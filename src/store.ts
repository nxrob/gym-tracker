import type { AppData } from './types';

const STORE_KEY = 'lift_data_v4';

export const INITIAL: AppData = {
  routine: {},
  sessions: [],
  targets: {},
  draftSession: null,
  bodyWeights: [],
  weightPhotos: {},
};

export function load(): Partial<AppData> {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null') || {}; }
  catch { return {}; }
}

export function save(d: AppData): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(d));
}
