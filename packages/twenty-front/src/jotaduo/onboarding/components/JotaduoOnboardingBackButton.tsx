import { IconChevronLeft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';

type JotaduoOnboardingBackButtonProps = {
  isDisabled: boolean;
  onClick: () => void;
};

export const JotaduoOnboardingBackButton = ({
  isDisabled,
  onClick,
}: JotaduoOnboardingBackButtonProps) => {
  const { getText } = useJotaduoText();

  return (
    <Button
      size="sm"
      variant="ghost"
      color="neutral"
      disabled={isDisabled}
      startIcon={<IconChevronLeft size={14} aria-hidden />}
      onClick={onClick}
    >
      {getText(JOTADUO_ONBOARDING_MESSAGES.back)}
    </Button>
  );
};
