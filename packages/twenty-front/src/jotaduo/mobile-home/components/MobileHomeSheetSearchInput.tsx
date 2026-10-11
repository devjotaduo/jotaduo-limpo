import { styled } from '@linaria/react';
import { IconSearch } from 'twenty-ui/icon';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const StyledSearchField = styled.label`
  align-items: center;
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.control};
  border: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.controlBorder};
  border-radius: 12px;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  min-height: 44px;
  padding: 0 12px;
`;

// 16px keeps iOS from zooming the page when the field takes focus.
const StyledInput = styled.input`
  background: transparent;
  border: 0;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  flex-grow: 1;
  font: inherit;
  font-size: 16px;
  min-width: 0;
  outline: none;

  &::placeholder {
    color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  }
`;

type MobileHomeSheetSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const MobileHomeSheetSearchInput = ({
  value,
  onChange,
}: MobileHomeSheetSearchInputProps) => {
  const { getText } = useJotaduoText();
  const searchLabel = getText(JOTADUO_MESSAGES.search);

  return (
    <StyledSearchField>
      <IconSearch size={18} stroke={2.2} aria-hidden />
      <StyledInput
        type="search"
        value={value}
        placeholder={searchLabel}
        aria-label={searchLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </StyledSearchField>
  );
};
