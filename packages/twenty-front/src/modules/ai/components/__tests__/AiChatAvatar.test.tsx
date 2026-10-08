import { render } from '@testing-library/react';

import { AiChatAvatar } from '@/ai/components/AiChatAvatar';

describe('AiChatAvatar', () => {
  it('should show two eyes while idle', () => {
    const { container } = render(<AiChatAvatar />);

    expect(container.firstElementChild?.childElementCount).toBe(2);
  });

  it('should show three dots while thinking', () => {
    const { container } = render(<AiChatAvatar isThinking />);

    expect(container.firstElementChild?.childElementCount).toBe(3);
  });

  it('should stay hidden from screen readers, since the text next to it already says what it is', () => {
    const { container } = render(<AiChatAvatar size={16} />);

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
