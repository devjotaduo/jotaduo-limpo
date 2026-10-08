import { JOTADUO_ONBOARDING_QUESTIONS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingQuestions';
import { type JotaduoOnboardingAnswers } from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { getOnboardingQuestionErrors } from '~/jotaduo/onboarding/utils/getOnboardingQuestionErrors';

// Starts on the first question still missing a valid answer. With nothing
// missing it starts from the top, to review.
export const getInitialOnboardingStepIndex = (
  answers: JotaduoOnboardingAnswers,
): number => {
  const firstIncompleteStepIndex = JOTADUO_ONBOARDING_QUESTIONS.findIndex(
    (question) =>
      Object.keys(getOnboardingQuestionErrors(question, answers)).length > 0,
  );

  return firstIncompleteStepIndex === -1 ? 0 : firstIncompleteStepIndex;
};
