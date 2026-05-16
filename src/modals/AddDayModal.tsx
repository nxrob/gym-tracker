import { useState } from 'react';

interface AddDayModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function AddDayModal({ onClose, onSave }: AddDayModalProps) {
  const [name, setName] = useState(''), [err, setErr] = useState('');
  function submit() { if (!name.trim()) { setErr('Name required'); return; } onSave(name.trim()); }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Add Training Day</div>
        <div className="form-row">
          <label>Day Name</label>
          <input placeholder="e.g. Push Day, Legs, Pull…" value={name} onChange={e => { setName(e.target.value); setErr(''); }} />
          {err && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-md)', marginTop: 'var(--sp-3)' }}>{err}</div>}
        </div>
        <button className="btn btn-accent" style={{ width: '100%', padding: 'var(--sp-7)' }} onClick={submit}>Add Day</button>
        <button className="btn btn-ghost" style={{ width: '100%', padding: 'var(--sp-7)', marginTop: 'var(--sp-5)' }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
