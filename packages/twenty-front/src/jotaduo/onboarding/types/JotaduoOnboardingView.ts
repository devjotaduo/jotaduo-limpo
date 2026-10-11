// The slice of GET /s/jotaduo/onboarding the questions read. Property names
// are the app's wire contract.
export type JotaduoOnboardingView = {
  estado: { concluidoEm: string | null };
  areasDeAtuacao: { valor: string; rotulo: string }[];
  perfil: Record<string, unknown>;
  empresa: {
    emEdicao: {
      dados: {
        perfil?: Record<string, unknown>;
        segmento: string | null;
      };
    };
  };
};
