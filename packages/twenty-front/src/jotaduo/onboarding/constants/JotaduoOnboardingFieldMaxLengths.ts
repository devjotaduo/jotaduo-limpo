import { type JotaduoOnboardingFieldId } from '~/jotaduo/onboarding/types/JotaduoOnboardingQuestion';

// Same limits the JotaDuo app enforces on the server (LIMITES_DO_PERFIL).
// The line of business is a pick from a list and has none.
export const JOTADUO_ONBOARDING_FIELD_MAX_LENGTHS: Partial<
  Record<JotaduoOnboardingFieldId, number>
> = {
  nome: 120,
  cnpj: 18,
  site: 200,
  instagram: 120,
  metas: 200,
  sistemaExterno: 80,
  agenteNome: 20,
  whatsapp: 30,
  whatsappResponsavel: 30,
};
