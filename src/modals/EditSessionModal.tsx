import { useState } from 'react';
import type { AppData, Session, SessionEntry } from '../types';
import ExerciseEntry from '../components/ExerciseEntry';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/button';

interface EditSessionModalProps {
  session: Session;
  data: AppData;
  onSave: (entries: SessionEntry[]) => void;
  onClose: () => void;
}

export default function EditSessionModal({ session, data, onSave, onClose }: EditSessionModalProps) {
  const exercises = data.routine[session.dayNum]?.exercises || [];
  const dayName = data.routine[session.dayNum]?.name;
  const fmtDate = new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const [entries, setEntries] = useState<SessionEntry[]>(() =>
    exercises.map(ex => {
      const e = session.entries?.find(e => e.exerciseId === ex.id);
      return { exerciseId: ex.id, sets: e?.sets ?? ex.minSets, reps: e?.reps ?? ex.minReps, weight: e?.weight ?? 0 };
    })
  );

  function getEntry(exId: string) { return entries.find(e => e.exerciseId === exId) || {}; }
  function update(exId: string, field: 'sets' | 'reps' | 'weight', val: number) {
    setEntries(prev => prev.map(e => e.exerciseId === exId ? { ...e, [field]: val } : e));
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ marginBottom: 'var(--sp-10)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent2)', letterSpacing: '.09em', marginBottom: 'var(--sp-2)' }}>✏️ EDITING · {fmtDate.toUpperCase()}</div>
        <div className="modal-title">{dayName || `Day ${session.dayNum}`}</div>
        <div className="modal-sub">Tap an exercise to adjust numbers.</div>
      </div>
      {exercises.map(ex => (
        <ExerciseEntry
          key={ex.id}
          exercise={ex}
          entry={getEntry(ex.id)}
          onUpdate={(field, val) => update(ex.id, field, val)}
        />
      ))}
      <Button className="w-full py-7 mt-3" onClick={() => onSave(entries)}>Save Changes</Button>
      <Button variant="ghost" className="w-full py-6 mt-3" onClick={onClose}>Cancel</Button>
    </BottomSheet>
  );
}
