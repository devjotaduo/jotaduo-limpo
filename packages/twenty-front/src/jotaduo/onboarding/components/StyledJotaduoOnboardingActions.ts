import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// The foot of the step half, outside the scroll so it stays in sight.
// Twenty's button does not grow on its own: the last one, which moves on,
// takes what is left of the column.
export const StyledJotaduoOnboardingActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-self: center;
  padding: ${themeCssVariables.spacing[4]} 0 ${themeCssVariables.spacing[6]};
  width: min(520px, 100% - 2 * ${themeCssVariables.spacing[6]});

  > button:last-child {
    flex: 1 1 auto;
    min-width: 0;
  }

  @media (max-width: 520px) {
    padding: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[4]};
    width: min(520px, 100% - 2 * ${themeCssVariables.spacing[4]});
  }
`;
