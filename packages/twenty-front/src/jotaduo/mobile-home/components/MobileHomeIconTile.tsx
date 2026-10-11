import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { getJotaduoMobileHueColors } from '~/jotaduo/mobile-theme/utils/getJotaduoMobileHueColors';

type MobileHomeIconTileShape = 'rounded-square' | 'circle';

// corner-shape is reset because Twenty squircles every corner by default,
// which turns the design's circles into rounded squares.
const StyledTile = styled.span<{
  backgroundColor: string;
  shape: MobileHomeIconTileShape;
  sizeInPx: number;
}>`
  align-items: center;
  background: ${({ backgroundColor }) => backgroundColor};
  border-radius: ${({ shape }) => (shape === 'circle' ? '50%' : '9px')};
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  flex-shrink: 0;
  height: ${({ sizeInPx }) => `${sizeInPx}px`};
  justify-content: center;
  width: ${({ sizeInPx }) => `${sizeInPx}px`};
`;

type MobileHomeIconTileProps = {
  Icon: IconComponent;
  color: ThemeColor;
  shape?: MobileHomeIconTileShape;
  sizeInPx?: number;
  iconSizeInPx?: number;
  className?: string;
};

export const MobileHomeIconTile = ({
  Icon,
  color,
  shape = 'rounded-square',
  sizeInPx = 34,
  iconSizeInPx = 20,
  className,
}: MobileHomeIconTileProps) => {
  const { backgroundColor, iconColor } = getJotaduoMobileHueColors(color);

  return (
    <StyledTile
      backgroundColor={backgroundColor}
      shape={shape}
      sizeInPx={sizeInPx}
      className={className}
      aria-hidden
    >
      <Icon size={iconSizeInPx} stroke={2} color={iconColor} />
    </StyledTile>
  );
};
