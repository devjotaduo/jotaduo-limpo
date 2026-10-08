import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AiChatAvatar } from '@/ai/components/AiChatAvatar';
import { getAiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/getAiChatSuggestedPrompts';
import { useAiChatSuggestedPromptsContext } from '@/ai/hooks/useAiChatSuggestedPromptsContext';
import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type SuggestedPrompt } from '@/ai/types/SuggestedPrompt';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// the page and the side panel show the same welcome (AI/Chat body, Empty?): face, title and
// prompts centered; only the face is smaller in the panel
const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-align: center;
`;

const StyledPromptList = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

const pickRandom = <TItem,>(items: TItem[]): TItem =>
  items[Math.floor(Math.random() * items.length)];

type AiChatSuggestedPromptsProps = {
  isCentered?: boolean;
};

export const AiChatSuggestedPrompts = ({
  isCentered = false,
}: AiChatSuggestedPromptsProps) => {
  const { t: resolveMessage } = useLingui();
  const { stageAiChatPreprompt } = useStageAiChatPreprompt();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const aiChatSuggestedPromptsContext = useAiChatSuggestedPromptsContext();

  const suggestedPrompts = getAiChatSuggestedPrompts(
    aiChatSuggestedPromptsContext,
  );

  const handleClick = (suggestedPrompt: SuggestedPrompt) => {
    stageAiChatPreprompt({
      serializedDocument: serializePlainTextAsAdvancedTextEditorDocument(
        resolveMessage(pickRandom(suggestedPrompt.prompts)),
      ),
      mode: suggestedPrompt.mode ?? 'PREFILL',
      draftKey: currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
  };

  return (
    <StyledContainer>
      <AiChatAvatar size={isCentered ? 40 : 32} shouldBlink />
      <StyledTitle>{t`What can I help you with?`}</StyledTitle>
      <StyledPromptList>
        {suggestedPrompts.map((suggestedPrompt) => (
          <Button
            key={suggestedPrompt.id}
            startIcon={
              isDefined(suggestedPrompt.Icon) ? (
                <suggestedPrompt.Icon />
              ) : undefined
            }
            onClick={() => handleClick(suggestedPrompt)}
            variant="outline"
          >
            {resolveMessage(suggestedPrompt.label)}
          </Button>
        ))}
      </StyledPromptList>
    </StyledContainer>
  );
};
