import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

import { JOTADUO_MANAGE_PERMISSION_FLAG } from '~/jotaduo/onboarding/constants/JotaduoManagePermissionFlag';
import { jotaduoOnboardingAvailabilityState } from '~/jotaduo/onboarding/states/jotaduoOnboardingAvailabilityState';
import { type JotaduoAppSession } from '~/jotaduo/onboarding/types/JotaduoAppSession';
import { requestJotaduoApp } from '~/jotaduo/onboarding/utils/requestJotaduoApp';

// Asks the JotaDuo app once whether its first setup is waiting for this
// person. A workspace without the app answers with an error, which counts as
// nothing pending.
export const JotaduoOnboardingAvailabilityEffect = () => {
  const setJotaduoOnboardingAvailability = useSetAtomState(
    jotaduoOnboardingAvailabilityState,
  );

  useEffect(() => {
    let isCancelled = false;

    requestJotaduoApp<JotaduoAppSession>('GET', 'session')
      .then((session) => {
        if (isCancelled) {
          return;
        }

        const canManage =
          session.actor?.flags.includes(JOTADUO_MANAGE_PERMISSION_FLAG) ===
          true;

        setJotaduoOnboardingAvailability(
          session.onboarding?.pendente === true && canManage
            ? 'pending'
            : 'notPending',
        );
      })
      .catch(() => {
        if (!isCancelled) {
          setJotaduoOnboardingAvailability('notPending');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [setJotaduoOnboardingAvailability]);

  return null;
};
