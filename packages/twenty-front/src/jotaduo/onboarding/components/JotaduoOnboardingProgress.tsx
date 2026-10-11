import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledProgress = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledProgressSegment = styled.span`
  background: ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  flex: 1 1 0;
  height: 3px;
  transition: background-color
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  &[data-done] {
    background: ${themeCssVariables.font.color.primary};
  }
`;

type JotaduoOnboardingProgressProps = {
  label: string;
  valueText: string;
  stepCount: number;
  // The steps already done plus the one on screen.
  filledStepCount: number;
};

// One segment per step.
export const JotaduoOnboardingProgress = ({
  label,
  valueText,
  stepCount,
  filledStepCount,
}: JotaduoOnboardingProgressProps) => (
  <StyledProgress
    role="progressbar"
    aria-label={label}
    aria-valuemin={1}
    aria-valuemax={stepCount}
    aria-valuenow={filledStepCount}
    aria-valuetext={valueText}
  >
    {Array.from({ length: stepCount }, (_, stepIndex) => (
      <StyledProgressSegment
        // oxlint-disable-next-line react/no-array-index-key
        key={stepIndex}
        data-done={stepIndex < filledStepCount ? '' : undefined}
        aria-hidden
      />
    ))}
  </StyledProgress>
);
