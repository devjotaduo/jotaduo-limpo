import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JOTADUO_ONBOARDING_QUESTIONS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingQuestions';
import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingFieldId,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { type JotaduoOnboardingView } from '~/jotaduo/onboarding/types/JotaduoOnboardingView';
import { getInitialOnboardingStepIndex } from '~/jotaduo/onboarding/utils/getInitialOnboardingStepIndex';
import { getOnboardingQuestionErrors } from '~/jotaduo/onboarding/utils/getOnboardingQuestionErrors';
import { getOnboardingAnswersAfterSave } from '~/jotaduo/onboarding/utils/getOnboardingAnswersAfterSave';
import { getSavedOnboardingAnswers } from '~/jotaduo/onboarding/utils/getSavedOnboardingAnswers';
import {
  JotaduoAppRequestError,
  requestJotaduoApp,
} from '~/jotaduo/onboarding/utils/requestJotaduoApp';

type JotaduoOnboardingProgress = {
  view: JotaduoOnboardingView;
  answers: JotaduoOnboardingAnswers;
  stepIndex: number;
};

type UseJotaduoOnboardingParams = {
  onFinish: () => void;
};

export const useJotaduoOnboarding = ({
  onFinish,
}: UseJotaduoOnboardingParams) => {
  const [progress, setProgress] = useState<JotaduoOnboardingProgress | null>(
    null,
  );
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  // Field errors stay hidden until the person tries to move on: nobody opens
  // a screen that is already wrong.
  const [hasTriedToContinue, setHasTriedToContinue] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Set while the current question blurs out, before the next one mounts.
  const [leavingToStepIndex, setLeavingToStepIndex] = useState<number | null>(
    null,
  );
  const { enqueueToast } = useToast();
  const { getText } = useJotaduoText();

  const showStep = (stepIndex: number) => {
    setProgress((currentProgress) =>
      isDefined(currentProgress)
        ? { ...currentProgress, stepIndex }
        : currentProgress,
    );
    setLeavingToStepIndex(null);
  };

  // The question on screen ends the transition itself, when its exit
  // animation finishes. With reduced motion there is no animation to wait
  // for, so the next question shows right away.
  const startStepTransition = (targetStepIndex: number) => {
    setHasTriedToContinue(false);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showStep(targetStepIndex);
      return;
    }

    setLeavingToStepIndex(targetStepIndex);
  };

  const finishStepTransition = () => {
    if (isDefined(leavingToStepIndex)) {
      showStep(leavingToStepIndex);
    }
  };

  const getRequestErrorText = (error: unknown) => {
    if (!(error instanceof JotaduoAppRequestError)) {
      return getText(JOTADUO_ONBOARDING_MESSAGES.requestFailed);
    }

    // The app writes its messages for the person, naming the field at fault.
    if (error.hasServerMessage) {
      return error.message;
    }

    return getText(
      error.status === 401 || error.status === 403
        ? JOTADUO_ONBOARDING_MESSAGES.accessDenied
        : JOTADUO_ONBOARDING_MESSAGES.requestFailed,
    );
  };

  const load = async () => {
    setHasLoadFailed(false);

    try {
      const view = await requestJotaduoApp<JotaduoOnboardingView>(
        'GET',
        'onboarding',
      );
      const answers = getSavedOnboardingAnswers(view);

      setProgress({
        view,
        answers,
        stepIndex: getInitialOnboardingStepIndex(answers),
      });
    } catch {
      setHasLoadFailed(true);
    }
  };

  const answer = (fieldId: JotaduoOnboardingFieldId, value: string) => {
    if (!isDefined(progress)) {
      return;
    }

    setProgress({
      ...progress,
      answers: { ...progress.answers, [fieldId]: value },
    });
  };

  const goBack = () => {
    if (!isDefined(progress) || progress.stepIndex === 0) {
      return;
    }

    startStepTransition(progress.stepIndex - 1);
  };

  const goForward = async () => {
    if (!isDefined(progress)) {
      return;
    }

    const { view, answers, stepIndex } = progress;
    const question = JOTADUO_ONBOARDING_QUESTIONS[stepIndex];

    if (
      Object.keys(getOnboardingQuestionErrors(question, answers)).length > 0
    ) {
      setHasTriedToContinue(true);
      return;
    }

    const savedAnswers = getSavedOnboardingAnswers(view);
    const changedFields = Object.fromEntries(
      question.fields
        .filter(
          (field) => answers[field.id].trim() !== savedAnswers[field.id].trim(),
        )
        .map((field) => [field.id, answers[field.id].trim()]),
    );
    const isLastStep = stepIndex === JOTADUO_ONBOARDING_QUESTIONS.length - 1;

    setIsSaving(true);

    try {
      const nextView =
        Object.keys(changedFields).length > 0
          ? await requestJotaduoApp<JotaduoOnboardingView>(
              'POST',
              'onboarding',
              { acao: question.action, campos: changedFields },
            )
          : view;

      if (isLastStep) {
        await requestJotaduoApp<JotaduoOnboardingView>('POST', 'onboarding', {
          acao: 'concluir',
        });
        enqueueToast({
          variant: 'success',
          children: getText(JOTADUO_ONBOARDING_MESSAGES.finished),
        });
        onFinish();
        return;
      }

      setProgress({
        view: nextView,
        answers: getOnboardingAnswersAfterSave({
          answers,
          savedAnswers,
          nextSavedAnswers: getSavedOnboardingAnswers(nextView),
          savedFieldIds: question.fields.map((field) => field.id),
        }),
        stepIndex,
      });
      startStepTransition(stepIndex + 1);
    } catch (error) {
      enqueueToast({ variant: 'error', children: getRequestErrorText(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    progress,
    hasLoadFailed,
    hasTriedToContinue,
    isSaving,
    leavingToStepIndex,
    finishStepTransition,
    load,
    answer,
    goBack,
    goForward,
  };
};
