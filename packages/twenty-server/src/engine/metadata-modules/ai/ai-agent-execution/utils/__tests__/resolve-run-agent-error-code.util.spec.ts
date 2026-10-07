import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { resolveRunAgentErrorCode } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-error-code.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { UnknownException } from 'src/utils/custom-exception';

describe('resolveRunAgentErrorCode', () => {
  it.each([
    [
      'a usage limit',
      new UsageLimitException(
        'Usage limit reached for workspace',
        UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      ),
      'QUOTA_EXHAUSTED',
    ],
    [
      'a rate limit',
      new UsageLimitException(
        'Rate limited',
        UsageLimitExceptionCode.RATE_LIMITED,
      ),
      'RATE_LIMITED',
    ],
    [
      'an inactive subscription',
      new BillingException(
        'Workspace workspace-id has no active subscription: CANCELED',
        BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
      ),
      'BILLING_SUBSCRIPTION_INACTIVE',
    ],
    [
      'a context window overflow',
      new AiException(
        'Prompt is too long',
        AiExceptionCode.CONTEXT_WINDOW_EXCEEDED,
      ),
      'CONTEXT_WINDOW_EXCEEDED',
    ],
  ])('gives the code of %s', (_, error, expectedCode) => {
    expect(resolveRunAgentErrorCode(error)).toBe(expectedCode);
  });

  it('never gives the message of a provider error', () => {
    const errorCode = resolveRunAgentErrorCode(
      new AiException(
        'Request to http://litellm.internal:4000/v1/chat/completions failed',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      ),
    );

    expect(errorCode).toBe('AGENT_EXECUTION_FAILED');
  });

  it.each([
    ['a plain error', new Error('connect ECONNREFUSED 10.0.0.12:4000')],
    ['a thrown string', 'http://litellm.internal:4000 is down'],
    [
      'an exception with a free-form code',
      new UnknownException('failed', 'http://litellm.internal:4000', {
        userFriendlyMessage: { id: 'failed' },
      }),
    ],
  ])('falls back to a generic code for %s', (_, error) => {
    expect(resolveRunAgentErrorCode(error)).toBe(
      AiExceptionCode.AGENT_EXECUTION_FAILED,
    );
  });
});
