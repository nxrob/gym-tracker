import { useSpring } from '@react-spring/web';

export function useButtonPress() {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 400, friction: 15 },
  }));

  return {
    spring,
    handlers: {
      onPointerDown: () => api.start({ scale: 0.94 }),
      onPointerUp: () => api.start({ scale: 1 }),
      onPointerLeave: () => api.start({ scale: 1 }),
    },
  };
}
