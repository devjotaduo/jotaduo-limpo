import { type MessageDescriptor } from '@lingui/core';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';

// The values are what the app stores, comma separated, in the profile's
// "metas". The order here is the order they are stored in.
export const JOTADUO_ONBOARDING_GOALS: {
  value: string;
  label: MessageDescriptor;
}[] = [
  { value: 'vendas', label: JOTADUO_ONBOARDING_MESSAGES.goalSales },
  { value: 'atendimento', label: JOTADUO_ONBOARDING_MESSAGES.goalService },
  { value: 'agendamento', label: JOTADUO_ONBOARDING_MESSAGES.goalScheduling },
  { value: 'suporte', label: JOTADUO_ONBOARDING_MESSAGES.goalSupport },
  { value: 'automacao', label: JOTADUO_ONBOARDING_MESSAGES.goalAutomation },
  { value: 'marketing', label: JOTADUO_ONBOARDING_MESSAGES.goalMarketing },
  { value: 'outros', label: JOTADUO_ONBOARDING_MESSAGES.goalOther },
];
