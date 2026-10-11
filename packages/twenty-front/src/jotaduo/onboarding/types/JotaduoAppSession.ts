// The slice of GET /s/jotaduo/session the onboarding gate reads. Property
// names are the app's wire contract.
export type JotaduoAppSession = {
  actor?: { flags: string[] };
  onboarding?: { pendente?: boolean };
};
