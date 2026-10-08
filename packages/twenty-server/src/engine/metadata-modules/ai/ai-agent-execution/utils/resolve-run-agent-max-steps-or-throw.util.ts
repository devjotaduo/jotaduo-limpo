import { isDefined } from 'twenty-shared/utils';

import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// the runAgent resolver runs no validation pipe, so the input's own decorators let a zero or negative limit through
export const resolveRunAgentMaxStepsOrThrow = (
  maxSteps: number | null | undefined,
): number | undefined => {
  if (!isDefined(maxSteps)) {
    return undefined;
  }

  if (!Number.isInteger(maxSteps) || maxSteps < 1) {
    throw new AiException(
      'maxSteps must be a positive integer',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  return Math.min(maxSteps, AGENT_CONFIG.MAX_STEPS);
};
