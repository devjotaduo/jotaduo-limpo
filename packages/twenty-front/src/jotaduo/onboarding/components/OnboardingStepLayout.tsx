import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { PrefetchBookCallStepEffect } from '@/onboarding/effect-components/PrefetchBookCallStepEffect';
import { PrefetchPlanRequiredStepEffect } from '@/onboarding/effect-components/PrefetchPlanRequiredStepEffect';
import { useGoBackToPreviousOnboardingStep } from '@/onboarding/hooks/useGoBackToPreviousOnboardingStep';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JotaduoOnboardingBackButton } from '~/jotaduo/onboarding/components/JotaduoOnboardingBackButton';
import { JotaduoOnboardingFreeCredits } from '~/jotaduo/onboarding/components/JotaduoOnboardingFreeCredits';
import { JotaduoOnboardingPreview } from '~/jotaduo/onboarding/components/JotaduoOnboardingPreview';
import { JotaduoOnboardingProgress } from '~/jotaduo/onboarding/components/JotaduoOnboardingProgress';
import { JotaduoOnboardingTransitionOutlet } from '~/jotaduo/onboarding/components/JotaduoOnboardingTransitionOutlet';
import { StyledJotaduoOnboardingHalves } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingHalves';
import { StyledJotaduoOnboardingTopBar } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingTopBar';
import { JOTADUO_ONBOARDING_EMPTY_ANSWERS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingEmptyAnswers';
import { getNativeOnboardingProgress } from '~/jotaduo/onboarding/utils/getNativeOnboardingProgress';

const StyledLayout = styled(StyledJotaduoOnboardingHalves)`
  height: calc(100dvh / var(--t-zoom, 1));
  width: 100%;
`;

const StyledMain = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

// Lines up with the column of the step below it, and stays put while the
// step changes.
const StyledProgressRow = styled.div`
  margin: 0 auto;
  max-width: calc(520px + 2 * ${themeCssVariables.spacing[6]});
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]} 0;
  width: 100%;

  @media (max-width: 520px) {
    padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]} 0;
  }
`;

// Twenty's own onboarding steps in the frame of the JotaDuo questions that
// follow them, so the whole first setup reads as one thing. The preview is
// still empty here: the questions are what fill it.
export const OnboardingStepLayout = () => {
  const { getText } = useJotaduoText();
  const { pathname } = useLocation();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isGoogleCalendarEnabled = useAtomStateValue(
    isGoogleCalendarEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );
  const isMicrosoftCalendarEnabled = useAtomStateValue(
    isMicrosoftCalendarEnabledState,
  );
  const {
    goBackToPreviousOnboardingStep,
    isGoingBackToPreviousOnboardingStep,
  } = useGoBackToPreviousOnboardingStep();

  const { stepCount, filledStepCount } = getNativeOnboardingProgress({
    pathname,
    hasEmailProvider:
      isGoogleMessagingEnabled ||
      isGoogleCalendarEnabled ||
      isMicrosoftMessagingEnabled ||
      isMicrosoftCalendarEnabled,
    isFirstWorkspaceMember: currentWorkspace?.workspaceMembersCount === 1,
  });

  return (
    <StyledLayout>
      <StyledMain>
        <StyledJotaduoOnboardingTopBar>
          {isDefined(currentUser?.previousOnboardingStatus) && (
            <JotaduoOnboardingBackButton
              isDisabled={isGoingBackToPreviousOnboardingStep}
              onClick={() => {
                void goBackToPreviousOnboardingStep();
              }}
            />
          )}
          {isDefined(onboardingConfig) && <JotaduoOnboardingFreeCredits />}
        </StyledJotaduoOnboardingTopBar>
        <StyledProgressRow>
          <JotaduoOnboardingProgress
            label={getText(JOTADUO_ONBOARDING_MESSAGES.setupProgress)}
            valueText={getText(JOTADUO_ONBOARDING_MESSAGES.setupStepCount, {
              current: filledStepCount,
              total: stepCount,
            })}
            stepCount={stepCount}
            filledStepCount={filledStepCount}
          />
        </StyledProgressRow>
        <PrefetchBookCallStepEffect />
        <PrefetchPlanRequiredStepEffect />
        <JotaduoOnboardingTransitionOutlet />
      </StyledMain>
      <JotaduoOnboardingPreview
        answers={JOTADUO_ONBOARDING_EMPTY_ANSWERS}
        areaOptions={[]}
        focusedQuestionId="nome"
      />
    </StyledLayout>
  );
};
