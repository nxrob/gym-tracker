import { useState, useMemo } from 'react';
import { animated } from '@react-spring/web';
import type { AppData, Page, SessionEntry } from '../types';
import { uuid, toDateStr, greeting } from '../utils';
import { useButtonPress } from '../hooks/useButtonPress';
import Calendar from '../components/Calendar';
import DraftBanner from '../components/DraftBanner';
import RecentSessions from '../components/RecentSessions';
import WorkoutModal from '../modals/WorkoutModal';
import CalDayModal from '../modals/CalDayModal';
import DataModal from '../modals/DataModal';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/button';

interface HomePageProps {
  data: AppData;
  persist: (d: AppData) => void;
  showToast: (msg: string) => void;
  go: (page: Page, ctx?: string | null) => void;
}

function ActionButton({ icon, label, action, accent }: { icon: string; label: string; action: () => void; accent: boolean }) {
  const { spring, handlers } = useButtonPress();
  return (
    <animated.button onClick={action} style={{ scale: spring.scale, background: accent ? 'var(--accent)' : 'var(--surface)', color: accent ? 'var(--on-accent)' : 'var(--text)', border: accent ? 'none' : '1px solid var(--border)', borderRadius: 'var(--r-2xl)', padding: '18px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)' }} {...handlers}>
      <span style={{ fontSize: 'var(--text-4xl)' }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', letterSpacing: '.04em', textAlign: 'center', textTransform: 'uppercase', whiteSpace: 'pre-line', lineHeight: 1.15 }}>{label}</span>
    </animated.button>
  );
}

export default function HomePage({ data, persist, showToast, go }: HomePageProps) {
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [dayPickOpen, setDayPickOpen] = useState(false);
  const [calModal, setCalModal] = useState<{ dateStr: string; isPast: boolean; hasSessions: boolean } | null>(null);
  const [dataModal, setDataModal] = useState(false);
  const now = new Date(), todayStr = toDateStr(now);
  const dayNums = Object.keys(data.routine).sort();
  const hasDraft = !!data.draftSession;

  const sessionsByDate = useMemo(() => {
    const m: Record<string, typeof data.sessions> = {};
    data.sessions.forEach(s => { const d = toDateStr(s.date); if (!m[d]) m[d] = []; m[d].push(s); });
    return m;
  }, [data.sessions]);

  function getLatest(exerciseId: string, dayNum: string): (SessionEntry & { date: string }) | null {
    for (let i = 0; i < data.sessions.length; i++) {
      const s = data.sessions[i];
      if (String(s.dayNum) === String(dayNum)) {
        const e = s.entries?.find(e => e.exerciseId === exerciseId);
        if (e) return { ...e, date: s.date };
      }
    }
    return null;
  }

  function startDraft(dayNum: string) {
    const exs = data.routine[dayNum]?.exercises || [];
    const entries = exs.map(ex => {
      const prev = getLatest(ex.id, dayNum), t = data.targets[ex.id] || {};
      return { exerciseId: ex.id, sets: t.sets ?? prev?.sets ?? ex.minSets, reps: t.reps ?? prev?.reps ?? ex.minReps, weight: t.weight ?? prev?.weight ?? 0 };
    });
    persist({ ...data, draftSession: { dayNum, entries } });
    setDayPickOpen(false); setWorkoutOpen(true);
  }

  function handleLogClick() {
    if (hasDraft) { setWorkoutOpen(true); return; }
    if (!dayNums.length) { showToast('Set up your routine first'); go('routine'); return; }
    if (dayNums.length === 1) startDraft(dayNums[0]); else setDayPickOpen(true);
  }

  function updateDraftEntry(exId: string, field: 'sets' | 'reps' | 'weight', val: number) {
    if (!data.draftSession) return;
    persist({ ...data, draftSession: { ...data.draftSession, entries: data.draftSession.entries.map(e => e.exerciseId === exId ? { ...e, [field]: val } : e) } });
  }

  function commitSession() {
    if (!data.draftSession) return;
    const session = { id: uuid(), date: new Date().toISOString(), dayNum: data.draftSession.dayNum, entries: data.draftSession.entries };
    const sorted = [...data.sessions, session].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    persist({ ...data, sessions: sorted, draftSession: null });
    setWorkoutOpen(false); showToast('Workout saved!');
  }

  function discardDraft() { persist({ ...data, draftSession: null }); setWorkoutOpen(false); }

  function handleCalDayClick(ds: string) {
    setCalModal({ dateStr: ds, isPast: ds < todayStr, hasSessions: !!sessionsByDate[ds] });
  }

  const ACTION_BTNS = [
    { icon: '🏋️', label: hasDraft ? 'Continue\nWorkout' : 'Log a\nWorkout', action: handleLogClick, accent: true },
    { icon: '📋', label: 'My\nRoutine', action: () => go('routine'), accent: false },
    { icon: '📊', label: 'Stats', action: () => go('stats'), accent: false },
  ];

  const sortedSessions = useMemo(() => [...data.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [data.sessions]);
  const nextDueDay = useMemo(() => {
    if (!dayNums.length) return null;
    if (!sortedSessions.length) return dayNums[0];
    const idx = dayNums.indexOf(String(sortedSessions[0].dayNum));
    return dayNums[(idx === -1 ? 0 : idx + 1) % dayNums.length];
  }, [dayNums, sortedSessions]);

  return (
    <div className="page">
      <div style={{ padding: 'var(--sp-18) var(--sp-10) var(--sp-10)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontWeight: 700, letterSpacing: '.01em', lineHeight: 1.1 }}>
            {greeting()},<br /><span style={{ color: 'var(--accent)' }}>Nico.</span>
          </h1>
        </div>
        <Button variant="ghost" size="sm" style={{ marginTop: 4 }} onClick={() => setDataModal(true)}>⇅</Button>
      </div>

      {hasDraft && <DraftBanner draft={data.draftSession!} routine={data.routine} onResume={() => setWorkoutOpen(true)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-5)', padding: '0 var(--sp-8) var(--sp-14)' }}>
        {ACTION_BTNS.map(btn => <ActionButton key={btn.label} {...btn} />)}
      </div>

      <Calendar sessionsByDate={sessionsByDate} todayStr={todayStr} onDayClick={handleCalDayClick} />

      <RecentSessions
        sessions={data.sessions}
        routine={data.routine}
        todayStr={todayStr}
        onSessionClick={(dateStr, isPast) => setCalModal({ dateStr, isPast, hasSessions: true })}
      />

      {dayPickOpen && (
        <BottomSheet onClose={() => setDayPickOpen(false)}>
          <div className="modal-title">Which day?</div>
          <div className="modal-sub">Choose the routine day you're training.</div>
          {dayNums.map(d => {
            const isDue = d === nextDueDay;
            return (
              <button key={d} onClick={() => startDraft(d)}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: isDue ? 'var(--accent-muted)' : 'var(--surface2)', border: isDue ? '1px solid var(--accent-border-strong)' : '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-7) var(--sp-8)', marginBottom: 'var(--sp-5)', cursor: 'pointer', gap: 'var(--sp-1)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', letterSpacing: '.04em', color: isDue ? 'var(--accent)' : 'var(--text)' }}>
                  {data.routine[d]?.name || `Day ${d}`}
                  {isDue && <span style={{ marginLeft: 'var(--sp-4)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', background: 'var(--accent)', color: 'var(--on-accent)', borderRadius: 'var(--r-sm)', padding: '2px 6px', verticalAlign: 'middle', letterSpacing: '.04em' }}>UP NEXT</span>}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--text3)' }}>{(data.routine[d]?.exercises || []).map(e => e.name).join(', ')}</span>
              </button>
            );
          })}
          <Button variant="ghost" className="w-full py-6" onClick={() => setDayPickOpen(false)}>Cancel</Button>
        </BottomSheet>
      )}

      {workoutOpen && data.draftSession && (
        <WorkoutModal data={data} draft={data.draftSession} getLatest={getLatest}
          onUpdate={updateDraftEntry} onSave={commitSession} onDiscard={discardDraft} onClose={() => setWorkoutOpen(false)} />
      )}

      {calModal && (
        <CalDayModal
          dateStr={calModal.dateStr} isPast={calModal.isPast} hasSessions={calModal.hasSessions}
          sessions={sessionsByDate[calModal.dateStr] || []} data={data} persist={persist} showToast={showToast}
          dayNums={dayNums} onClose={() => setCalModal(null)}
        />
      )}

      {dataModal && <DataModal data={data} persist={persist} showToast={showToast} onClose={() => setDataModal(false)} />}
    </div>
  );
}
