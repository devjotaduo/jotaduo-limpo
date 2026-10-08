import { MarkdownRenderer } from '@/ai/components/MarkdownRenderer';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';

import { AiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AiChatSuggestedPrompts';
import { useShouldShowAiChatEmptyState } from '@/ai/hooks/useShouldShowAiChatEmptyState';

// on the page the welcome sits right above the centered composer; in the side panel the composer
// stays at the bottom, so the welcome takes the middle of the space above it
const StyledEmptyState = styled(StyledAiChatContentContainer)<{
  isCentered: boolean;
}>`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: ${({ isCentered }) => (isCentered ? 'flex-end' : 'center')};
`;

type AiChatEmptyStateProps = {
  isCentered?: boolean;
};

export const AiChatEmptyState = ({
  isCentered = false,
}: AiChatEmptyStateProps) => {
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();

  MarkdownRenderer.preload();

  if (!shouldShowAiChatEmptyState) {
    return null;
  }

  return (
    <StyledEmptyState isCentered={isCentered}>
      <AiChatSuggestedPrompts isCentered={isCentered} />
    </StyledEmptyState>
  );
};
