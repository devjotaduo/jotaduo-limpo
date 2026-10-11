import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
`;

// The 44px floor is the organize button's tap target: titles without one keep
// the same rhythm.
const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  min-height: 44px;
`;

const StyledTitle = styled.h2`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.2;
  margin: 0;
`;

export const StyledMobileHomeCard = styled.div`
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.card};
  border: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.border};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const StyledMobileHomeSecondaryButton = styled.button`
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.control};
  border: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.controlBorder};
  border-radius: 10px;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  cursor: pointer;
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  min-height: 46px;
  width: 100%;
`;

type MobileHomeSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export const MobileHomeSection = ({
  title,
  action,
  children,
}: MobileHomeSectionProps) => (
  <StyledSection aria-label={title}>
    <StyledHeader>
      <StyledTitle>{title}</StyledTitle>
      {action}
    </StyledHeader>
    {children}
  </StyledSection>
);
