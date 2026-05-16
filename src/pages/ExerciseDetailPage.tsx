import { useMemo } from 'react';
import type { AppData } from '../types';
import { fmtShort } from '../utils';
import { useSwipeBack } from '../hooks/useSwipeBack';

interface ExerciseDetailPageProps {
  data: AppData;
  exerciseId: string;
  goBack: () => void;
}

export default function ExerciseDetailPage({ data, exerciseId, goBack }: ExerciseDetailPageProps) {
  const swipeBack = useSwipeBack(goBack);

  let ex: AppData['routine'][string]['exercises'][0] | null = null;
  for (const day of Object.values(data.routine)) {
    const f = (day.exercises || []).find(e => e.id === exerciseId);
    if (f) { ex = f; break; }
  }

  const allEntries = useMemo(() => {
    const entries: Array<{ exerciseId: string; sets: number; reps: number; weight: number; date: string; dayNum: string }> = [];
    data.sessions.forEach(s => {
      const e = s.entries?.find(e => e.exerciseId === exerciseId);
      if (e) entries.push({ ...e, date: s.date, dayNum: s.dayNum });
    });
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }, [data, exerciseId]);

  const latest = allEntries[allEntries.length - 1];
  const maxWeight = allEntries.length ? Math.max(...allEntries.map(e => e.weight || 0)) : null;

  if (!ex) return (
    <div className="page" {...swipeBack}>
      <div className="back-header"><button className="back-btn" onClick={goBack}>←</button><h2>Exercise</h2></div>
      <div style={{ padding: '40px 16px', color: 'var(--text3)', textAlign: 'center' }}>Exercise not found.</div>
    </div>
  );

  return (
    <div className="page" {...swipeBack}>
      <div className="back-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <h2>{ex.name}</h2>
      </div>
      <div style={{ padding: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-6)', marginBottom: 'var(--sp-10)' }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="section-label" style={{ marginBottom: 'var(--sp-3)' }}>MOST RECENT</div>
            {latest ? (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--text)' }}>{latest.sets}×{latest.reps}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', color: 'var(--accent2)', marginTop: 'var(--sp-1)' }}>@{latest.weight}kg</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text3)', marginTop: 'var(--sp-2)' }}>{fmtShort(latest.date)}</div>
              </>
            ) : <div style={{ color: 'var(--text3)', fontSize: 'var(--text-base)' }}>No logs yet</div>}
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="section-label" style={{ marginBottom: 'var(--sp-3)' }}>MAX WEIGHT</div>
            {maxWeight != null
              ? <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 700, color: 'var(--accent)' }}>{maxWeight}<span style={{ fontSize: 'var(--text-lg)', fontWeight: 400 }}> kg</span></div>
              : <div style={{ color: 'var(--text3)', fontSize: 'var(--text-base)' }}>—</div>}
          </div>
        </div>

        <div className="exercise-meta" style={{ marginBottom: 'var(--sp-10)' }}>
          <span className="pill">Range: {ex.minSets}–{ex.maxSets} sets · {ex.minReps}–{ex.maxReps} reps</span>
        </div>

        <div style={{ marginBottom: 'var(--sp-10)' }}>
          <div className="section-label">PROGRESS OVER TIME</div>
          <div className="wip">🚧 Charts coming soon</div>
        </div>

        <div>
          <div className="section-label">ALL SESSIONS</div>
          {allEntries.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 'var(--text-base)' }}>No sessions logged for this exercise.</div>}
          {[...allEntries].reverse().map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: 'var(--sp-5) 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text3)', minWidth: 72 }}>{fmtShort(e.date)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--text)' }}>{e.sets}×{e.reps} <span style={{ color: 'var(--accent2)' }}>@{e.weight}kg</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
