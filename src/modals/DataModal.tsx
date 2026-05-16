import { useRef, useState } from 'react';
import type { AppData } from '../types';
import { exportCSV, parseCSV } from '../utils';
import { INITIAL } from '../store';

interface DataModalProps {
  data: AppData;
  persist: (d: AppData) => void;
  showToast: (msg: string) => void;
  onClose: () => void;
}

export default function DataModal({ data, persist, showToast, onClose }: DataModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ p: Partial<AppData>; dc: number; sc: number } | null>(null);
  const [err, setErr] = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; setErr(''); setPreview(null);
    const r = new FileReader();
    r.onload = ev => {
      try {
        const p = parseCSV(ev.target?.result as string);
        const dc = Object.keys(p.routine ?? {}).length, sc = p.sessions?.length ?? 0;
        if (!dc && !sc) { setErr('No valid data found.'); return; }
        setPreview({ p, dc, sc });
      } catch { setErr('Could not parse file.'); }
    };
    r.readAsText(f);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Data Backup</div>
        <div className="card" style={{ marginBottom: 'var(--sp-7)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', letterSpacing: '.05em', marginBottom: 'var(--sp-3)' }}>EXPORT</div>
          <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginBottom: 'var(--sp-6)' }}>Download all your data as a CSV.</div>
          <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => { exportCSV(data); showToast('Exported!'); }}>↓ Export CSV</button>
        </div>
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', letterSpacing: '.05em', marginBottom: 'var(--sp-3)' }}>IMPORT</div>
          <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginBottom: 'var(--sp-6)' }}>Restore from backup. <span style={{ color: 'var(--danger)' }}>Replaces all data.</span></div>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => fileRef.current?.click()}>↑ Choose CSV</button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
          {err && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-md)', marginTop: 'var(--sp-5)' }}>{err}</div>}
          {preview && (
            <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-6)', background: 'var(--surface3)', borderRadius: 'var(--r-md)' }}>
              <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginBottom: 'var(--sp-5)' }}>Found <b style={{ color: 'var(--accent)' }}>{preview.dc} days</b> and <b style={{ color: 'var(--accent)' }}>{preview.sc} sessions</b>.</div>
              <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => { persist({ ...INITIAL, ...preview.p } as AppData); onClose(); showToast('Imported!'); }}>Confirm Import</button>
            </div>
          )}
        </div>
        <button className="btn btn-ghost" style={{ width: '100%', padding: 'var(--sp-7)', marginTop: 'var(--sp-6)' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
