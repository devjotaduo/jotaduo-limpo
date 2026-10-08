import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// Two halves: the step on the left and, on the right, a preview of JotaDuo.
// On a narrow screen the preview goes away. Twenty themes its scrollbars
// from the page layout, which the onboarding is outside of, so it sets its
// own.
export const StyledJotaduoOnboardingHalves = styled.div`
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  font-family: ${themeCssVariables.font.family};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  scrollbar-color: ${themeCssVariables.border.color.strong} transparent;

  * {
    box-sizing: border-box;
    scrollbar-width: thin;
  }

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.md};
  }

  @media (max-width: 899px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
