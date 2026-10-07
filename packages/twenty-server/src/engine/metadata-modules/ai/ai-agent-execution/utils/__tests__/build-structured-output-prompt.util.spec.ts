import { type ModelMessage } from 'ai';
import { type AgentResponseSchema } from 'twenty-shared/ai';

import { STRUCTURED_OUTPUT_CONTEXT_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/structured-output-context-limits.const';
import { buildStructuredOutputPrompt } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-structured-output-prompt.util';
import {
  TRUNCATION_SENTINEL,
  utf8ByteLengthOf,
} from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const SCHEMA: AgentResponseSchema = {
  type: 'object',
  properties: {
    decision: {
      type: 'string',
      description: 'reply, escalate or close',
    },
    needsHuman: { type: 'boolean' },
  },
  required: ['decision', 'needsHuman'],
  additionalProperties: false,
};

const CONVERSATION: ModelMessage[] = [
  { role: 'user', content: 'Cliente pediu reembolso do pedido 4521' },
];

const EXECUTION: ModelMessage[] = [
  {
    role: 'assistant',
    content: [
      {
        type: 'tool-call',
        toolCallId: 'call-1',
        toolName: 'find_orders',
        input: { number: 4521 },
      },
    ],
  },
  {
    role: 'tool',
    content: [
      {
        type: 'tool-result',
        toolCallId: 'call-1',
        toolName: 'find_orders',
        output: {
          type: 'json',
          value: { records: [{ number: 4521, status: 'DELIVERED' }] },
        },
      },
    ],
  },
  {
    role: 'assistant',
    content: [{ type: 'text', text: 'The order was delivered; escalate.' }],
  },
];

const extractSection = (prompt: string, tag: string): string | undefined =>
  prompt.match(new RegExp(`<${tag}>\\n([\\s\\S]*?)\\n</${tag}>`))?.[1];

describe('buildStructuredOutputPrompt', () => {
  it('gives the structuring call the instructions, the request, the tool results, the answer and the schema', () => {
    const prompt = buildStructuredOutputPrompt({
      agentInstructions: 'Escalate refunds of delivered orders to a human.',
      conversationMessages: CONVERSATION,
      executionMessages: EXECUTION,
      response: 'The order was delivered; escalate.',
      schema: SCHEMA,
    });

    expect(extractSection(prompt, 'agent_instructions')).toBe(
      'Escalate refunds of delivered orders to a human.',
    );
    expect(extractSection(prompt, 'conversation')).toBe(
      'user: Cliente pediu reembolso do pedido 4521',
    );
    expect(extractSection(prompt, 'tool_results')).toBe(
      '- find_orders({"number":4521}) => {"records":[{"number":4521,"status":"DELIVERED"}]}',
    );
    expect(extractSection(prompt, 'agent_response')).toBe(
      'The order was delivered; escalate.',
    );
    expect(JSON.parse(extractSection(prompt, 'output_schema') ?? '')).toEqual(
      SCHEMA,
    );
  });

  it('includes tool results from earlier turns of a continued run', () => {
    const prompt = buildStructuredOutputPrompt({
      agentInstructions: '',
      conversationMessages: [...CONVERSATION, ...EXECUTION.slice(0, 2)],
      executionMessages: [{ role: 'assistant', content: 'Escalating now.' }],
      response: 'Escalating now.',
      schema: SCHEMA,
    });

    expect(extractSection(prompt, 'tool_results')).toContain('find_orders');
  });

  it('leaves out the sections it has nothing for', () => {
    const prompt = buildStructuredOutputPrompt({
      agentInstructions: '  ',
      conversationMessages: CONVERSATION,
      executionMessages: [{ role: 'assistant', content: 'Done.' }],
      response: 'Done.',
      schema: SCHEMA,
    });

    expect(prompt).not.toContain('<agent_instructions>');
    expect(prompt).not.toContain('<tool_results>');
    expect(prompt).toContain('<conversation>');
    expect(prompt).toContain('<output_schema>');
  });

  it('cuts long agent instructions down to their cap', () => {
    const instructions = extractSection(
      buildStructuredOutputPrompt({
        agentInstructions: 'Rule. '.repeat(5_000),
        conversationMessages: CONVERSATION,
        executionMessages: [],
        response: 'Done.',
        schema: SCHEMA,
      }),
      'agent_instructions',
    );

    expect(instructions?.endsWith(TRUNCATION_SENTINEL)).toBe(true);
    expect(utf8ByteLengthOf(instructions ?? '')).toBeLessThanOrEqual(
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_INSTRUCTIONS_BYTES + 50,
    );
  });

  it('stays within its caps for a long thread with large tool outputs', () => {
    const conversationMessages = Array.from(
      { length: 200 },
      (): ModelMessage => ({ role: 'user', content: 'a'.repeat(5_000) }),
    );
    const executionMessages = Array.from(
      { length: 100 },
      (_, index): ModelMessage[] => [
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId: `call-${index}`,
              toolName: 'find_records',
              input: { filter: 'b'.repeat(5_000) },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolCallId: `call-${index}`,
              toolName: 'find_records',
              output: { type: 'text', value: 'c'.repeat(100_000) },
            },
          ],
        },
      ],
    ).flat();
    const response = 'Done.';

    const prompt = buildStructuredOutputPrompt({
      agentInstructions: 'd'.repeat(100_000),
      conversationMessages,
      executionMessages,
      response,
      schema: SCHEMA,
    });

    const contextBudgetBytes =
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_INSTRUCTIONS_BYTES +
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_CONVERSATION_BYTES +
      STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_TOOL_RESULTS_BYTES;
    const framingBytes = 1_000;

    expect(utf8ByteLengthOf(prompt)).toBeLessThanOrEqual(
      contextBudgetBytes +
        utf8ByteLengthOf(response) +
        utf8ByteLengthOf(JSON.stringify(SCHEMA)) +
        framingBytes,
    );
  });
});
