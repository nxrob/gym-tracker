import { useState } from 'react';
import type { AppData, DraftSession, SessionEntry } from '../types';
import ExerciseEntry from '../components/ExerciseEntry';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/button';

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

  return (
    <BottomSheet onClose={() => hasEdited ? onClose() : onDiscard()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--sp-8)', gap: 'var(--sp-6)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '.09em', marginBottom: 'var(--sp-1)' }}>● LOGGING WORKOUT</div>
          <div className="modal-title" style={{ marginBottom: 'var(--sp-1)' }}>{dayName || `Day ${draft.dayNum}`}</div>
          <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)' }}>Tap an exercise to log your numbers.</div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-4)', flexShrink: 0, paddingTop: 2 }}>
          <Button variant="destructive" size="icon" onClick={onDiscard} title="Discard workout">🗑</Button>
          <Button onClick={onSave}>Save</Button>
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
    </BottomSheet>
  );
}
