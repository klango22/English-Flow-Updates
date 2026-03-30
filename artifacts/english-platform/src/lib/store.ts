export interface DayProgress {
  day: number;
  week: number;
  xp: number;
  completedTasks: string[];
  totalMinutes: number;
  accuracy: number;
  date: string;
  lessonUnlocked: boolean;
}

export interface WeekProgress {
  week: number;
  totalXP: number;
  daysCompleted: number;
  averageAccuracy: number;
}

export interface AppState {
  currentDay: number;
  currentWeek: number;
  totalXP: number;
  streak: number;
  lastPlayDate: string;
  dayProgress: Record<string, DayProgress>;
  weekProgress: Record<string, WeekProgress>;
  undoStack: UndoEntry[];
}

export interface UndoEntry {
  id: string;
  type: 'task_answer';
  taskId: string;
  previousAnswer: string;
  timestamp: number;
}

const STORAGE_KEY = 'english_platform_v2';
const UNDO_KEY = 'english_platform_undo';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full
  }
}

export function getDefaultState(): AppState {
  return {
    currentDay: 1,
    currentWeek: 1,
    totalXP: 0,
    streak: 0,
    lastPlayDate: '',
    dayProgress: {},
    weekProgress: {},
    undoStack: [],
  };
}

export function masterReset(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(UNDO_KEY);
  window.location.reload();
}

export function resetCurrentWeek(state: AppState): AppState {
  const weekKey = `week_${state.currentWeek}`;
  const newDayProgress = { ...state.dayProgress };
  
  Object.keys(newDayProgress).forEach((key) => {
    if (newDayProgress[key].week === state.currentWeek) {
      delete newDayProgress[key];
    }
  });

  const newWeekProgress = { ...state.weekProgress };
  delete newWeekProgress[weekKey];

  const weeklyXP = state.weekProgress[weekKey]?.totalXP ?? 0;

  const newState: AppState = {
    ...state,
    totalXP: Math.max(0, state.totalXP - weeklyXP),
    dayProgress: newDayProgress,
    weekProgress: newWeekProgress,
    undoStack: [],
  };
  saveState(newState);
  return newState;
}

export function getDayKey(day: number, week: number): string {
  return `w${week}_d${day}`;
}

export function getCurrentDayProgress(state: AppState): DayProgress {
  const key = getDayKey(state.currentDay, state.currentWeek);
  return state.dayProgress[key] ?? {
    day: state.currentDay,
    week: state.currentWeek,
    xp: 0,
    completedTasks: [],
    totalMinutes: 0,
    accuracy: 0,
    date: new Date().toISOString(),
    lessonUnlocked: false,
  };
}

export function updateDayProgress(
  state: AppState,
  updates: Partial<DayProgress>
): AppState {
  const key = getDayKey(state.currentDay, state.currentWeek);
  const current = getCurrentDayProgress(state);
  const updated = { ...current, ...updates };
  
  const newState: AppState = {
    ...state,
    dayProgress: {
      ...state.dayProgress,
      [key]: updated,
    },
  };
  saveState(newState);
  return newState;
}

export function addXP(state: AppState, amount: number): AppState {
  const key = getDayKey(state.currentDay, state.currentWeek);
  const current = getCurrentDayProgress(state);
  const dayXP = current.xp + amount;

  const updatedDayProgress = {
    ...current,
    xp: dayXP,
  };

  const weekKey = `week_${state.currentWeek}`;
  const weekProg = state.weekProgress[weekKey] ?? {
    week: state.currentWeek,
    totalXP: 0,
    daysCompleted: 0,
    averageAccuracy: 0,
  };

  const newState: AppState = {
    ...state,
    totalXP: state.totalXP + amount,
    dayProgress: {
      ...state.dayProgress,
      [key]: updatedDayProgress,
    },
    weekProgress: {
      ...state.weekProgress,
      [weekKey]: {
        ...weekProg,
        totalXP: weekProg.totalXP + amount,
      },
    },
  };
  saveState(newState);
  return newState;
}

export function checkLessonUnlock(dayProgress: DayProgress): boolean {
  return dayProgress.totalMinutes >= 90 && dayProgress.accuracy >= 80;
}

export function canAdvanceToNextLesson(state: AppState): boolean {
  const day = getCurrentDayProgress(state);
  return checkLessonUnlock(day);
}
