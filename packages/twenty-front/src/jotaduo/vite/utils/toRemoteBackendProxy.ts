import { type IncomingMessage } from 'http';
import { Transform } from 'stream';
import { type ProxyOptions } from 'vite';

import { createRemoteBackendUrlMapper } from './createRemoteBackendUrlMapper';

type ProxyTable = Record<string, string | ProxyOptions>;

const CLIENT_CONFIG_PATH_PATTERN = /^\/client-config($|[/?])/;

// GraphQL answers as application/graphql-response+json.
const JSON_CONTENT_TYPE_PATTERN = /^application\/([\w.-]+\+)?json\b/i;

const isJson = (contentType: string | string[] | undefined) =>
  JSON_CONTENT_TYPE_PATTERN.test(String(contentType ?? ''));

// Lets the dev server talk to a backend that sits behind a reverse proxy on
// another host. That backend is routed by Host, trusts only its own Origin
// and, with multi-workspace on, finds the workspace in the subdomain of the
// origin it is told. So every URL is translated on the way through, in
// headers and in JSON bodies: http://apple.localhost:3001 on this side is
// https://apple.<backend domain> on the other.
export const toRemoteBackendProxy = (
  proxyTable: ProxyTable,
  { localOrigin }: { localOrigin: string },
): ProxyTable =>
  Object.fromEntries(
    Object.entries(proxyTable).map(([matcher, options]) => {
      const proxyOptions: ProxyOptions =
        typeof options === 'string' ? { target: options } : options;

      if (typeof proxyOptions.target !== 'string') {
        return [matcher, options];
      }

      const urlMapper = createRemoteBackendUrlMapper({
        remoteOrigin: new URL(proxyOptions.target).origin,
        localOrigin,
      });

      // The front reads its domain from the client config and compares it
      // with the address bar, so the dev server has to be that domain.
      const toLocalResponseBody = (request: IncomingMessage, body: string) => {
        const localBody = urlMapper.toLocal(body);

        if (!CLIENT_CONFIG_PATH_PATTERN.test(request.url ?? '')) {
          return localBody;
        }

        try {
          const clientConfig: Record<string, unknown> = JSON.parse(localBody);

          return JSON.stringify(
            clientConfig.frontDomain === urlMapper.remoteFrontDomain
              ? { ...clientConfig, frontDomain: urlMapper.localFrontDomain }
              : clientConfig,
          );
        } catch {
          return localBody;
        }
      };

      return [
        matcher,
        {
          ...proxyOptions,
          changeOrigin: true,
          // Responses are written below, after their URLs are translated.
          selfHandleResponse: true,
          bypass: (request, response, bypassOptions) => {
            if (isJson(request.headers['content-type'])) {
              // The proxy pipes the request straight to the backend. Piping
              // it through this instead translates the body on the way.
              const bodyChunks: Buffer[] = [];
              const bodyTranslator = new Transform({
                transform: (chunk: Buffer, _encoding, callback) => {
                  bodyChunks.push(chunk);
                  callback();
                },
                flush: (callback) =>
                  callback(
                    null,
                    urlMapper.toRemote(
                      Buffer.concat(bodyChunks).toString('utf8'),
                    ),
                  ),
              });
              const pipeRequest = request.pipe.bind(request);

              request.pipe = ((destination, pipeOptions) =>
                pipeRequest(bodyTranslator).pipe(
                  destination,
                  pipeOptions,
                )) as typeof request.pipe;
            }

            return proxyOptions.bypass?.(request, response, bypassOptions);
          },
          configure: (proxy, configuredOptions) => {
            proxyOptions.configure?.(proxy, configuredOptions);

            proxy.on('proxyReq', (proxyRequest, request) => {
              for (const headerName of ['origin', 'referer']) {
                const headerValue = request.headers[headerName];

                if (typeof headerValue === 'string') {
                  proxyRequest.setHeader(
                    headerName,
                    urlMapper.toRemote(headerValue),
                  );
                }
              }

              // A compressed response could not be translated.
              proxyRequest.setHeader('accept-encoding', 'identity');

              // The translated body has another length, known only once it
              // is all read, so it goes out chunked.
              if (isJson(request.headers['content-type'])) {
                proxyRequest.removeHeader('content-length');
              }
            });

            proxy.on('proxyRes', (proxyResponse, request, response) => {
              const headers = { ...proxyResponse.headers };

              if (typeof headers.location === 'string') {
                headers.location = urlMapper.toLocal(headers.location);
              }

              // A cookie scoped to the backend's domain would be refused on
              // this one. Without the attribute it belongs to the host that
              // received it.
              if (headers['set-cookie'] !== undefined) {
                headers['set-cookie'] = headers['set-cookie'].map((cookie) =>
                  cookie.replace(/;\s*domain=[^;]*/i, ''),
                );
              }

              // A stream cut short, by the backend or by the browser, would
              // otherwise take the dev server down with it.
              proxyResponse.on('error', () => response.destroy());

              if (!isJson(headers['content-type'])) {
                response.writeHead(proxyResponse.statusCode ?? 502, headers);
                proxyResponse.pipe(response);
                return;
              }

              // The translated body goes out whole, with its own length.
              delete headers['transfer-encoding'];

              const bodyChunks: Buffer[] = [];

              proxyResponse.on('data', (chunk: Buffer) =>
                bodyChunks.push(chunk),
              );
              proxyResponse.on('end', () => {
                const body = toLocalResponseBody(
                  request,
                  Buffer.concat(bodyChunks).toString('utf8'),
                );

                response.writeHead(proxyResponse.statusCode ?? 502, {
                  ...headers,
                  'content-length': Buffer.byteLength(body),
                });
                response.end(body);
              });
            });
          },
        } satisfies ProxyOptions,
      ];
    }),
  );
