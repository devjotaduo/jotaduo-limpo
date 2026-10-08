import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// Icon/AI Avatar in its soft style (Agent avatar/Dots): light accent body with two accent
// eyes. Eyes and the gap between them are fractions of the side, so every size keeps the face.
const StyledAvatar = styled.div<{ size: number }>`
  align-items: center;
  background: ${themeCssVariables.accent.accent4};
  border-radius: ${themeCssVariables.border.radius.rounded};
  display: flex;
  flex-shrink: 0;
  gap: ${({ size }) => `${size / 8}px`};
  height: ${({ size }) => `${size}px`};
  justify-content: center;
  width: ${({ size }) => `${size}px`};
`;

const StyledEye = styled.span<{ size: number }>`
  background: ${themeCssVariables.accent.accent10};
  border-radius: 1px;
  height: ${({ size }) => `${size / 4}px`};
  width: ${({ size }) => `${size / 8}px`};
`;

type AiChatAvatarProps = {
  size?: number;
};

export const AiChatAvatar = ({ size = 40 }: AiChatAvatarProps) => (
  <StyledAvatar size={size} aria-hidden="true">
    <StyledEye size={size} />
    <StyledEye size={size} />
  </StyledAvatar>
);
