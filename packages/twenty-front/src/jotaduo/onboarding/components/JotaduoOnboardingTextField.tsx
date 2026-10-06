import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledJotaduoOnboardingFieldMessage } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingFieldMessage';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

// Small and strong above the box, as in Twenty's record forms: a larger
// label competes with the question.
const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

type JotaduoOnboardingTextFieldProps = {
  label: string;
  type: 'text' | 'tel' | 'url';
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  isDisabled: boolean;
  hasAutoFocus?: boolean;
  onChange: (value: string) => void;
};

export const JotaduoOnboardingTextField = ({
  label,
  type,
  value,
  placeholder,
  hint,
  error,
  isDisabled,
  hasAutoFocus = false,
  onChange,
}: JotaduoOnboardingTextFieldProps) => {
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <StyledField>
      <StyledLabel htmlFor={inputId}>{label}</StyledLabel>
      <Input
        id={inputId}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={isDisabled}
        autoFocus={hasAutoFocus}
        aria-invalid={isNonEmptyString(error)}
        aria-describedby={isNonEmptyString(message) ? messageId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {isNonEmptyString(message) && (
        <StyledJotaduoOnboardingFieldMessage
          id={messageId}
          role={isNonEmptyString(error) ? 'alert' : undefined}
          data-error={isNonEmptyString(error) ? '' : undefined}
        >
          {message}
        </StyledJotaduoOnboardingFieldMessage>
      )}
    </StyledField>
  );
};
