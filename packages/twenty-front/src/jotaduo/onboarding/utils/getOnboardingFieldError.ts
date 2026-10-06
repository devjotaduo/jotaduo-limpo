import { type MessageDescriptor } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { JOTADUO_ONBOARDING_FIELD_MAX_LENGTHS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingFieldMaxLengths';
import { JOTADUO_ONBOARDING_OTHER_SYSTEM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingOtherSystem';
import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingField,
  type JotaduoOnboardingFieldError,
  type JotaduoOnboardingFieldId,
  type JotaduoOnboardingFieldKind,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { getInstagramAccount } from '~/jotaduo/onboarding/utils/getInstagramAccount';
import { getWhatsappPhoneDigits } from '~/jotaduo/onboarding/utils/getWhatsappPhoneDigits';
import { isValidCnpj } from '~/jotaduo/onboarding/utils/isValidCnpj';

const ASSISTANT_NAME_PATTERN = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '-]{1,19}$/;
const WEBSITE_PATTERN = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i;
const INSTAGRAM_ACCOUNT_PATTERN = /^[A-Za-z0-9._]{1,30}$/;

const EMPTY_MESSAGE_BY_FIELD_KIND: Record<
  JotaduoOnboardingFieldKind,
  MessageDescriptor
> = {
  area: JOTADUO_ONBOARDING_MESSAGES.errorEmptyArea,
  goals: JOTADUO_ONBOARDING_MESSAGES.errorEmptyGoals,
  system: JOTADUO_ONBOARDING_MESSAGES.errorEmptySystem,
  text: JOTADUO_ONBOARDING_MESSAGES.errorEmptyText,
  phone: JOTADUO_ONBOARDING_MESSAGES.errorEmptyPhone,
  url: JOTADUO_ONBOARDING_MESSAGES.errorEmptyText,
};

const getPhoneFormatError = (value: string) =>
  isDefined(getWhatsappPhoneDigits(value))
    ? null
    : JOTADUO_ONBOARDING_MESSAGES.errorPhone;

// The same format rules the app's server applies, so the mistake shows on
// the field instead of after saving.
const FORMAT_ERROR_BY_FIELD_ID: Partial<
  Record<JotaduoOnboardingFieldId, (value: string) => MessageDescriptor | null>
> = {
  cnpj: (value) =>
    isValidCnpj(value) ? null : JOTADUO_ONBOARDING_MESSAGES.errorCnpj,
  whatsapp: getPhoneFormatError,
  whatsappResponsavel: getPhoneFormatError,
  agenteNome: (value) =>
    ASSISTANT_NAME_PATTERN.test(value.trim())
      ? null
      : JOTADUO_ONBOARDING_MESSAGES.errorAssistantName,
  instagram: (value) =>
    INSTAGRAM_ACCOUNT_PATTERN.test(getInstagramAccount(value))
      ? null
      : JOTADUO_ONBOARDING_MESSAGES.errorInstagram,
  site: (value) => {
    if (WEBSITE_PATTERN.test(value.trim())) {
      return null;
    }

    return /^https:\/\//i.test(value.trim())
      ? JOTADUO_ONBOARDING_MESSAGES.errorWebsite
      : JOTADUO_ONBOARDING_MESSAGES.errorWebsiteScheme;
  },
};

export const getOnboardingFieldError = (
  field: JotaduoOnboardingField,
  answers: JotaduoOnboardingAnswers,
): JotaduoOnboardingFieldError | null => {
  const value = answers[field.id];

  if (field.kind === 'system' && value === JOTADUO_ONBOARDING_OTHER_SYSTEM) {
    return { message: JOTADUO_ONBOARDING_MESSAGES.errorSystemName };
  }

  if (value.trim() === '') {
    return field.isRequired
      ? { message: EMPTY_MESSAGE_BY_FIELD_KIND[field.kind] }
      : null;
  }

  const maxLength = JOTADUO_ONBOARDING_FIELD_MAX_LENGTHS[field.id];

  if (isDefined(maxLength) && value.length > maxLength) {
    return {
      message: JOTADUO_ONBOARDING_MESSAGES.errorTooLong,
      values: { limit: maxLength, typed: value.length },
    };
  }

  const formatErrorMessage = FORMAT_ERROR_BY_FIELD_ID[field.id]?.(value);

  return isDefined(formatErrorMessage) ? { message: formatErrorMessage } : null;
};
