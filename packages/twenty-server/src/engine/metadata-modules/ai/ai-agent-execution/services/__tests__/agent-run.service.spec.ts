import { Logger } from '@nestjs/common';

import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE = { id: 'workspace-id' } as never;
const APPLICATION = { id: 'application-id' };
const AGENT = {
  id: 'agent-id',
  label: 'Slack Assistant',
  applicationId: APPLICATION.id,
  universalIdentifier: 'slack-assistant',
};
const RUN_AS_USER_WORKSPACE_ID = 'user-workspace-id';
const RUN_AS_ACTOR = {
  source: 'API',
  name: 'Tim Apple',
  workspaceMemberId: 'workspace-member-id',
  context: {},
};
const SUMMARY: AgentRunSummary = {
  modelId: 'openai/gpt-5-mini',
  usage: {
    inputTokens: 1200,
    outputTokens: 80,
    reasoningTokens: 16,
    cacheReadTokens: 1000,
    cacheCreationTokens: 0,
    totalTokens: 1280,
  },
  cost: { totalCostInDollars: 0.0004, creditsUsedMicro: 400 },
  nativeWebSearchCallCount: 0,
  toolCalls: [
    {
      toolName: 'find_companies',
      toolCallId: 'call-id',
      input: { limit: 1 },
      output: { records: [{ name: 'Acme' }] },
      state: 'success',
    },
  ],
  durationMs: 2300,
};
const REPORTED_SUMMARY = {
  modelId: 'openai/gpt-5-mini',
  usage: {
    inputTokens: 1200,
    outputTokens: 80,
    reasoningTokens: 16,
    cacheReadTokens: 1000,
    cacheCreationTokens: 0,
    totalTokens: 1280,
    nativeWebSearchCallCount: 0,
  },
  cost: { totalCostInDollars: 0.0004, creditsUsedMicro: 400 },
  toolCalls: [{ toolName: 'find_companies', state: 'success' }],
  durationMs: 2300,
};
const buildService = () => {
  const agentRunnerService = {
    run: jest.fn().mockImplementation(async ({ conversation }) => ({
      threadId: conversation.threadId,
      outcome: {
        status: 'COMPLETED',
        result: { response: 'Acme is your biggest customer' },
      },
      summary: SUMMARY,
    })),
  };
  const agentActorContextService = {
    buildRunAsWorkspaceMemberContext: jest.fn().mockResolvedValue({
      actorContext: RUN_AS_ACTOR,
      authContext: { userWorkspaceId: RUN_AS_USER_WORKSPACE_ID },
      roleId: 'role-id',
    }),
  };

  const service = new AgentRunService(
    agentActorContextService as never,
    agentRunnerService as never,
    { findById: jest.fn().mockResolvedValue(APPLICATION) } as never,
    { findOne: jest.fn().mockResolvedValue(AGENT) } as never,
  );

  return { service, agentRunnerService };
};

const runInput = (agentRunnerService: { run: jest.Mock }) =>
  agentRunnerService.run.mock.calls[0][0];

const run = (
  service: AgentRunService,
  input: Record<string, unknown>,
  {
    isCalledByApplication = true,
    requestUserWorkspaceId = null,
  }: {
    isCalledByApplication?: boolean;
    requestUserWorkspaceId?: string | null;
  } = {},
) =>
  service.run({
    workspace: WORKSPACE,
    requestUserWorkspaceId,
    requestWorkspaceMemberId: null,
    callerApplication: isCalledByApplication
      ? (APPLICATION as never)
      : undefined,
    input: { agentUniversalIdentifier: AGENT.universalIdentifier, ...input },
  });

const userInput = (content: string) => [{ role: 'user', content }];

describe('AgentRunService', () => {
  it('runs without a thread in a new conversation of its own', async () => {
    const { service, agentRunnerService } = buildService();

    const result = await run(service, {
      input: userInput('Who is our biggest customer?'),
    });
    const secondResult = await run(service, {
      input: userInput('Who is our biggest customer?'),
    });

    expect(result).toEqual({
      result: { response: 'Acme is your biggest customer' },
      error: null,
      success: true,
      threadId: expect.any(String),
      errorCode: null,
      ...REPORTED_SUMMARY,
    });
    expect(secondResult.threadId).not.toBe(result.threadId);

    const { conversation, turn, execution } = runInput(agentRunnerService);

    expect(conversation).toEqual({
      threadId: result.threadId,
      isCreated: true,
    });
    expect(turn).toMatchObject({
      title: AGENT.label,
      senderUserWorkspaceId: null,
      senderApplicationId: APPLICATION.id,
      messages: userInput('Who is our biggest customer?'),
    });
    await expect(turn.resolveCreatedBy()).resolves.toMatchObject({
      source: 'APPLICATION',
    });
    expect(execution).toMatchObject({ toolLoadingStrategy: 'lazy' });
  });

  it('keeps the replies a run without a thread hands over as its input', async () => {
    const { service, agentRunnerService } = buildService();
    const history = [
      { role: 'user', content: 'Who is our biggest customer?' },
      { role: 'assistant', content: 'Acme.' },
      { role: 'user', content: 'And the second one?' },
    ];

    await run(service, { input: history });

    expect(runInput(agentRunnerService).turn.messages).toEqual(history);
  });

  it('keeps accepting a prompt', async () => {
    const { service, agentRunnerService } = buildService();

    await run(service, { prompt: 'Who is our biggest customer?' });

    expect(runInput(agentRunnerService).execution.messages).toEqual(
      userInput('Who is our biggest customer?'),
    );
  });

  it('continues the thread as the member it runs as', async () => {
    const { service, agentRunnerService } = buildService();
    const threadId = buildAgentRunThreadId({
      applicationId: APPLICATION.id,
      agentId: AGENT.id,
      threadKey: 'C123:1700000000.000100',
    });

    const result = await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'C123:1700000000.000100' },
      runAsWorkspaceMemberId: 'workspace-member-id',
    });

    const { conversation, conversationActor, turn, execution } =
      runInput(agentRunnerService);

    expect(result.threadId).toBe(threadId);
    expect(conversation).toEqual({ threadId, isCreated: false });
    expect(conversationActor).toEqual({
      type: 'user',
      userWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
    });
    expect(turn).toMatchObject({
      title: AGENT.label,
      senderUserWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
    });
    await expect(turn.resolveCreatedBy()).resolves.toEqual(RUN_AS_ACTOR);
    expect(execution).toMatchObject({
      actorContext: RUN_AS_ACTOR,
      userWorkspaceId: RUN_AS_USER_WORKSPACE_ID,
      runAsRoleId: 'role-id',
    });
  });

  it('gives the additional instructions to the model without recording them', async () => {
    const { service, agentRunnerService } = buildService();

    await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'thread', title: 'Acme renewal' },
      additionalInstructions: 'Answer in Slack markdown',
    });

    const { turn, execution } = runInput(agentRunnerService);

    expect(execution.messages).toEqual(
      userInput('Answer in Slack markdown\n\nAnd the second one?'),
    );
    expect(turn).toMatchObject({
      title: 'Acme renewal',
      messages: userInput('And the second one?'),
      senderUserWorkspaceId: null,
    });
  });

  it('records the member who called without an application as the sender', async () => {
    const { service, agentRunnerService } = buildService();

    await run(
      service,
      { input: userInput('Who is our biggest customer?') },
      {
        isCalledByApplication: false,
        requestUserWorkspaceId: 'caller-user-workspace-id',
      },
    );

    expect(runInput(agentRunnerService).turn).toMatchObject({
      senderUserWorkspaceId: 'caller-user-workspace-id',
      senderApplicationId: null,
    });
  });

  it('reports a run that ran out of credits with what it spent', async () => {
    const { service, agentRunnerService } = buildService();

    agentRunnerService.run.mockResolvedValue({
      threadId: 'thread-id',
      outcome: {
        status: 'FAILED',
        error: 'Agent stopped: no more available credits.',
        errorCode: 'CREDITS_EXHAUSTED',
      },
      summary: SUMMARY,
    });

    await expect(run(service, { input: userInput('Hello') })).resolves.toEqual({
      result: null,
      success: false,
      error: 'Agent stopped: no more available credits.',
      errorCode: 'CREDITS_EXHAUSTED',
      threadId: expect.any(String),
      ...REPORTED_SUMMARY,
    });
  });

  it('reports a failed run without throwing', async () => {
    const { service, agentRunnerService } = buildService();

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    agentRunnerService.run.mockRejectedValue(new Error('provider down'));

    await expect(
      run(service, { input: userInput('Hello') }),
    ).resolves.toMatchObject({
      success: false,
      error: 'Agent execution failed.',
      errorCode: 'AGENT_EXECUTION_FAILED',
    });
  });

  it('reports the code of a usage limit that stopped the run', async () => {
    const { service, agentRunnerService } = buildService();

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    agentRunnerService.run.mockRejectedValue(
      new UsageLimitException(
        'Usage limit reached for agent',
        UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      ),
    );

    const result = await run(service, { input: userInput('Hello') });

    expect(result).toMatchObject({
      success: false,
      error: 'Agent execution failed.',
      errorCode: 'QUOTA_EXHAUSTED',
    });
    expect(result.usage).toBeUndefined();
  });

  it('keeps the provider message of a failed run from its caller', async () => {
    const { service, agentRunnerService } = buildService();

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    agentRunnerService.run.mockRejectedValue(
      new AiException(
        'Request to http://litellm.internal:4000/v1/chat/completions failed',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      ),
    );

    const result = await run(service, { input: userInput('Hello') });

    expect(JSON.stringify(result)).not.toContain('litellm');
    expect(result).toMatchObject({
      error: 'Agent execution failed.',
      errorCode: 'AGENT_EXECUTION_FAILED',
    });
  });

  it('runs without recording anything when persist is false', async () => {
    const { service, agentRunnerService } = buildService();

    const result = await run(service, {
      input: userInput('Who is our biggest customer?'),
      persist: false,
    });

    const { turn, execution } = runInput(agentRunnerService);

    expect(turn).toBeNull();
    expect(execution).toMatchObject({
      messages: userInput('Who is our biggest customer?'),
      toolLoadingStrategy: 'lazy',
    });
    expect(result).toEqual({
      result: { response: 'Acme is your biggest customer' },
      error: null,
      success: true,
      threadId: null,
      errorCode: null,
      ...REPORTED_SUMMARY,
    });
  });

  it('reads a thread without adding to it when persist is false', async () => {
    const { service, agentRunnerService } = buildService();

    const result = await run(service, {
      input: userInput('And the second one?'),
      thread: { key: 'C123:1700000000.000100' },
      persist: false,
    });

    const { conversation, turn } = runInput(agentRunnerService);

    expect(conversation).toEqual({
      threadId: buildAgentRunThreadId({
        applicationId: APPLICATION.id,
        agentId: AGENT.id,
        threadKey: 'C123:1700000000.000100',
      }),
      isCreated: false,
    });
    expect(turn).toBeNull();
    expect(result.threadId).toBeNull();
  });

  it.each([[true], [null], [undefined]])(
    'records the run when persist is %s',
    async (persist) => {
      const { service, agentRunnerService } = buildService();

      const result = await run(service, {
        input: userInput('Who is our biggest customer?'),
        persist,
      });

      expect(runInput(agentRunnerService).turn).toMatchObject({
        title: AGENT.label,
        messages: userInput('Who is our biggest customer?'),
      });
      expect(result.threadId).toEqual(expect.any(String));
    },
  );

  it('refuses a thread without an application token', async () => {
    const { service } = buildService();

    await expect(
      run(
        service,
        { input: userInput('Hello'), thread: { key: 'thread' } },
        { isCalledByApplication: false },
      ),
    ).rejects.toMatchObject({ code: AiExceptionCode.RUN_AGENT_NOT_ALLOWED });
  });

  it.each([
    ['a member', 'caller-user-workspace-id'],
    ['an API key', null],
  ])(
    'refuses to run without recording for %s',
    async (_, requestUserWorkspaceId) => {
      const { service, agentRunnerService } = buildService();

      await expect(
        run(
          service,
          { input: userInput('Hello'), persist: false },
          { isCalledByApplication: false, requestUserWorkspaceId },
        ),
      ).rejects.toMatchObject({ code: AiExceptionCode.RUN_AGENT_NOT_ALLOWED });
      expect(agentRunnerService.run).not.toHaveBeenCalled();
    },
  );

  it('refuses a thread with a blank key', async () => {
    const { service, agentRunnerService } = buildService();

    await expect(
      run(service, { input: userInput('Hello'), thread: { key: '  ' } }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
    expect(agentRunnerService.run).not.toHaveBeenCalled();
  });

  it('refuses assistant messages sent to a thread', async () => {
    const { service } = buildService();

    await expect(
      run(service, {
        thread: { key: 'thread' },
        input: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi' },
        ],
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
  });
});
