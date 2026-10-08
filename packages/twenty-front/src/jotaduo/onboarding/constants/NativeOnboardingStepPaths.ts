import { AppPath } from 'twenty-shared/types';

// Twenty's own onboarding steps, in the order the server walks them.
export const NATIVE_ONBOARDING_STEP_PATHS: string[] = [
  AppPath.SyncEmails,
  AppPath.InstallApps,
  AppPath.CreateProfile,
  AppPath.InviteTeam,
  AppPath.BookCall,
  AppPath.PlanRequired,
];
