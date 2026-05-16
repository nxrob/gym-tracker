import { useState } from 'react';
import { flushSync } from 'react-dom';
import type { AppData } from '../types';
import { exportCSV, parseCSV } from '../utils';
import { INITIAL } from '../store';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/button';

interface DataModalProps {
  data: AppData;
  persist: (d: AppData) => void;
  showToast: (msg: string) => void;
  onClose: () => void;
}

export default function DataModal({ data, persist, showToast, onClose }: DataModalProps) {
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
    <BottomSheet onClose={onClose}>
      <div className="modal-title" style={{ marginBottom: 'var(--sp-8)' }}>Data Backup</div>
      <div className="card" style={{ marginBottom: 'var(--sp-7)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', letterSpacing: '.05em', marginBottom: 'var(--sp-3)' }}>EXPORT</div>
        <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginBottom: 'var(--sp-6)' }}>Download all your data as a CSV.</div>
        <Button className="w-full" onClick={() => { exportCSV(data); showToast('Exported!'); }}>↓ Export CSV</Button>
      </div>
      <div className="card">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', letterSpacing: '.05em', marginBottom: 'var(--sp-3)' }}>IMPORT</div>
        <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginBottom: 'var(--sp-6)' }}>Restore from backup. <span style={{ color: 'var(--danger)' }}>Replaces all data.</span></div>
        {/* Use <label> instead of Button + programmatic .click() — label activation is
            always a trusted gesture on mobile, so the file picker opens reliably. */}
        <label style={{ display: 'block', width: '100%', textAlign: 'center', cursor: 'pointer', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--sp-5) var(--sp-8)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-base)', letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text2)' }}>
          ↑ Choose CSV
          <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        </label>
        {err && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-md)', marginTop: 'var(--sp-5)' }}>{err}</div>}
        {preview && (
          <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-6)', background: 'var(--surface3)', borderRadius: 'var(--r-md)' }}>
            <div style={{ fontSize: 'var(--text-md)', color: 'var(--text2)', marginBottom: 'var(--sp-5)' }}>Found <b style={{ color: 'var(--accent)' }}>{preview.dc} days</b> and <b style={{ color: 'var(--accent)' }}>{preview.sc} sessions</b>.</div>
            <Button className="w-full" onClick={() => {
              const imported = preview.p;
              // flushSync forces the modal to unmount synchronously before
              // persist runs its blocking JSON.stringify + localStorage write.
              flushSync(() => { onClose(); });
              persist({ ...INITIAL, ...imported } as AppData);
              showToast('Imported!');
            }}>Confirm Import</Button>
          </div>
        )}
      </div>
      <Button variant="ghost" className="w-full py-7 mt-4" onClick={onClose}>Close</Button>
    </BottomSheet>
  );
}
