import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFreeCredits = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-left: auto;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

// The credits earned along the steps, which upstream shows in its header.
export const JotaduoOnboardingFreeCredits = () => {
  const { t } = useLingui();
  const { earnedCredits: freeCreditsTotal } = useAtomStateValue(
    onboardingCreditsProgressSelector,
  );

  return (
    <StyledFreeCredits>
      <IconCoins size={14} aria-hidden />
      <StyledCount>{freeCreditsTotal}</StyledCount>
      {t`free credits`}
    </StyledFreeCredits>
  );
};
