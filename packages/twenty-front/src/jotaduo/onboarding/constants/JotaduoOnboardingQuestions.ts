import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { type JotaduoOnboardingQuestion } from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';

// The first setup of the JotaDuo app, one question per screen. Each one is
// stored by the action the app's own setup pages use, so leaving halfway
// keeps what was already answered.
export const JOTADUO_ONBOARDING_QUESTIONS: JotaduoOnboardingQuestion[] = [
  {
    id: 'segmento',
    action: 'salvar-empresa',
    title: JOTADUO_ONBOARDING_MESSAGES.areaTitle,
    subtitle: JOTADUO_ONBOARDING_MESSAGES.areaSubtitle,
    fields: [
      {
        id: 'segmento',
        kind: 'area',
        label: JOTADUO_ONBOARDING_MESSAGES.areaTitle,
        isRequired: true,
      },
    ],
  },
  {
    id: 'nome',
    action: 'salvar-empresa',
    title: JOTADUO_ONBOARDING_MESSAGES.companyTitle,
    subtitle: JOTADUO_ONBOARDING_MESSAGES.companySubtitle,
    fields: [
      {
        id: 'nome',
        kind: 'text',
        label: JOTADUO_ONBOARDING_MESSAGES.companyName,
        isRequired: true,
      },
      {
        id: 'cnpj',
        kind: 'text',
        label: JOTADUO_ONBOARDING_MESSAGES.cnpj,
        isRequired: false,
        placeholder: '12.345.678/0001-95',
      },
      {
        id: 'site',
        kind: 'url',
        label: JOTADUO_ONBOARDING_MESSAGES.website,
        isRequired: false,
        placeholder: 'https://suaempresa.com.br',
      },
      {
        id: 'instagram',
        kind: 'text',
        label: JOTADUO_ONBOARDING_MESSAGES.instagram,
        isRequired: false,
        placeholder: '@suaempresa',
      },
    ],
  },
  {
    id: 'metas',
    action: 'salvar-empresa',
    title: JOTADUO_ONBOARDING_MESSAGES.goalsTitle,
    subtitle: JOTADUO_ONBOARDING_MESSAGES.goalsSubtitle,
    fields: [
      {
        id: 'metas',
        kind: 'goals',
        label: JOTADUO_ONBOARDING_MESSAGES.goalsTitle,
        isRequired: true,
      },
    ],
  },
  {
    id: 'sistemaExterno',
    action: 'salvar-empresa',
    title: JOTADUO_ONBOARDING_MESSAGES.systemTitle,
    subtitle: JOTADUO_ONBOARDING_MESSAGES.systemSubtitle,
    fields: [
      {
        id: 'sistemaExterno',
        kind: 'system',
        label: JOTADUO_ONBOARDING_MESSAGES.systemTitle,
        isRequired: true,
      },
    ],
  },
  {
    id: 'agenteNome',
    action: 'preparar-atendente',
    title: JOTADUO_ONBOARDING_MESSAGES.assistantTitle,
    subtitle: JOTADUO_ONBOARDING_MESSAGES.assistantSubtitle,
    fields: [
      {
        id: 'agenteNome',
        kind: 'text',
        label: JOTADUO_ONBOARDING_MESSAGES.assistantName,
        isRequired: true,
      },
      {
        id: 'whatsapp',
        kind: 'phone',
        label: JOTADUO_ONBOARDING_MESSAGES.companyWhatsapp,
        isRequired: true,
        placeholder: '87 99999-0000',
      },
      {
        id: 'whatsappResponsavel',
        kind: 'phone',
        label: JOTADUO_ONBOARDING_MESSAGES.ownerWhatsapp,
        isRequired: true,
        placeholder: '87 99999-0000',
      },
    ],
  },
];
