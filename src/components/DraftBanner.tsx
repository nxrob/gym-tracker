import type { DraftSession, RoutineDay } from '../types';

interface DraftBannerProps {
  draft: DraftSession;
  routine: Record<string, RoutineDay>;
  onResume: () => void;
}

export default function DraftBanner({ draft, routine, onResume }: DraftBannerProps) {
  return (
    <div style={{ margin: '0 var(--sp-8) var(--sp-8)', padding: 'var(--sp-6) var(--sp-7)', background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-6)' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--accent)', letterSpacing: '.06em' }}>WORKOUT IN PROGRESS</div>
        <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginTop: 'var(--sp-1)' }}>{routine[draft.dayNum]?.name || `Day ${draft.dayNum}`}</div>
      </div>
      <button className="btn btn-accent btn-sm" onClick={onResume}>Resume</button>
    </div>
  );
}
