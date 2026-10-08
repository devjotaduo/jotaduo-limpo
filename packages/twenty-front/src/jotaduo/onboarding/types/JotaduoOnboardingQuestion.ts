import { type MessageDescriptor } from '@lingui/core';

// Field ids are the profile keys of the JotaDuo app's /jotaduo/onboarding
// contract, which is why they are in Portuguese.
export type JotaduoOnboardingFieldId =
  | 'segmento'
  | 'nome'
  | 'cnpj'
  | 'site'
  | 'instagram'
  | 'metas'
  | 'sistemaExterno'
  | 'agenteNome'
  | 'whatsapp'
  | 'whatsappResponsavel';

export type JotaduoOnboardingFieldKind =
  | 'area'
  | 'goals'
  | 'system'
  | 'text'
  | 'phone'
  | 'url';

export type JotaduoOnboardingField = {
  id: JotaduoOnboardingFieldId;
  kind: JotaduoOnboardingFieldKind;
  label: MessageDescriptor;
  isRequired: boolean;
  placeholder?: string;
};

export type JotaduoOnboardingAnswers = Record<JotaduoOnboardingFieldId, string>;

export type JotaduoOnboardingQuestion = {
  id: JotaduoOnboardingFieldId;
  // The app action that stores the answer.
  action: 'salvar-empresa' | 'preparar-atendente';
  title: MessageDescriptor;
  subtitle: MessageDescriptor;
  fields: JotaduoOnboardingField[];
};

export type JotaduoOnboardingFieldError = {
  message: MessageDescriptor;
  values?: Record<string, string | number>;
};
