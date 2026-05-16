import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useCallback, useEffect } from 'react';

interface UseSpringSheetOptions {
  onClose: () => void;
  closeThreshold?: number;
  velocityThreshold?: number;
}

export function useSpringSheet({ onClose, closeThreshold = 80, velocityThreshold = 0.5 }: UseSpringSheetOptions) {
  const [spring, api] = useSpring(() => ({
    y: 600,
    opacity: 0,
    config: { tension: 300, friction: 30 },
  }));

  useEffect(() => {
    api.start({ y: 0, opacity: 1 });
  }, [api]);

  const close = useCallback(() => {
    api.start({ y: 600, opacity: 0, onRest: onClose });
  }, [api, onClose]);

  const bind = useDrag(
    ({ offset: [, oy], velocity: [, vy], last, cancel }) => {
      if (oy < 0) { cancel?.(); return; }
      if (last) {
        if (oy > closeThreshold || vy > velocityThreshold) {
          close();
        } else {
          api.start({ y: 0 });
        }
      } else {
        api.start({ y: oy, immediate: true });
      }
    },
    {
      from: () => [0, spring.y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      rubberband: true,
      axis: 'y',
    }
  );

  return { spring, bind, close };
}
