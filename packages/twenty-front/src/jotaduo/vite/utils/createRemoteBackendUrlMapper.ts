const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Zero or more subdomain labels, as in "apple." or "a.b.".
const SUBDOMAINS_PATTERN = '((?:[a-z0-9-]+\\.)*)';

// The host has to end there: crm.example.com.evil.org is another site.
const HOST_END_PATTERN = '(?![\\w.-])';

type CreateRemoteBackendUrlMapperParams = {
  // Where the remote backend's front lives, e.g. https://crm.example.com.
  remoteOrigin: string;
  // Where the dev server answers, e.g. http://localhost:3001.
  localOrigin: string;
};

// A remote backend only knows its own domain: it resolves a workspace from
// the subdomain of the origin it is given and builds every link on that
// domain. The mapper translates between that domain and the dev server's, in
// both directions and keeping the subdomain, so http://apple.localhost:3001
// stands for https://apple.crm.example.com.
export const createRemoteBackendUrlMapper = ({
  remoteOrigin,
  localOrigin,
}: CreateRemoteBackendUrlMapperParams) => {
  const remoteUrl = new URL(remoteOrigin);
  const localUrl = new URL(localOrigin);

  const remoteUrlPattern = new RegExp(
    `${escapeRegExp(remoteUrl.protocol)}//${SUBDOMAINS_PATTERN}${escapeRegExp(remoteUrl.host)}${HOST_END_PATTERN}`,
    'gi',
  );
  const localUrlPattern = new RegExp(
    `${escapeRegExp(localUrl.protocol)}//${SUBDOMAINS_PATTERN}${escapeRegExp(localUrl.host)}${HOST_END_PATTERN}`,
    'gi',
  );

  return {
    remoteFrontDomain: remoteUrl.hostname,
    localFrontDomain: localUrl.hostname,
    toRemote: (text: string) =>
      text.replace(
        localUrlPattern,
        (_match, subdomains: string) =>
          `${remoteUrl.protocol}//${subdomains}${remoteUrl.host}`,
      ),
    toLocal: (text: string) =>
      text.replace(
        remoteUrlPattern,
        (_match, subdomains: string) =>
          `${localUrl.protocol}//${subdomains}${localUrl.host}`,
      ),
  };
};

export type RemoteBackendUrlMapper = ReturnType<
  typeof createRemoteBackendUrlMapper
>;
