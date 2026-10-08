import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBrandWhatsapp,
  IconBriefcase,
  IconCheck,
  IconChevronRight,
  IconDatabase,
  IconSparkles,
  IconUser,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JOTADUO_ONBOARDING_GOALS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingGoals';
import { JOTADUO_ONBOARDING_OTHER_SYSTEM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingOtherSystem';
import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingFieldId,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { formatCnpj } from '~/jotaduo/onboarding/utils/formatCnpj';
import { formatWhatsappPhone } from '~/jotaduo/onboarding/utils/formatWhatsappPhone';
import { getInstagramAccount } from '~/jotaduo/onboarding/utils/getInstagramAccount';
import { getOnboardingGoals } from '~/jotaduo/onboarding/utils/getOnboardingGoals';
import { getWhatsappPhoneDigits } from '~/jotaduo/onboarding/utils/getWhatsappPhoneDigits';

const PREVIEW_WINDOW_WIDTH_IN_PX = 1120;
const SKELETON_LIST_BAR_WIDTHS = [
  'long',
  'medium',
  'long',
  'short',
  'medium',
  'long',
  'medium',
  'short',
];

const StyledSide = styled.aside`
  background: ${themeCssVariables.background.secondary};
  border-left: 1px solid ${themeCssVariables.border.color.light};
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;

  @media (max-width: 899px) {
    display: none;
  }
`;

// A skeleton of a JotaDuo window, larger than the half and cut by its edges,
// like a screen seen up close. On each question it slides to the part the
// answer lands on. It is the one long movement of the onboarding, and it
// stays put for whoever asks for less motion. The offsets are where each
// card sits inside the window.
const StyledWindow = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 1400px;
  left: 12%;
  overflow: hidden;
  position: absolute;
  top: 12%;
  transition:
    left calc(${themeCssVariables.animation.duration.normal} * 2s)
      cubic-bezier(0.22, 1, 0.36, 1),
    top calc(${themeCssVariables.animation.duration.normal} * 2s)
      cubic-bezier(0.22, 1, 0.36, 1);
  width: ${PREVIEW_WINDOW_WIDTH_IN_PX}px;

  &[data-focus='segmento'] {
    left: calc(88% - ${PREVIEW_WINDOW_WIDTH_IN_PX}px);
  }

  &[data-focus='metas'] {
    left: calc(12% - 200px);
    top: calc(12% - 53px);
  }

  &[data-focus='sistemaExterno'] {
    left: calc(12% - 200px);
    top: calc(12% - 205px);
  }

  &[data-focus='agenteNome'] {
    left: calc(12% - 200px);
    top: calc(12% - 317px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 52px;
  padding: 0 ${themeCssVariables.spacing[4]};
  white-space: nowrap;
`;

const StyledBadge = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: inline-grid;
  flex: 0 0 auto;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 24px;
  place-items: center;
  width: 24px;

  &[data-brand] {
    background: ${themeCssVariables.font.color.primary};
    color: ${themeCssVariables.background.primary};
  }

  &[data-avatar] {
    border-radius: 50%;
    height: 32px;
    width: 32px;
  }
`;

const StyledIdentity = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 420px;
  min-width: 0;
`;

const StyledCompanyName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;

  &[data-empty] {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledCompanyData = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Stands in for what has not been answered yet: the preview never makes up
// text.
const StyledBar = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  display: block;
  height: 8px;
  width: 60%;

  &[data-width='long'] {
    width: 90%;
  }

  &[data-width='short'] {
    width: 40%;
  }

  &[data-in='company-data'] {
    height: 6px;
    width: 120px;
  }

  &[data-in='area'] {
    background: ${themeCssVariables.background.quaternary};
    width: 64px;
  }
`;

const StyledArea = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  margin-left: auto;
  min-width: 96px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: box-shadow
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  &[data-current] {
    box-shadow: 0 0 0 1px ${themeCssVariables.border.color.strong};
  }
`;

const StyledBody = styled.div`
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  min-height: 0;
`;

const StyledList = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledListRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledListRowDisc = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 50%;
  flex: 0 0 auto;
  height: 28px;
  width: 28px;
`;

const StyledListRowText = styled.span`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[6]};
`;

// The card of the open question gets the strong border: it is where the
// window slid to. The first two keep a minimum height so the ones below do
// not move as answers come in, which the slide offsets rely on.
const StyledCard = styled.section`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-width: 440px;
  padding: ${themeCssVariables.spacing[4]};
  transition: border-color
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  &:first-child {
    min-height: 136px;
  }

  &:nth-child(2) {
    min-height: 96px;
  }

  &[data-current] {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledCardTitle = styled.p`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledGoals = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

const StyledIconText = styled.span`
  align-items: center;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};

  &[data-muted] {
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.sm};
  }
`;

const StyledAssistant = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAssistantIdentity = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledAssistantName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};

  &[data-empty] {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledContacts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledContact = styled.div`
  align-items: center;
  display: grid;
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 96px minmax(0, 1fr);
`;

const StyledConversation = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledBubble = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  display: block;
  height: 28px;
  width: 55%;

  &[data-side='assistant'] {
    align-self: flex-end;
    background: ${themeCssVariables.background.quaternary};
    width: 70%;
  }
`;

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase();

// The phone the way a person reads it. What is not a phone yet stays as
// typed.
const getReadablePhone = (value: string) => {
  const phoneDigits = getWhatsappPhoneDigits(value);

  return isDefined(phoneDigits)
    ? formatWhatsappPhone(phoneDigits)
    : value.trim();
};

type JotaduoOnboardingPreviewProps = {
  answers: JotaduoOnboardingAnswers;
  areaOptions: { value: string; label: string }[];
  // The question on screen, or the one it is leaving for.
  focusedQuestionId: JotaduoOnboardingFieldId;
};

// The right half of the questions, with what was already answered in the
// place it will show up. It is decoration: screen readers skip it, because
// the same value sits in the field next to it.
export const JotaduoOnboardingPreview = ({
  answers,
  areaOptions,
  focusedQuestionId,
}: JotaduoOnboardingPreviewProps) => {
  const { getText } = useJotaduoText();

  const areaLabel = areaOptions.find(
    (areaOption) => areaOption.value === answers.segmento,
  )?.label;
  const companyName = answers.nome.trim();
  const instagramAccount = getInstagramAccount(answers.instagram);
  const companyData = [
    answers.cnpj.trim() === '' ? '' : formatCnpj(answers.cnpj),
    instagramAccount === '' ? '' : `@${instagramAccount}`,
    answers.site.trim().replace(/^https?:\/\//i, ''),
  ].filter((companyDatum) => companyDatum !== '');
  const selectedGoals = getOnboardingGoals(answers.metas);
  const goals = JOTADUO_ONBOARDING_GOALS.filter((goal) =>
    selectedGoals.includes(goal.value),
  );
  const systemName =
    answers.sistemaExterno === JOTADUO_ONBOARDING_OTHER_SYSTEM
      ? ''
      : answers.sistemaExterno.trim();
  const assistantName = answers.agenteNome.trim();
  const contacts = [
    {
      Icon: IconBrandWhatsapp,
      label: getText(JOTADUO_ONBOARDING_MESSAGES.previewCompany),
      phone: getReadablePhone(answers.whatsapp),
    },
    {
      Icon: IconUser,
      label: getText(JOTADUO_ONBOARDING_MESSAGES.previewOwner),
      phone: getReadablePhone(answers.whatsappResponsavel),
    },
  ];

  const getCurrentMark = (questionId: JotaduoOnboardingFieldId) =>
    questionId === focusedQuestionId ? '' : undefined;

  return (
    <StyledSide aria-hidden>
      <StyledWindow data-focus={focusedQuestionId}>
        <StyledTopBar>
          <StyledBadge data-brand="">J</StyledBadge>
          <IconChevronRight size={14} />
          <StyledBadge>{getInitial(companyName)}</StyledBadge>
          <StyledIdentity>
            <StyledCompanyName data-empty={companyName === '' ? '' : undefined}>
              {companyName === ''
                ? getText(JOTADUO_ONBOARDING_MESSAGES.companyName)
                : companyName}
            </StyledCompanyName>
            <StyledCompanyData>
              {companyData.length > 0 ? (
                companyData.join(' · ')
              ) : (
                <StyledBar data-in="company-data" />
              )}
            </StyledCompanyData>
          </StyledIdentity>
          <StyledArea data-current={getCurrentMark('segmento')}>
            <IconBriefcase size={14} />
            {areaLabel ?? <StyledBar data-in="area" />}
          </StyledArea>
        </StyledTopBar>
        <StyledBody>
          <StyledList>
            {SKELETON_LIST_BAR_WIDTHS.map((barWidth, rowIndex) => (
              // oxlint-disable-next-line react/no-array-index-key
              <StyledListRow key={rowIndex}>
                <StyledListRowDisc />
                <StyledListRowText>
                  <StyledBar data-width={barWidth} />
                  <StyledBar data-width="short" />
                </StyledListRowText>
              </StyledListRow>
            ))}
          </StyledList>
          <StyledContent>
            <StyledCard data-current={getCurrentMark('metas')}>
              <StyledCardTitle>
                {getText(JOTADUO_ONBOARDING_MESSAGES.previewGoals)}
              </StyledCardTitle>
              {goals.length > 0 ? (
                <StyledGoals>
                  {goals.map((goal) => (
                    <StyledIconText key={goal.value}>
                      <IconCheck size={12} />
                      {getText(goal.label)}
                    </StyledIconText>
                  ))}
                </StyledGoals>
              ) : (
                <>
                  <StyledBar data-width="long" />
                  <StyledBar data-width="medium" />
                </>
              )}
            </StyledCard>
            <StyledCard data-current={getCurrentMark('sistemaExterno')}>
              <StyledCardTitle>
                {getText(JOTADUO_ONBOARDING_MESSAGES.previewSystem)}
              </StyledCardTitle>
              {systemName === '' ? (
                <StyledBar data-width="medium" />
              ) : (
                <StyledIconText>
                  <IconDatabase size={12} />
                  {systemName}
                </StyledIconText>
              )}
            </StyledCard>
            <StyledCard data-current={getCurrentMark('agenteNome')}>
              <StyledAssistant>
                <StyledBadge data-avatar="">
                  {getInitial(assistantName)}
                </StyledBadge>
                <StyledAssistantIdentity>
                  <StyledAssistantName
                    data-empty={assistantName === '' ? '' : undefined}
                  >
                    {assistantName === ''
                      ? getText(
                          JOTADUO_ONBOARDING_MESSAGES.previewAssistantName,
                        )
                      : assistantName}
                  </StyledAssistantName>
                  <StyledIconText data-muted="">
                    <IconSparkles size={12} />
                    {getText(JOTADUO_ONBOARDING_MESSAGES.previewAssistantRole)}
                  </StyledIconText>
                </StyledAssistantIdentity>
              </StyledAssistant>
              <StyledContacts>
                {contacts.map(({ Icon, label, phone }) => (
                  <StyledContact key={label}>
                    <StyledIconText data-muted="">
                      <Icon size={12} />
                      {label}
                    </StyledIconText>
                    {phone === '' ? (
                      <StyledBar data-width="medium" />
                    ) : (
                      <span>{phone}</span>
                    )}
                  </StyledContact>
                ))}
              </StyledContacts>
              <StyledConversation>
                <StyledBubble />
                <StyledBubble data-side="assistant" />
              </StyledConversation>
            </StyledCard>
          </StyledContent>
        </StyledBody>
      </StyledWindow>
    </StyledSide>
  );
};
