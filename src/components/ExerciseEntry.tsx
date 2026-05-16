import { useState } from 'react';
import type { Exercise, SessionEntry } from '../types';
import Stepper from './Stepper';

interface ExerciseEntryProps {
  exercise: Exercise;
  entry: Partial<SessionEntry>;
  onUpdate: (field: 'sets' | 'reps' | 'weight', val: number) => void;
  onDone?: () => void;
  latest?: SessionEntry & { date: string };
}

export default function ExerciseEntry({ exercise: ex, entry, onUpdate, onDone, latest }: ExerciseEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasData = entry.sets || entry.reps || entry.weight;

  function handleDone() {
    setIsOpen(false);
    onDone?.();
  }

  return (
    <>
      <div className="ex-card-clickable" onClick={() => setIsOpen(true)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="exercise-name">{ex.name}</div>
            <div className="exercise-meta">
              <span className="pill">{ex.minSets}–{ex.maxSets} sets · {ex.minReps}–{ex.maxReps} reps</span>
            </div>
          </div>
          {hasData
            ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--accent2)', flexShrink: 0, textAlign: 'right' }}>{entry.sets}×{entry.reps}<br />@{entry.weight}kg</div>
            : <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text3)', flexShrink: 0 }}>tap</div>}
        </div>
      </div>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title" style={{ marginBottom: 'var(--sp-2)' }}>{ex.name}</div>
            <div className="exercise-meta" style={{ marginBottom: 'var(--sp-8)' }}>
              <span className="pill">Range: {ex.minSets}–{ex.maxSets} sets · {ex.minReps}–{ex.maxReps} reps</span>
              {latest && <span className="pill info">Last: {latest.sets}×{latest.reps} @{latest.weight ?? 0}kg</span>}
            </div>
            <div className="form-grid-3">
              <div><label>Sets</label><Stepper value={entry.sets ?? ex.minSets} min={0} max={ex.maxSets + 5} onChange={v => onUpdate('sets', v)} /></div>
              <div><label>Reps</label><Stepper value={entry.reps ?? ex.minReps} min={0} max={ex.maxReps + 20} onChange={v => onUpdate('reps', v)} /></div>
              <div><label>Weight (kg)</label><Stepper value={entry.weight ?? 0} step={2.5} onChange={v => onUpdate('weight', v)} /></div>
            </div>
            <button className="btn btn-accent" style={{ width: '100%', padding: 'var(--sp-7)', marginTop: 'var(--sp-7)' }} onClick={handleDone}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
