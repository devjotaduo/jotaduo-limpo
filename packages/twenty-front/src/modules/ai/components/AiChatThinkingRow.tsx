import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatAvatar } from '@/ai/components/AiChatAvatar';

const StyledRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledLoaderIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-width: calc(${themeCssVariables.icon.size.sm} * 1px);
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.md};
`;

export const AiChatThinkingRow = () => {
  return (
    <StyledRow>
      <StyledLoaderIconContainer>
        <AiChatAvatar size={16} isThinking />
      </StyledLoaderIconContainer>
      <StyledLabel>{t`Thinking`}</StyledLabel>
    </StyledRow>
  );
};
