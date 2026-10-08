import { type ModelMessage } from 'ai';

import { STRUCTURED_OUTPUT_CONTEXT_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/structured-output-context-limits.const';
import { summarizeConversationForStructuredOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/summarize-conversation-for-structured-output.util';
import {
  TRUNCATION_SENTINEL,
  utf8ByteLengthOf,
} from 'src/utils/truncate-string-to-utf8-byte-budget.util';

describe('summarizeConversationForStructuredOutput', () => {
  it('keeps what the user and the agent said, in order', () => {
    const messages: ModelMessage[] = [
      { role: 'system', content: 'You are a sales assistant.' },
      { role: 'user', content: 'Quero falar com um atendente' },
      {
        role: 'assistant',
        content: [
          { type: 'reasoning', text: 'The customer asks for a human.' },
          { type: 'text', text: 'Vou chamar a equipe.' },
          {
            type: 'tool-call',
            toolCallId: 'call-1',
            toolName: 'find_people',
            input: {},
          },
        ],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'find_people',
            output: { type: 'json', value: { records: [] } },
          },
        ],
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Segue a nota fiscal' },
          { type: 'file', data: 'aGVsbG8=', mediaType: 'application/pdf' },
        ],
      },
    ];

    expect(summarizeConversationForStructuredOutput(messages)).toBe(
      [
        'user: Quero falar com um atendente',
        'assistant: Vou chamar a equipe.',
        'user: Segue a nota fiscal',
      ].join('\n'),
    );
  });

  it('cuts a long message down to its cap', () => {
    const summary = summarizeConversationForStructuredOutput([
      { role: 'user', content: 'z'.repeat(20_000) },
    ]);

    expect(summary.endsWith(TRUNCATION_SENTINEL)).toBe(true);
    expect(utf8ByteLengthOf(summary)).toBeLessThanOrEqual(
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_MESSAGE_BYTES + 50,
    );
  });

  it('keeps the latest messages of a long thread and counts the ones left out', () => {
    const messages = Array.from({ length: 40 }, (_, index): ModelMessage => {
      const content = `message ${index} `.repeat(30);

      return index % 2 === 0
        ? { role: 'user', content }
        : { role: 'assistant', content };
    });

    const [firstLine, ...entries] =
      summarizeConversationForStructuredOutput(messages).split('\n');

    expect(firstLine).toBe(`[${40 - entries.length} earlier messages omitted]`);
    expect(entries[entries.length - 1]).toMatch(/^assistant: message 39 /);
    expect(utf8ByteLengthOf(entries.join('\n'))).toBeLessThanOrEqual(
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_CONVERSATION_BYTES,
    );
  });
});
