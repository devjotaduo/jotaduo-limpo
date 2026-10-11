import { useEffect } from 'react';

type JotaduoOnboardingLoadEffectProps = {
  onLoad: () => void;
};

// Loads the setup once, when the questions open. Retries go through the
// button on the failure screen.
export const JotaduoOnboardingLoadEffect = ({
  onLoad,
}: JotaduoOnboardingLoadEffectProps) => {
  useEffect(() => {
    onLoad();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
