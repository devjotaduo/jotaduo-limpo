import { styled } from '@linaria/react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { useTheme } from 'twenty-ui/theme';

const StyledTransitionPage = styled(motion.div)`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

// Same movement as between the JotaDuo questions: the step blurs out and the
// next one comes in from blurred to sharp, one after the other. A filter left
// on the page would trap its fixed descendants, so it is dropped at the end.
export const JotaduoOnboardingTransitionOutlet = () => {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const enterDuration = shouldReduceMotion
    ? 0
    : theme.animation.duration.normal;
  const exitDuration = shouldReduceMotion ? 0 : theme.animation.duration.fast;

  const transitionPageVariants: Variants = {
    initial: { opacity: 0, filter: 'blur(8px)' },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: enterDuration, ease: 'easeOut' },
      transitionEnd: { filter: 'none' },
    },
    exit: {
      opacity: 0,
      filter: 'blur(8px)',
      pointerEvents: 'none',
      transition: { duration: exitDuration, ease: 'easeIn' },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <StyledTransitionPage
        key={pathname}
        variants={transitionPageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {outlet}
      </StyledTransitionPage>
    </AnimatePresence>
  );
};
