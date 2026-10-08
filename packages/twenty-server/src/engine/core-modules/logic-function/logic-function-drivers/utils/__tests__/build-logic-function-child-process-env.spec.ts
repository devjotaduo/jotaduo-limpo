import { buildLogicFunctionChildProcessEnv } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/build-logic-function-child-process-env';

const SERVER_ENV = {
  APP_SECRET: 'server-app-secret',
  PG_DATABASE_URL: 'postgres://twenty:password@db:5432/default',
  REDIS_URL: 'redis://redis:6379',
  STORAGE_S3_SECRET_ACCESS_KEY: 's3-secret',
  NODE_OPTIONS: '--import tsx',
  PATH: '/usr/local/bin:/usr/bin:/bin',
  HOME: '/home/node',
  TZ: 'America/Sao_Paulo',
  NODE_ENV: 'production',
  HTTPS_PROXY: 'http://proxy.internal:3128',
  no_proxy: 'localhost,127.0.0.1',
  NODE_EXTRA_CA_CERTS: '/etc/ssl/certs/internal-ca.pem',
  YARN_NPM_REGISTRY_SERVER: 'https://registry.internal',
};

describe('buildLogicFunctionChildProcessEnv', () => {
  it('drops server variables that are not allowlisted', () => {
    const childEnv = buildLogicFunctionChildProcessEnv({
      parentEnv: SERVER_ENV,
    });

    expect(childEnv).not.toHaveProperty('APP_SECRET');
    expect(childEnv).not.toHaveProperty('PG_DATABASE_URL');
    expect(childEnv).not.toHaveProperty('REDIS_URL');
    expect(childEnv).not.toHaveProperty('STORAGE_S3_SECRET_ACCESS_KEY');
    expect(childEnv).not.toHaveProperty('NODE_OPTIONS');
    expect(childEnv).not.toHaveProperty('YARN_NPM_REGISTRY_SERVER');
  });

  it('keeps allowlisted runtime, proxy and certificate variables', () => {
    expect(
      buildLogicFunctionChildProcessEnv({ parentEnv: SERVER_ENV }),
    ).toEqual({
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/home/node',
      TZ: 'America/Sao_Paulo',
      NODE_ENV: 'production',
      HTTPS_PROXY: 'http://proxy.internal:3128',
      no_proxy: 'localhost,127.0.0.1',
      NODE_EXTRA_CA_CERTS: '/etc/ssl/certs/internal-ca.pem',
    });
  });

  it('puts the function env on top of the allowlisted server values', () => {
    const childEnv = buildLogicFunctionChildProcessEnv({
      parentEnv: SERVER_ENV,
      functionEnv: {
        TWENTY_API_URL: 'http://localhost:3000',
        TWENTY_APP_ACCESS_TOKEN: 'application-token',
        TZ: 'Europe/Paris',
      },
    });

    expect(childEnv).toMatchObject({
      PATH: '/usr/local/bin:/usr/bin:/bin',
      TWENTY_API_URL: 'http://localhost:3000',
      TWENTY_APP_ACCESS_TOKEN: 'application-token',
      TZ: 'Europe/Paris',
    });
  });

  it('skips allowlisted variables that are undefined in the server env', () => {
    const childEnv = buildLogicFunctionChildProcessEnv({
      parentEnv: { PATH: '/usr/bin', HOME: undefined, TZ: undefined },
    });

    expect(childEnv).toEqual({ PATH: '/usr/bin' });
    expect(Object.keys(childEnv)).not.toContain('HOME');
  });

  it('never passes NODE_OPTIONS, even from the function env', () => {
    const childEnv = buildLogicFunctionChildProcessEnv({
      parentEnv: SERVER_ENV,
      functionEnv: { NODE_OPTIONS: '--require ./preload.cjs' },
    });

    expect(childEnv).not.toHaveProperty('NODE_OPTIONS');
  });

  it('keeps server variables matching an allowed prefix', () => {
    const childEnv = buildLogicFunctionChildProcessEnv({
      parentEnv: SERVER_ENV,
      allowedParentEnvPrefixes: ['YARN_'],
    });

    expect(childEnv).toMatchObject({
      PATH: '/usr/local/bin:/usr/bin:/bin',
      YARN_NPM_REGISTRY_SERVER: 'https://registry.internal',
    });
    expect(childEnv).not.toHaveProperty('APP_SECRET');
  });
});
