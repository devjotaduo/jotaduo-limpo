import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'twenty-ui/theme';

import { AiChatGeneratedUiPagePreview } from '@/ai/components/AiChatGeneratedUiPagePreview';

const createGeneratedUiPage = jest.fn();

jest.mock('@/ai/hooks/useCreateGeneratedUiPage', () => ({
  useCreateGeneratedUiPage: () => ({ createGeneratedUiPage }),
}));

describe('AiChatGeneratedUiPagePreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createGeneratedUiPage.mockResolvedValue('page-layout-id');
  });

  it('persists the draft only after explicit confirmation', async () => {
    render(
      <I18nProvider i18n={i18n}>
        <ThemeProvider colorScheme="light">
          <AiChatGeneratedUiPagePreview
            output={{
              success: true,
              result: {
                draft: {
                  title: 'Pipeline overview',
                  tabs: [
                    {
                      title: 'Summary',
                      blocks: [
                        {
                          type: 'metric',
                          label: 'Open deals',
                          value: '12',
                        },
                      ],
                    },
                  ],
                },
              },
            }}
          />
        </ThemeProvider>
      </I18nProvider>,
    );

    expect(createGeneratedUiPage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save page' }));

    await waitFor(() =>
      expect(createGeneratedUiPage).toHaveBeenCalledWith({
        title: 'Pipeline overview',
        tabs: [
          {
            title: 'Summary',
            blocks: [{ type: 'metric', label: 'Open deals', value: '12' }],
          },
        ],
      }),
    );
  });
});
