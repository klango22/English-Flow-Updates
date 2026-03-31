// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  startDate: string;       // 'YYYY-MM-DD' — set once on first ever launch
  currentDay: number;      // 1–7, tracks the currently *viewed* lesson day
  currentWeek: number;     // 1, 2, 3… tracks the currently *viewed* week
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

/** Derived calendar state — computed on every render, never stored. */
export interface CalendarSync {
  /** 0-indexed days elapsed since startDate (0 = Day 1). */
  absoluteDay: number;
  /** 1–7 position in the current week, derived from today's date. */
  calendarDay: number;
  /** Current week number derived from today's date. */
  calendarWeek: number;
  /** True if at least one earlier day is not yet completed. */
  isBehind: boolean;
  /** Absolute index of the oldest incomplete past day (when isBehind). */
  behindAbsoluteDay: number;
  /** 1–7 day number of the oldest incomplete past day (when isBehind). */
  behindDay: number;
  /** Week number of the oldest incomplete past day (when isBehind). */
  behindWeek: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'english_platform_v2';
const UNDO_KEY = 'english_platform_undo';

// ─── Date helpers — always use local timezone ─────────────────────────────────

/**
 * Returns today's date as a YYYY-MM-DD string in the device's local timezone.
 * This ensures the "day" flips at local midnight, not UTC midnight.
 */
export function getLocalDateStr(date: Date = new Date()): string {
  // toLocaleDateString('en-CA') reliably gives YYYY-MM-DD in all browsers
  return date.toLocaleDateString('en-CA');
}

/**
 * Returns the number of whole calendar days between two YYYY-MM-DD strings,
 * treating each as local-timezone midnight so there's no DST drift.
 */
export function daysBetween(startStr: string, endStr: string): number {
  const start = new Date(`${startStr}T00:00:00`);
  const end   = new Date(`${endStr}T00:00:00`);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86_400_000));
}

// ─── State helpers ─────────────────────────────────────────────────────────────

export function getDefaultState(): AppState {
  return {
    startDate:    '',
    currentDay:   1,
    currentWeek:  1,
    totalXP:      0,
    streak:       0,
    lastPlayDate: '',
    dayProgress:  {},
    weekProgress: {},
    undoStack:    [],
  };
}

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
  } catch { /* storage full */ }
}

export function masterReset(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(UNDO_KEY);
  window.location.reload();
}

export function resetCurrentWeek(state: AppState): AppState {
  const weekKey = `week_${state.currentWeek}`;
  const newDayProgress = { ...state.dayProgress };

  Object.keys(newDayProgress).forEach(key => {
    if (newDayProgress[key].week === state.currentWeek) delete newDayProgress[key];
  });

  const newWeekProgress = { ...state.weekProgress };
  delete newWeekProgress[weekKey];

  const weeklyXP = state.weekProgress[weekKey]?.totalXP ?? 0;
  const next: AppState = {
    ...state,
    totalXP: Math.max(0, state.totalXP - weeklyXP),
    dayProgress: newDayProgress,
    weekProgress: newWeekProgress,
    undoStack: [],
  };
  saveState(next);
  return next;
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
    date: getLocalDateStr(),
    lessonUnlocked: false,
  };
}

export function updateDayProgress(state: AppState, updates: Partial<DayProgress>): AppState {
  const key = getDayKey(state.currentDay, state.currentWeek);
  const current = getCurrentDayProgress(state);
  const next: AppState = {
    ...state,
    dayProgress: { ...state.dayProgress, [key]: { ...current, ...updates } },
  };
  saveState(next);
  return next;
}

export function addXP(state: AppState, amount: number): AppState {
  const key = getDayKey(state.currentDay, state.currentWeek);
  const current = getCurrentDayProgress(state);
  const weekKey = `week_${state.currentWeek}`;
  const weekProg = state.weekProgress[weekKey] ?? {
    week: state.currentWeek, totalXP: 0, daysCompleted: 0, averageAccuracy: 0,
  };
  const next: AppState = {
    ...state,
    totalXP: state.totalXP + amount,
    dayProgress: { ...state.dayProgress, [key]: { ...current, xp: current.xp + amount } },
    weekProgress: { ...state.weekProgress, [weekKey]: { ...weekProg, totalXP: weekProg.totalXP + amount } },
  };
  saveState(next);
  return next;
}

export function checkLessonUnlock(dayProgress: DayProgress): boolean {
  return dayProgress.totalMinutes >= 90 && dayProgress.accuracy >= 80;
}

export function canAdvanceToNextLesson(state: AppState): boolean {
  return checkLessonUnlock(getCurrentDayProgress(state));
}

// ─── Calendar sync ────────────────────────────────────────────────────────────

/**
 * Derives the full calendar sync state from the stored AppState.
 * Never stored — always computed fresh so it reflects device local time.
 */
export function computeCalendarSync(state: AppState): CalendarSync {
  const today = getLocalDateStr();
  const start = state.startDate || today;
  const absoluteDay = daysBetween(start, today); // 0 on Day 1

  const calendarWeek = Math.floor(absoluteDay / 7) + 1;
  const calendarDay  = (absoluteDay % 7) + 1;       // 1–7

  // Scan every previous day (oldest first) for the first incomplete one
  let isBehind = false;
  let behindAbsoluteDay = 0;
  let behindDay  = 1;
  let behindWeek = 1;

  for (let d = 0; d < absoluteDay; d++) {
    const w   = Math.floor(d / 7) + 1;
    const day = (d % 7) + 1;
    const key = getDayKey(day, w);
    const prog = state.dayProgress[key];
    if (!prog || !checkLessonUnlock(prog)) {
      isBehind          = true;
      behindAbsoluteDay = d;
      behindDay         = day;
      behindWeek        = w;
      break;
    }
  }

  return { absoluteDay, calendarDay, calendarWeek, isBehind, behindAbsoluteDay, behindDay, behindWeek };
}
