import { useState } from 'react';
import type { AppData, DraftSession, SessionEntry } from '../types';
import ExerciseEntry from '../components/ExerciseEntry';
import { useSwipeDownClose } from '../hooks/useSwipeDownClose';

interface WorkoutModalProps {
  data: AppData;
  draft: DraftSession;
  getLatest: (exerciseId: string, dayNum: string) => (SessionEntry & { date: string }) | null;
  onUpdate: (exId: string, field: 'sets' | 'reps' | 'weight', val: number) => void;
  onSave: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export default function WorkoutModal({ data, draft, getLatest, onUpdate, onSave, onDiscard, onClose }: WorkoutModalProps) {
  const [hasEdited, setHasEdited] = useState(false);
  const exercises = data.routine[draft.dayNum]?.exercises || [];
  const dayName = data.routine[draft.dayNum]?.name;
  const swipeDown = useSwipeDownClose(() => { hasEdited ? onClose() : onDiscard(); });

  return (
    <div className="modal-backdrop" onClick={() => { hasEdited ? onClose() : onDiscard(); }}>
      <div className="modal" onClick={e => e.stopPropagation()} {...swipeDown}>
        <div className="modal-handle" />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--sp-8)', gap: 'var(--sp-6)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '.09em', marginBottom: 'var(--sp-1)' }}>● LOGGING WORKOUT</div>
            <div className="modal-title" style={{ marginBottom: 'var(--sp-1)' }}>{dayName || `Day ${draft.dayNum}`}</div>
            <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)' }}>Tap an exercise to log your numbers.</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexShrink: 0, paddingTop: 2 }}>
            <button onClick={e => { e.stopPropagation(); onDiscard(); }} title="Discard workout"
              style={{ background: 'transparent', border: '1px solid var(--danger)', borderRadius: 'var(--r-md)', color: 'var(--danger)', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 'var(--text-lg)', flexShrink: 0 }}>
              🗑
            </button>
            <button onClick={e => { e.stopPropagation(); onSave(); }}
              style={{ background: 'var(--accent)', border: 'none', borderRadius: 'var(--r-md)', color: 'var(--on-accent)', padding: '0 var(--sp-6)', height: 38, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', letterSpacing: '.05em', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Save
            </button>
          </div>
        </div>

        {exercises.map(ex => {
          const entry = draft.entries.find(e => e.exerciseId === ex.id) || {};
          const latest = getLatest(ex.id, draft.dayNum);
          return (
            <ExerciseEntry
              key={ex.id}
              exercise={ex}
              entry={entry}
              onUpdate={(field, val) => onUpdate(ex.id, field, val)}
              onDone={() => setHasEdited(true)}
              latest={latest ?? undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
