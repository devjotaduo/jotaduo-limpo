import { type KeyboardEvent } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

import { getFocusableElements } from '~/jotaduo/accessibility/utils/getFocusableElements';

// The keydown handler of a modal the fork portals itself: Tab goes round its
// own controls instead of walking into the page behind it.
export const keepFocusInsideOnTab = (event: KeyboardEvent<HTMLElement>) => {
  if (event.key !== Key.Tab) {
    return;
  }

  const modal = event.currentTarget;
  const focusableElements = getFocusableElements(modal);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!isDefined(firstElement) || !isDefined(lastElement)) {
    event.preventDefault();
    return;
  }

  const focusedElement = document.activeElement;

  if (
    event.shiftKey &&
    (focusedElement === firstElement || focusedElement === modal)
  ) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && focusedElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};
