import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';

import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// The navigation bar floats over the scrolling content. Without this, rows
// show through it and peek out in the gap underneath. The page colour is solid
// up to the middle of the bar (22px off the edge, 70px tall) and fades out
// above it.
const StyledBottomFade = styled.div`
  background: linear-gradient(
    to top,
    ${JOTADUO_MOBILE_THEME_VARIABLES.page}
      calc(57px + env(safe-area-inset-bottom, 0px)),
    transparent
  );
  bottom: 0;
  height: calc(120px + env(safe-area-inset-bottom, 0px));
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  transition: opacity 0.2s ease;
  z-index: 1;

  &[data-hidden] {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const MobileHomeBottomFade = () => {
  const isMobileNavigationBarVisible = useAtomStateValue(
    isMobileNavigationBarVisibleState,
  );

  // Gone together with the bar, so a hidden bar leaves the page fully readable.
  return (
    <StyledBottomFade
      aria-hidden
      data-hidden={isMobileNavigationBarVisible ? undefined : ''}
    />
  );
};
