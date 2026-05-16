import { useState } from 'react';
import type { AppData, Session, SessionEntry } from '../types';
import { uuid } from '../utils';
import ExerciseEntry from '../components/ExerciseEntry';
import SessionView from '../components/SessionView';
import EditSessionModal from './EditSessionModal';

interface CalDayModalProps {
  dateStr: string;
  isPast: boolean;
  hasSessions: boolean;
  sessions: Session[];
  data: AppData;
  persist: (d: AppData) => void;
  showToast: (msg: string) => void;
  dayNums: string[];
  onClose: () => void;
}

export default function CalDayModal({ dateStr, isPast, sessions, data, persist, showToast, dayNums, onClose }: CalDayModalProps) {
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [addingWorkout, setAddingWorkout] = useState(false);
  const [pickDayForPast, setPickDayForPast] = useState(false);
  const [pastDayNum, setPastDayNum] = useState<string | null>(null);
  const [pastEntries, setPastEntries] = useState<SessionEntry[]>([]);

  const [y, m, d] = dateStr.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function deleteSession(id: string) {
    persist({ ...data, sessions: data.sessions.filter(s => s.id !== id) });
    showToast('Session deleted');
    if (sessions.filter(s => s.id !== id).length === 0) onClose();
  }

  function saveEditedSession(sid: string, entries: SessionEntry[]) {
    persist({ ...data, sessions: data.sessions.map(s => s.id === sid ? { ...s, entries } : s) });
    showToast('Session updated'); setEditingSession(null);
  }

  function startPastAdd(dayNum: string) {
    const exs = data.routine[dayNum]?.exercises || [];
    setPastDayNum(dayNum);
    setPastEntries(exs.map(ex => ({ exerciseId: ex.id, sets: ex.minSets, reps: ex.minReps, weight: 0 })));
    setPickDayForPast(false); setAddingWorkout(true);
  }

  function commitPastSession() {
    if (!pastDayNum) return;
    const session = { id: uuid(), date: new Date(y, m - 1, d, 12, 0, 0).toISOString(), dayNum: pastDayNum, entries: pastEntries };
    const sorted = [...data.sessions, session].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    persist({ ...data, sessions: sorted });
    showToast('Session added'); setAddingWorkout(false); onClose();
  }

  function updatePastEntry(exId: string, field: 'sets' | 'reps' | 'weight', val: number) {
    setPastEntries(prev => prev.map(e => e.exerciseId === exId ? { ...e, [field]: val } : e));
  }

  if (editingSession) {
    return <EditSessionModal session={editingSession} data={data} onSave={entries => saveEditedSession(editingSession.id, entries)} onClose={() => setEditingSession(null)} />;
  }

  if (addingWorkout && pastDayNum) {
    const exercises = data.routine[pastDayNum]?.exercises || [];
    const dayName = data.routine[pastDayNum]?.name;
    return (
      <div className="modal-backdrop" onClick={() => setAddingWorkout(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-handle" />
          <div className="warn-banner">⚠️ You're logging a session in the past for {label}.</div>
          <div className="modal-title">{dayName || `Day ${pastDayNum}`}</div>
          <div className="modal-sub">Tap each exercise to enter your numbers.</div>
          {exercises.map(ex => (
            <ExerciseEntry
              key={ex.id}
              exercise={ex}
              entry={pastEntries.find(e => e.exerciseId === ex.id) || {}}
              onUpdate={(field, val) => updatePastEntry(ex.id, field, val)}
            />
          ))}
          <button className="btn btn-accent" style={{ width: '100%', padding: 'var(--sp-7)', marginTop: 'var(--sp-5)', fontSize: 'var(--text-lg)' }} onClick={commitPastSession}>Save Past Session</button>
          <button className="btn btn-ghost" style={{ width: '100%', padding: 'var(--sp-6)', marginTop: 'var(--sp-5)' }} onClick={() => setAddingWorkout(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  if (pickDayForPast) {
    return (
      <div className="modal-backdrop" onClick={() => setPickDayForPast(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-handle" />
          <div className="warn-banner">⚠️ You're adding a session to a past date: {label}.</div>
          <div className="modal-title">Which routine day?</div>
          {dayNums.map(d => (
            <button key={d} onClick={() => startPastAdd(d)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-7) var(--sp-8)', marginBottom: 'var(--sp-5)', cursor: 'pointer', gap: 'var(--sp-1)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text)' }}>{data.routine[d]?.name || `Day ${d}`}</span>
              <span style={{ fontSize: 'var(--text-md)', color: 'var(--text3)' }}>{(data.routine[d]?.exercises || []).map(e => e.name).join(', ')}</span>
            </button>
          ))}
          <button className="btn btn-ghost" style={{ width: '100%', padding: 'var(--sp-6)' }} onClick={() => setPickDayForPast(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop center" onClick={onClose}>
      <div className="modal center-modal" onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent2)', letterSpacing: '.07em', marginBottom: 'var(--sp-6)' }}>{label.toUpperCase()}</div>
        {sessions.length === 0
          ? <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 'var(--sp-8) 0 var(--sp-10)' }}>No sessions on this day.</div>
          : sessions.map(s => (
            <SessionView
              key={s.id}
              session={s}
              routine={data.routine}
              onEdit={() => setEditingSession(s)}
              onDelete={() => deleteSession(s.id)}
            />
          ))}
        {isPast && dayNums.length > 0 && (
          <button className="btn btn-warn" style={{ width: '100%', padding: 'var(--sp-6)', marginTop: 'var(--sp-2)' }} onClick={() => setPickDayForPast(true)}>
            + Add past session for this day
          </button>
        )}
        <button className="btn btn-ghost" style={{ width: '100%', padding: 'var(--sp-6)', marginTop: 'var(--sp-4)' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
