import { styled } from '@linaria/react';
import { type AnimationEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JotaduoOnboardingField } from '~/jotaduo/onboarding/components/JotaduoOnboardingField';
import { JotaduoOnboardingProgress } from '~/jotaduo/onboarding/components/JotaduoOnboardingProgress';
import { StyledJotaduoOnboardingFieldMessage } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingFieldMessage';
import { JOTADUO_ONBOARDING_QUESTIONS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingQuestions';
import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingFieldError,
  type JotaduoOnboardingFieldId,
  type JotaduoOnboardingQuestion,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  margin: 0 auto;
  max-width: 520px;
  width: 100%;
`;

// The question blurs out and the next one comes in from blurred to sharp.
// Opacity and blur only, nothing moves. The hook waits for the exit before
// mounting the next question.
const StyledQuestion = styled.div`
  @keyframes jotaduoOnboardingQuestionEnter {
    from {
      filter: blur(8px);
      opacity: 0;
    }
  }

  @keyframes jotaduoOnboardingQuestionLeave {
    to {
      filter: blur(8px);
      opacity: 0;
    }
  }

  animation: jotaduoOnboardingQuestionEnter
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease-out both;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};

  &[data-leaving] {
    animation: jotaduoOnboardingQuestionLeave
      calc(${themeCssVariables.animation.duration.fast} * 1s) ease-in both;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &[data-leaving] {
      animation: none;
    }
  }
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.3;
  margin: 0;
  overflow-wrap: anywhere;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

type JotaduoOnboardingQuestionStepProps = {
  question: JotaduoOnboardingQuestion;
  stepIndex: number;
  answers: JotaduoOnboardingAnswers;
  errors: Partial<
    Record<JotaduoOnboardingFieldId, JotaduoOnboardingFieldError>
  >;
  areaOptions: { value: string; label: string }[];
  // The saved line of business is being replaced, which restarts what the
  // next steps of the app's setup already hold.
  isChangingArea: boolean;
  isDisabled: boolean;
  isLeaving: boolean;
  onLeaveEnd: () => void;
  onAnswer: (fieldId: JotaduoOnboardingFieldId, value: string) => void;
};

// The scrolling column of the question half: progress, question and answer.
export const JotaduoOnboardingQuestionStep = ({
  question,
  stepIndex,
  answers,
  errors,
  areaOptions,
  isChangingArea,
  isDisabled,
  isLeaving,
  onLeaveEnd,
  onAnswer,
}: JotaduoOnboardingQuestionStepProps) => {
  const { getText } = useJotaduoText();

  const firstTextFieldId = question.fields.find(
    (field) =>
      field.kind === 'text' || field.kind === 'phone' || field.kind === 'url',
  )?.id;

  // Animations of the fields inside bubble up here too, and only the
  // question's own exit ends the step.
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (isLeaving && event.target === event.currentTarget) {
      onLeaveEnd();
    }
  };

  return (
    <StyledColumn>
      <JotaduoOnboardingProgress
        label={getText(JOTADUO_ONBOARDING_MESSAGES.progress)}
        valueText={getText(JOTADUO_ONBOARDING_MESSAGES.stepCount, {
          current: stepIndex + 1,
          total: JOTADUO_ONBOARDING_QUESTIONS.length,
        })}
        stepCount={JOTADUO_ONBOARDING_QUESTIONS.length}
        filledStepCount={stepIndex + 1}
      />
      {/* The key remounts the question on a step change, which is what plays
          the entrance. The progress stays outside and does not blink. */}
      <StyledQuestion
        key={question.id}
        data-leaving={isLeaving ? '' : undefined}
        onAnimationEnd={handleAnimationEnd}
      >
        <StyledHeading>
          <StyledTitle>{getText(question.title)}</StyledTitle>
          <StyledSubtitle>{getText(question.subtitle)}</StyledSubtitle>
        </StyledHeading>
        <StyledFields>
          {question.fields.map((field) => {
            const fieldError = errors[field.id];

            return (
              <JotaduoOnboardingField
                key={field.id}
                field={field}
                answers={answers}
                areaOptions={areaOptions}
                error={
                  isDefined(fieldError)
                    ? getText(fieldError.message, fieldError.values)
                    : undefined
                }
                isDisabled={isDisabled}
                hasAutoFocus={field.id === firstTextFieldId}
                onAnswer={(value) => onAnswer(field.id, value)}
              />
            );
          })}
          {isChangingArea && (
            <StyledJotaduoOnboardingFieldMessage role="status">
              {getText(JOTADUO_ONBOARDING_MESSAGES.areaChangeNotice)}
            </StyledJotaduoOnboardingFieldMessage>
          )}
        </StyledFields>
      </StyledQuestion>
    </StyledColumn>
  );
};
