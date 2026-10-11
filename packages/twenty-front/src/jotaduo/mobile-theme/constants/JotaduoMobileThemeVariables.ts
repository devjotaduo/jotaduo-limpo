// Values come straight from the "Home mobile do JotaDuo" design. The Twenty
// tokens do not line up with it across both colour schemes (its light page is
// Twenty's tertiary background, its dark page is the primary one), so the
// mobile surfaces carry their own variables, declared by
// StyledJotaduoMobileTheme.
export const JOTADUO_MOBILE_THEME_VARIABLES = {
  page: 'var(--jd-mobile-page)',
  text: 'var(--jd-mobile-text)',
  textSecondary: 'var(--jd-mobile-text-secondary)',
  textTertiary: 'var(--jd-mobile-text-tertiary)',
  card: 'var(--jd-mobile-card)',
  border: 'var(--jd-mobile-border)',
  control: 'var(--jd-mobile-control)',
  controlBorder: 'var(--jd-mobile-control-border)',
  floatingControl: 'var(--jd-mobile-floating-control)',
  floatingControlShadow: 'var(--jd-mobile-floating-control-shadow)',
  inverse: 'var(--jd-mobile-inverse)',
  inverseText: 'var(--jd-mobile-inverse-text)',
  inverseShadow: 'var(--jd-mobile-inverse-shadow)',
  navigationBar: 'var(--jd-mobile-navigation-bar)',
  navigationBarShadow: 'var(--jd-mobile-navigation-bar-shadow)',
  navigationBarActive: 'var(--jd-mobile-navigation-bar-active)',
  accent: 'var(--jd-mobile-accent)',
  workspaceLogo: 'var(--jd-mobile-workspace-logo)',
  workspaceLogoText: 'var(--jd-mobile-workspace-logo-text)',
} as const;
