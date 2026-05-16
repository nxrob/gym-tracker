import { useState } from 'react';
import type { Exercise } from '../types';
import Stepper from '../components/Stepper';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/button';

interface AddExerciseModalProps {
  dayNum: string;
  dayName?: string;
  onClose: () => void;
  onSave: (ex: Omit<Exercise, 'id'>) => void;
}

const PRESETS = ['Bench Press','Squat','Deadlift','OHP','Pull-ups','Barbell Row','Lunges','Bicep Curls','Tricep Dips','Lat Pulldown','Leg Press','Cable Fly','Incline Press','Romanian Deadlift'];

export default function AddExerciseModal({ dayNum, dayName, onClose, onSave }: AddExerciseModalProps) {
  const [name, setName] = useState('');
  const [minSets, setMinSets] = useState(3), [maxSets, setMaxSets] = useState(4);
  const [minReps, setMinReps] = useState(8), [maxReps, setMaxReps] = useState(12);
  const [err, setErr] = useState('');

  function submit() {
    if (!name.trim()) { setErr('Name required'); return; }
    if (minSets > maxSets) { setErr('Min sets > max'); return; }
    if (minReps > maxReps) { setErr('Min reps > max'); return; }
    onSave({ name: name.trim(), minSets, maxSets, minReps, maxReps });
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="modal-title">Add Exercise</div>
      <div className="modal-sub">{dayName || `Day ${dayNum}`}</div>
      <div className="form-row">
        <label>Name</label>
        <input placeholder="e.g. Bench Press" value={name} onChange={e => { setName(e.target.value); setErr(''); }} />
        <div className="tag-row">{PRESETS.map(p => <span key={p} className={`tag${name === p ? ' selected' : ''}`} onClick={() => setName(p)}>{p}</span>)}</div>
      </div>
      <div className="form-row">
        <label>Sets Range</label>
        <div className="form-grid">
          <div><label>Min</label><Stepper value={minSets} min={1} max={maxSets} onChange={setMinSets} /></div>
          <div><label>Max</label><Stepper value={maxSets} min={minSets} max={10} onChange={setMaxSets} /></div>
        </div>
      </div>
      <div className="form-row">
        <label>Reps Range</label>
        <div className="form-grid">
          <div><label>Min</label><Stepper value={minReps} min={1} max={maxReps} onChange={setMinReps} /></div>
          <div><label>Max</label><Stepper value={maxReps} min={minReps} max={50} onChange={setMaxReps} /></div>
        </div>
      </div>
      {err && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-md)', marginBottom: 'var(--sp-6)' }}>{err}</div>}
      <Button className="w-full py-7" onClick={submit}>Add Exercise</Button>
      <Button variant="ghost" className="w-full py-7 mt-3" onClick={onClose}>Cancel</Button>
    </BottomSheet>
  );
}
