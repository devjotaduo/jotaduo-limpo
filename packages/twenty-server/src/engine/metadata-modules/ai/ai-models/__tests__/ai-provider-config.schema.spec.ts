import { aiProviderConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.schema';

const LITELLM_PROVIDER = {
  npm: '@ai-sdk/openai-compatible',
  label: 'LiteLLM',
  baseUrl: 'http://litellm.test/v1',
};

describe('aiProviderConfigSchema', () => {
  it('keeps supportsStructuredOutputs on a provider added from the admin panel', () => {
    expect(
      aiProviderConfigSchema.parse({
        ...LITELLM_PROVIDER,
        supportsStructuredOutputs: true,
      }),
    ).toMatchObject({ supportsStructuredOutputs: true });
  });

  it('leaves supportsStructuredOutputs unset on a provider that does not declare it', () => {
    expect(aiProviderConfigSchema.parse(LITELLM_PROVIDER)).not.toHaveProperty(
      'supportsStructuredOutputs',
    );
  });

  it('rejects a supportsStructuredOutputs that is not a boolean', () => {
    expect(
      aiProviderConfigSchema.safeParse({
        ...LITELLM_PROVIDER,
        supportsStructuredOutputs: 'yes',
      }).success,
    ).toBe(false);
  });
});
