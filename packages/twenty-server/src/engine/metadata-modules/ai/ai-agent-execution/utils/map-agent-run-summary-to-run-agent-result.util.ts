import { type RunAgentResult } from 'twenty-shared/application';

import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';

// tool inputs and outputs stay out: they hold record data and can weigh megabytes per run
export const mapAgentRunSummaryToRunAgentResult = (
  summary: AgentRunSummary,
): Pick<
  RunAgentResult,
  'modelId' | 'usage' | 'cost' | 'toolCalls' | 'durationMs'
> => ({
  modelId: summary.modelId,
  usage: {
    inputTokens: summary.usage.inputTokens,
    outputTokens: summary.usage.outputTokens,
    reasoningTokens: summary.usage.reasoningTokens ?? null,
    cacheReadTokens: summary.usage.cacheReadTokens ?? null,
    cacheCreationTokens: summary.usage.cacheCreationTokens ?? null,
    totalTokens: summary.usage.totalTokens,
    nativeWebSearchCallCount: summary.nativeWebSearchCallCount,
  },
  cost: {
    totalCostInDollars: summary.cost.totalCostInDollars,
    creditsUsedMicro: summary.cost.creditsUsedMicro,
  },
  toolCalls: summary.toolCalls.map(({ toolName, state }) => ({
    toolName,
    state,
  })),
  durationMs: summary.durationMs,
});
