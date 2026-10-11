import { JOTADUO_ONBOARDING_FALLBACK_SYSTEMS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingFallbackSystems';
import { JOTADUO_ONBOARDING_SYSTEMS_BY_AREA } from '~/jotaduo/onboarding/constants/JotaduoOnboardingSystemsByArea';

export const getOnboardingSystemsForArea = (area: string): string[] =>
  JOTADUO_ONBOARDING_SYSTEMS_BY_AREA[area] ??
  JOTADUO_ONBOARDING_FALLBACK_SYSTEMS;
