import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated-metadata/graphql';

import { JotaduoOnboardingOverlay } from '~/jotaduo/onboarding/components/JotaduoOnboardingOverlay';
import { JOTADUO_ONBOARDING_SEARCH_PARAM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingSearchParam';
import { JOTADUO_ONBOARDING_SEARCH_PARAM_OPEN_VALUE } from '~/jotaduo/onboarding/constants/JotaduoOnboardingSearchParamOpenValue';
import { JotaduoOnboardingAvailabilityEffect } from '~/jotaduo/onboarding/effect-components/JotaduoOnboardingAvailabilityEffect';
import { jotaduoOnboardingAvailabilityState } from '~/jotaduo/onboarding/states/jotaduoOnboardingAvailabilityState';

// Shows the JotaDuo questions right after Twenty's own onboarding steps: to
// whoever can manage the app, while its first setup is open, until that
// person finishes it. The search param opens them again to review.
export const JotaduoOnboardingGate = () => {
  const onboardingStatus = useOnboardingStatus();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const [jotaduoOnboardingAvailability, setJotaduoOnboardingAvailability] =
    useAtomState(jotaduoOnboardingAvailabilityState);
  const [searchParams, setSearchParams] = useSearchParams();

  if (
    onboardingStatus !== OnboardingStatus.COMPLETED ||
    !isDefined(currentWorkspaceMember)
  ) {
    return null;
  }

  const isRequested =
    searchParams.get(JOTADUO_ONBOARDING_SEARCH_PARAM) ===
    JOTADUO_ONBOARDING_SEARCH_PARAM_OPEN_VALUE;

  // Covers both ways out: finishing, and giving up on a setup that would not
  // load. The second only lasts until the page is opened again.
  const handleClose = () => {
    setJotaduoOnboardingAvailability('notPending');

    if (isRequested) {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete(JOTADUO_ONBOARDING_SEARCH_PARAM);
      setSearchParams(nextSearchParams, { replace: true });
    }
  };

  return (
    <>
      <JotaduoOnboardingAvailabilityEffect />
      {(isRequested || jotaduoOnboardingAvailability === 'pending') && (
        <JotaduoOnboardingOverlay
          onFinish={handleClose}
          onDismiss={handleClose}
        />
      )}
    </>
  );
};
