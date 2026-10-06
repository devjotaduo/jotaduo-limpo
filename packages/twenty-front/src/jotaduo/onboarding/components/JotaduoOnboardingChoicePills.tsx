import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledJotaduoOnboardingFieldMessage } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingFieldMessage';

const StyledChoice = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

// Twenty's buttons have superellipse corners, which turn a pill radius into
// a square.
const StyledPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};

  > button {
    border-radius: ${themeCssVariables.border.radius.pill};
    corner-shape: round;
  }
`;

type JotaduoOnboardingChoicePillsProps = {
  label: string;
  options: { value: string; label: string }[];
  isSelected: (value: string) => boolean;
  onSelect: (value: string) => void;
  isDisabled: boolean;
  error?: string;
};

// Every option in sight, one tap each. The picked one turns grey rather than
// blue: blue is kept for the button that moves the questions forward.
export const JotaduoOnboardingChoicePills = ({
  label,
  options,
  isSelected,
  onSelect,
  isDisabled,
  error,
}: JotaduoOnboardingChoicePillsProps) => (
  <StyledChoice>
    <StyledPills role="group" aria-label={label}>
      {options.map((option) => {
        const isOptionSelected = isSelected(option.value);

        return (
          <Button
            key={option.value}
            size="md"
            variant={isOptionSelected ? 'solid' : 'soft'}
            color="neutral"
            aria-pressed={isOptionSelected}
            disabled={isDisabled}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </StyledPills>
    {isNonEmptyString(error) && (
      <StyledJotaduoOnboardingFieldMessage role="alert" data-error="">
        {error}
      </StyledJotaduoOnboardingFieldMessage>
    )}
  </StyledChoice>
);
