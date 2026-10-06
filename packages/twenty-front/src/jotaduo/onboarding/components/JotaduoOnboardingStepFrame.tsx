import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledJotaduoOnboardingActions } from '~/jotaduo/onboarding/components/StyledJotaduoOnboardingActions';

const StyledFrame = styled.div`
  display: grid;
  flex: 1 1 0;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
  min-width: 0;
`;

const StyledBody = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]};

  @media (max-width: 520px) {
    padding: ${themeCssVariables.spacing[4]};
  }
`;

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  margin: 0 auto;
  max-width: 520px;
  width: 100%;
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

type JotaduoOnboardingStepFrameProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  // The buttons at the foot. The last one is the one that moves on.
  actions: ReactNode;
};

// One of Twenty's onboarding steps drawn like a JotaDuo question: heading,
// what is asked, and the buttons at the foot, outside the scroll.
export const JotaduoOnboardingStepFrame = ({
  title,
  subtitle,
  children,
  actions,
}: JotaduoOnboardingStepFrameProps) => (
  <StyledFrame>
    <StyledBody>
      <StyledColumn>
        <StyledHeading>
          <StyledTitle>{title}</StyledTitle>
          <StyledSubtitle>{subtitle}</StyledSubtitle>
        </StyledHeading>
        {children}
      </StyledColumn>
    </StyledBody>
    <StyledJotaduoOnboardingActions>{actions}</StyledJotaduoOnboardingActions>
  </StyledFrame>
);
