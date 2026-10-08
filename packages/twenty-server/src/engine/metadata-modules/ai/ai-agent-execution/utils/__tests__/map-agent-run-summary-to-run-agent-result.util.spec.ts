import { type AgentRunSummary } from 'twenty-shared/ai';
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

  it.each(['started', 'success', 'error', 'awaiting-approval'] as const)(
    'reports the called tool in state %s without exposing its arguments or output',
    (state) => {
      const { toolCalls } = mapAgentRunSummaryToRunAgentResult({
        ...SUMMARY,
        toolCalls: [
          {
            toolName: 'execute_tool',
            toolCallId: 'call-3',
            state,
            input: {
              toolName: 'app_lookup_order',
              arguments: { orderNumber: '42' },
            },
            output: { privateRecord: 'private-data' },
          },
        ],
      });
      expect(toolCalls).toEqual([{ toolName: 'app_lookup_order', state }]);
    },
  );

  it.each([
    undefined,
    null,
    [],
    'truncated-input',
    {},
    { toolName: 42 },
    { toolName: '' },
    { toolName: 'http://internal-host' },
  ])(
    'keeps the wrapper name when its input is unavailable or invalid: %p',
    (input) => {
      const { toolCalls } = mapAgentRunSummaryToRunAgentResult({
        ...SUMMARY,
        toolCalls: [
          {
            toolName: 'execute_tool',
            toolCallId: 'call-4',
            state: 'error',
            input,
          },
        ],
      });
      expect(toolCalls).toEqual([{ toolName: 'execute_tool', state: 'error' }]);
    },
  );

  it('does not unwrap learn_tools or direct tool calls', () => {
    const { toolCalls } = mapAgentRunSummaryToRunAgentResult({
      ...SUMMARY,
      toolCalls: [
        {
          toolName: 'learn_tools',
          toolCallId: 'call-5',
          state: 'success',
          input: { toolName: 'app_lookup_order' },
        },
      ],
    });
    expect(toolCalls).toEqual([{ toolName: 'learn_tools', state: 'success' }]);
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
