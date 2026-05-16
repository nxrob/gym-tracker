import { useState, useRef } from 'react';
import type { AppData, Exercise } from '../types';
import { uuid } from '../utils';
import { useSwipeBack } from '../hooks/useSwipeBack';
import AddDayModal from '../modals/AddDayModal';
import EditDayModal from '../modals/EditDayModal';
import AddExerciseModal from '../modals/AddExerciseModal';

interface RoutinePageProps {
  data: AppData;
  persist: (d: AppData) => void;
  showToast: (msg: string) => void;
  goBack: () => void;
}

export default function RoutinePage({ data, persist, showToast, goBack }: RoutinePageProps) {
  const swipeBack = useSwipeBack(goBack);
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [addExDay, setAddExDay] = useState<string | null>(null);
  const [editDayNum, setEditDayNum] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const addBtnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dayNums = Object.keys(data.routine).sort();

  function toggleCollapse(d: string) { setCollapsed(prev => ({ ...prev, [d]: !prev[d] })); }

  function addDay(name: string) {
    const nums = Object.keys(data.routine).map(Number), next = nums.length ? Math.max(...nums) + 1 : 1;
    if (next > 5) return;
    persist({ ...data, routine: { ...data.routine, [String(next)]: { name, exercises: [] } } });
    setAddDayOpen(false); showToast(`${name} added`);
  }

  function removeDay(d: string) {
    const r = { ...data.routine }; delete r[d];
    const ren: typeof data.routine = {};
    Object.keys(r).sort().forEach((k, i) => { ren[String(i + 1)] = r[k]; });
    persist({ ...data, routine: ren }); showToast('Day removed');
  }

  function renameDay(d: string, name: string) {
    persist({ ...data, routine: { ...data.routine, [d]: { ...data.routine[d], name } } });
    setEditDayNum(null);
  }

  function addExercise(d: string, ex: Omit<Exercise, 'id'>) {
    const day = data.routine[d] || { name: '', exercises: [] };
    persist({ ...data, routine: { ...data.routine, [d]: { ...day, exercises: [...day.exercises, { ...ex, id: uuid() }] } } });
    setAddExDay(null); showToast('Exercise added');
    setTimeout(() => { addBtnRefs.current[d]?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 150);
  }

  function removeEx(d: string, exId: string) {
    const day = data.routine[d];
    persist({ ...data, routine: { ...data.routine, [d]: { ...day, exercises: day.exercises.filter(e => e.id !== exId) } } });
    showToast('Removed');
  }

  return (
    <div className="page" {...swipeBack}>
      <div className="back-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <h2>My Routine</h2>
        {dayNums.length < 5 && <button className="btn btn-accent btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setAddDayOpen(true)}>+ Day</button>}
      </div>
      {dayNums.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 'var(--text-display)', marginBottom: 'var(--sp-7)' }}>📋</div>
          <p style={{ fontSize: 'var(--text-lg)' }}>No days yet.<br />Add your first training day above.</p>
        </div>
      )}
      {dayNums.map(d => {
        const isCollapsed = collapsed[d];
        const dayName = data.routine[d]?.name || `Day ${d}`;
        return (
          <div key={d} className="day-section">
            <div className="day-label-row" onClick={() => toggleCollapse(d)}>
              <span style={{ flex: 1 }}>{dayName}</span>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditDayNum(d)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeDay(d)}>✕</button>
              </div>
              <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text3)', marginLeft: 'var(--sp-4)', flexShrink: 0 }}>{isCollapsed ? '▸' : '▾'}</span>
            </div>
            {!isCollapsed && (
              <div style={{ paddingTop: 'var(--sp-6)' }}>
                {(data.routine[d]?.exercises || []).map(ex => (
                  <div key={ex.id} className="exercise-item">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div className="exercise-name">{ex.name}</div>
                        <div className="exercise-meta">
                          <span className="pill accent">{ex.minSets}–{ex.maxSets} sets</span>
                          <span className="pill info">{ex.minReps}–{ex.maxReps} reps</span>
                        </div>
                      </div>
                      <button className="btn btn-danger btn-sm" style={{ marginLeft: 8, flexShrink: 0 }} onClick={() => removeEx(d, ex.id)}>✕</button>
                    </div>
                  </div>
                ))}
                <div ref={el => { addBtnRefs.current[d] = el; }}>
                  <button className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }} onClick={() => setAddExDay(d)}>
                    + Add exercise to {dayName}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {addDayOpen && <AddDayModal onClose={() => setAddDayOpen(false)} onSave={addDay} />}
      {addExDay && <AddExerciseModal dayNum={addExDay} dayName={data.routine[addExDay]?.name} onClose={() => setAddExDay(null)} onSave={ex => addExercise(addExDay, ex)} />}
      {editDayNum && <EditDayModal dayNum={editDayNum} currentName={data.routine[editDayNum]?.name || ''} onClose={() => setEditDayNum(null)} onSave={n => renameDay(editDayNum, n)} />}
    </div>
  );
}
