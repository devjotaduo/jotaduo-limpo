import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ModelMessage, type ToolResultPart } from 'ai';

import { STRUCTURED_OUTPUT_CONTEXT_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/structured-output-context-limits.const';
import { keepMostRecentWithinByteBudget } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/keep-most-recent-within-byte-budget.util';
import { truncateStringToUtf8ByteBudget } from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const serializeForSummary = (value: unknown): string => {
  if (isString(value)) {
    return value;
  }

  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
};

const describeToolOutput = (output: ToolResultPart['output']): string => {
  switch (output.type) {
    case 'text':
      return output.value;
    case 'json':
      return serializeForSummary(output.value);
    case 'error-text':
      return `Error: ${output.value}`;
    case 'error-json':
      return `Error: ${serializeForSummary(output.value)}`;
    case 'execution-denied':
      return isNonEmptyString(output.reason)
        ? `Execution denied: ${output.reason}`
        : 'Execution denied';
    case 'content':
      return output.value
        .map((item) => (item.type === 'text' ? item.text : `[${item.type}]`))
        .join('\n');
    default:
      return serializeForSummary(output);
  }
};

const truncateForSummary = (text: string, maxBytes: number): string =>
  truncateStringToUtf8ByteBudget(text, maxBytes).value;

// the agent already acted on these results; the structuring call only needs enough of each to fill the fields
export const summarizeToolResultsForStructuredOutput = (
  messages: ModelMessage[],
): string => {
  const inputsByToolCallId = new Map<string, unknown>();
  const entries: string[] = [];

  for (const message of messages) {
    if (message.role !== 'assistant' && message.role !== 'tool') {
      continue;
    }

    if (isString(message.content)) {
      continue;
    }

    for (const part of message.content) {
      if (part.type === 'tool-call') {
        inputsByToolCallId.set(part.toolCallId, part.input);
        continue;
      }

      if (part.type !== 'tool-result') {
        continue;
      }

      const input = truncateForSummary(
        serializeForSummary(inputsByToolCallId.get(part.toolCallId)),
        STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_TOOL_INPUT_BYTES,
      );
      const output = truncateForSummary(
        describeToolOutput(part.output),
        STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_TOOL_OUTPUT_BYTES,
      );

      entries.push(`- ${part.toolName}(${input}) => ${output}`);
    }
  }

  const { keptEntries, omittedCount } = keepMostRecentWithinByteBudget({
    entries,
    maxBytes: STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_TOOL_RESULTS_BYTES,
  });

  return [
    ...(omittedCount > 0
      ? [`[${omittedCount} earlier tool results omitted]`]
      : []),
    ...keptEntries,
  ].join('\n');
};
