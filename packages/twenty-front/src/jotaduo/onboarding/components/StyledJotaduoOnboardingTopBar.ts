import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// Keeps the height of the Back button on the first step, which has none.
export const StyledJotaduoOnboardingTopBar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 72px;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[6]} 0;

  @media (max-width: 520px) {
    min-height: 56px;
    padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]} 0;
  }
`;
