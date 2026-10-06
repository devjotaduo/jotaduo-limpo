// The systems each line of business usually runs on, keyed by the app's
// segment ids.
export const JOTADUO_ONBOARDING_SYSTEMS_BY_AREA: Record<string, string[]> = {
  clinica_medica: ['Shosp', 'iClinic', 'Feegow', 'Planilha'],
  pizzaria_delivery: ['iFood', 'Anota AI', 'Saipos'],
  ecommerce: ['Nuvemshop', 'Shopify', 'Loja Integrada', 'Tray'],
  imobiliaria: ['Vista', 'Jetimob', 'Planilha'],
  oficina_automotiva: ['Onmotor', 'Planilha'],
  hotel_pousada: ['Omnibees', 'Planilha'],
  escola_cursos: ['Sponte', 'Proesc', 'Planilha'],
  escritorio_contabil: ['Domínio', 'Alterdata'],
  salao_estetica: ['Trinks', 'Avec', 'Planilha'],
  servicos_b2b: ['Google Agenda', 'Pipedrive', 'RD Station', 'Planilha'],
  outro: ['Planilha'],
};
