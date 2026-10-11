import { MobileNavigationBarScrollEffect } from '@/navigation/components/MobileNavigationBarScrollEffect';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { isAiChatPath } from '~/utils/isAiChatPath';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MOBILE_NAVIGATION_BAR_HEIGHT } from '~/jotaduo/mobile-navigation/constants/MobileNavigationBarHeight';
import { useJotaduoMobileNavigationBarItems } from '~/jotaduo/mobile-navigation/hooks/useJotaduoMobileNavigationBarItems';
import { StyledJotaduoMobileTheme } from '~/jotaduo/mobile-theme/components/StyledJotaduoMobileTheme';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

// Same floating container as upstream: taps have to reach the page scrolling
// underneath everywhere except on the bar itself.
const StyledFloatingContainer = styled(StyledJotaduoMobileTheme)`
  bottom: 0;
  left: 0;
  padding: 0 12px calc(22px + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
  position: absolute;
  right: 0;
  z-index: ${RootStackingContextZIndices.MobileNavigationBar};

  > * {
    pointer-events: auto;
  }

  @media print {
    display: none;
  }
`;

// The bar is slightly see-through by design; the blur keeps whatever scrolls
// behind it from reading as ghost text between the items.
const StyledBar = styled.nav`
  align-items: center;
  backdrop-filter: blur(16px);
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.navigationBar};
  border: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.controlBorder};
  border-radius: 35px;
  box-shadow: ${JOTADUO_MOBILE_THEME_VARIABLES.navigationBarShadow};
  box-sizing: border-box;
  display: flex;
  gap: 4px;
  height: ${MOBILE_NAVIGATION_BAR_HEIGHT};
  padding: 0 6px;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0.2s;

  &[data-hidden] {
    opacity: 0;
    pointer-events: none;
    transform: translateY(calc(100% + 22px));
    visibility: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// The design fills the active item's icon with the accent colour.
const StyledItem = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 29px;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  cursor: pointer;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  font: inherit;
  gap: 3px;
  height: 58px;
  justify-content: center;
  min-width: 0;
  padding: 0;

  &[data-active] {
    background: ${JOTADUO_MOBILE_THEME_VARIABLES.navigationBarActive};
    color: ${JOTADUO_MOBILE_THEME_VARIABLES.accent};
  }

  &[data-active] > svg {
    fill: currentColor;
  }
`;

const StyledItemLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  [data-active] > & {
    font-weight: 700;
  }
`;

export const MobileNavigationBar = () => {
  const { pathname } = useLocation();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const isMobileNavigationBarVisible = useAtomStateValue(
    isMobileNavigationBarVisibleState,
  );
  const { items, activeItemName } = useJotaduoMobileNavigationBarItems();
  const { getText } = useJotaduoText();

  // The chat page keeps the keyboard up most of the time and carries its own
  // close button, so the bar stays out of its way like upstream.
  const isHidden =
    isSidePanelOpened ||
    !isMobileNavigationBarVisible ||
    isAiChatPath(pathname);

  return (
    <>
      <MobileNavigationBarScrollEffect />
      <StyledFloatingContainer>
        <StyledBar
          aria-label={getText(JOTADUO_MESSAGES.mainNavigation)}
          aria-hidden={isHidden}
          data-hidden={isHidden ? '' : undefined}
        >
          {items.map(({ name, label, Icon, onClick }) => {
            const isActive = activeItemName === name;

            return (
              <StyledItem
                key={name}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? '' : undefined}
                onClick={onClick}
              >
                <Icon size={24} stroke={2} aria-hidden />
                <StyledItemLabel>{label}</StyledItemLabel>
              </StyledItem>
            );
          })}
        </StyledBar>
      </StyledFloatingContainer>
    </>
  );
};
