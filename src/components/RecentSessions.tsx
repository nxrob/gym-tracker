import type { Session, RoutineDay } from '../types';
import { fmtShort, toDateStr } from '../utils';

interface RecentSessionsProps {
  sessions: Session[];
  routine: Record<string, RoutineDay>;
  todayStr: string;
  onSessionClick: (dateStr: string, isPast: boolean) => void;
}

export default function RecentSessions({ sessions, routine, todayStr, onSessionClick }: RecentSessionsProps) {
  if (sessions.length === 0) return null;

  const recent = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div style={{ margin: '0 var(--sp-8)' }}>
      <div className="section-label">RECENT SESSIONS</div>
      {recent.map(s => {
        const dateStr = toDateStr(s.date);
        return (
          <div key={s.id} onClick={() => onSessionClick(dateStr, dateStr < todayStr)}
            className="list-row" style={{ cursor: 'pointer' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text3)', minWidth: 68 }}>{fmtShort(s.date)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--accent)' }}>{routine[s.dayNum]?.name || `Day ${s.dayNum}`}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(s.entries || []).map(e => (routine[s.dayNum]?.exercises || []).find(x => x.id === e.exerciseId)?.name).filter(Boolean).join(' · ')}
              </div>
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 'var(--text-lg)', flexShrink: 0 }}>›</div>
          </div>
        );
      })}
    </div>
  );
}
