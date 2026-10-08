import { type RunAgentMessageAttachment } from './runAgentMessageAttachmentType';

export type RunAgentMessageRole = 'user' | 'assistant';

export type RunAgentMessage = {
  role: RunAgentMessageRole;
  content: string;
  attachments?: RunAgentMessageAttachment[];
};

export type RunAgentThread = {
  key: string;
  title?: string;
};

export type RunAgentInput = {
  agentUniversalIdentifier: string;
  additionalInstructions?: string;
  thread?: RunAgentThread;
  runAsWorkspaceMemberId?: string;
  // false runs the agent without writing its conversation, for application tokens only; billing is unchanged
  persist?: boolean;
} & (
  | {
      input: string | RunAgentMessage[];
      prompt?: never;
      messages?: never;
    }
  | {
      /** @deprecated Use `input` instead. */
      prompt: string;
      input?: never;
      messages?: never;
    }
  | {
      /** @deprecated Use `input` instead. */
      messages: RunAgentMessage[];
      input?: never;
      prompt?: never;
    }
);

export type RunAgentUsage = {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number | null;
  cacheReadTokens: number | null;
  cacheCreationTokens: number | null;
  totalTokens: number;
  nativeWebSearchCallCount: number;
};

export type RunAgentCost = {
  totalCostInDollars: number;
  creditsUsedMicro: number;
};

export type RunAgentToolCallState =
  | 'started'
  | 'success'
  | 'error'
  | 'awaiting-approval';

export type RunAgentToolCall = {
  toolName: string;
  state: RunAgentToolCallState;
};

export type RunAgentResult = {
  // null when the run was kept off the record (persist: false), so it has no conversation
  threadId: string | null;
  // SUSPENDED: the agent paused on a wait and goes on by itself; its reply lands in the thread
  status: 'COMPLETED' | 'SUSPENDED' | 'FAILED';
  result: object | null;
  error: string | null;
  success: boolean;
  // a code such as QUOTA_EXHAUSTED, never the provider's message, which can name internal hosts
  errorCode?: string | null;
  modelId?: string | null;
  usage?: RunAgentUsage | null;
  cost?: RunAgentCost | null;
  toolCalls?: RunAgentToolCall[] | null;
  durationMs?: number | null;
};
