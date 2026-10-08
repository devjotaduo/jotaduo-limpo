import { isString } from '@sniptt/guards';

import { JOTADUO_ONBOARDING_QUESTIONS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingQuestions';
import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingFieldId,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { type JotaduoOnboardingView } from '~/jotaduo/onboarding/types/JotaduoOnboardingView';
import { formatCnpj } from '~/jotaduo/onboarding/utils/formatCnpj';
import { formatWhatsappPhone } from '~/jotaduo/onboarding/utils/formatWhatsappPhone';
import { getInstagramAccount } from '~/jotaduo/onboarding/utils/getInstagramAccount';

const formatInstagramAccount = (value: string) => {
  const account = getInstagramAccount(value);

  return account === '' ? '' : `@${account}`;
};

// The app stores bare digits and the Instagram account without "@". Showing
// them the way a person types keeps an untouched field from counting as a
// change.
const FORMAT_SAVED_VALUE_BY_FIELD_ID: Partial<
  Record<JotaduoOnboardingFieldId, (value: string) => string>
> = {
  cnpj: formatCnpj,
  instagram: formatInstagramAccount,
  whatsapp: formatWhatsappPhone,
  whatsappResponsavel: formatWhatsappPhone,
};

// What is stored today. The edit in progress wins over the profile in use,
// as in the rest of the app's setup.
export const getSavedOnboardingAnswers = (
  view: JotaduoOnboardingView,
): JotaduoOnboardingAnswers => {
  const editedCompany = view.empresa.emEdicao.dados;
  const profile: Record<string, unknown> = {
    ...view.perfil,
    ...editedCompany.perfil,
  };

  const answers = Object.fromEntries(
    JOTADUO_ONBOARDING_QUESTIONS.flatMap((question) => question.fields).map(
      (field) => {
        const storedValue = profile[field.id];
        const value = isString(storedValue) ? storedValue : '';

        return [
          field.id,
          FORMAT_SAVED_VALUE_BY_FIELD_ID[field.id]?.(value) ?? value,
        ];
      },
    ),
  ) as JotaduoOnboardingAnswers;

  return { ...answers, segmento: editedCompany.segmento ?? '' };
};
