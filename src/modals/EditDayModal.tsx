import { useState } from 'react';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/button';

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
    <BottomSheet onClose={onClose}>
      <div className="modal-title" style={{ marginBottom: 'var(--sp-8)' }}>Rename Day</div>
      <div className="form-row">
        <label>Name</label>
        <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} />
        {err && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-md)', marginTop: 'var(--sp-3)' }}>{err}</div>}
      </div>
      <Button className="w-full py-7" onClick={submit}>Save</Button>
      <Button variant="ghost" className="w-full py-7 mt-3" onClick={onClose}>Cancel</Button>
    </BottomSheet>
  );
}
