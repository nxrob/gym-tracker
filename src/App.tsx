import { useState, useCallback } from 'react';
import { INITIAL, load, save } from './store';
import type { AppData, Page } from './types';
import HomePage from './pages/HomePage';
import RoutinePage from './pages/RoutinePage';
import StatsPage from './pages/StatsPage';
import BodyWeightPage from './pages/BodyWeightPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import { showToast } from './lib/toast';

export default function App() {
  const [data, setData] = useState<AppData>(() => ({ ...INITIAL, ...load() }));
  const [page, setPage] = useState<Page>('home');
  const [pageCtx, setPageCtx] = useState<string | null>(null);

  const persist = useCallback((d: AppData) => { setData(d); save(d); }, []);
  function go(p: Page, ctx: string | null = null) { setPage(p); setPageCtx(ctx); }

  return (
    <div>
      {page === 'home'      && <HomePage      data={data} persist={persist} showToast={showToast} go={go} />}
      {page === 'routine'   && <RoutinePage   data={data} persist={persist} showToast={showToast} goBack={() => go('home')} />}
      {page === 'stats'     && <StatsPage     data={data} persist={persist} showToast={showToast} go={go} />}
      {page === 'bodyweight'&& <BodyWeightPage data={data} persist={persist} showToast={showToast} goBack={() => go('stats')} />}
      {page === 'exercise-detail' && <ExerciseDetailPage data={data} exerciseId={pageCtx!} goBack={() => go('stats')} />}
    </div>
  );
}
