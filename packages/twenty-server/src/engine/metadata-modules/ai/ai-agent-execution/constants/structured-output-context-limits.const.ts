// the structuring call reads at most about 28 KB of context (roughly 7k tokens) besides the agent's answer
// and the schema, so a long thread or a run with large tool outputs keeps it a small fixed cost
export const STRUCTURED_OUTPUT_CONTEXT_LIMITS = {
  MAX_INSTRUCTIONS_BYTES: 4_000,
  MAX_MESSAGE_BYTES: 2_000,
  MAX_CONVERSATION_BYTES: 8_000,
  MAX_TOOL_INPUT_BYTES: 500,
  MAX_TOOL_OUTPUT_BYTES: 2_000,
  MAX_TOOL_RESULTS_BYTES: 16_000,
};
