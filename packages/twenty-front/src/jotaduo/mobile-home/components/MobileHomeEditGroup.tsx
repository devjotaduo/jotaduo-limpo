import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';

import { StyledMobileHomeCard } from '~/jotaduo/mobile-home/components/MobileHomeSection';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const StyledGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledGroupLabel = styled.h3`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 0 4px;
`;

type MobileHomeEditGroupProps = {
  label?: string;
  children: ReactNode;
};

export const MobileHomeEditGroup = ({
  label,
  children,
}: MobileHomeEditGroupProps) => (
  <StyledGroup aria-label={label}>
    {isNonEmptyString(label) && <StyledGroupLabel>{label}</StyledGroupLabel>}
    <StyledMobileHomeCard>{children}</StyledMobileHomeCard>
  </StyledGroup>
);
