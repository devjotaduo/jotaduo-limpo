import { PageLayoutStandaloneIdentifierBar } from '@/page-layout/components/PageLayoutStandaloneIdentifierBar';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

const mockOpenTabSettings = jest.fn();

jest.mock('@/page-layout/hooks/useOpenPageLayoutTabSettings', () => ({
  useOpenPageLayoutTabSettings: () => ({
    openTabSettings: mockOpenTabSettings,
  }),
}));

jest.mock('twenty-ui/components/input', () => ({
  IconButton: ({
    'aria-label': ariaLabel,
    onClick,
  }: {
    'aria-label': string;
    onClick: () => void;
  }) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {ariaLabel}
    </button>
  ),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe('PageLayoutStandaloneIdentifierBar', () => {
  beforeEach(() => mockOpenTabSettings.mockClear());

  it('opens native settings for the pinned tab without a record', async () => {
    render(
      <PageLayoutStandaloneIdentifierBar
        title="Central de operações"
        pinnedTab={{ id: 'details', title: 'Detalhes' }}
        isPinnedTabEditable
        tabList={<div>Atividade</div>}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Central de operações')).toBeVisible();
    expect(screen.getByText('Atividade')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Edit pinned tab: Detalhes' }),
    );
    expect(mockOpenTabSettings).toHaveBeenCalledWith('details');
  });

  it('hides the edit control in read mode', () => {
    render(
      <PageLayoutStandaloneIdentifierBar
        title="Central de operações"
        pinnedTab={{ id: 'details', title: 'Detalhes' }}
        isPinnedTabEditable={false}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Central de operações')).toBeVisible();
  });
});
