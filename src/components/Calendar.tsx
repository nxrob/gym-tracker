import { useState, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import type { Session } from '../types';

interface CalendarProps {
  sessionsByDate: Record<string, Session[]>;
  todayStr: string;
  onDayClick: (dateStr: string) => void;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar({ sessionsByDate, todayStr, onDayClick }: CalendarProps) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [{ x }, api] = useSpring(() => ({ x: 0, config: { tension: 300, friction: 28 } }));

  const prevMonth = useCallback(() => {
    setCalMonth(m => { if (m === 0) { setCalYear(y => y - 1); return 11; } return m - 1; });
  }, []);
  const nextMonth = useCallback(() => {
    setCalMonth(m => { if (m === 11) { setCalYear(y => y + 1); return 0; } return m + 1; });
  }, []);

  const slideAndChange = useCallback((dir: 1 | -1) => {
    const w = 320;
    api.start({ x: dir * -w, immediate: false, onRest: () => {
      if (dir === 1) nextMonth(); else prevMonth();
      api.set({ x: dir * w });
      api.start({ x: 0 });
    }});
  }, [api, nextMonth, prevMonth]);

  const bind = useDrag(
    ({ offset: [ox], velocity: [vx], last, direction: [dx] }) => {
      if (last) {
        if (Math.abs(ox) > 50 || Math.abs(vx) > 0.4) {
          slideAndChange(dx < 0 ? 1 : -1);
        } else {
          api.start({ x: 0 });
        }
      } else {
        api.start({ x: ox, immediate: true });
      }
    },
    { axis: 'x', filterTaps: true }
  );

  function calDays() {
    const firstDow = new Date(calYear, calMonth, 1).getDay(), offset = (firstDow + 6) % 7;
    const dInMonth = new Date(calYear, calMonth + 1, 0).getDate(), dInPrev = new Date(calYear, calMonth, 0).getDate();
    const cells: { d: number; cur: boolean }[] = [];
    for (let i = 0; i < offset; i++) cells.push({ d: dInPrev - offset + 1 + i, cur: false });
    for (let d = 1; d <= dInMonth; d++) cells.push({ d, cur: true });
    while (cells.length % 7 !== 0) cells.push({ d: cells.length - offset - dInMonth + 1, cur: false });
    return cells;
  }

  return (
    <div style={{ margin: '0 var(--sp-8) var(--sp-14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-7)' }}>
        <button onClick={() => slideAndChange(-1)} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 'var(--text-3xl)', cursor: 'pointer', padding: 'var(--sp-1) var(--sp-5)', lineHeight: 1 }}>‹</button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', letterSpacing: '.04em' }}>{MONTHS[calMonth]} {calYear}</div>
        <button onClick={() => slideAndChange(1)} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 'var(--text-3xl)', cursor: 'pointer', padding: 'var(--sp-1) var(--sp-5)', lineHeight: 1 }}>›</button>
      </div>

      <animated.div {...bind()} style={{ x, touchAction: 'pan-y', userSelect: 'none' }} className="cal-grid">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="cal-dow">{d}</div>)}
        {calDays().map((cell, i) => {
          if (!cell.cur) return <div key={i} className="cal-day other-month">{cell.d}</div>;
          const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(cell.d).padStart(2, '0')}`;
          const hasLog = !!sessionsByDate[ds], isToday = ds === todayStr, isPast = ds < todayStr, isFuture = ds > todayStr;
          let cls = 'cal-day';
          if (hasLog) cls += ' has-log clickable';
          else if (isPast) cls += ' past-empty';
          if (isToday) cls += ' today';
          if (isFuture) cls += ' other-month';
          return <div key={i} className={cls} onClick={() => !isFuture && onDayClick(ds)}>{cell.d}</div>;
        })}
      </animated.div>

      <div style={{ marginTop: 'var(--sp-5)', display: 'flex', gap: 'var(--sp-8)', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-xs)', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} /> logged
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-xs)', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 'var(--r-sm)', border: '1px solid var(--accent)', opacity: 0.4, display: 'inline-block' }} /> today
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-xs)', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 'var(--r-sm)', background: 'var(--surface2)', display: 'inline-block' }} /> tap to add
        </div>
      </div>
    </div>
  );
}
