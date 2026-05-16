export interface Exercise {
  id: string;
  name: string;
  minSets: number;
  maxSets: number;
  minReps: number;
  maxReps: number;
}

export interface SessionEntry {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Session {
  id: string;
  date: string;
  dayNum: string;
  entries: SessionEntry[];
}

export interface RoutineDay {
  name: string;
  exercises: Exercise[];
}

export interface BodyWeight {
  id: string;
  date: string;
  weight: number;
  photoKey?: string;
}

export interface Target {
  sets?: number;
  reps?: number;
  weight?: number;
}

export interface DraftSession {
  dayNum: string;
  entries: SessionEntry[];
}

export interface AppData {
  routine: Record<string, RoutineDay>;
  sessions: Session[];
  targets: Record<string, Target>;
  draftSession: DraftSession | null;
  bodyWeights: BodyWeight[];
  weightPhotos: Record<string, string>;
}

export type Page = 'home' | 'routine' | 'stats' | 'bodyweight' | 'exercise-detail';
