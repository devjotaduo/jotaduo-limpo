import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useIsMobile } from 'twenty-ui/utilities';
import { styled } from '@linaria/react';
import { type UIEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { AssistantSection } from '~/jotaduo/mobile-home/components/AssistantSection';
import { FavoritesSection } from '~/jotaduo/mobile-home/components/FavoritesSection';
import { MobileHomeBottomFade } from '~/jotaduo/mobile-home/components/MobileHomeBottomFade';
import { MobileHomeGreeting } from '~/jotaduo/mobile-home/components/MobileHomeGreeting';
import { MobileHomeHeader } from '~/jotaduo/mobile-home/components/MobileHomeHeader';
import { MyWorkSection } from '~/jotaduo/mobile-home/components/MyWorkSection';
import { ShortcutsSection } from '~/jotaduo/mobile-home/components/ShortcutsSection';
import { TodaySection } from '~/jotaduo/mobile-home/components/TodaySection';
import { StyledJotaduoMobileTheme } from '~/jotaduo/mobile-theme/components/StyledJotaduoMobileTheme';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const COMPACT_HEADER_SCROLL_THRESHOLD_IN_PX = 8;

const StyledPage = styled(StyledJotaduoMobileTheme)`
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.page};
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  height: 100%;
  min-height: 0;
  position: relative;
  width: 100%;
`;

// The bottom padding keeps the last section clear of the floating bar, which
// ends 92px above the edge.
const StyledScrollContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 0 16px calc(120px + env(safe-area-inset-bottom, 0px));
`;

const StyledSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 26px;
  margin-top: 18px;
`;

export const MobileHomePage = () => {
  const isMobile = useIsMobile();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  // Desktop keeps the drawer, so the page has nothing to show there.
  if (!isMobile) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsHeaderCompact(
      event.currentTarget.scrollTop > COMPACT_HEADER_SCROLL_THRESHOLD_IN_PX,
    );
  };

  return (
    <StyledPage>
      <StyledScrollContainer onScroll={handleScroll}>
        <MobileHomeHeader isCompact={isHeaderCompact} />
        <MobileHomeGreeting />
        <StyledSections>
          <TodaySection />
          <MyWorkSection />
          <FavoritesSection />
          <ShortcutsSection />
          <AssistantSection />
        </StyledSections>
      </StyledScrollContainer>
      <MobileHomeBottomFade />
    </StyledPage>
  );
};
