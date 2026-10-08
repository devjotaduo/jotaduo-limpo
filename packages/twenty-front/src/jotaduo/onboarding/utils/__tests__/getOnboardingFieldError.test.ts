import { JOTADUO_ONBOARDING_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoOnboardingMessages';
import { JOTADUO_ONBOARDING_QUESTIONS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingQuestions';
import { JOTADUO_ONBOARDING_OTHER_SYSTEM } from '~/jotaduo/onboarding/constants/JotaduoOnboardingOtherSystem';
import {
  type JotaduoOnboardingAnswers,
  type JotaduoOnboardingFieldId,
} from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';
import { getOnboardingFieldError } from '~/jotaduo/onboarding/utils/getOnboardingFieldError';

const EMPTY_ANSWERS: JotaduoOnboardingAnswers = {
  segmento: '',
  nome: '',
  cnpj: '',
  site: '',
  instagram: '',
  metas: '',
  sistemaExterno: '',
  agenteNome: '',
  whatsapp: '',
  whatsappResponsavel: '',
};

const getErrorMessage = (fieldId: JotaduoOnboardingFieldId, value: string) => {
  const field = JOTADUO_ONBOARDING_QUESTIONS.flatMap(
    (question) => question.fields,
  ).find((candidate) => candidate.id === fieldId);

  if (field === undefined) {
    throw new Error(`Unknown field ${fieldId}`);
  }

  return (
    getOnboardingFieldError(field, { ...EMPTY_ANSWERS, [fieldId]: value })
      ?.message ?? null
  );
};

describe('getOnboardingFieldError', () => {
  it('asks for a required field left blank', () => {
    expect(getErrorMessage('nome', '  ')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorEmptyText,
    );
    expect(getErrorMessage('segmento', '')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorEmptyArea,
    );
  });

  it('accepts an optional field left blank', () => {
    expect(getErrorMessage('cnpj', '')).toBeNull();
    expect(getErrorMessage('site', '')).toBeNull();
  });

  it('checks the CNPJ check digits', () => {
    expect(getErrorMessage('cnpj', '11.222.333/0001-81')).toBeNull();
    expect(getErrorMessage('cnpj', '11.222.333/0001-82')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorCnpj,
    );
  });

  it('asks for https on the website', () => {
    expect(getErrorMessage('site', 'https://empresa.com.br')).toBeNull();
    expect(getErrorMessage('site', 'empresa.com.br')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorWebsiteScheme,
    );
    expect(getErrorMessage('site', 'https://empresa')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorWebsite,
    );
  });

  it('accepts an Instagram link, handle or account', () => {
    expect(getErrorMessage('instagram', '@sua.empresa')).toBeNull();
    expect(
      getErrorMessage('instagram', 'https://instagram.com/sua.empresa/'),
    ).toBeNull();
    expect(getErrorMessage('instagram', '@sua empresa')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorInstagram,
    );
  });

  it('asks for a phone with area code', () => {
    expect(getErrorMessage('whatsapp', '87 99999-0000')).toBeNull();
    expect(getErrorMessage('whatsapp', '+351 912 345 678')).toBeNull();
    expect(getErrorMessage('whatsapp', '9999')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorPhone,
    );
  });

  it('keeps the assistant name to letters', () => {
    expect(getErrorMessage('agenteNome', 'Ana Lúcia')).toBeNull();
    expect(getErrorMessage('agenteNome', 'Ana 2')).toBe(
      JOTADUO_ONBOARDING_MESSAGES.errorAssistantName,
    );
  });

  it('reports a text past its limit with both counts', () => {
    const companyNameField = JOTADUO_ONBOARDING_QUESTIONS[1].fields[0];

    expect(
      getOnboardingFieldError(companyNameField, {
        ...EMPTY_ANSWERS,
        nome: 'a'.repeat(121),
      }),
    ).toEqual({
      message: JOTADUO_ONBOARDING_MESSAGES.errorTooLong,
      values: { limit: 120, typed: 121 },
    });
  });

  it('asks for the name when "other system" is picked', () => {
    expect(
      getErrorMessage('sistemaExterno', JOTADUO_ONBOARDING_OTHER_SYSTEM),
    ).toBe(JOTADUO_ONBOARDING_MESSAGES.errorSystemName);
    expect(getErrorMessage('sistemaExterno', 'Shosp')).toBeNull();
  });
});
