import { useRef } from 'react';
import type { TouchEvent } from 'react';

export function useSwipeDownClose(onClose: () => void) {
  const ref = useRef({ y: null as number | null, startX: null as number | null });
  return {
    onTouchStart: (e: TouchEvent) => { ref.current = { y: e.touches[0].clientY, startX: e.touches[0].clientX }; },
    onTouchEnd: (e: TouchEvent) => {
      if (ref.current.y === null) return;
      const dy = e.changedTouches[0].clientY - ref.current.y;
      const dx = Math.abs(e.changedTouches[0].clientX - (ref.current.startX ?? 0));
      ref.current = { y: null, startX: null };
      if (dy > 80 && dx < 60) onClose();
    },
  };
}
