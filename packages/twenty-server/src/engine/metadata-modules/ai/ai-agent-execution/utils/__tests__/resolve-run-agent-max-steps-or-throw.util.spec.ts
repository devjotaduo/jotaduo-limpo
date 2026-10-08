import { resolveRunAgentMaxStepsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-max-steps-or-throw.util';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

describe('resolveRunAgentMaxStepsOrThrow', () => {
  it.each([[undefined], [null]])(
    'should leave the default limit when maxSteps is %s',
    (maxSteps) => {
      expect(resolveRunAgentMaxStepsOrThrow(maxSteps)).toBeUndefined();
    },
  );

  it.each([[1], [4], [AGENT_CONFIG.MAX_STEPS]])(
    'should keep a limit of %s',
    (maxSteps) => {
      expect(resolveRunAgentMaxStepsOrThrow(maxSteps)).toBe(maxSteps);
    },
  );

  it('should cap a limit above the server one', () => {
    expect(resolveRunAgentMaxStepsOrThrow(AGENT_CONFIG.MAX_STEPS + 1)).toBe(
      AGENT_CONFIG.MAX_STEPS,
    );
    expect(resolveRunAgentMaxStepsOrThrow(10_000)).toBe(AGENT_CONFIG.MAX_STEPS);
  });

  it.each([[0], [-3], [2.5], [Number.NaN]])(
    'should reject a limit of %s',
    (maxSteps) => {
      expect(() => resolveRunAgentMaxStepsOrThrow(maxSteps)).toThrow(
        expect.objectContaining({ code: AiExceptionCode.INVALID_AGENT_INPUT }),
      );
    },
  );
});
