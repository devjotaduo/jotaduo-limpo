import { MultiWorkspaceDropdownButton } from '@/navigation/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { styled } from '@linaria/react';
import { MobileHomeCreateMenu } from '~/jotaduo/mobile-home/components/MobileHomeCreateMenu';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// Stays pinned while the page scrolls. Once content slides underneath, the
// page colour fades in behind it so the two controls stay legible.
const StyledHeader = styled.header`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-top: 20px;
  position: sticky;
  top: 0;
  z-index: 1;

  &::before {
    background: linear-gradient(
      ${JOTADUO_MOBILE_THEME_VARIABLES.page} 30%,
      transparent
    );
    content: '';
    height: 92px;
    left: -16px;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: -16px;
    top: 0;
    transition: opacity 0.2s ease;
    z-index: -1;
  }

  &[data-compact]::before {
    opacity: 1;
  }
`;

type MobileHomeHeaderProps = {
  isCompact: boolean;
};

export const MobileHomeHeader = ({ isCompact }: MobileHomeHeaderProps) => {
  return (
    <StyledHeader data-compact={isCompact ? '' : undefined}>
      <MultiWorkspaceDropdownButton shouldHideLabel />
      <MobileHomeCreateMenu />
    </StyledHeader>
  );
};
