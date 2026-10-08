import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';

import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';

const SERVER_SECRETS = {
  APP_SECRET: 'server-app-secret',
  PG_DATABASE_URL: 'postgres://twenty:password@db:5432/default',
};

const HANDLER_SOURCE = `
export const main = async (payload, context) => ({
  payload,
  context,
  appSecret: process.env.APP_SECRET ?? null,
  databaseUrl: process.env.PG_DATABASE_URL ?? null,
  httpsProxy: process.env.HTTPS_PROXY ?? null,
  apiUrl: process.env.TWENTY_API_URL ?? null,
});
`;

const CONTEXT: LogicFunctionExecutionContext = {
  retryCount: 0,
  maxRetries: 0,
  workspaceId: 'workspace-id',
  userWorkspaceId: null,
  workspaceMemberId: null,
};

describe('LocalChildProcessRunnerService', () => {
  const originalEnv = process.env;
  let workDir: string;

  beforeEach(async () => {
    jest.useRealTimers();
    workDir = await mkdtemp(path.join(tmpdir(), 'local-child-process-runner-'));
    process.env = {
      ...originalEnv,
      ...SERVER_SECRETS,
      HTTPS_PROXY: 'http://proxy:3128',
    };
  });

  afterEach(async () => {
    process.env = originalEnv;
    await rm(workDir, { recursive: true, force: true });
  });

  it('runs the handler with the function env and without server secrets', async () => {
    const builtFileAbsPath = path.join(workDir, 'handler.mjs');

    await writeFile(builtFileAbsPath, HANDLER_SOURCE);

    const runner = new LocalChildProcessRunnerService();
    const runnerPath = await runner.writeBootstrapRunner({
      dir: workDir,
      builtFileAbsPath,
      handlerName: 'main',
    });

    const outcome = await runner.runChildWithEnv({
      runnerPath,
      env: { TWENTY_API_URL: 'http://localhost:3000' },
      payload: { name: 'Acme' },
      context: CONTEXT,
      timeoutMs: 30_000,
    });

    expect(outcome.ok).toBe(true);
    expect(outcome.result).toEqual({
      payload: { name: 'Acme' },
      context: CONTEXT,
      appSecret: null,
      databaseUrl: null,
      httpsProxy: 'http://proxy:3128',
      apiUrl: 'http://localhost:3000',
    });
  });
});
