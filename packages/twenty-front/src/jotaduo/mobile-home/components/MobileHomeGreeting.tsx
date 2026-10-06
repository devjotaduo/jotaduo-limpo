import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react';
import { isNonEmptyString } from '@sniptt/guards';

import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { getGreetingMessage } from '~/jotaduo/mobile-home/utils/getGreetingMessage';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const StyledGreeting = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 18px;
`;

const StyledDate = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 14px;
  font-weight: 500;
`;

const StyledTitle = styled.h1`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin: 0;
  overflow-wrap: anywhere;
`;

export const MobileHomeGreeting = () => {
  const { i18n } = useLingui();
  const { getText } = useJotaduoText();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const now = new Date();
  const greeting = getText(getGreetingMessage(now.getHours()));
  const firstName = currentWorkspaceMember?.name?.firstName?.trim();

  return (
    <StyledGreeting>
      <StyledDate>
        {new Intl.DateTimeFormat(i18n.locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(now)}
      </StyledDate>
      <StyledTitle>
        {isNonEmptyString(firstName) ? `${greeting}, ${firstName}` : greeting}
      </StyledTitle>
    </StyledGreeting>
  );
};
