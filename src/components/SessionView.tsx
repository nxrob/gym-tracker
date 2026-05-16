import { useState } from 'react';
import type { Session, RoutineDay } from '../types';

interface SessionViewProps {
  session: Session;
  routine: Record<string, RoutineDay>;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SessionView({ session: s, routine, onEdit, onDelete }: SessionViewProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dayName = routine[s.dayNum]?.name;
  const exList = routine[s.dayNum]?.exercises || [];

  return (
    <div style={{ marginBottom: 'var(--sp-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-5)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-2xl)', color: 'var(--accent)', letterSpacing: '.04em' }}>{dayName || `Day ${s.dayNum}`}</div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️</button>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>🗑</button>
        </div>
      </div>

      {(s.entries || []).map(entry => {
        const ex = exList.find(x => x.id === entry.exerciseId);
        if (!ex) return null;
        return (
          <div key={entry.exerciseId} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: 'var(--sp-4) 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{ex.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--text2)', textAlign: 'right', flexShrink: 0, marginLeft: 'var(--sp-6)' }}>
              {entry.sets}×{entry.reps}{entry.weight != null ? <span style={{ color: 'var(--accent2)' }}> @{entry.weight}kg</span> : null}
            </div>
          </div>
        );
      })}

      {confirmDelete && (
        <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-6)', background: 'var(--danger-muted)', border: '1px solid var(--danger-border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginBottom: 'var(--sp-5)' }}>Delete this session? Can't be undone.</div>
          <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
            <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={onDelete}>Yes, delete</button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
