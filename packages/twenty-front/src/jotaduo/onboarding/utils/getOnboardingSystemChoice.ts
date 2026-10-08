import { JOTADUO_ONBOARDING_NO_SYSTEM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingNoSystem';
import { JOTADUO_ONBOARDING_OTHER_SYSTEM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingOtherSystem';
import { getOnboardingSystemsForArea } from '~/jotaduo/onboarding/utils/getOnboardingSystemsForArea';

// Which option is picked for a stored value: a listed system, "no system",
// "other" (a name outside the list, or still blank) or none.
export const getOnboardingSystemChoice = (
  area: string,
  value: string,
): string => {
  if (
    value === '' ||
    value === JOTADUO_ONBOARDING_NO_SYSTEM ||
    getOnboardingSystemsForArea(area).includes(value)
  ) {
    return value;
  }

  return JOTADUO_ONBOARDING_OTHER_SYSTEM;
};
