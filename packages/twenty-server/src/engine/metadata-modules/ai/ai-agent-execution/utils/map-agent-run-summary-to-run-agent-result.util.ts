import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentResult } from 'twenty-shared/application';
import { isPlainObject } from 'twenty-shared/utils';

import { EXECUTE_TOOL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import { type AgentRunSummary } from 'twenty-shared/ai';

const TOOL_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

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
  toolCalls: summary.toolCalls.map(({ toolName, state, input }) => ({
    // Lazy tools keep the called name in the wrapper's input; only that name crosses the API.
    toolName:
      toolName === EXECUTE_TOOL_TOOL_NAME &&
      isPlainObject(input) &&
      isNonEmptyString(input.toolName) &&
      TOOL_NAME_PATTERN.test(input.toolName)
        ? input.toolName
        : toolName,
    state,
  })),
  durationMs: summary.durationMs,
});
