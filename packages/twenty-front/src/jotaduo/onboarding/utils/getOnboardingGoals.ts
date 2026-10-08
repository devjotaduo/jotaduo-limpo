import { JOTADUO_ONBOARDING_GOALS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingGoals';

// The goals in a stored "a,b,c" text, in list order and without repeats.
// Unknown values are left out.
export const getOnboardingGoals = (value: string): string[] => {
  const storedGoals = value.split(',').map((goal) => goal.trim());

  return JOTADUO_ONBOARDING_GOALS.map((goal) => goal.value).filter((goal) =>
    storedGoals.includes(goal),
  );
};
