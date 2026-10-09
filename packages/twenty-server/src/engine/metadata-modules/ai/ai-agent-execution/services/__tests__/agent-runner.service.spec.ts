import { Logger } from '@nestjs/common';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { WAIT_FOR_DURATION_TOOL_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/wait-for-duration-tool-name.constant';
import { WAIT_FOR_EVENT_TOOL_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/wait-for-event-tool-name.constant';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';

const CREATED_BY = {
  source: 'WORKFLOW',
  name: 'New deals',
  workspaceMemberId: null,
  context: {},
} as AgentRunnerRunInput['executionContext']['turnCreatedBy'];

const PRIOR_MESSAGES = [{ id: 'message-id', role: 'assistant', parts: [] }];

const MESSAGES = [{ role: 'user' as const, content: 'Draft a quote' }];

const buildExecution = (
  overrides: Partial<AgentExecutionResult> = {},
): AgentExecutionResult => ({
  result: { answer: 'done' },
  usage: {
    inputTokens: 1,
    outputTokens: 2,
    totalTokens: 3,
  } as AgentExecutionResult['usage'],
  cacheCreationTokens: 0,
  nativeWebSearchCallCount: 0,
  hasNoMoreAvailableCredits: false,
  isPaused: false,
  steps: [],
  modelId: 'model-id',
  totalCostInDollars: 0,
  creditsUsedMicro: 0,
  turnUsage: {
    inputTokens: 1,
    outputTokens: 2,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    inputCredits: 0,
    outputCredits: 0,
  },
  ...overrides,
});

const RUN_INPUT: AgentRunnerRunInput = {
  workspaceId: 'workspace-id',
  conversation: { threadId: 'thread-id', isCreated: false },
  caller: {
    type: 'WORKFLOW_STEP',
    ref: { workflowRunId: 'run', stepId: 'step' },
  },
  spec: {
    agentId: null,
    title: 'Draft the quote',
    baseSystemPrompt: 'base prompt',
    instructions: null,
    capabilities: {
      canAskHumans: false,
    },
  },
  agent: null,
  prompt: {
    messages: MESSAGES,
    senderUserWorkspaceId: 'user-workspace-id',
    senderApplicationId: null,
  },
  executionContext: {
    authContext: {} as never,
    userWorkspaceId: 'user-workspace-id',
    rolePermissionConfig: { intersectionOf: [] },
    conversationActor: { type: 'application', applicationId: 'app-id' },
    turnCreatedBy: CREATED_BY,
    usageOperationType: UsageOperationType.AI_WORKFLOW_TOKEN,
  },
};

const SUSPENSION = {
  caller: RUN_INPUT.caller,
  runSpec: RUN_INPUT.spec,
  summary: null,
  continuationCount: 0,
};

const CONTINUATION = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  wakeUpId: 'wake-up-id',
  outcome: { type: 'ANSWERED' as const, answer: { result: {} } },
};

const buildService = (execution = buildExecution()) => {
  const agentAsyncExecutorService = {
    executeAgent: jest.fn().mockResolvedValue(execution),
  };
  const agentRunConversationService = {
    openTurn: jest.fn().mockResolvedValue('turn-id'),
    closeTurn: jest.fn().mockResolvedValue({ isAwaitingAnswer: false }),
    failTurn: jest.fn().mockResolvedValue(undefined),
    withThreadLock: jest.fn(({ work }) => work()),
  };
  const conversationReaderService = {
    loadMessages: jest.fn().mockResolvedValue(PRIOR_MESSAGES),
  };

  const agentRunSuspensionService = {
    assertConversationNotSuspended: jest.fn().mockResolvedValue(undefined),
    closeAwaitedCalls: jest.fn().mockResolvedValue(undefined),
    suspend: jest.fn().mockResolvedValue(undefined),
    settle: jest.fn().mockResolvedValue(undefined),
    recordWaitOutcome: jest.fn().mockResolvedValue(undefined),
  };
  const callerHandler = {
    getWaitingState: jest.fn().mockResolvedValue('WAITING'),
    buildExecutionContext: jest
      .fn()
      .mockResolvedValue(RUN_INPUT.executionContext),
  };

  const pendingWakeUpService = {
    claim: jest.fn().mockResolvedValue({
      condition: { type: 'ANSWER', threadId: 'thread-id' },
      payload: SUSPENSION,
    }),
    cancel: jest.fn().mockResolvedValue([]),
  };

  jest.spyOn(Logger.prototype, 'error').mockImplementation();

  const service = new AgentRunnerService(
    agentAsyncExecutorService as never,
    agentRunConversationService as never,
    conversationReaderService as never,
    agentRunSuspensionService as never,
    { getHandlerOrThrow: () => callerHandler } as never,
    pendingWakeUpService as never,
    {} as never,
  );

  return {
    service,
    agentAsyncExecutorService,
    agentRunConversationService,
    conversationReaderService,
    agentRunSuspensionService,
    callerHandler,
    pendingWakeUpService,
  };
};

describe('AgentRunnerService', () => {
  it('continues a conversation under its lock and records the turn', async () => {
    const {
      service,
      agentAsyncExecutorService,
      agentRunConversationService,
      conversationReaderService,
    } = buildService();

    const { threadId, outcome, summary } = await service.run(RUN_INPUT);

    expect(threadId).toBe('thread-id');
    expect(outcome).toEqual({
      status: 'COMPLETED',
      result: { answer: 'done' },
    });
    expect(summary).toMatchObject({ modelId: 'model-id', toolCalls: [] });
    expect(agentRunConversationService.withThreadLock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
      }),
    );
    expect(conversationReaderService.loadMessages).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      actor: { type: 'application', applicationId: 'app-id' },
    });
    expect(agentRunConversationService.openTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      title: 'Draft the quote',
      agentId: null,
      senderUserWorkspaceId: 'user-workspace-id',
      senderApplicationId: null,
      createdBy: CREATED_BY,
      messages: MESSAGES,
    });
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: MESSAGES,
        baseSystemPrompt: expect.stringMatching(
          /^base prompt\n\n.*wait_for_event/,
        ),
        priorMessages: PRIOR_MESSAGES,
        executionContext: RUN_INPUT.executionContext,
      }),
    );
    expect(agentRunConversationService.closeTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        turnId: 'turn-id',
        title: 'Draft the quote',
      }),
    );
  });

  it.each([true, false])(
    'offers every human-input tool only to a run that can ask humans (%s)',
    async (canAskHumans) => {
      const { service, agentAsyncExecutorService } = buildService();

      await service.run({
        ...RUN_INPUT,
        spec: { ...RUN_INPUT.spec, capabilities: { canAskHumans } },
      });

      expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
        expect.objectContaining({ canAskHumans }),
      );
    },
  );

  it('records a run that cannot wait without offering or explaining the waits', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();

    await service.run({
      ...RUN_INPUT,
      spec: {
        ...RUN_INPUT.spec,
        capabilities: { canAskHumans: false, canWait: false },
      },
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        pausingTools: {},
        baseSystemPrompt: RUN_INPUT.spec.baseSystemPrompt,
      }),
    );
    expect(agentRunConversationService.openTurn).toHaveBeenCalled();
    expect(agentRunConversationService.closeTurn).toHaveBeenCalled();
  });

  it('offers the waits to a run spec saved before canWait', async () => {
    const { service, agentAsyncExecutorService } = buildService();

    await service.run(RUN_INPUT);

    expect(
      Object.keys(
        agentAsyncExecutorService.executeAgent.mock.calls[0][0].pausingTools,
      ),
    ).toEqual([WAIT_FOR_EVENT_TOOL_NAME, WAIT_FOR_DURATION_TOOL_NAME]);
  });

  it('locks a conversation it just created without reading it', async () => {
    const {
      service,
      agentRunConversationService,
      conversationReaderService,
      agentAsyncExecutorService,
    } = buildService();

    await service.run({
      ...RUN_INPUT,
      conversation: { threadId: 'thread-id', isCreated: true },
    });

    expect(agentRunConversationService.withThreadLock).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: 'thread-id' }),
    );
    expect(conversationReaderService.loadMessages).not.toHaveBeenCalled();
    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ priorMessages: [] }),
    );
  });

  it('still runs the agent when the turn cannot be opened', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();

    agentRunConversationService.openTurn.mockRejectedValue(
      new Error('db down'),
    );

    const { outcome } = await service.run(RUN_INPUT);

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalled();
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
    expect(outcome).toEqual({
      status: 'COMPLETED',
      result: { answer: 'done' },
    });
  });

  it('fails the turn of a run that throws', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();
    const error = new Error('provider down');

    agentAsyncExecutorService.executeAgent.mockRejectedValue(error);

    await expect(service.run(RUN_INPUT)).rejects.toThrow('provider down');
    expect(agentRunConversationService.failTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      turnId: 'turn-id',
      error,
    });
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
  });

  it('fails a run that ran out of credits', async () => {
    const { service } = buildService(
      buildExecution({ hasNoMoreAvailableCredits: true }),
    );

    await expect(service.run(RUN_INPUT)).resolves.toMatchObject({
      outcome: {
        status: 'FAILED',
        error: 'Agent stopped: no more available credits.',
        errorCode: 'CREDITS_EXHAUSTED',
      },
    });
  });

  it('suspends a run that asked a question on an answer to it', async () => {
    const { service, agentRunConversationService, agentRunSuspensionService } =
      buildService(buildExecution({ isPaused: true }));

    agentRunConversationService.closeTurn.mockResolvedValue({
      isAwaitingAnswer: true,
    });

    const { outcome } = await service.run(RUN_INPUT);

    expect(outcome).toEqual({ status: 'SUSPENDED' });
    expect(agentRunSuspensionService.suspend).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      condition: { type: 'ANSWER', threadId: 'thread-id' },
      suspension: expect.objectContaining({
        caller: RUN_INPUT.caller,
        runSpec: RUN_INPUT.spec,
        continuationCount: 0,
      }),
    });
    expect(agentRunSuspensionService.closeAwaitedCalls).not.toHaveBeenCalled();
  });

  it('stops a continued run that keeps pausing and closes what it asked', async () => {
    const {
      service,
      agentRunConversationService,
      agentRunSuspensionService,
      conversationReaderService,
      pendingWakeUpService,
    } = buildService(buildExecution({ isPaused: true }));

    agentRunConversationService.closeTurn.mockResolvedValue({
      isAwaitingAnswer: true,
    });
    pendingWakeUpService.claim.mockResolvedValue({
      condition: { type: 'ANSWER', threadId: 'thread-id' },
      payload: { ...SUSPENSION, continuationCount: 49 },
    });

    await service.continue(CONTINUATION);

    expect(agentRunConversationService.withThreadLock).toHaveBeenCalledTimes(1);
    expect(pendingWakeUpService.claim).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      wakeUpId: 'wake-up-id',
    });
    expect(conversationReaderService.loadMessages).toHaveBeenCalled();
    expect(agentRunSuspensionService.suspend).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.closeAwaitedCalls).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      isAwaitingAnswer: true,
    });
    expect(agentRunSuspensionService.settle).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 'thread-id',
        outcome: {
          status: 'FAILED',
          error: 'Agent stopped: it paused more than 50 times in one run.',
        },
      }),
    );
  });

  it('drops a continuation whose caller stopped waiting', async () => {
    const { service, callerHandler, agentAsyncExecutorService } =
      buildService();

    callerHandler.getWaitingState.mockResolvedValue('GONE');

    await service.continue(CONTINUATION);

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('continues a pause once, as a second continuation finds its wake-up claimed', async () => {
    const { service, pendingWakeUpService, agentAsyncExecutorService } =
      buildService();

    pendingWakeUpService.claim.mockResolvedValue(null);

    await service.continue(CONTINUATION);

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });

  it('fails the run when its answer could not be delivered', async () => {
    const { service, agentRunSuspensionService, agentAsyncExecutorService } =
      buildService();

    await service.continue({
      ...CONTINUATION,
      outcome: { type: 'ANSWERED', answer: { error: 'answer lost' } },
    });

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
    expect(agentRunSuspensionService.settle).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'answer lost' },
        isAwaitingAnswer: true,
      }),
    );
  });

  it('fails a claimed run whose caller cannot be read, rather than dropping it', async () => {
    const { service, callerHandler, agentRunSuspensionService } =
      buildService();

    callerHandler.getWaitingState.mockRejectedValue(new Error('db down'));

    await service.continue(CONTINUATION);

    expect(agentRunSuspensionService.settle).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { status: 'FAILED', error: 'db down' },
      }),
    );
  });

  it('drops the pause of a continued run whose caller stopped waiting while it ran', async () => {
    const {
      service,
      callerHandler,
      agentRunConversationService,
      agentRunSuspensionService,
      pendingWakeUpService,
    } = buildService(buildExecution({ isPaused: true }));

    agentRunConversationService.closeTurn.mockResolvedValue({
      isAwaitingAnswer: true,
    });
    callerHandler.getWaitingState
      .mockResolvedValueOnce('WAITING')
      .mockResolvedValueOnce('GONE');

    await service.continue(CONTINUATION);

    expect(agentRunSuspensionService.suspend).toHaveBeenCalled();
    expect(pendingWakeUpService.cancel).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      owner: { type: 'AGENT_RUN', id: 'thread-id' },
    });
    expect(agentRunSuspensionService.closeAwaitedCalls).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      isAwaitingAnswer: true,
    });
  });

  it('runs a turn it does not record and still reports its usage', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService(
        buildExecution({
          modelId: 'openai/gpt-5-mini',
          totalCostInDollars: 0.0004,
          creditsUsedMicro: 400,
        }),
      );

    const { outcome, summary } = await service.run({
      ...RUN_INPUT,
      conversation: { threadId: 'thread-id', isCreated: true },
      persist: false,
    });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: MESSAGES,
        priorMessages: [],
        pausingTools: {},
        baseSystemPrompt: RUN_INPUT.spec.baseSystemPrompt,
        executionContext: RUN_INPUT.executionContext,
      }),
    );
    expect(agentRunConversationService.openTurn).not.toHaveBeenCalled();
    expect(agentRunConversationService.closeTurn).not.toHaveBeenCalled();
    expect(outcome).toEqual({
      status: 'COMPLETED',
      result: { answer: 'done' },
    });
    expect(summary).toMatchObject({
      modelId: 'openai/gpt-5-mini',
      usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
      cost: { totalCostInDollars: 0.0004, creditsUsedMicro: 400 },
    });
  });

  it('keeps the step limit in its run spec', async () => {
    const { service, agentAsyncExecutorService } = buildService();

    await service.run({ ...RUN_INPUT, spec: { ...RUN_INPUT.spec, maxSteps: 4 } });

    expect(agentAsyncExecutorService.executeAgent).toHaveBeenCalledWith(
      expect.objectContaining({ maxSteps: 4 }),
    );
  });

  it('records nothing of a turn it does not record that throws', async () => {
    const { service, agentAsyncExecutorService, agentRunConversationService } =
      buildService();

    agentAsyncExecutorService.executeAgent.mockRejectedValue(
      new Error('provider down'),
    );

    await expect(service.run({ ...RUN_INPUT, persist: false })).rejects.toThrow(
      'provider down',
    );
    expect(agentRunConversationService.openTurn).not.toHaveBeenCalled();
    expect(agentRunConversationService.failTurn).not.toHaveBeenCalled();
  });
});
