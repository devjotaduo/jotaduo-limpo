import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { OnboardingProfilePictureUploader } from '@/onboarding/components/OnboardingProfilePictureUploader';
import { usePrefetchInviteSuggestions } from '@/onboarding/hooks/usePrefetchInviteSuggestions';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { type KeyboardEvent, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

import { JotaduoOnboardingStepFrame } from '~/jotaduo/onboarding/components/JotaduoOnboardingStepFrame';
import { JotaduoOnboardingTextField } from '~/jotaduo/onboarding/components/JotaduoOnboardingTextField';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

// The picture sits level with the two inputs, whose labels are above them.
const StyledNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  > button {
    margin-top: 18px;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;

    > button {
      margin-top: 0;
    }
  }
`;

const StyledNameField = styled.div`
  flex: 1 1 0;
  min-width: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex: 0 0 auto;
    width: 100%;
  }
`;

type CreateProfileForm = {
  firstName: string;
  lastName: string;
  jobTitle: string;
};

// Upstream's profile step, saved the same way, drawn like a JotaDuo
// question. The texts are upstream's own, so they keep its translations.
export const CreateProfile = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();
  const store = useStore();

  usePrefetchInviteSuggestions();

  const { enqueueToast } = useToast();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setCurrentUser = useSetAtomState(currentUserState);
  const setCurrentWorkspaceMembers = useSetAtomState(
    currentWorkspaceMembersState,
  );
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  const [isNavigating, setIsNavigating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateProfileForm>({
    defaultValues: {
      firstName: currentWorkspaceMember?.name?.firstName ?? '',
      lastName: currentWorkspaceMember?.name?.lastName ?? '',
      jobTitle: currentWorkspaceMember?.jobTitle ?? '',
    },
  });

  const isBusy = isSubmitting || isNavigating;

  const onSubmit: SubmitHandler<CreateProfileForm> = async ({
    firstName,
    lastName,
    jobTitle,
  }) => {
    try {
      if (!isDefined(currentWorkspaceMember?.id)) {
        throw new Error('User is not logged in');
      }

      await updateWorkspaceMemberSettings({
        workspaceMemberId: currentWorkspaceMember.id,
        update: {
          name: { firstName, lastName },
          jobTitle,
          colorScheme: 'System',
        },
      });

      setCurrentWorkspaceMembers((members) =>
        members.map((member) =>
          member.id === currentWorkspaceMember.id
            ? {
                ...member,
                name: { firstName, lastName },
                jobTitle,
                colorScheme: 'System',
              }
            : member,
        ),
      );

      setCurrentUser((current) =>
        isDefined(current) ? { ...current, firstName, lastName } : current,
      );

      setOnboardingStepFreeCredits(
        'createProfile',
        store.get(onboardingCreditsProgressSelector.atom).rewardCreditsByStep
          .createProfile,
      );
      setNextOnboardingStatus({ stepHistoryEffect: 'recordAsReversible' });
      setIsNavigating(true);
    } catch (error) {
      setIsNavigating(false);
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const submit = handleSubmit(onSubmit);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Enter on the picture button is that button's own, not a submit.
    if (
      event.key === Key.Enter &&
      event.target instanceof HTMLInputElement &&
      !isBusy
    ) {
      void submit();
    }
  };

  return (
    <JotaduoOnboardingStepFrame
      title={t`Create profile`}
      subtitle={t`How you'll appear to teammates and agents.`}
      actions={
        <Button
          size="md"
          variant="solid"
          color="accent"
          disabled={isBusy}
          onClick={() => {
            void submit();
          }}
        >
          {t`Continue`}
        </Button>
      }
    >
      <StyledFields onKeyDown={handleKeyDown}>
        <StyledNameRow>
          {isDefined(currentWorkspaceMember?.id) && (
            <OnboardingProfilePictureUploader
              workspaceMemberId={currentWorkspaceMember.id}
            />
          )}
          <StyledNameField>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: t`First name can not be empty` }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <JotaduoOnboardingTextField
                  label={t`First Name`}
                  type="text"
                  value={value}
                  placeholder={t`Tim`}
                  error={error?.message}
                  isDisabled={isBusy}
                  hasAutoFocus
                  onChange={onChange}
                />
              )}
            />
          </StyledNameField>
          <StyledNameField>
            <Controller
              name="lastName"
              control={control}
              rules={{ required: t`Last name can not be empty` }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <JotaduoOnboardingTextField
                  label={t`Last name`}
                  type="text"
                  value={value}
                  placeholder={t`Apple`}
                  error={error?.message}
                  isDisabled={isBusy}
                  onChange={onChange}
                />
              )}
            />
          </StyledNameField>
        </StyledNameRow>
        <Controller
          name="jobTitle"
          control={control}
          render={({ field: { onChange, value } }) => (
            <JotaduoOnboardingTextField
              label={t`Job Title`}
              type="text"
              value={value}
              placeholder={t`Head of Partnerships`}
              isDisabled={isBusy}
              onChange={onChange}
            />
          )}
        />
      </StyledFields>
    </JotaduoOnboardingStepFrame>
  );
};
