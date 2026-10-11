import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingInviteTeamSkipDialog } from '@/onboarding/components/OnboardingInviteTeamSkipDialog';
import { ONBOARDING_MOTION_SLIDE_OFFSET } from '@/onboarding/constants/OnboardingMotionSlideOffset';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { JotaduoOnboardingStepFrame } from '~/jotaduo/onboarding/components/JotaduoOnboardingStepFrame';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

// Upstream's invite step, with its own form behind it, drawn like a JotaDuo
// question. The texts are upstream's own, so they keep its translations.
export const InviteTeam = () => {
  const { t } = useLingui();
  const {
    control,
    fields,
    remove,
    handleInvite,
    openSkipDialog,
    emailIndexToFocus,
    handleSkip,
    getPlaceholder,
    isValid,
    isSubmitting,
    isNavigating,
  } = useInviteTeam();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const creditsRewardPerUser = onboardingConfig?.inviteTeamCreditsRewardPerUser;
  const transition = useOnboardingMotionTransition();
  const emailInputToFocusRef = useRef<HTMLInputElement>(null);

  const isBusy = isSubmitting || isNavigating;
  const canRemoveEmailField = fields.length > 1;

  return (
    <JotaduoOnboardingStepFrame
      title={t`Invite your team`}
      subtitle={t`Get the most out of your workspace by inviting your team.`}
      actions={
        <>
          <Button
            size="md"
            variant="outline"
            color="neutral"
            disabled={isBusy}
            onClick={() => void openSkipDialog()}
          >
            {t`Skip`}
          </Button>
          <Button
            size="md"
            variant="solid"
            color="accent"
            loading={isBusy}
            disabled={!isValid || isBusy}
            onClick={handleInvite}
          >
            {t`Invite`}
          </Button>
        </>
      }
    >
      {isDefined(creditsRewardPerUser) && (
        <span>{t`${creditsRewardPerUser} free credits per user`}</span>
      )}
      <StyledFields>
        <AnimatePresence initial={false}>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, y: -ONBOARDING_MOTION_SLIDE_OFFSET }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -ONBOARDING_MOTION_SLIDE_OFFSET }}
              transition={transition}
            >
              <Controller
                name={`emails.${index}.email`}
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <TextInput
                    ref={
                      index === emailIndexToFocus
                        ? emailInputToFocusRef
                        : undefined
                    }
                    autoFocus={index === 0}
                    type="email"
                    value={value}
                    placeholder={getPlaceholder(index)}
                    onBlur={onBlur}
                    error={error?.message}
                    onChange={onChange}
                    RightIcon={canRemoveEmailField ? IconX : undefined}
                    onRightIconClick={
                      canRemoveEmailField ? () => remove(index) : undefined
                    }
                    noErrorHelper
                    fullWidth
                  />
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </StyledFields>
      <OnboardingInviteTeamSkipDialog
        isValid={isValid}
        finalFocus={emailInputToFocusRef}
        onInvite={handleInvite}
        onSkip={() => void handleSkip()}
      />
    </JotaduoOnboardingStepFrame>
  );
};
