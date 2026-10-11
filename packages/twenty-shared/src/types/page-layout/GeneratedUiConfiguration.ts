import { z } from 'zod';

const generatedUiTextSchema = z.string().trim().min(1).max(500);

export type GeneratedUiBlock =
  | {
      type: 'stack';
      gap?: 'small' | 'medium' | 'large';
      children: GeneratedUiBlock[];
    }
  | { type: 'grid'; columns: 2 | 3; children: GeneratedUiBlock[] }
  | { type: 'card'; title?: string; children: GeneratedUiBlock[] }
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'text'; text: string; tone?: 'default' | 'muted' }
  | {
      type: 'badge';
      text: string;
      tone?: 'neutral' | 'positive' | 'warning' | 'danger';
    }
  | { type: 'metric'; label: string; value: string; caption?: string };

export const generatedUiBlockSchema: z.ZodType<GeneratedUiBlock> = z.lazy(
  (): z.ZodType<GeneratedUiBlock> =>
    z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('stack'),
          gap: z.enum(['small', 'medium', 'large']).optional(),
          children: z.array(generatedUiBlockSchema).min(1).max(20),
        })
        .strict(),
      z
        .object({
          type: z.literal('grid'),
          columns: z.union([z.literal(2), z.literal(3)]),
          children: z.array(generatedUiBlockSchema).min(1).max(12),
        })
        .strict(),
      z
        .object({
          type: z.literal('card'),
          title: generatedUiTextSchema.optional(),
          children: z.array(generatedUiBlockSchema).min(1).max(12),
        })
        .strict(),
      z
        .object({
          type: z.literal('heading'),
          level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
          text: generatedUiTextSchema,
        })
        .strict(),
      z
        .object({
          type: z.literal('text'),
          text: generatedUiTextSchema,
          tone: z.enum(['default', 'muted']).optional(),
        })
        .strict(),
      z
        .object({
          type: z.literal('badge'),
          text: generatedUiTextSchema,
          tone: z.enum(['neutral', 'positive', 'warning', 'danger']).optional(),
        })
        .strict(),
      z
        .object({
          type: z.literal('metric'),
          label: generatedUiTextSchema,
          value: generatedUiTextSchema,
          caption: generatedUiTextSchema.optional(),
        })
        .strict(),
    ]),
);

export const generatedUiConfigurationSchema = z
  .object({
    configurationType: z.literal('AI_GENERATED_UI'),
    schemaVersion: z.literal(1),
    blocks: z.array(generatedUiBlockSchema).min(1).max(20),
  })
  .strict()
  .superRefine((configuration, context) => {
    validateGeneratedUiTree(configuration.blocks, (message) =>
      context.addIssue({ code: 'custom', message }),
    );
  });

export const generatedUiPageDraftInputSchema = z
  .object({
    title: generatedUiTextSchema,
    tabs: z
      .array(
        z
          .object({
            title: generatedUiTextSchema,
            blocks: z.array(generatedUiBlockSchema).min(1).max(20),
          })
          .strict(),
      )
      .min(1)
      .max(6),
  })
  .strict();

export const generatedUiPageDraftSchema =
  generatedUiPageDraftInputSchema.superRefine((draft, context) => {
    draft.tabs.forEach((tab, index) => {
      validateGeneratedUiTree(tab.blocks, (message) => {
        context.addIssue({
          code: 'custom',
          message,
          path: ['tabs', index],
        });
      });
    });
  });

const validateGeneratedUiTree = (
  blocks: GeneratedUiBlock[],
  addIssue: (message: string) => void,
) => {
  let nodeCount = 0;

  const visit = (block: GeneratedUiBlock, depth: number) => {
    nodeCount += 1;

    if (depth > 8 || nodeCount > 80) {
      addIssue('Generated UI must be no deeper than 8 levels or 80 blocks.');

      return;
    }

    if ('children' in block) {
      block.children.forEach((child) => visit(child, depth + 1));
    }
  };

  blocks.forEach((block) => visit(block, 1));
};

export type GeneratedUiConfiguration = z.infer<
  typeof generatedUiConfigurationSchema
>;
export type GeneratedUiPageDraft = z.infer<typeof generatedUiPageDraftSchema>;

export const isGeneratedUiConfiguration = (
  value: unknown,
): value is GeneratedUiConfiguration =>
  generatedUiConfigurationSchema.safeParse(value).success;

export const isGeneratedUiPageDraft = (
  value: unknown,
): value is GeneratedUiPageDraft =>
  generatedUiPageDraftSchema.safeParse(value).success;
