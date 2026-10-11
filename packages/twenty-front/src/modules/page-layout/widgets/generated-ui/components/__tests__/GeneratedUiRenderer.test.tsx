import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'twenty-ui/theme';

import { GeneratedUiRenderer } from '@/page-layout/widgets/generated-ui/components/GeneratedUiRenderer';

describe('GeneratedUiRenderer', () => {
  it('renders only the allowlisted visual blocks', () => {
    render(
      <ThemeProvider colorScheme="light">
        <GeneratedUiRenderer
          blocks={[
            { type: 'heading', level: 1, text: 'Workspace overview' },
            {
              type: 'metric',
              label: 'Open deals',
              value: '12',
              caption: 'Updated today',
            },
          ]}
        />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Workspace overview' }),
    ).toBeVisible();
    expect(screen.getByText('Open deals')).toBeVisible();
    expect(screen.getByText('12')).toBeVisible();
  });
});
