import { isNonEmptyString } from '@sniptt/guards';
import { type ModelMessage } from 'ai';
import { type AgentResponseSchema } from 'twenty-shared/ai';

import { STRUCTURED_OUTPUT_CONTEXT_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/structured-output-context-limits.const';
import { summarizeConversationForStructuredOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/summarize-conversation-for-structured-output.util';
import { summarizeToolResultsForStructuredOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/summarize-tool-results-for-structured-output.util';
import { truncateStringToUtf8ByteBudget } from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const buildSection = (tag: string, content: string): string[] =>
  isNonEmptyString(content) ? [`<${tag}>\n${content}\n</${tag}>`] : [];

// the schema is written out because a provider without structured outputs never receives it,
// and the agent's own prompt is what tells what each field means
export const buildStructuredOutputPrompt = ({
  agentInstructions,
  conversationMessages,
  executionMessages,
  response,
  schema,
}: {
  agentInstructions: string;
  // what the agent was asked, earlier turns of a continued run included
  conversationMessages: ModelMessage[];
  // what the agent produced on this call, with its tool calls and results
  executionMessages: ModelMessage[];
  response: string;
  schema: AgentResponseSchema;
}): string =>
  [
    'Based on the following execution results, generate the structured output according to the schema.',
    ...buildSection(
      'agent_instructions',
      truncateStringToUtf8ByteBudget(
        agentInstructions.trim(),
        STRUCTURED_OUTPUT_CONTEXT_LIMITS.MAX_INSTRUCTIONS_BYTES,
      ).value,
    ),
    ...buildSection(
      'conversation',
      summarizeConversationForStructuredOutput(conversationMessages),
    ),
    ...buildSection(
      'tool_results',
      summarizeToolResultsForStructuredOutput([
        ...conversationMessages,
        ...executionMessages,
      ]),
    ),
    ...buildSection('agent_response', response.trim()),
    ...buildSection('output_schema', JSON.stringify(schema)),
    'Generate the structured output from the execution results and context above. Use the agent instructions only to understand what each field means.',
  ].join('\n\n');
