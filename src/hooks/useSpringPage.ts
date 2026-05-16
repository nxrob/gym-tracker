import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useCallback, useEffect } from 'react';

interface UseSpringPageOptions {
  onBack: () => void;
  backThreshold?: number;
  velocityThreshold?: number;
}

export function useSpringPage({ onBack, backThreshold = 80, velocityThreshold = 0.4 }: UseSpringPageOptions) {
  const [spring, api] = useSpring(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth : 400,
    config: { tension: 280, friction: 26 },
  }));

  useEffect(() => {
    api.start({ x: 0 });
  }, [api]);

  const back = useCallback(() => {
    api.start({ x: typeof window !== 'undefined' ? window.innerWidth : 400, onRest: onBack });
  }, [api, onBack]);

  const bind = useDrag(
    ({ offset: [ox], velocity: [vx], last, cancel }) => {
      if (ox < 0) { cancel?.(); return; }
      if (last) {
        if (ox > backThreshold || vx > velocityThreshold) {
          back();
        } else {
          api.start({ x: 0 });
        }
      } else {
        api.start({ x: ox, immediate: true });
      }
    },
    {
      from: () => [spring.x.get(), 0],
      filterTaps: true,
      bounds: { left: 0 },
      rubberband: true,
      axis: 'x',
    }
  );

  return { spring, bind, back };
}
