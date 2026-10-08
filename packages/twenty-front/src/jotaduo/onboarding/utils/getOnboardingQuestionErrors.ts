import { isDefined } from 'twenty-shared/utils';

import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingFieldError,
  type JotaduoOnboardingFieldId,
  type JotaduoOnboardingQuestion,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { getOnboardingFieldError } from '~/jotaduo/onboarding/utils/getOnboardingFieldError';

export const getOnboardingQuestionErrors = (
  question: JotaduoOnboardingQuestion,
  answers: JotaduoOnboardingAnswers,
): Partial<Record<JotaduoOnboardingFieldId, JotaduoOnboardingFieldError>> =>
  Object.fromEntries(
    question.fields.flatMap((field) => {
      const fieldError = getOnboardingFieldError(field, answers);

      return isDefined(fieldError) ? [[field.id, fieldError]] : [];
    }),
  );
