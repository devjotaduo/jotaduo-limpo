import {
  generatedUiPageDraftInputSchema,
  generatedUiPageDraftSchema,
} from 'twenty-shared/types';

export const createDraftUiPageTool = () => ({
  name: 'draft_ui_page' as const,
  description:
    'Create a safe visual page draft for the user to preview in chat. Do not save or publish the page. Each tab has a title and a blocks array. Use only stack (gap and children), grid (2 or 3 columns and children), card (optional title and children), heading (level 1-3 and text), text (text and optional default/muted tone), badge (text and optional neutral/positive/warning/danger tone), and metric (label, value, optional caption). Children may only contain these same supported blocks. This is presentation-only content; do not include code, scripts, styles, event handlers, URLs, or data queries.',
  inputSchema: generatedUiPageDraftInputSchema,
  execute: async (parameters: unknown) => {
    const parsedDraft = generatedUiPageDraftSchema.safeParse(parameters);

    if (!parsedDraft.success) {
      return {
        success: false,
        message: 'The page draft is invalid.',
        error: parsedDraft.error.message,
      };
    }

    return {
      success: true,
      message: 'Page draft is ready to preview. It has not been saved.',
      result: { draft: parsedDraft.data },
    };
  },
});
