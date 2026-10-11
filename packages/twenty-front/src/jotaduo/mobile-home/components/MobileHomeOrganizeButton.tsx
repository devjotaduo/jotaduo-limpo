import { styled } from '@linaria/react';
import { IconDotsVertical } from 'twenty-ui/icon';

import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// twenty-ui only exports the vertical dots; the design uses them sideways.
const StyledOrganizeButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 50%;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 44px;
  justify-content: center;
  padding: 0;
  width: 44px;

  > svg {
    transform: rotate(90deg);
  }
`;

type MobileHomeOrganizeButtonProps = {
  label: string;
  onClick: () => void;
};

export const MobileHomeOrganizeButton = ({
  label,
  onClick,
}: MobileHomeOrganizeButtonProps) => (
  <StyledOrganizeButton
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
  >
    <IconDotsVertical size={22} stroke={2.4} aria-hidden />
  </StyledOrganizeButton>
);
