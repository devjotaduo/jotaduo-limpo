import { styled } from '@linaria/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus } from 'twenty-ui/icon';

import { JOTADUO_MESSAGES } from '~/jotaduo/i18n/constants/JotaduoMessages';
import { useJotaduoText } from '~/jotaduo/i18n/hooks/useJotaduoText';
import { FavoriteItemAvatar } from '~/jotaduo/mobile-home/components/FavoriteItemAvatar';
import { FavoritesEditor } from '~/jotaduo/mobile-home/components/FavoritesEditor';
import { MobileHomeOrganizeButton } from '~/jotaduo/mobile-home/components/MobileHomeOrganizeButton';
import { MobileHomeSection } from '~/jotaduo/mobile-home/components/MobileHomeSection';
import { useFavoriteItems } from '~/jotaduo/mobile-home/hooks/useFavoriteItems';
import { JOTADUO_MOBILE_THEME_VARIABLES } from '~/jotaduo/mobile-theme/constants/JotaduoMobileThemeVariables';

const TILE_WIDTH_IN_PX = 68;
const AVATAR_SIZE_IN_PX = 56;

// One line of pinned records that scrolls sideways, bleeding to the edges of
// the screen so the last one in sight is cut and reads as "there is more".
const StyledStrip = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 12px;
  margin: 0 -16px;
  overflow-x: auto;
  padding: 0 16px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledTile = styled(Link)`
  align-items: center;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 6px;
  text-decoration: none;
  width: ${TILE_WIDTH_IN_PX}px;
`;

const StyledAddTile = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.text};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  font: inherit;
  gap: 6px;
  padding: 0;
  width: ${TILE_WIDTH_IN_PX}px;
`;

const StyledAddCircle = styled.span`
  align-items: center;
  background: ${JOTADUO_MOBILE_THEME_VARIABLES.card};
  border: 1px solid ${JOTADUO_MOBILE_THEME_VARIABLES.controlBorder};
  border-radius: 50%;
  box-sizing: border-box;
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  display: flex;
  height: ${AVATAR_SIZE_IN_PX}px;
  justify-content: center;
  width: ${AVATAR_SIZE_IN_PX}px;
`;

// Two lines at most: a full name rarely fits one at this width.
const StyledTileLabel = styled.span`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.25;
  max-width: 100%;
  overflow: hidden;
  overflow-wrap: anywhere;
  text-align: center;
`;

const StyledEmpty = styled.div`
  align-items: center;
  display: flex;
  gap: 14px;
`;

const StyledHint = styled.span`
  color: ${JOTADUO_MOBILE_THEME_VARIABLES.textSecondary};
  font-size: 14px;
  line-height: 1.4;
`;

export const FavoritesSection = () => {
  const favoriteItems = useFavoriteItems();
  const [isEditing, setIsEditing] = useState(false);
  const { getText } = useJotaduoText();

  const addTile = (
    <StyledAddTile
      type="button"
      aria-label={getText(JOTADUO_MESSAGES.addFavorite)}
      onClick={() => setIsEditing(true)}
    >
      <StyledAddCircle>
        <IconPlus size={22} stroke={2} aria-hidden />
      </StyledAddCircle>
      <StyledTileLabel>{getText(JOTADUO_MESSAGES.add)}</StyledTileLabel>
    </StyledAddTile>
  );

  return (
    <MobileHomeSection
      title={getText(JOTADUO_MESSAGES.favorites)}
      action={
        favoriteItems.length > 0 && (
          <MobileHomeOrganizeButton
            label={getText(JOTADUO_MESSAGES.organizeFavorites)}
            onClick={() => setIsEditing(true)}
          />
        )
      }
    >
      {favoriteItems.length > 0 ? (
        <StyledStrip>
          {addTile}
          {favoriteItems.map((favoriteItem) => (
            <StyledTile
              key={favoriteItem.id}
              to={favoriteItem.link}
              title={favoriteItem.label}
            >
              <FavoriteItemAvatar
                favoriteItem={favoriteItem}
                sizeInPx={AVATAR_SIZE_IN_PX}
              />
              <StyledTileLabel>{favoriteItem.label}</StyledTileLabel>
            </StyledTile>
          ))}
        </StyledStrip>
      ) : (
        <StyledEmpty>
          {addTile}
          <StyledHint>{getText(JOTADUO_MESSAGES.favoritesHint)}</StyledHint>
        </StyledEmpty>
      )}
      {isEditing && <FavoritesEditor onClose={() => setIsEditing(false)} />}
    </MobileHomeSection>
  );
};
