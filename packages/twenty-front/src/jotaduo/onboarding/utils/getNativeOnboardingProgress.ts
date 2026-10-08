import { AppPath } from 'twenty-shared/types';

import { NATIVE_ONBOARDING_STEP_PATHS } from '~/jotaduo/onboarding/constants/NativeOnboardingStepPaths';

type GetNativeOnboardingProgressParams = {
  pathname: string;
  hasEmailProvider: boolean;
  isFirstWorkspaceMember: boolean;
};

// Only the steps a person is sure to go through get a segment. Booking a
// call and picking a plan depend on what the server offers at that moment,
// so they count as the step before them.
export const getNativeOnboardingProgress = ({
  pathname,
  hasEmailProvider,
  isFirstWorkspaceMember,
}: GetNativeOnboardingProgressParams) => {
  const stepPaths: string[] = [
    ...(hasEmailProvider ? [AppPath.SyncEmails] : []),
    AppPath.CreateProfile,
    ...(isFirstWorkspaceMember ? [AppPath.InviteTeam] : []),
  ];
  const currentStepOrder = NATIVE_ONBOARDING_STEP_PATHS.indexOf(pathname);
  const reachedStepCount = stepPaths.filter(
    (stepPath) =>
      NATIVE_ONBOARDING_STEP_PATHS.indexOf(stepPath) <= currentStepOrder,
  ).length;

  return {
    stepCount: stepPaths.length,
    filledStepCount: Math.max(reachedStepCount, 1),
  };
};
