import { useState, useRef } from 'react';
import type { AppData } from '../types';
import { uuid, fmtShort, todayDateStr } from '../utils';
import { useSwipeBack } from '../hooks/useSwipeBack';

interface BodyWeightPageProps {
  data: AppData;
  persist: (d: AppData) => void;
  showToast: (msg: string) => void;
  goBack: () => void;
}

export default function BodyWeightPage({ data, persist, showToast, goBack }: BodyWeightPageProps) {
  const swipeBack = useSwipeBack(goBack);
  const [logDate, setLogDate] = useState(todayDateStr());
  const [logWeight, setLogWeight] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const bwSorted = [...(data.bodyWeights || [])].sort((a, b) => b.date.localeCompare(a.date));

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => { setPhotoData(ev.target?.result as string); setPhotoKey(uuid()); };
    reader.readAsDataURL(f);
  }

  function logBodyWeight() {
    if (!logWeight || isNaN(+logWeight)) { setErr('Enter a valid weight'); return; }
    const photos = { ...(data.weightPhotos || {}) };
    if (photoData && photoKey) photos[photoKey] = photoData;
    const entry = { id: uuid(), date: logDate, weight: +logWeight, ...(photoKey ? { photoKey } : {}) };
    persist({ ...data, bodyWeights: [...(data.bodyWeights || []), entry], weightPhotos: photos });
    setLogWeight(''); setPhotoData(null); setPhotoKey(null); setErr(''); showToast('Weight logged!');
  }

  const chartEntries = [...(data.bodyWeights || [])].sort((a, b) => a.date.localeCompare(b.date));

  function renderChart() {
    if (chartEntries.length < 2) return null;
    const weights = chartEntries.map(e => e.weight);
    const minW = Math.min(...weights), maxW = Math.max(...weights), range = maxW - minW || 1;
    const W = 320, H = 80, PAD = 8;
    const pts = chartEntries.map((e, i) => {
      const x = PAD + (i / (chartEntries.length - 1)) * (W - 2 * PAD);
      const y = H - PAD - ((e.weight - minW) / range) * (H - 2 * PAD);
      return `${x},${y}`;
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80, display: 'block' }}>
        <polyline points={pts.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
        {chartEntries.map((_, i) => {
          const [x, y] = pts[i].split(',').map(Number);
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />;
        })}
      </svg>
    );
  }

  return (
    <div className="page" {...swipeBack}>
      <div className="back-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <h2>Body Weight</h2>
      </div>
      <div style={{ padding: 'var(--sp-8)' }}>
        <div className="card" style={{ padding: 'var(--sp-8)', marginBottom: 'var(--sp-8)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', letterSpacing: '.06em', color: 'var(--text)', marginBottom: 'var(--sp-6)' }}>LOG WEIGHT</div>
          <div className="form-grid" style={{ marginBottom: 'var(--sp-6)' }}>
            <div>
              <label>Date</label>
              <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} max={todayDateStr()} />
            </div>
            <div>
              <label>Weight (kg)</label>
              <input type="number" step="0.1" placeholder="e.g. 82.5" value={logWeight} onChange={e => { setLogWeight(e.target.value); setErr(''); }} />
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-5)' }} onClick={() => setLogDate(todayDateStr())}>Today ↩</button>
          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <label>Photo (optional)</label>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => photoRef.current?.click()}>
              {photoData ? '📷 Photo selected — tap to change' : '📷 Add a photo'}
            </button>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>
          {photoData && <img src={photoData} alt="preview" style={{ width: '100%', borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-6)', maxHeight: 200, objectFit: 'cover' }} />}
          {err && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-md)', marginBottom: 'var(--sp-4)' }}>{err}</div>}
          <button className="btn btn-accent" style={{ width: '100%', padding: 'var(--sp-7)' }} onClick={logBodyWeight}>Save</button>
        </div>

        {chartEntries.length >= 2 && (
          <div className="card" style={{ marginBottom: 'var(--sp-8)' }}>
            <div className="section-label">WEIGHT OVER TIME</div>
            {renderChart()}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text3)', marginTop: 'var(--sp-2)' }}>
              <span>{fmtShort(chartEntries[0].date)}</span>
              <span>{fmtShort(chartEntries[chartEntries.length - 1].date)}</span>
            </div>
          </div>
        )}

        <div>
          <div className="section-label">ALL ENTRIES</div>
          {bwSorted.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 'var(--text-base)' }}>No entries yet.</div>}
          {bwSorted.map(entry => {
            const photo = (data.weightPhotos || {})[entry.photoKey ?? ''];
            return (
              <div key={entry.id} onClick={() => { if (photo) setViewPhoto(photo); }}
                className="list-row" style={{ cursor: photo ? 'pointer' : 'default' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text3)', minWidth: 72 }}>{fmtShort(entry.date)}</div>
                <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text)' }}>{entry.weight} kg</div>
                {photo && <div style={{ fontSize: 18 }}>🖼</div>}
              </div>
            );
          })}
        </div>
      </div>

      {viewPhoto && (
        <div className="modal-backdrop center" onClick={() => setViewPhoto(null)}>
          <div style={{ maxWidth: 440, width: '100%', padding: '0 var(--sp-8)' }} onClick={e => e.stopPropagation()}>
            <img src={viewPhoto} alt="Progress" style={{ width: '100%', borderRadius: 'var(--r-3xl)', display: 'block' }} />
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--sp-6)' }} onClick={() => setViewPhoto(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
