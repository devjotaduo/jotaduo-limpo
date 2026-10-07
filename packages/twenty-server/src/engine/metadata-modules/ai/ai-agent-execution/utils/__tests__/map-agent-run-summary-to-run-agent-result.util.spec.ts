import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { mapAgentRunSummaryToRunAgentResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-run-summary-to-run-agent-result.util';

const SUMMARY: AgentRunSummary = {
  modelId: 'openai/gpt-5-mini',
  usage: {
    inputTokens: 55_000,
    outputTokens: 800,
    reasoningTokens: 320,
    cacheReadTokens: 40_000,
    cacheCreationTokens: 0,
    totalTokens: 55_800,
  },
  cost: { totalCostInDollars: 0.0123, creditsUsedMicro: 12_300 },
  nativeWebSearchCallCount: 1,
  toolCalls: [
    {
      toolName: 'find_people',
      toolCallId: 'call-1',
      input: { filter: { phone: '+5511999990000' } },
      output: { records: [{ name: 'Ana' }] },
      state: 'success',
    },
    {
      toolName: 'send_email',
      toolCallId: 'call-2',
      errorMessage: 'Request to http://litellm.internal:4000 failed',
      state: 'error',
    },
  ],
  durationMs: 4_200,
};

describe('mapAgentRunSummaryToRunAgentResult', () => {
  it('reports the model, tokens, cost, tool calls and duration of the run', () => {
    expect(mapAgentRunSummaryToRunAgentResult(SUMMARY)).toEqual({
      modelId: 'openai/gpt-5-mini',
      usage: {
        inputTokens: 55_000,
        outputTokens: 800,
        reasoningTokens: 320,
        cacheReadTokens: 40_000,
        cacheCreationTokens: 0,
        totalTokens: 55_800,
        nativeWebSearchCallCount: 1,
      },
      cost: { totalCostInDollars: 0.0123, creditsUsedMicro: 12_300 },
      toolCalls: [
        { toolName: 'find_people', state: 'success' },
        { toolName: 'send_email', state: 'error' },
      ],
      durationMs: 4_200,
    });
  });

  it('reports a token count the provider did not give as null', () => {
    const { usage } = mapAgentRunSummaryToRunAgentResult({
      ...SUMMARY,
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    });

    expect(usage).toMatchObject({
      reasoningTokens: null,
      cacheReadTokens: null,
      cacheCreationTokens: null,
    });
  });
});
