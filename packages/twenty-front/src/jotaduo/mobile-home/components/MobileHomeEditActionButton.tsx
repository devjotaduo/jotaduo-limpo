import { styled } from '@linaria/react';
import { IconCheck, IconMinus, IconPlus } from 'twenty-ui/icon';

import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';
import { getJotaduoMobileHueColors } from '~/jotaduo/mobile-theme/utils/getJotaduoMobileHueColors';

type MobileHomeEditActionKind = 'add' | 'remove' | 'checked' | 'unchecked';

const DISC_COLOR_BY_KIND: Record<MobileHomeEditActionKind, string> = {
  add: getJotaduoMobileHueColors('green').iconColor,
  remove: getJotaduoMobileHueColors('red').iconColor,
  checked: JOTADUO_MOBILE_THEME_VARIABLES.accent,
  unchecked: 'transparent',
};

// The visible disc is small, the button around it keeps a 44px tap target.
const StyledActionButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 44px;
  justify-content: center;
  padding: 0;
  width: 44px;
`;

const StyledDisc = styled.span<{ discColor: string }>`
  align-items: center;
  background: ${({ discColor }) => discColor};
  border-radius: 50%;
  box-sizing: border-box;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.card};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;

  &[data-outlined] {
    border: 2px solid ${JOTADUO_MOBILE_THEME_VARIABLES.textTertiary};
  }
`;

type MobileHomeEditActionButtonProps = {
  kind: MobileHomeEditActionKind;
  label: string;
  onClick: () => void;
};

export const MobileHomeEditActionButton = ({
  kind,
  label,
  onClick,
}: MobileHomeEditActionButtonProps) => {
  const isCheckbox = kind === 'checked' || kind === 'unchecked';

  return (
    <StyledActionButton
      type="button"
      role={isCheckbox ? 'checkbox' : undefined}
      aria-checked={isCheckbox ? kind === 'checked' : undefined}
      aria-label={label}
      onClick={onClick}
    >
      <StyledDisc
        discColor={DISC_COLOR_BY_KIND[kind]}
        data-outlined={kind === 'unchecked' ? '' : undefined}
      >
        {kind === 'add' && <IconPlus size={16} stroke={3} aria-hidden />}
        {kind === 'remove' && <IconMinus size={16} stroke={3} aria-hidden />}
        {kind === 'checked' && <IconCheck size={16} stroke={3} aria-hidden />}
      </StyledDisc>
    </StyledActionButton>
  );
};
