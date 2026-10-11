import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { styled } from '@linaria/react';
import { type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck } from 'twenty-ui/icon';

import { keepFocusInsideOnTab } from '~/jotaduo/accessibility/utils/keepFocusInsideOnTab';
import { moveFocusIntoModal } from '~/jotaduo/accessibility/utils/moveFocusIntoModal';
import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { StyledJotaduoMobileTheme } from '~/jotaduo/mobile-theme/components/StyledJotaduoMobileTheme';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const DONE_BUTTON_SIZE_IN_PX = 44;

// Sits at the modal level so it covers the navigation bar and the Ask AI
// button, and stays under toasts.
const StyledSheet = styled(StyledJotaduoMobileTheme)`
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.page};
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  display: flex;
  flex-direction: column;
  inset: 0;
  outline: none;
  position: fixed;
  z-index: ${RootStackingContextZIndices.RootModal};
`;

// The empty first column mirrors the done button so the title stays centred.
const StyledHeader = styled.header`
  align-items: center;
  display: grid;
  flex-shrink: 0;
  gap: 12px;
  grid-template-columns: ${DONE_BUTTON_SIZE_IN_PX}px 1fr ${DONE_BUTTON_SIZE_IN_PX}px;
  padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 12px;
`;

const StyledTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  grid-column: 2;
  margin: 0;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDoneButton = styled.button`
  align-items: center;
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.accent};
  border: 0;
  border-radius: 50%;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.card};
  cursor: pointer;
  display: flex;
  grid-column: 3;
  height: ${DONE_BUTTON_SIZE_IN_PX}px;
  justify-content: center;
  padding: 0;
  width: ${DONE_BUTTON_SIZE_IN_PX}px;
`;

const StyledBody = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 18px;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 16px calc(32px + env(safe-area-inset-bottom, 0px));
`;

type MobileHomeSheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

// Changes made in a sheet apply as they happen, so it has a single way out.
export const MobileHomeSheet = ({
  title,
  onClose,
  children,
}: MobileHomeSheetProps) => {
  const { getText } = useJotaduoText();
  const doneLabel = getText(JOTADUO_MESSAGES.done);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    keepFocusInsideOnTab(event);
  };

  return createPortal(
    <StyledSheet
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      ref={moveFocusIntoModal}
      onKeyDown={handleKeyDown}
    >
      <StyledHeader>
        <StyledTitle>{title}</StyledTitle>
        <StyledDoneButton
          type="button"
          aria-label={doneLabel}
          title={doneLabel}
          onClick={onClose}
        >
          <IconCheck size={24} stroke={2.6} aria-hidden />
        </StyledDoneButton>
      </StyledHeader>
      <StyledBody>{children}</StyledBody>
    </StyledSheet>,
    document.body,
  );
};
