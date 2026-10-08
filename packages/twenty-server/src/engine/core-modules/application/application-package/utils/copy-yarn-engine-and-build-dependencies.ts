import { execFile } from 'child_process';
import { promises as fs, statSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { buildLogicFunctionChildProcessEnv } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/build-logic-function-child-process-env';

const execFilePromise = promisify(execFile);

export const copyYarnEngineAndBuildDependencies = async (
  buildDirectory: string,
) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });

  await fs.cp(YARN_ENGINE_DIRNAME, buildDirectory, {
    recursive: true,
  });

  const localYarnPath = join(buildDirectory, '.yarn/releases/yarn-4.9.2.cjs');

  // enableScripts: false only skips dependency scripts: the app's own
  // package.json postinstall still runs here. YARN_* carries registry and cache
  // settings.
  const yarnEnv = buildLogicFunctionChildProcessEnv({
    parentEnv: process.env,
    allowedParentEnvPrefixes: ['YARN_'],
  });

  try {
    await execFilePromise(
      process.execPath,
      [localYarnPath, 'workspaces', 'focus', '--all', '--production'],
      {
        cwd: buildDirectory,
        env: yarnEnv,
      },
    );
    // oxlint-disable-next-line typescript/no-explicit-any
  } catch (error: any) {
    const errorMessage =
      [error?.stdout, error?.stderr].filter(Boolean).join('\n') ||
      'Failed to install logic function executor dependencies';

    throw new Error(errorMessage);
  }
  const objects = await fs.readdir(buildDirectory);

  await Promise.all(
    objects
      .filter((object) => object !== 'node_modules')
      .map((object) => {
        const fullPath = join(buildDirectory, object);

        return statSync(fullPath).isDirectory()
          ? fs.rm(fullPath, { recursive: true, force: true })
          : fs.rm(fullPath);
      }),
  );
};
