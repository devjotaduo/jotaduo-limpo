import { getSavedOnboardingAnswers } from '~/jotaduo/onboarding/utils/getSavedOnboardingAnswers';

describe('getSavedOnboardingAnswers', () => {
  it('shows stored values the way a person types them', () => {
    const answers = getSavedOnboardingAnswers({
      estado: { concluidoEm: null },
      areasDeAtuacao: [],
      perfil: {
        nome: 'Clínica Boa Vista',
        cnpj: '11222333000181',
        instagram: 'clinica.boavista',
        whatsapp: '5587999990000',
        metas: 'vendas,suporte',
      },
      empresa: {
        emEdicao: { dados: { segmento: 'clinica_medica' } },
      },
    });

    expect(answers).toMatchObject({
      segmento: 'clinica_medica',
      nome: 'Clínica Boa Vista',
      cnpj: '11.222.333/0001-81',
      instagram: '@clinica.boavista',
      whatsapp: '(87) 99999-0000',
      whatsappResponsavel: '',
      metas: 'vendas,suporte',
      site: '',
    });
  });

  it('prefers the edit in progress over the profile in use', () => {
    const answers = getSavedOnboardingAnswers({
      estado: { concluidoEm: null },
      areasDeAtuacao: [],
      perfil: { nome: 'Nome antigo' },
      empresa: {
        emEdicao: {
          dados: { segmento: null, perfil: { nome: 'Nome novo' } },
        },
      },
    });

    expect(answers.nome).toBe('Nome novo');
    expect(answers.segmento).toBe('');
  });
});
