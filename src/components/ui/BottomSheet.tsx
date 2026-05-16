import { animated } from '@react-spring/web';
import { useSpringSheet } from '@/hooks/useSpringSheet';

interface BottomSheetProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ onClose, children }: BottomSheetProps) {
  const { spring, bind, close } = useSpringSheet({ onClose });

  return (
    <animated.div
      onClick={close}
      style={{
        opacity: spring.opacity,
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        backgroundColor: 'var(--overlay)',
      }}
    >
      <animated.div
        onClick={e => e.stopPropagation()}
        style={{
          y: spring.y,
          position: 'relative',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div
          {...bind()}
          style={{
            touchAction: 'none',
            cursor: 'grab',
            paddingTop: '16px',
            paddingBottom: '8px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>
        <div style={{ padding: '0 20px 56px' }}>
          {children}
        </div>
      </animated.div>
    </animated.div>
  );
}
