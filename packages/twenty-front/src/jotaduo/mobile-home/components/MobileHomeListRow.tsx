import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isAbsoluteUrl, isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';

import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const DEFAULT_LEADING_WIDTH_IN_PX = 34;
const ROW_PADDING_LEFT_IN_PX = 16;
const LEADING_GAP_IN_PX = 14;

// The divider starts under the label, not under what leads the row, and the
// last row of a card has none.
const StyledRow = styled.div<{ dividerOffsetInPx: number }>`
  align-items: center;
  display: flex;
  position: relative;

  &::after {
    background: ${JOTADUO_MOBILE_THEME_VARIABLES.border};
    bottom: 0;
    content: '';
    height: 1px;
    left: ${({ dividerOffsetInPx }) => `${dividerOffsetInPx}px`};
    position: absolute;
    right: 0;
  }

  &:last-child::after {
    display: none;
  }
`;

// The row is a link or a button. Both only take the room and drop their own
// look: the layout sits in the span inside them, which the two share.
const StyledRowLink = styled(Link)`
  color: inherit;
  display: flex;
  flex-grow: 1;
  min-width: 0;
  text-decoration: none;
`;

const StyledRowButton = styled.button`
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-grow: 1;
  font: inherit;
  min-width: 0;
  padding: 0;
  text-align: left;
`;

// Rows with a second line of text are a little taller.
const StyledRowContent = styled.span`
  align-items: center;
  box-sizing: border-box;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  display: flex;
  flex-grow: 1;
  gap: ${LEADING_GAP_IN_PX}px;
  min-height: 58px;
  min-width: 0;
  padding: 0 14px 0 ${ROW_PADDING_LEFT_IN_PX}px;

  &[data-two-lines] {
    min-height: 62px;
  }

  &[data-after-leading-action] {
    padding-left: ${LEADING_GAP_IN_PX}px;
  }
`;

// Holds a control of its own, kept out of the row's target so one does not
// sit inside the other.
const StyledLeadingAction = styled.span<{ widthInPx: number }>`
  box-sizing: content-box;
  display: flex;
  flex-shrink: 0;
  padding-left: ${ROW_PADDING_LEFT_IN_PX}px;
  width: ${({ widthInPx }) => `${widthInPx}px`};
`;

const StyledLabels = styled.span`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 2px;
  min-width: 0;
`;

const StyledLabel = styled.span`
  font-size: 17px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-struck] {
    color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
    text-decoration: line-through;
  }
`;

const StyledSecondaryLabel = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTrailingText = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  flex-shrink: 0;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

const StyledTrailingAction = styled.span`
  display: flex;
  flex-shrink: 0;
  padding-right: 3px;
`;

type MobileHomeListRowProps = {
  // What leads the row inside its target: an icon tile, an avatar, a time.
  icon?: ReactNode;
  // A control that leads the row instead, like a task's checkbox.
  leadingAction?: ReactNode;
  leadingWidthInPx?: number;
  label: string;
  isLabelStruck?: boolean;
  secondaryLabel?: string;
  // A count or another short figure before the chevron.
  trailingText?: string;
  // Where the row leads. Without it the row is a button and calls onClick.
  to?: string;
  onClick?: () => void;
  // Replaces the chevron, and sits outside the target so it can hold a button.
  trailingAction?: ReactNode;
};

export const MobileHomeListRow = ({
  icon,
  leadingAction,
  leadingWidthInPx = DEFAULT_LEADING_WIDTH_IN_PX,
  label,
  isLabelStruck = false,
  secondaryLabel,
  trailingText,
  to,
  onClick,
  trailingAction,
}: MobileHomeListRowProps) => {
  const content = (
    <StyledRowContent
      data-two-lines={isNonEmptyString(secondaryLabel) ? '' : undefined}
      data-after-leading-action={isDefined(leadingAction) ? '' : undefined}
    >
      {icon}
      <StyledLabels>
        <StyledLabel data-struck={isLabelStruck ? '' : undefined}>
          {label}
        </StyledLabel>
        {isNonEmptyString(secondaryLabel) && (
          <StyledSecondaryLabel>{secondaryLabel}</StyledSecondaryLabel>
        )}
      </StyledLabels>
      {isNonEmptyString(trailingText) && (
        <StyledTrailingText>{trailingText}</StyledTrailingText>
      )}
      {!isDefined(trailingAction) && (
        <IconChevronRight
          size={18}
          stroke={2.2}
          color={JOTADUO_MOBILE_THEME_VARIABLES.textTertiary}
          aria-hidden
        />
      )}
    </StyledRowContent>
  );

  return (
    <StyledRow
      dividerOffsetInPx={
        ROW_PADDING_LEFT_IN_PX + leadingWidthInPx + LEADING_GAP_IN_PX
      }
    >
      {isDefined(leadingAction) && (
        <StyledLeadingAction widthInPx={leadingWidthInPx}>
          {leadingAction}
        </StyledLeadingAction>
      )}
      {isDefined(to) ? (
        <StyledRowLink
          to={to}
          target={isAbsoluteUrl(to) ? '_blank' : undefined}
          rel={isAbsoluteUrl(to) ? 'noopener noreferrer' : undefined}
        >
          {content}
        </StyledRowLink>
      ) : (
        <StyledRowButton type="button" onClick={onClick}>
          {content}
        </StyledRowButton>
      )}
      {isDefined(trailingAction) && (
        <StyledTrailingAction>{trailingAction}</StyledTrailingAction>
      )}
    </StyledRow>
  );
};
