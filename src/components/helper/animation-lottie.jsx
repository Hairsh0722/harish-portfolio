import React, { Suspense, lazy } from 'react';

// Lazy load Lottie to prevent blocking the main thread
const Lottie = lazy(() => import('lottie-react'));

// Respect users who ask for reduced motion (WCAG 2.2.2).
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const AnimationLottie = ({ animationPath, width = '100%', height = 'auto', style = {} }) => {
  const defaultOptions = {
    loop: !prefersReducedMotion,
    autoplay: !prefersReducedMotion,
    animationData: animationPath,
    style: {
      width,
      height,
      margin: '0 auto',
      ...style,
    },
  };

  return (
    <Suspense
      fallback={
        <div
          style={{
            width,
            height: height === 'auto' ? '300px' : height,
            background: 'transparent',
            borderRadius: 'var(--radius-md)',
          }}
        />
      }
    >
      <Lottie {...defaultOptions} />
    </Suspense>
  );
};

export default AnimationLottie;
