import { createDraftUiPageTool } from 'src/modules/dashboard/tools/draft-ui-page.tool';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';

describe('createDraftUiPageTool', () => {
  it('returns a safe page draft without persisting it', async () => {
    const tool = createDraftUiPageTool();
    const result = await tool.execute({
      title: 'Pipeline overview',
      tabs: [
        {
          title: 'Summary',
          blocks: [
            {
              type: 'metric',
              label: 'Open deals',
              value: '12',
            },
          ],
        },
      ],
    });

    expect(result).toEqual({
      success: true,
      message: 'Page draft is ready to preview. It has not been saved.',
      result: {
        draft: {
          title: 'Pipeline overview',
          tabs: [
            {
              title: 'Summary',
              blocks: [
                {
                  type: 'metric',
                  label: 'Open deals',
                  value: '12',
                },
              ],
            },
          ],
        },
      },
    });
  });

  it('rejects an unsupported block rather than returning executable content', async () => {
    const tool = createDraftUiPageTool();
    const result = await tool.execute({
      title: 'Unsafe page',
      tabs: [
        {
          title: 'Main',
          blocks: [{ type: 'script', code: 'alert(1)' }],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('exposes the recursive block catalog as a provider-compatible JSON schema', () => {
    const tool = createDraftUiPageTool();
    const jsonSchema = toToolJsonSchema(tool.inputSchema);

    expect(jsonSchema).toMatchObject({
      type: 'object',
      properties: { tabs: { type: 'array' } },
    });
    expect(JSON.stringify(jsonSchema)).toContain('"$ref"');
  });
});
