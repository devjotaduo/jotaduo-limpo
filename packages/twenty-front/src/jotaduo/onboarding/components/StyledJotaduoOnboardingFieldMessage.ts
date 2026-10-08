import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// The hint under a field, and its error when the answer cannot be stored.
export const StyledJotaduoOnboardingFieldMessage = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
  min-width: 0;

  &[data-error] {
    color: ${themeCssVariables.font.color.danger};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;
