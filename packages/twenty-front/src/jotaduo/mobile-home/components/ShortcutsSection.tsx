import { styled } from '@linaria/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAbsoluteUrl } from 'twenty-shared/utils';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { MobileHomeIconTile } from '~/jotaduo/mobile-home/components/MobileHomeIconTile';
import { MobileHomeOrganizeButton } from '~/jotaduo/mobile-home/components/MobileHomeOrganizeButton';
import {
  MobileHomeSection,
  StyledMobileHomeCard,
} from '~/jotaduo/mobile-home/components/MobileHomeSection';
import { ShortcutsEditor } from '~/jotaduo/mobile-home/components/ShortcutsEditor';
import { ShortcutsEmptyState } from '~/jotaduo/mobile-home/components/ShortcutsEmptyState';
import { useShortcutItems } from '~/jotaduo/mobile-home/hooks/useShortcutItems';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const StyledGrid = styled(StyledMobileHomeCard)`
  column-gap: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 16px 8px;
  row-gap: 14px;
`;

const StyledTile = styled(Link)`
  align-items: center;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 4px 0;
  text-decoration: none;
`;

const StyledTileLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ShortcutsSection = () => {
  const shortcutItems = useShortcutItems();
  const [isEditing, setIsEditing] = useState(false);
  const { getText } = useJotaduoText();

  const hasShortcutItems = shortcutItems.length > 0;

  return (
    <MobileHomeSection
      title={getText(JOTADUO_MESSAGES.shortcuts)}
      action={
        hasShortcutItems && (
          <MobileHomeOrganizeButton
            label={getText(JOTADUO_MESSAGES.organizeShortcuts)}
            onClick={() => setIsEditing(true)}
          />
        )
      }
    >
      {hasShortcutItems ? (
        <StyledGrid>
          {shortcutItems.map((shortcutItem) => (
            <StyledTile
              key={shortcutItem.id}
              to={shortcutItem.link}
              target={isAbsoluteUrl(shortcutItem.link) ? '_blank' : undefined}
              rel={
                isAbsoluteUrl(shortcutItem.link)
                  ? 'noopener noreferrer'
                  : undefined
              }
            >
              <MobileHomeIconTile
                Icon={shortcutItem.Icon}
                color={shortcutItem.color}
                shape="circle"
                sizeInPx={48}
                iconSizeInPx={22}
              />
              <StyledTileLabel>{shortcutItem.label}</StyledTileLabel>
            </StyledTile>
          ))}
        </StyledGrid>
      ) : (
        <ShortcutsEmptyState onStart={() => setIsEditing(true)} />
      )}
      {isEditing && <ShortcutsEditor onClose={() => setIsEditing(false)} />}
    </MobileHomeSection>
  );
};
