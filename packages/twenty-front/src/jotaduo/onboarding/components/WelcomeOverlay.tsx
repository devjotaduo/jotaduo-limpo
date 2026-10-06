import { WelcomeOverlay as UpstreamWelcomeOverlay } from '@/onboarding/components/WelcomeOverlay/WelcomeOverlay';

import { JotaduoOnboardingGate } from '~/jotaduo/onboarding/components/JotaduoOnboardingGate';

// Upstream mounts WelcomeOverlay once, inside the workspace providers and
// the router. Replacing it with this pair is how the JotaDuo questions get a
// place in the tree without a new route or an edit to upstream.
export const WelcomeOverlay = () => (
  <>
    <UpstreamWelcomeOverlay />
    <JotaduoOnboardingGate />
  </>
);
