import { JOTADUO_ONBOARDING_EMPTY_ANSWERS } from '~/jotaduo/onboarding/constants/JotaduoOnboardingEmptyAnswers';
import { getOnboardingAnswersAfterSave } from '~/jotaduo/onboarding/utils/getOnboardingAnswersAfterSave';

const savedAnswers = {
  ...JOTADUO_ONBOARDING_EMPTY_ANSWERS,
  segmento: 'clinica_medica',
  nome: 'Clínica Sol',
  sistemaExterno: 'Shosp',
};

describe('getOnboardingAnswersAfterSave', () => {
  it('takes the stored fields the way the app wrote them', () => {
    expect(
      getOnboardingAnswersAfterSave({
        answers: { ...savedAnswers, cnpj: '11222333000181' },
        savedAnswers,
        nextSavedAnswers: { ...savedAnswers, cnpj: '11.222.333/0001-81' },
        savedFieldIds: ['nome', 'cnpj', 'site', 'instagram'],
      }).cnpj,
    ).toBe('11.222.333/0001-81');
  });

  it('follows the app on a field of another question it changed', () => {
    expect(
      getOnboardingAnswersAfterSave({
        answers: { ...savedAnswers, segmento: 'salao_estetica' },
        savedAnswers,
        nextSavedAnswers: {
          ...savedAnswers,
          segmento: 'salao_estetica',
          sistemaExterno: '',
        },
        savedFieldIds: ['segmento'],
      }).sistemaExterno,
    ).toBe('');
  });

  it('keeps an answer typed on another question and not sent yet', () => {
    expect(
      getOnboardingAnswersAfterSave({
        answers: { ...savedAnswers, agenteNome: 'Lia' },
        savedAnswers,
        nextSavedAnswers: savedAnswers,
        savedFieldIds: ['segmento'],
      }).agenteNome,
    ).toBe('Lia');
  });
});
