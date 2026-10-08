import { isDefined } from 'twenty-shared/utils';

import { LOGIC_FUNCTION_CHILD_PROCESS_ENV_ALLOWLIST } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-child-process-env-allowlist';

export const buildLogicFunctionChildProcessEnv = ({
  parentEnv,
  functionEnv = {},
  allowedParentEnvPrefixes = [],
}: {
  parentEnv: Record<string, string | undefined>;
  functionEnv?: Record<string, string>;
  allowedParentEnvPrefixes?: string[];
}): Record<string, string> => {
  const childEnv: Record<string, string> = {};

  for (const name of LOGIC_FUNCTION_CHILD_PROCESS_ENV_ALLOWLIST) {
    const value = parentEnv[name];

    if (isDefined(value)) {
      childEnv[name] = value;
    }
  }

  for (const [name, value] of Object.entries(parentEnv)) {
    if (
      isDefined(value) &&
      allowedParentEnvPrefixes.some((prefix) => name.startsWith(prefix))
    ) {
      childEnv[name] = value;
    }
  }

  // An app variable named NODE_OPTIONS must not change how Node starts the child
  const { NODE_OPTIONS: _nodeOptions, ...functionEnvWithoutNodeOptions } =
    functionEnv;

  return { ...childEnv, ...functionEnvWithoutNodeOptions };
};
