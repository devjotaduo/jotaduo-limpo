import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingFieldId,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';

type GetOnboardingAnswersAfterSaveParams = {
  answers: JotaduoOnboardingAnswers;
  // What the app held before the save, and what it holds after it.
  savedAnswers: JotaduoOnboardingAnswers;
  nextSavedAnswers: JotaduoOnboardingAnswers;
  savedFieldIds: JotaduoOnboardingFieldId[];
};

// After a save, what the app holds is the baseline: its own formatting of
// the fields just stored, and anything else it changed along the way. Only
// an answer typed on another question and not sent yet is kept over it.
export const getOnboardingAnswersAfterSave = ({
  answers,
  savedAnswers,
  nextSavedAnswers,
  savedFieldIds,
}: GetOnboardingAnswersAfterSaveParams) =>
  Object.fromEntries(
    (Object.keys(nextSavedAnswers) as JotaduoOnboardingFieldId[]).map(
      (fieldId) => {
        const hasUnsentEdit =
          !savedFieldIds.includes(fieldId) &&
          answers[fieldId].trim() !== savedAnswers[fieldId].trim();

        return [
          fieldId,
          hasUnsentEdit ? answers[fieldId] : nextSavedAnswers[fieldId],
        ];
      },
    ),
  ) as JotaduoOnboardingAnswers;
