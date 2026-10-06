import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { keepFocusInsideOnTab } from '~/jotaduo/accessibility/utils/keepFocusInsideOnTab';
import { moveFocusIntoModal } from '~/jotaduo/accessibility/utils/moveFocusIntoModal';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <button>Behind</button>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Sheet"
          tabIndex={-1}
          ref={moveFocusIntoModal}
          onKeyDown={keepFocusInsideOnTab}
        >
          <button>First</button>
          <button>Last</button>
          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
};

describe('modal focus', () => {
  // jsdom lays nothing out, so every element would count as hidden.
  beforeEach(() => {
    jest
      .spyOn(HTMLElement.prototype, 'getClientRects')
      .mockReturnValue([new DOMRect()] as unknown as DOMRectList);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('moves focus into the modal when it opens', async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByRole('dialog', { name: 'Sheet' })).toHaveFocus();
  });

  it('keeps Tab going round the controls of the modal', async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('gives focus back to what had it when the modal closes', async () => {
    render(<Page />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });
});
