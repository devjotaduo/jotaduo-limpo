import { type ModelMessage, type ToolResultPart } from 'ai';

import { STRUCTURED_OUTPUT_CONTEXT_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/structured-output-context-limits.const';
import { summarizeToolResultsForStructuredOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/summarize-tool-results-for-structured-output.util';
import {
  TRUNCATION_SENTINEL,
  utf8ByteLengthOf,
} from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const toolCall = ({
  toolCallId,
  toolName,
  input,
}: {
  toolCallId: string;
  toolName: string;
  input: unknown;
}): ModelMessage => ({
  role: 'assistant',
  content: [{ type: 'tool-call', toolCallId, toolName, input }],
});

const toolResult = ({
  toolCallId,
  toolName,
  output,
}: {
  toolCallId: string;
  toolName: string;
  output: ToolResultPart['output'];
}): ModelMessage => ({
  role: 'tool',
  content: [{ type: 'tool-result', toolCallId, toolName, output }],
});

describe('summarizeToolResultsForStructuredOutput', () => {
  it('lists each tool result with the name and input of its call', () => {
    expect(
      summarizeToolResultsForStructuredOutput([
        { role: 'user', content: 'Who is our biggest customer?' },
        toolCall({
          toolCallId: 'call-1',
          toolName: 'find_companies',
          input: { orderBy: { employees: 'DescNullsLast' }, limit: 1 },
        }),
        toolResult({
          toolCallId: 'call-1',
          toolName: 'find_companies',
          output: { type: 'json', value: { records: [{ name: 'Acme' }] } },
        }),
        { role: 'assistant', content: 'Acme is your biggest customer.' },
      ]),
    ).toBe(
      '- find_companies({"orderBy":{"employees":"DescNullsLast"},"limit":1}) => {"records":[{"name":"Acme"}]}',
    );
  });

  it('marks a failed or denied call', () => {
    expect(
      summarizeToolResultsForStructuredOutput([
        toolResult({
          toolCallId: 'call-1',
          toolName: 'send_email',
          output: { type: 'error-text', value: 'Mailbox not connected' },
        }),
        toolResult({
          toolCallId: 'call-2',
          toolName: 'delete_company',
          output: { type: 'execution-denied', reason: 'Not approved' },
        }),
      ]).split('\n'),
    ).toEqual([
      '- send_email() => Error: Mailbox not connected',
      '- delete_company() => Execution denied: Not approved',
    ]);
  });

  it('cuts a large output down to its own cap', () => {
    const summary = summarizeToolResultsForStructuredOutput([
      toolResult({
        toolCallId: 'call-1',
        toolName: 'find_people',
        output: { type: 'text', value: 'x'.repeat(50_000) },
      }),
    ]);

    expect(summary.endsWith(TRUNCATION_SENTINEL)).toBe(true);
    expect(utf8ByteLengthOf(summary)).toBeLessThanOrEqual(
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_TOOL_OUTPUT_BYTES + 100,
    );
  });

  it('cuts a large input down to its own cap', () => {
    const summary = summarizeToolResultsForStructuredOutput([
      toolCall({
        toolCallId: 'call-1',
        toolName: 'create_note',
        input: { body: 'y'.repeat(10_000) },
      }),
      toolResult({
        toolCallId: 'call-1',
        toolName: 'create_note',
        output: { type: 'json', value: { id: 'note-id' } },
      }),
    ]);

    expect(summary).toContain(`${TRUNCATION_SENTINEL}) => {"id":"note-id"}`);
    expect(utf8ByteLengthOf(summary)).toBeLessThanOrEqual(
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_TOOL_INPUT_BYTES + 100,
    );
  });

  it('keeps the latest results within the total cap and counts the ones left out', () => {
    const messages = Array.from({ length: 30 }, (_, index) => [
      toolCall({
        toolCallId: `call-${index}`,
        toolName: 'find_opportunities',
        input: { page: index },
      }),
      toolResult({
        toolCallId: `call-${index}`,
        toolName: 'find_opportunities',
        output: { type: 'text', value: `page ${index} `.repeat(400) },
      }),
    ]).flat();

    const [firstLine, ...entries] =
      summarizeToolResultsForStructuredOutput(messages).split('\n');

    expect(firstLine).toBe(
      `[${30 - entries.length} earlier tool results omitted]`,
    );
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.length).toBeLessThan(30);
    expect(entries[entries.length - 1]).toContain('{"page":29}');
    expect(utf8ByteLengthOf(entries.join('\n'))).toBeLessThanOrEqual(
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_TOOL_RESULTS_BYTES,
    );
  });

  it('gives nothing when the agent called no tool', () => {
    expect(
      summarizeToolResultsForStructuredOutput([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: [{ type: 'text', text: 'Hi' }] },
      ]),
    ).toBe('');
  });
});
