import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  type GeneratedUiBlock,
  type GeneratedUiConfiguration,
} from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';

type GeneratedUiBadgeTone = Extract<
  GeneratedUiBlock,
  { type: 'badge' }
>['tone'];

const StyledStack = styled.div<{ gap: 'small' | 'medium' | 'large' }>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) =>
    gap === 'small'
      ? themeCssVariables.spacing[1]
      : gap === 'large'
        ? themeCssVariables.spacing[4]
        : themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledGrid = styled.div<{ columns: 2 | 3 }>`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.section`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeading = styled.h1<{ level: 1 | 2 | 3 }>`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${({ level }) =>
    level === 1
      ? themeCssVariables.font.size.lg
      : level === 2
        ? themeCssVariables.font.size.md
        : themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.3;
  margin: 0;
`;

const StyledText = styled.p<{ tone: 'default' | 'muted' }>`
  color: ${({ tone }) =>
    tone === 'muted'
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
`;

const StyledBadge = styled.span<{ tone: GeneratedUiBadgeTone }>`
  align-self: flex-start;
  background: ${({ tone }) =>
    tone === 'positive'
      ? themeCssVariables.background.transparent.success
      : tone === 'warning'
        ? themeCssVariables.background.transparent.orange
        : tone === 'danger'
          ? themeCssVariables.background.transparent.danger
          : themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledMetricLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMetricValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.2;
`;

const StyledMetricCaption = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type GeneratedUiRendererProps = {
  blocks: GeneratedUiConfiguration['blocks'];
};

const renderBlock = (block: GeneratedUiBlock, index: number): ReactNode => {
  switch (block.type) {
    case 'stack':
      return (
        <StyledStack key={index} gap={block.gap ?? 'medium'}>
          {block.children.map(renderBlock)}
        </StyledStack>
      );
    case 'grid':
      return (
        <StyledGrid key={index} columns={block.columns}>
          {block.children.map(renderBlock)}
        </StyledGrid>
      );
    case 'card':
      return (
        <StyledCard key={index}>
          {block.title && (
            <StyledHeading role="heading" aria-level={3} level={3}>
              {block.title}
            </StyledHeading>
          )}
          {block.children.map(renderBlock)}
        </StyledCard>
      );
    case 'heading':
      return (
        <StyledHeading
          key={index}
          role="heading"
          aria-level={block.level}
          level={block.level}
        >
          {block.text}
        </StyledHeading>
      );
    case 'text':
      return (
        <StyledText key={index} tone={block.tone ?? 'default'}>
          {block.text}
        </StyledText>
      );
    case 'badge':
      return (
        <StyledBadge key={index} tone={block.tone}>
          {block.text}
        </StyledBadge>
      );
    case 'metric':
      return (
        <StyledCard key={index}>
          <StyledMetricLabel>{block.label}</StyledMetricLabel>
          <StyledMetricValue>{block.value}</StyledMetricValue>
          {block.caption && (
            <StyledMetricCaption>{block.caption}</StyledMetricCaption>
          )}
        </StyledCard>
      );
    default:
      return null;
  }
};

export const GeneratedUiRenderer = ({ blocks }: GeneratedUiRendererProps) => (
  <StyledStack gap="medium">{blocks.map(renderBlock)}</StyledStack>
);
