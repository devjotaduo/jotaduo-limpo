import { styled } from '@linaria/react';
import { IconX } from 'twenty-ui/icon';

import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// The visible disc is small, the button around it keeps a 44px tap target.
const StyledRemoveButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  height: 44px;
  justify-content: center;
  padding: 0;
  width: 44px;
`;

const StyledDisc = styled.span`
  align-items: center;
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.control};
  border: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.controlBorder};
  border-radius: 50%;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  display: flex;
  height: 26px;
  justify-content: center;
  width: 26px;
`;

type MobileHomeRemoveButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export const MobileHomeRemoveButton = ({
  label,
  onClick,
  className,
}: MobileHomeRemoveButtonProps) => (
  <StyledRemoveButton
    type="button"
    aria-label={label}
    className={className}
    onClick={onClick}
  >
    <StyledDisc>
      <IconX size={14} stroke={2.4} aria-hidden />
    </StyledDisc>
  </StyledRemoveButton>
);
