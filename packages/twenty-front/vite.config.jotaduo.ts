import { defineConfig, mergeConfig, type ConfigEnv } from 'vite';

import { toRemoteBackendProxy } from './src/jotaduo/vite/utils/toRemoteBackendProxy';
import upstreamViteConfig from './vite.config';

// Remote backend URL rewriting is only needed for local development against
// a server on another domain.
export default defineConfig(async (configEnv: ConfigEnv) => {
  const upstreamConfig =
    typeof upstreamViteConfig === 'function'
      ? await upstreamViteConfig(configEnv)
      : await upstreamViteConfig;

  const upstreamProxy = upstreamConfig.server?.proxy;
  const localProtocol = upstreamConfig.server?.https ? 'https' : 'http';
  const localOrigin = `${localProtocol}://localhost:${upstreamConfig.server?.port}`;

  return mergeConfig(upstreamConfig, {
    server: {
      proxy:
        upstreamProxy !== undefined && !Array.isArray(upstreamProxy)
          ? toRemoteBackendProxy(upstreamProxy, { localOrigin })
          : undefined,
    },
  });
});
