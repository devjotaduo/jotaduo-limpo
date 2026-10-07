import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { CustomException } from 'src/utils/custom-exception';

const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

// The caller gets a code and never the message: a provider error can name internal hosts.
// Some exceptions take free-form codes, so only constant-like ones pass through
export const resolveRunAgentErrorCode = (error: unknown): string =>
  error instanceof CustomException && ERROR_CODE_PATTERN.test(error.code)
    ? error.code
    : AiExceptionCode.AGENT_EXECUTION_FAILED;
