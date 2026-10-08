const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// What Tab can land on inside the container, in document order. An element
// that is not laid out, like a hidden file input, cannot take focus.
export const getFocusableElements = (container: HTMLElement) =>
  [
    ...container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR),
  ].filter((element) => element.getClientRects().length > 0);
