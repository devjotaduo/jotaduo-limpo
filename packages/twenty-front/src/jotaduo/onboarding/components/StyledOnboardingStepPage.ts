import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

// Upstream's page with its background taken out, so the steps the fork does
// not redraw take the color of the half they sit in. The sign-up page uses
// it too and keeps its look, since its layout paints the same color behind.
export const StyledOnboardingStepPage = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[14]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[8]};
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${themeCssVariables.spacing[8]};
    padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[4]};
  }
`;
