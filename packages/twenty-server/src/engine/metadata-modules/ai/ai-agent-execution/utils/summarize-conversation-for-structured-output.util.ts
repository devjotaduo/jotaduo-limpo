import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ModelMessage } from 'ai';

import { STRUCTURED_OUTPUT_CONTEXT_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/structured-output-context-limits.const';
import { keepMostRecentWithinByteBudget } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/keep-most-recent-within-byte-budget.util';
import { truncateStringToUtf8ByteBudget } from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const extractMessageText = (message: ModelMessage): string => {
  if (isString(message.content)) {
    return message.content;
  }

  const texts: string[] = [];

  for (const part of message.content) {
    if (part.type === 'text') {
      texts.push(part.text);
    }
  }

  return texts.join('\n');
};

// tool calls and results are summarized on their own, and files are left to the agent's answer
export const summarizeConversationForStructuredOutput = (
  messages: ModelMessage[],
): string => {
  const entries: string[] = [];

  for (const message of messages) {
    if (message.role !== 'user' && message.role !== 'assistant') {
      continue;
    }

    const text = extractMessageText(message).trim();

    if (!isNonEmptyString(text)) {
      continue;
    }

    const { value } = truncateStringToUtf8ByteBudget(
      text,
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_MESSAGE_BYTES,
    );

    entries.push(`${message.role}: ${value}`);
  }

  const { keptEntries, omittedCount } = keepMostRecentWithinByteBudget({
    entries,
    maxBytes: STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_CONVERSATION_BYTES,
  });

  return [
    ...(omittedCount > 0 ? [`[${omittedCount} earlier messages omitted]`] : []),
    ...keptEntries,
  ].join('\n');
};
