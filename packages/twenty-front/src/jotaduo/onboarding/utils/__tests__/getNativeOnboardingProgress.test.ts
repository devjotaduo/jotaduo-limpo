import { AppPath } from 'twenty-shared/types';

import { getNativeOnboardingProgress } from '~/jotaduo/onboarding/utils/getNativeOnboardingProgress';

describe('getNativeOnboardingProgress', () => {
  it('counts the profile and the team for the first member', () => {
    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.CreateProfile,
        hasEmailProvider: false,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({ stepCount: 2, filledStepCount: 1 });

    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.InviteTeam,
        hasEmailProvider: false,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({ stepCount: 2, filledStepCount: 2 });
  });

  it('leaves the team out for someone who was invited', () => {
    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.CreateProfile,
        hasEmailProvider: false,
        isFirstWorkspaceMember: false,
      }),
    ).toEqual({ stepCount: 1, filledStepCount: 1 });
  });

  it('adds the e-mail step when a provider is set up', () => {
    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.SyncEmails,
        hasEmailProvider: true,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({ stepCount: 3, filledStepCount: 1 });

    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.CreateProfile,
        hasEmailProvider: true,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({ stepCount: 3, filledStepCount: 2 });
  });

  it('counts a step without a segment as the one before it', () => {
    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.InstallApps,
        hasEmailProvider: true,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({ stepCount: 3, filledStepCount: 1 });

    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.PlanRequired,
        hasEmailProvider: false,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({ stepCount: 2, filledStepCount: 2 });
  });

  it('fills the first segment before any counted step is reached', () => {
    expect(
      getNativeOnboardingProgress({
        pathname: AppPath.InstallApps,
        hasEmailProvider: false,
        isFirstWorkspaceMember: true,
      }),
    ).toEqual({ stepCount: 2, filledStepCount: 1 });
  });
});
