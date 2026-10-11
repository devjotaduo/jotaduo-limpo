// Paths are relative to packages/twenty-front/src. Each override must export
// the same names as the upstream module it replaces.
export const JOTADUO_MODULE_OVERRIDES: Record<string, string> = {
  'pages/mobile-home/MobileHomePage.tsx':
    'jotaduo/mobile-home/pages/MobileHomePage.tsx',
  'modules/navigation/components/MobileNavigationBar.tsx':
    'jotaduo/mobile-navigation/components/MobileNavigationBar.tsx',
  'modules/navigation/constants/MobileNavigationBarHeight.ts':
    'jotaduo/mobile-navigation/constants/MobileNavigationBarHeight.ts',
  'modules/onboarding/components/WelcomeOverlay/WelcomeOverlay.tsx':
    'jotaduo/onboarding/components/WelcomeOverlay.tsx',
  'modules/onboarding/components/OnboardingStepLayout.tsx':
    'jotaduo/onboarding/components/OnboardingStepLayout.tsx',
  'modules/onboarding/components/OnboardingStepPageLoader.tsx':
    'jotaduo/onboarding/components/OnboardingStepPageLoader.tsx',
  'modules/onboarding/components/StyledOnboardingStepPage.ts':
    'jotaduo/onboarding/components/StyledOnboardingStepPage.ts',
  'pages/onboarding/CreateProfile.tsx':
    'jotaduo/onboarding/pages/CreateProfile.tsx',
  'pages/onboarding/InviteTeam.tsx': 'jotaduo/onboarding/pages/InviteTeam.tsx',
};
