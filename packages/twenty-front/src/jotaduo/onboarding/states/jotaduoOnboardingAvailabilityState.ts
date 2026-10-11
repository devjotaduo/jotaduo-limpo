import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// 'pending' only for someone who can manage the JotaDuo app while its first
// setup is still open. 'unknown' until the app answers.
export type JotaduoOnboardingAvailability =
  | 'unknown'
  | 'pending'
  | 'notPending';

export const jotaduoOnboardingAvailabilityState =
  createAtomState<JotaduoOnboardingAvailability>({
    key: 'jotaduoOnboardingAvailabilityState',
    defaultValue: 'unknown',
  });
