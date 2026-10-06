import { isDefined } from 'twenty-shared/utils';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JotaduoOnboardingChoicePills } from '~/jotaduo/onboarding/components/JotaduoOnboardingChoicePills';
import { JotaduoOnboardingTextField } from '~/jotaduo/onboarding/components/JotaduoOnboardingTextField';
import { JOTADUO_ONBOARDING_FIELD_MAX_LENGTHS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingFieldMaxLengths';
import { JOTADUO_ONBOARDING_GOALS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingGoals';
import { JOTADUO_ONBOARDING_NO_SYSTEM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingNoSystem';
import { JOTADUO_ONBOARDING_OTHER_SYSTEM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingOtherSystem';
import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingField as JotaduoOnboardingFieldDefinition,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { getOnboardingGoals } from '~/jotaduo/onboarding/utils/getOnboardingGoals';
import { getOnboardingSystemChoice } from '~/jotaduo/onboarding/utils/getOnboardingSystemChoice';
import { getOnboardingSystemsForArea } from '~/jotaduo/onboarding/utils/getOnboardingSystemsForArea';

const INPUT_TYPE_BY_FIELD_KIND = {
  text: 'text',
  phone: 'tel',
  url: 'url',
} as const;

const getCharacterCount = (value: string, maxLength: number | undefined) =>
  isDefined(maxLength) ? `${value.length} / ${maxLength}` : undefined;

type JotaduoOnboardingFieldProps = {
  field: JotaduoOnboardingFieldDefinition;
  answers: JotaduoOnboardingAnswers;
  areaOptions: { value: string; label: string }[];
  error?: string;
  isDisabled: boolean;
  hasAutoFocus: boolean;
  onAnswer: (value: string) => void;
};

export const JotaduoOnboardingField = ({
  field,
  answers,
  areaOptions,
  error,
  isDisabled,
  hasAutoFocus,
  onAnswer,
}: JotaduoOnboardingFieldProps) => {
  const { getText } = useJotaduoText();
  const value = answers[field.id];
  const label = getText(field.label);
  const maxLength = JOTADUO_ONBOARDING_FIELD_MAX_LENGTHS[field.id];

  if (field.kind === 'area') {
    return (
      <JotaduoOnboardingChoicePills
        label={label}
        options={areaOptions}
        isSelected={(option) => option === value}
        onSelect={onAnswer}
        isDisabled={isDisabled}
        error={error}
      />
    );
  }

  if (field.kind === 'goals') {
    const selectedGoals = getOnboardingGoals(value);

    const toggleGoal = (goal: string) =>
      onAnswer(
        getOnboardingGoals(
          (selectedGoals.includes(goal)
            ? selectedGoals.filter((selectedGoal) => selectedGoal !== goal)
            : [...selectedGoals, goal]
          ).join(','),
        ).join(','),
      );

    return (
      <JotaduoOnboardingChoicePills
        label={label}
        options={JOTADUO_ONBOARDING_GOALS.map((goal) => ({
          value: goal.value,
          label: getText(goal.label),
        }))}
        isSelected={(goal) => selectedGoals.includes(goal)}
        onSelect={toggleGoal}
        isDisabled={isDisabled}
        error={error}
      />
    );
  }

  if (field.kind === 'system') {
    const systemChoice = getOnboardingSystemChoice(answers.segmento, value);
    const isOtherSystem = systemChoice === JOTADUO_ONBOARDING_OTHER_SYSTEM;
    const systemName = value === JOTADUO_ONBOARDING_OTHER_SYSTEM ? '' : value;

    // Picking "Other" again keeps the name already typed.
    const selectSystem = (system: string) => {
      if (system !== JOTADUO_ONBOARDING_OTHER_SYSTEM || !isOtherSystem) {
        onAnswer(system);
      }
    };

    return (
      <>
        <JotaduoOnboardingChoicePills
          label={label}
          options={[
            ...getOnboardingSystemsForArea(answers.segmento).map((system) => ({
              value: system,
              label: system,
            })),
            {
              value: JOTADUO_ONBOARDING_NO_SYSTEM,
              label: getText(JOTADUO_ONBOARDING_MESSAGES.noSystem),
            },
            {
              value: JOTADUO_ONBOARDING_OTHER_SYSTEM,
              label: getText(JOTADUO_ONBOARDING_MESSAGES.otherSystem),
            },
          ]}
          isSelected={(system) => system === systemChoice}
          onSelect={selectSystem}
          isDisabled={isDisabled}
          error={isOtherSystem ? undefined : error}
        />
        {isOtherSystem && (
          <JotaduoOnboardingTextField
            hasAutoFocus
            type="text"
            label={getText(JOTADUO_ONBOARDING_MESSAGES.systemName)}
            value={systemName}
            hint={getCharacterCount(systemName, maxLength)}
            error={error}
            isDisabled={isDisabled}
            onChange={(typedSystemName) =>
              onAnswer(
                typedSystemName.trim() === ''
                  ? JOTADUO_ONBOARDING_OTHER_SYSTEM
                  : typedSystemName,
              )
            }
          />
        )}
      </>
    );
  }

  return (
    <JotaduoOnboardingTextField
      type={INPUT_TYPE_BY_FIELD_KIND[field.kind]}
      label={label}
      value={value}
      placeholder={field.placeholder}
      // The count shows where the text is the answer itself, not a number or
      // an address with a format of its own.
      hint={
        field.kind === 'text' && field.isRequired
          ? getCharacterCount(value, maxLength)
          : undefined
      }
      error={error}
      isDisabled={isDisabled}
      hasAutoFocus={hasAutoFocus}
      onChange={onAnswer}
    />
  );
};
