import { isDefined } from 'twenty-shared/utils';

// A ref callback for a modal the fork portals itself: focus goes in when it
// opens and back to where it was when it closes. It lives outside the
// components so its identity never changes, otherwise React would run it
// again on every render. A field with autoFocus inside keeps the focus it
// already took.
export const moveFocusIntoModal = (modal: HTMLElement | null) => {
  if (!isDefined(modal)) {
    return;
  }

  const previouslyFocusedElement = document.activeElement;

  if (!modal.contains(previouslyFocusedElement)) {
    modal.focus();
  }

  return () => {
    if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus();
    }
  };
};
