import { styled } from '@linaria/react';

// Upstream paints its own background here, which would show as a block of
// another color inside the step half.
const StyledContainer = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
`;

export const OnboardingStepPageLoader = () => <StyledContainer />;
