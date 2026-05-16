import { useState } from 'react';

interface EditDayModalProps {
  dayNum: string;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function EditDayModal({ onClose, onSave, currentName }: EditDayModalProps) {
  const [name, setName] = useState(currentName), [err, setErr] = useState('');
  function submit() { if (!name.trim()) { setErr('Name required'); return; } onSave(name.trim()); }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Rename Day</div>
        <div className="form-row">
          <label>Name</label>
          <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} />
          {err && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-md)', marginTop: 'var(--sp-3)' }}>{err}</div>}
        </div>
        <button className="btn btn-accent" style={{ width: '100%', padding: 'var(--sp-7)' }} onClick={submit}>Save</button>
        <button className="btn btn-ghost" style={{ width: '100%', padding: 'var(--sp-7)', marginTop: 'var(--sp-5)' }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
