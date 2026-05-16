import type { AppData } from './types';

export const uuid = (): string => Math.random().toString(36).slice(2, 9);

export const fmtShort = (d: string): string =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const toDateStr = (d: Date | string): string => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

export const todayDateStr = (): string => toDateStr(new Date());

export function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function exportCSV(data: AppData): void {
  const q = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const row = (r: unknown[]) => r.map(q).join(',');
  const rr = [row(['sheet', 'day_num', 'day_name', 'exercise_id', 'exercise_name', 'min_sets', 'max_sets', 'min_reps', 'max_reps'])];
  Object.entries(data.routine).forEach(([d, day]) =>
    (day.exercises || []).forEach(ex =>
      rr.push(row(['routine', d, day.name || '', ex.id, ex.name, ex.minSets, ex.maxSets, ex.minReps, ex.maxReps]))
    )
  );
  const sr = [row(['sheet', 'session_id', 'date', 'day_num', 'exercise_id', 'sets', 'reps', 'weight_kg'])];
  data.sessions.forEach(s =>
    (s.entries || []).forEach(e =>
      sr.push(row(['session', s.id, s.date, s.dayNum, e.exerciseId, e.sets, e.reps, e.weight ?? '']))
    )
  );
  const tr = [row(['sheet', 'exercise_id', 'target_sets', 'target_reps', 'target_weight_kg'])];
  Object.entries(data.targets || {}).forEach(([id, t]) =>
    tr.push(row(['target', id, t.sets ?? '', t.reps ?? '', t.weight ?? '']))
  );
  const bw = [row(['sheet', 'bw_id', 'date', 'weight_kg'])];
  (data.bodyWeights || []).forEach(w => bw.push(row(['bodyweight', w.id, w.date, w.weight])));
  const csv = [...rr, '', ...sr, '', ...tr, '', ...bw].join('\n');
  Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: `lift-${new Date().toISOString().slice(0, 10)}.csv`,
  }).click();
}

export function parseCSV(text: string): Partial<AppData> {
  const blocks = text.trim().split(/\n[ \t]*\n/);
  function pb(b: string): Record<string, string>[] {
    const lines = b.trim().split('\n');
    const hdrs = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const vals: string[] = [];
      let cur = '', inQ = false;
      for (const c of line) {
        if (c === '"') inQ = !inQ;
        else if (c === ',' && !inQ) { vals.push(cur); cur = ''; }
        else cur += c;
      }
      vals.push(cur);
      return Object.fromEntries(hdrs.map((h, i) => [h, vals[i] ?? '']));
    });
  }
  const [b0, b1, b2, b3] = blocks;
  const rr = b0 ? pb(b0) : [], sr = b1 ? pb(b1) : [], tr = b2 ? pb(b2) : [], bwr = b3 ? pb(b3) : [];
  const routine: AppData['routine'] = {};
  rr.filter(r => r['sheet'] === 'routine').forEach(r => {
    if (!routine[r['day_num']]) routine[r['day_num']] = { name: r['day_name'], exercises: [] };
    routine[r['day_num']].exercises.push({
      id: r['exercise_id'], name: r['exercise_name'],
      minSets: +r['min_sets'], maxSets: +r['max_sets'],
      minReps: +r['min_reps'], maxReps: +r['max_reps'],
    });
  });
  const sm: Record<string, AppData['sessions'][0]> = {};
  sr.filter(r => r['sheet'] === 'session').forEach(r => {
    if (!sm[r['session_id']]) sm[r['session_id']] = { id: r['session_id'], date: r['date'], dayNum: r['day_num'], entries: [] };
    sm[r['session_id']].entries.push({
      exerciseId: r['exercise_id'], sets: +r['sets'], reps: +r['reps'],
      weight: r['weight_kg'] !== '' ? +r['weight_kg'] : 0,
    });
  });
  const targets: AppData['targets'] = {};
  tr.filter(r => r['sheet'] === 'target').forEach(r => {
    targets[r['exercise_id']] = {
      sets: r['target_sets'] !== '' ? +r['target_sets'] : undefined,
      reps: r['target_reps'] !== '' ? +r['target_reps'] : undefined,
      weight: r['target_weight_kg'] !== '' ? +r['target_weight_kg'] : undefined,
    };
  });
  const bodyWeights = bwr
    .filter(r => r['sheet'] === 'bodyweight')
    .map(r => ({ id: r['bw_id'], date: r['date'], weight: +r['weight_kg'] }));
  return { routine, sessions: Object.values(sm), targets, bodyWeights };
}
