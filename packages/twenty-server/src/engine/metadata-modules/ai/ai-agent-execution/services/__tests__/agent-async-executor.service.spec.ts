import { jsonSchema, tool } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { type AgentResponseSchema } from 'twenty-shared/ai';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';

import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { STRUCTURED_OUTPUT_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/structured-output-system-prompt.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AI_SDK_OPENAI_COMPATIBLE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';

const DECISION_SCHEMA: AgentResponseSchema = {
  type: 'object',
  properties: {
    decision: { type: 'string', description: 'reply, escalate or close' },
    company: { type: 'string' },
  },
};

const USAGE = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 5, text: 5, reasoning: 0 },
};

const AGENT_ANSWER = 'Acme is the biggest customer, so this goes to a human.';

const EXECUTION_CONTEXT: AgentRunExecutionContext = {
  authContext: {} as never,
  turnCreatedBy: {} as never,
  userWorkspaceId: null,
  rolePermissionConfig: { intersectionOf: ['role-id'] },
  usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
};

const buildModel = () =>
  new MockLanguageModelV4({
    doGenerate: [
      {
        content: [
          {
            type: 'tool-call',
            toolCallId: 'call-1',
            toolName: 'find_companies',
            input: JSON.stringify({ limit: 1 }),
          },
        ],
        finishReason: { unified: 'tool-calls', raw: undefined },
        usage: USAGE,
        warnings: [],
      },
      {
        content: [{ type: 'text', text: AGENT_ANSWER }],
        finishReason: { unified: 'stop', raw: undefined },
        usage: USAGE,
        warnings: [],
      },
      {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ decision: 'escalate', company: 'Acme' }),
          },
        ],
        finishReason: { unified: 'stop', raw: undefined },
        usage: USAGE,
        warnings: [],
      },
    ],
  });

const buildService = (model: MockLanguageModelV4) => {
  const aiModelRegistryService = {
    validateModelAvailability: jest.fn(),
    resolveModelForAgent: jest.fn().mockResolvedValue({
      modelId: 'litellm/gpt-5-mini',
      sdkPackage: AI_SDK_OPENAI_COMPATIBLE,
      model,
    }),
    getModelConfig: jest.fn().mockReturnValue(undefined),
  };
  const aiModelConfigService = {
    getReasoningProviderOptions: jest.fn().mockReturnValue(undefined),
    getNativeModelTools: jest.fn().mockReturnValue({}),
  };
  const toolRegistry = {
    getToolsByCategories: jest.fn().mockResolvedValue({
      find_companies: tool({
        description: 'Find companies',
        inputSchema: jsonSchema<{ limit: number }>({
          type: 'object',
          properties: { limit: { type: 'number' } },
        }),
        execute: async () => ({
          records: [{ name: 'Acme', employees: 120 }],
        }),
      }),
    }),
  };
  const aiBillingService = {
    assertAiExecutionAllowed: jest.fn().mockResolvedValue(undefined),
    decrementAndCheckAvailableCredits: jest
      .fn()
      .mockResolvedValue({ hasNoMoreAvailableCredits: false }),
    calculateStepsCost: jest.fn().mockReturnValue(0),
    calculateStepsTurnUsage: jest.fn().mockReturnValue(undefined),
    emitAiTokenUsageEvent: jest.fn().mockResolvedValue(undefined),
    billNativeWebSearchUsage: jest.fn().mockResolvedValue(undefined),
  };
  const metricsService = {
    recordHistogram: jest.fn(),
    incrementCounterBy: jest.fn(),
  };
  const runAgentAttachmentService = {
    buildModelMessagesOrThrow: jest
      .fn()
      .mockImplementation(async ({ messages }) => messages),
  };
  const aiAgentRoleService = {
    findAgentRoleId: jest.fn().mockResolvedValue('role-id'),
  };
  const workspaceRepository = {
    findOneBy: jest.fn().mockResolvedValue({ id: 'workspace-id' }),
  };

  return new AgentAsyncExecutorService(
    aiModelRegistryService as never,
    aiModelConfigService as never,
    toolRegistry as never,
    aiBillingService as never,
    metricsService as never,
    runAgentAttachmentService as never,
    aiAgentRoleService as never,
    workspaceRepository as never,
  );
};

const AGENT = {
  id: 'agent-id',
  workspaceId: 'workspace-id',
  modelId: 'litellm/gpt-5-mini',
  prompt: 'Escalate anything about our biggest customer to a human.',
  responseFormat: { type: 'json', schema: DECISION_SCHEMA },
  modelConfiguration: {},
} as unknown as AgentEntity;

describe('AgentAsyncExecutorService', () => {
  it('structures the output of a json agent from its request, its tool results and its answer', async () => {
    const model = buildModel();
    const service = buildService(model);

    const execution = await service.executeAgent({
      agent: AGENT,
      messages: [
        { role: 'user', content: 'Should the Acme ticket go to a human?' },
      ],
      baseSystemPrompt: 'You are a CRM agent.',
      workspaceId: 'workspace-id',
      executionContext: EXECUTION_CONTEXT,
    });

    expect(execution.result).toEqual({ decision: 'escalate', company: 'Acme' });
    expect(model.doGenerateCalls).toHaveLength(3);

    const { prompt, responseFormat } = model.doGenerateCalls[2];
    const [systemMessage, userMessage] = prompt;
    const structuringPrompt =
      userMessage.role === 'user' && userMessage.content[0].type === 'text'
        ? userMessage.content[0].text
        : '';

    expect(systemMessage).toEqual({
      role: 'system',
      content: STRUCTURED_OUTPUT_SYSTEM_PROMPT,
    });
    expect(structuringPrompt).toContain(
      'Escalate anything about our biggest customer to a human.',
    );
    expect(structuringPrompt).toContain(
      'user: Should the Acme ticket go to a human?',
    );
    expect(structuringPrompt).toContain(
      '- find_companies({"limit":1}) => {"records":[{"name":"Acme","employees":120}]}',
    );
    expect(structuringPrompt).toContain(AGENT_ANSWER);
    expect(structuringPrompt).toContain('"reply, escalate or close"');
    expect(responseFormat).toEqual({
      type: 'json',
      schema: {
        ...DECISION_SCHEMA,
        required: ['decision', 'company'],
        additionalProperties: false,
      },
    });
  });

  it('makes a single call for an agent that answers in text', async () => {
    const model = buildModel();
    const service = buildService(model);

    const execution = await service.executeAgent({
      agent: { ...AGENT, responseFormat: { type: 'text' } } as AgentEntity,
      messages: [
        { role: 'user', content: 'Should the Acme ticket go to a human?' },
      ],
      baseSystemPrompt: 'You are a CRM agent.',
      workspaceId: 'workspace-id',
      executionContext: EXECUTION_CONTEXT,
    });

    expect(execution.result).toEqual({ response: AGENT_ANSWER });
    expect(model.doGenerateCalls).toHaveLength(2);
  });
});
