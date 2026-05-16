import { useMemo } from 'react';
import { animated } from '@react-spring/web';
import type { AppData, Page, SessionEntry } from '../types';
import { fmtShort } from '../utils';
import { useSpringPage } from '../hooks/useSpringPage';

interface StatsPageProps {
  data: AppData;
  persist: (d: AppData) => void;
  showToast: (msg: string) => void;
  go: (page: Page, ctx?: string | null) => void;
}

export default function StatsPage({ data, go }: StatsPageProps) {
  const { spring, bind, back } = useSpringPage({ onBack: () => go('home') });

  const allExercises = useMemo(() => {
    const map: Record<string, AppData['routine'][string]['exercises'][0]> = {};
    Object.values(data.routine).forEach(day => (day.exercises || []).forEach(ex => { map[ex.id] = { ...ex }; }));
    data.sessions.forEach(s => {
      const exs = data.routine[s.dayNum]?.exercises || [];
      exs.forEach(ex => { if (!map[ex.id]) map[ex.id] = { ...ex }; });
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const totalSessions = data.sessions.length;
  const latestBW = [...(data.bodyWeights || [])].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <animated.div className="page" {...bind()} style={{ x: spring.x }}>
      <div className="back-header">
        <button className="back-btn" onClick={back}>←</button>
        <h2>Stats</h2>
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-6)', padding: 'var(--sp-8) var(--sp-8) 0' }}>
        <div className="stat-block" style={{ cursor: 'default' }}>
          <div className="stat-val">{totalSessions}</div>
          <div className="stat-lbl">Sessions logged</div>
        </div>
        <div className="stat-block" onClick={() => go('bodyweight')}>
          <div className="stat-val">{latestBW ? `${latestBW.weight}` : '—'}</div>
          <div className="stat-lbl">Body weight (kg) ›</div>
        </div>
      </div>

      <div style={{ padding: 'var(--sp-10) var(--sp-8) 0' }}>
        <div className="section-label">EXERCISES</div>
        {allExercises.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 'var(--text-base)', padding: 'var(--sp-10) 0' }}>No exercises in your routine yet.</div>}
        {allExercises.map(ex => {
          let latestEntry: (SessionEntry & { date: string }) | null = null;
          for (let i = 0; i < data.sessions.length; i++) {
            const s = data.sessions[i];
            const e = s.entries?.find(e => e.exerciseId === ex.id);
            if (e) { latestEntry = { ...e, date: s.date }; break; }
          }
          return (
            <div key={ex.id} onClick={() => go('exercise-detail', ex.id)}
              className="list-row" style={{ cursor: 'pointer' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{ex.name}</div>
                {latestEntry
                  ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>{latestEntry.sets}×{latestEntry.reps} @{latestEntry.weight}kg · {fmtShort(latestEntry.date)}</div>
                  : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginTop: 2 }}>No sessions yet</div>}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 'var(--text-lg)', flexShrink: 0 }}>›</div>
            </div>
          );
        })}
      </div>
    </animated.div>
  );
}
