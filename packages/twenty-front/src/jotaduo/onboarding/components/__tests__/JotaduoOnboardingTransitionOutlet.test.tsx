import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MotionGlobalConfig } from 'framer-motion';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';

import { JotaduoOnboardingTransitionOutlet } from '~/jotaduo/onboarding/components/JotaduoOnboardingTransitionOutlet';

const renderSteps = () =>
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <Link to="/team">Next</Link>
      <Routes>
        <Route element={<JotaduoOnboardingTransitionOutlet />}>
          <Route path="/profile" element={<h1>Create profile</h1>} />
          <Route path="/team" element={<h1>Invite your team</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('JotaduoOnboardingTransitionOutlet', () => {
  // jsdom barely produces animation frames, so the exit would never end.
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });

  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  it('shows the step of the current route', () => {
    renderSteps();

    expect(
      screen.getByRole('heading', { name: 'Create profile' }),
    ).toBeInTheDocument();
  });

  it('replaces the step when the route changes', async () => {
    renderSteps();

    await userEvent.click(screen.getByRole('link', { name: 'Next' }));

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Invite your team' }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('heading', { name: 'Create profile' }),
    ).not.toBeInTheDocument();
  });
});
