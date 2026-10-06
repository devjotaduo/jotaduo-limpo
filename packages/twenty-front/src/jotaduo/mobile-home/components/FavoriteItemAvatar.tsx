import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

import { type FavoriteItem } from '~/jotaduo/mobile-home/hooks/useFavoriteItems';

const AVATAR_SIZE_IN_PX = 40;
const DEFAULT_SIZE_IN_PX = 34;

// twenty-ui's largest avatar is 40px, and the design draws it at other sizes.
const StyledAvatarContainer = styled.span<{ zoomFactor: number }>`
  display: flex;
  flex-shrink: 0;
  zoom: ${({ zoomFactor }) => zoomFactor};
`;

type FavoriteItemAvatarProps = {
  favoriteItem: FavoriteItem;
  sizeInPx?: number;
};

export const FavoriteItemAvatar = ({
  favoriteItem,
  sizeInPx = DEFAULT_SIZE_IN_PX,
}: FavoriteItemAvatarProps) => (
  <StyledAvatarContainer zoomFactor={sizeInPx / AVATAR_SIZE_IN_PX}>
    <Avatar
      size="xl"
      shape={favoriteItem.avatarShape}
      name={favoriteItem.label}
      colorSeed={favoriteItem.avatarColorSeed}
      src={
        isNonEmptyString(favoriteItem.avatarUrl)
          ? getAbsoluteImageUrl(favoriteItem.avatarUrl)
          : undefined
      }
    />
  </StyledAvatarContainer>
);
