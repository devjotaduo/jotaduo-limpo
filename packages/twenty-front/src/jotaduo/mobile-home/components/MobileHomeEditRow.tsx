import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { IconGripVertical } from 'twenty-ui/icon';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// The divider is a shadow so the card's overflow clips it under the last row.
const StyledRow = styled.div`
  align-items: center;
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.card};
  box-shadow: 0 1px 0 ${JOTADUO_MOBILE_THEME_VARIABLES.border};
  box-sizing: border-box;
  display: flex;
  gap: 10px;
  min-height: 54px;
  padding: 0 12px 0 4px;
  width: 100%;
`;

const StyledIcon = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledLabels = styled.span`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 1px;
  min-width: 0;
`;

const StyledCaption = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Dragging starts on a press and hold anywhere on the row; the grip only
// tells the user the row can move.
const StyledGrip = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textTertiary};
  display: flex;
  flex-shrink: 0;
`;

type MobileHomeEditRowProps = {
  leadingAction: ReactNode;
  icon?: ReactNode;
  label: string;
  caption?: string;
  isReorderable?: boolean;
};

export const MobileHomeEditRow = ({
  leadingAction,
  icon,
  label,
  caption,
  isReorderable = false,
}: MobileHomeEditRowProps) => {
  const { getText } = useJotaduoText();

  return (
    <StyledRow>
      {leadingAction}
      {icon !== undefined && <StyledIcon aria-hidden>{icon}</StyledIcon>}
      <StyledLabels>
        {isNonEmptyString(caption) && <StyledCaption>{caption}</StyledCaption>}
        <StyledLabel>{label}</StyledLabel>
      </StyledLabels>
      {isReorderable && (
        <StyledGrip title={getText(JOTADUO_MESSAGES.holdToReorder)}>
          <IconGripVertical size={20} stroke={2} aria-hidden />
        </StyledGrip>
      )}
    </StyledRow>
  );
};
