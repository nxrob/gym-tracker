import { useState, useRef } from 'react';
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
  const swipeRef = useRef<{ x: number | null }>({ x: null });

  function prevMonth() { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }
  function nextMonth() { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }

  function calDays() {
    const firstDow = new Date(calYear, calMonth, 1).getDay(), offset = (firstDow + 6) % 7;
    const dInMonth = new Date(calYear, calMonth + 1, 0).getDate(), dInPrev = new Date(calYear, calMonth, 0).getDate();
    const cells: { d: number; cur: boolean }[] = [];
    for (let i = 0; i < offset; i++) cells.push({ d: dInPrev - offset + 1 + i, cur: false });
    for (let d = 1; d <= dInMonth; d++) cells.push({ d, cur: true });
    while (cells.length % 7 !== 0) cells.push({ d: cells.length - offset - dInMonth + 1, cur: false });
    return cells;
  }

  function onTouchStart(e: React.TouchEvent) { swipeRef.current.x = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (swipeRef.current.x === null) return;
    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
    swipeRef.current.x = null;
    if (Math.abs(dx) > 50) { if (dx < 0) nextMonth(); else prevMonth(); }
  }

  return (
    <div style={{ margin: '0 var(--sp-8) var(--sp-14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-7)' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 'var(--text-3xl)', cursor: 'pointer', padding: 'var(--sp-1) var(--sp-5)', lineHeight: 1 }}>‹</button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', letterSpacing: '.04em' }}>{MONTHS[calMonth]} {calYear}</div>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 'var(--text-3xl)', cursor: 'pointer', padding: 'var(--sp-1) var(--sp-5)', lineHeight: 1 }}>›</button>
      </div>

      <div className="cal-wrap cal-grid" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
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
      </div>

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
