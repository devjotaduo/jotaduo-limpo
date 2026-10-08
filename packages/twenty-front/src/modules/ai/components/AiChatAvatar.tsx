import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// Icon/AI Avatar in its soft style (Agent avatar/Dots): light accent body with an accent face.
// Eyes, dots and the gap between them are fractions of the side, so every size keeps the face.
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

// blinking closes the eyes for a moment every few seconds, so an idle face still looks alive
const StyledEye = styled.span<{ size: number; shouldBlink: boolean }>`
  animation: ${({ shouldBlink }) =>
    shouldBlink ? 'aiChatAvatarBlink 5s ease-in-out infinite' : 'none'};
  background: ${themeCssVariables.accent.accent10};
  border-radius: 1px;
  height: ${({ size }) => `${size / 4}px`};
  width: ${({ size }) => `${size / 8}px`};

  @keyframes aiChatAvatarBlink {
    0%,
    94%,
    100% {
      transform: scaleY(1);
    }
    97% {
      transform: scaleY(0.15);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// thinking swaps the eyes for three dots that bounce one after the other
const StyledDot = styled.span<{ size: number; delayInSeconds: number }>`
  animation: aiChatAvatarDotBounce 0.9s ease-in-out infinite;
  animation-delay: ${({ delayInSeconds }) => `${delayInSeconds}s`};
  background: ${themeCssVariables.accent.accent10};
  border-radius: ${themeCssVariables.border.radius.rounded};
  height: ${({ size }) => `${size / 8}px`};
  width: ${({ size }) => `${size / 8}px`};

  @keyframes aiChatAvatarDotBounce {
    0%,
    60%,
    100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-40%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const DOT_DELAYS_IN_SECONDS = [0, 0.15, 0.3];
const EYES = ['left', 'right'];

type AiChatAvatarProps = {
  size?: number;
  isThinking?: boolean;
  shouldBlink?: boolean;
};

export const AiChatAvatar = ({
  size = 40,
  isThinking = false,
  shouldBlink = false,
}: AiChatAvatarProps) => (
  <StyledAvatar
    size={size}
    aria-hidden="true"
    data-ai-avatar-state={isThinking ? 'thinking' : 'idle'}
  >
    {isThinking
      ? DOT_DELAYS_IN_SECONDS.map((delayInSeconds) => (
          <StyledDot
            key={delayInSeconds}
            size={size}
            delayInSeconds={delayInSeconds}
          />
        ))
      : EYES.map((eye) => (
          <StyledEye key={eye} size={size} shouldBlink={shouldBlink} />
        ))}
  </StyledAvatar>
);
