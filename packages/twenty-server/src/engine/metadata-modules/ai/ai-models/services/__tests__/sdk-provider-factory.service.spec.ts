import { generateText, jsonSchema, Output } from 'ai';
import { type AgentResponseSchema } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_SDK_OPENAI_COMPATIBLE } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

const DECISION_SCHEMA: AgentResponseSchema = {
  type: 'object',
  properties: {
    decision: { type: 'string', description: 'reply, escalate or close' },
  },
  required: ['decision'],
  additionalProperties: false,
};

const CHAT_COMPLETION = {
  id: 'chatcmpl-1',
  object: 'chat.completion',
  created: 1_700_000_000,
  model: 'gpt-5-mini',
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: '{"decision":"escalate"}' },
      finish_reason: 'stop',
    },
  ],
  usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
};

// runs a JSON call the way the agent executor does and returns the body the endpoint received
const sendJsonCall = async (
  providerConfig: Partial<AiProviderConfig>,
): Promise<{ requestBody: Record<string, unknown>; output: unknown }> => {
  const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(CHAT_COMPLETION), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const { createModel } = new SdkProviderFactoryService().createProvider(
    'litellm',
    {
      npm: AI_SDK_OPENAI_COMPATIBLE,
      name: 'litellm',
      baseUrl: 'http://litellm.test/v1',
      ...providerConfig,
    },
  );

  if (!isDefined(createModel)) {
    throw new Error('An openai-compatible provider creates chat models');
  }

  const { output } = await generateText({
    model: createModel('gpt-5-mini'),
    prompt: 'Decide what to do with this conversation.',
    output: Output.object({ schema: jsonSchema(DECISION_SCHEMA) }),
  });

  const [, requestInit] = fetchSpy.mock.calls[0];

  return { requestBody: JSON.parse(String(requestInit?.body)), output };
};

describe('SdkProviderFactoryService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('openai-compatible providers', () => {
    it('sends the response schema when the provider declares structured outputs', async () => {
      const { requestBody, output } = await sendJsonCall({
        supportsStructuredOutputs: true,
      });

      expect(requestBody.response_format).toEqual({
        type: 'json_schema',
        json_schema: {
          name: 'response',
          strict: true,
          schema: DECISION_SCHEMA,
        },
      });
      expect(output).toEqual({ decision: 'escalate' });
    });

    it.each([
      ['does not declare structured outputs', {}],
      ['declares no structured outputs', { supportsStructuredOutputs: false }],
    ])(
      'asks for a bare JSON object, as before, when the provider %s',
      async (_, providerConfig) => {
        const { requestBody, output } = await sendJsonCall(providerConfig);

        expect(requestBody.response_format).toEqual({ type: 'json_object' });
        expect(JSON.stringify(requestBody)).not.toContain('reply, escalate');
        expect(output).toEqual({ decision: 'escalate' });
      },
    );
  });
});
