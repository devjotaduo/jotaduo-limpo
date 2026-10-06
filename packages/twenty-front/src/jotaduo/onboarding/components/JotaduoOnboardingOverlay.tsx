import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { styled } from '@linaria/react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { keepFocusInsideOnTab } from '~/jotaduo/accessibility/utils/keepFocusInsideOnTab';
import { moveFocusIntoModal } from '~/jotaduo/accessibility/utils/moveFocusIntoModal';
import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JotaduoOnboardingBackButton } from '~/jotaduo/onboarding/components/JotaduoOnboardingBackButton';
import { JotaduoOnboardingPreview } from '~/jotaduo/onboarding/components/JotaduoOnboardingPreview';
import { JotaduoOnboardingQuestionStep } from '~/jotaduo/onboarding/components/JotaduoOnboardingQuestionStep';
import { StyledJotaduoOnboardingActions } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingActions';
import { StyledJotaduoOnboardingHalves } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingHalves';
import { StyledJotaduoOnboardingTopBar } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingTopBar';
import { JOTADUO_ONBOARDING_QUESTIONS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingQuestions';
import { JotaduoOnboardingLoadEffect } from '~/jotaduo/onboarding/effect-components/JotaduoOnboardingLoadEffect';
import { useJotaduoOnboarding } from '~/jotaduo/onboarding/hooks/useJotaduoOnboarding';
import { getOnboardingQuestionErrors } from '~/jotaduo/onboarding/utils/getOnboardingQuestionErrors';
import { getSavedOnboardingAnswers } from '~/jotaduo/onboarding/utils/getSavedOnboardingAnswers';

// The questions are not a route: they sit over the workspace at the modal
// level, which keeps toasts above them and the app underneath untouched.
const StyledOverlay = styled(StyledJotaduoOnboardingHalves)`
  inset: 0;
  outline: none;
  position: fixed;
  z-index: ${RootStackingContextZIndices.RootModal};
`;

// Back on top, the column that scrolls, and the button that moves on at the
// foot, outside the scroll so it stays in sight.
const StyledMain = styled.div`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-height: 0;
  min-width: 0;
`;

const StyledBody = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]};

  @media (max-width: 520px) {
    padding: ${themeCssVariables.spacing[4]};
  }
`;

const StyledNotice = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[3]};
  margin: 0 auto;
  max-width: 520px;
  padding-top: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

const StyledNoticeTitle = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

type JotaduoOnboardingOverlayProps = {
  onFinish: () => void;
  // Closes the questions when they could not be loaded.
  onDismiss: () => void;
};

export const JotaduoOnboardingOverlay = ({
  onFinish,
  onDismiss,
}: JotaduoOnboardingOverlayProps) => {
  const { getText } = useJotaduoText();
  const {
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
  } = useJotaduoOnboarding({ onFinish });

  const isLeaving = isDefined(leavingToStepIndex);
  const isBusy = isSaving || isLeaving;

  const renderContent = () => {
    if (!isDefined(progress)) {
      return (
        <StyledMain>
          <StyledJotaduoOnboardingTopBar />
          <StyledBody>
            {hasLoadFailed ? (
              <StyledNotice role="alert">
                <StyledNoticeTitle>
                  {getText(JOTADUO_ONBOARDING_MESSAGES.loadErrorTitle)}
                </StyledNoticeTitle>
                <Button size="md" variant="solid" color="accent" onClick={load}>
                  {getText(JOTADUO_ONBOARDING_MESSAGES.retry)}
                </Button>
                {/* The questions have no way out once they load. This one is
                    here so a JotaDuo app that does not answer never locks
                    anyone out of the workspace. */}
                <Button
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  onClick={onDismiss}
                >
                  {getText(JOTADUO_ONBOARDING_MESSAGES.close)}
                </Button>
              </StyledNotice>
            ) : (
              <StyledNotice role="status">
                {getText(JOTADUO_ONBOARDING_MESSAGES.loading)}
              </StyledNotice>
            )}
          </StyledBody>
        </StyledMain>
      );
    }

    const { view, answers, stepIndex } = progress;
    const question = JOTADUO_ONBOARDING_QUESTIONS[stepIndex];
    const questionErrors = getOnboardingQuestionErrors(question, answers);
    const savedArea = getSavedOnboardingAnswers(view).segmento;
    const isLastStep = stepIndex === JOTADUO_ONBOARDING_QUESTIONS.length - 1;
    const isChangingArea =
      question.id === 'segmento' &&
      savedArea !== '' &&
      answers.segmento !== '' &&
      answers.segmento !== savedArea;
    const areaOptions = view.areasDeAtuacao.map((area) => ({
      value: area.valor,
      label: area.rotulo,
    }));

    // Before the first try, only a text past its limit shows its error.
    const visibleErrors = hasTriedToContinue
      ? questionErrors
      : Object.fromEntries(
          Object.entries(questionErrors).filter(
            ([, fieldError]) =>
              fieldError.message === JOTADUO_ONBOARDING_MESSAGES.errorTooLong,
          ),
        );

    const getContinueLabel = () => {
      if (isChangingArea) {
        return getText(JOTADUO_ONBOARDING_MESSAGES.changeAndSave);
      }

      return getText(
        isLastStep
          ? JOTADUO_ONBOARDING_MESSAGES.finish
          : JOTADUO_ONBOARDING_MESSAGES.continue,
      );
    };

    return (
      <>
        <StyledMain>
          <StyledJotaduoOnboardingTopBar>
            {stepIndex > 0 && (
              <JotaduoOnboardingBackButton
                isDisabled={isBusy}
                onClick={goBack}
              />
            )}
          </StyledJotaduoOnboardingTopBar>
          <StyledBody>
            <JotaduoOnboardingQuestionStep
              question={question}
              stepIndex={stepIndex}
              answers={answers}
              errors={visibleErrors}
              areaOptions={areaOptions}
              isChangingArea={isChangingArea}
              isDisabled={isBusy}
              isLeaving={isLeaving}
              onLeaveEnd={finishStepTransition}
              onAnswer={answer}
            />
          </StyledBody>
          <StyledJotaduoOnboardingActions>
            <Button
              size="md"
              variant="solid"
              color="accent"
              disabled={isBusy}
              onClick={goForward}
            >
              {getContinueLabel()}
            </Button>
          </StyledJotaduoOnboardingActions>
        </StyledMain>
        <JotaduoOnboardingPreview
          answers={answers}
          areaOptions={areaOptions}
          focusedQuestionId={
            JOTADUO_ONBOARDING_QUESTIONS[leavingToStepIndex ?? stepIndex].id
          }
        />
      </>
    );
  };

  return createPortal(
    <StyledOverlay
      role="dialog"
      aria-modal="true"
      aria-label={getText(JOTADUO_ONBOARDING_MESSAGES.dialogLabel)}
      tabIndex={-1}
      ref={moveFocusIntoModal}
      onKeyDown={keepFocusInsideOnTab}
    >
      <JotaduoOnboardingLoadEffect onLoad={load} />
      {renderContent()}
    </StyledOverlay>,
    document.body,
  );
};
