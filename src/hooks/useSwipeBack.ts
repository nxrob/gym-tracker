import { useRef } from 'react';
import type { TouchEvent } from 'react';

export function useSwipeBack(onBack: () => void) {
  const ref = useRef({ x: null as number | null, y: null as number | null });
  return {
    onTouchStart: (e: TouchEvent) => { ref.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; },
    onTouchEnd: (e: TouchEvent) => {
      if (ref.current.x === null) return;
      const dx = e.changedTouches[0].clientX - ref.current.x;
      const dy = Math.abs(e.changedTouches[0].clientY - (ref.current.y ?? 0));
      ref.current = { x: null, y: null };
      if (dx > 60 && dy < 100) onBack();
    },
  };
}
