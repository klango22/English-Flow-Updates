import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@workspace/replit-auth-web';
import {
  AppState,
  CalendarSync,
  loadState,
  saveState,
  getDefaultState,
  masterReset,
  resetCurrentWeek,
  addXP,
  updateDayProgress,
  getCurrentDayProgress,
  canAdvanceToNextLesson,
  getLocalDateStr,
  computeCalendarSync,
} from '@/lib/store';

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';

// ─── Remote progress helpers ──────────────────────────────────────────────────

async function fetchRemoteProgress(): Promise<AppState | null> {
  try {
    const res = await fetch('/api/progress', { credentials: 'include' });
    if (!res.ok) return null;
    const { data } = await res.json() as { data: unknown };
    if (!data || typeof data !== 'object') return null;
    return { ...getDefaultState(), ...(data as Partial<AppState>) };
  } catch {
    return null;
  }
}

async function pushRemoteProgress(state: AppState): Promise<boolean> {
  try {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: state }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── useAppState ──────────────────────────────────────────────────────────────

export function useAppState() {
  // Auth — provided by Replit Auth OIDC
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();

  const [state, setState] = useState<AppState>(() => loadState());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Derived: recomputed on every render so it's always current local-time
  const calendarSync: CalendarSync = computeCalendarSync(state);

  // ── First-launch: stamp startDate, sync currentDay/Week to calendar ──────

  useEffect(() => {
    setState(prev => {
      const today = getLocalDateStr();
      const sync  = computeCalendarSync(prev);
      let next = { ...prev };
      let changed = false;

      if (!next.startDate) { next = { ...next, startDate: today }; changed = true; }

      if (!next.lastPlayDate || next.lastPlayDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = getLocalDateStr(yesterday);
        const streak = next.lastPlayDate === yStr ? next.streak + 1 : 0;
        next = { ...next, streak, lastPlayDate: today };
        changed = true;
      }

      if (next.currentDay !== sync.calendarDay || next.currentWeek !== sync.calendarWeek) {
        next = { ...next, currentDay: sync.calendarDay, currentWeek: sync.calendarWeek };
        changed = true;
      }

      if (changed) { saveState(next); return next; }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Midnight tick ─────────────────────────────────────────────────────────

  const lastDateRef = useRef(getLocalDateStr());

  useEffect(() => {
    const id = setInterval(() => {
      const today = getLocalDateStr();
      if (today !== lastDateRef.current) {
        lastDateRef.current = today;
        setState(prev => {
          const sync = computeCalendarSync({ ...prev, lastPlayDate: today });
          const next = {
            ...prev,
            startDate: prev.startDate || today,
            lastPlayDate: today,
            currentDay: sync.calendarDay,
            currentWeek: sync.calendarWeek,
          };
          saveState(next);
          return next;
        });
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Remote sync: fetch on login ───────────────────────────────────────────
  // When the user logs in, pull their saved progress and hydrate local state.
  // Remote takes precedence over localStorage so progress is never lost.

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || authLoading || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setSyncStatus('syncing');
    fetchRemoteProgress().then(remote => {
      if (remote) {
        // Merge: keep calendar from today's local timestamp, use remote progress data
        const today = getLocalDateStr();
        const sync = computeCalendarSync(remote);
        const merged: AppState = {
          ...remote,
          startDate: remote.startDate || today,
          lastPlayDate: today,
          currentDay: sync.calendarDay,
          currentWeek: sync.calendarWeek,
        };
        saveState(merged);
        setState(merged);
      }
      setSyncStatus('saved');
    });
  }, [isAuthenticated, authLoading]);

  // ── Remote sync: debounced push on state change ───────────────────────────
  // Only push when authenticated. 4-second debounce so rapid interactions
  // (answering exercises quickly) don't hammer the API.

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      setSyncStatus('syncing');
      pushRemoteProgress(state).then(ok => {
        setSyncStatus(ok ? 'saved' : 'error');
      });
    }, 4_000);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [state, isAuthenticated]);

  // ── View-day switching (catch-up mode) ────────────────────────────────────

  const handleViewDay = useCallback((day: number, week: number) => {
    setState(prev => {
      const next = { ...prev, currentDay: day, currentWeek: week };
      saveState(next);
      return next;
    });
  }, []);

  const handleReturnToToday = useCallback(() => {
    setState(prev => {
      const sync = computeCalendarSync(prev);
      const next = { ...prev, currentDay: sync.calendarDay, currentWeek: sync.calendarWeek };
      saveState(next);
      return next;
    });
  }, []);

  // ── Core state handlers ───────────────────────────────────────────────────

  const handleMasterReset = useCallback(() => masterReset(), []);

  const handleWeekReset = useCallback(() => {
    setState(prev => resetCurrentWeek(prev));
  }, []);

  const handleCompleteTask = useCallback((taskId: string, xp: number, correct: boolean) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      if (dayProg.completedTasks.includes(taskId)) return prev;

      const completedTasks = [...dayProg.completedTasks, taskId];
      const total = completedTasks.length;
      const correctCount = correct
        ? Math.round((dayProg.accuracy / 100) * (total - 1)) + 1
        : Math.round((dayProg.accuracy / 100) * (total - 1));
      const newAccuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      const withTasks = updateDayProgress(prev, { completedTasks, accuracy: newAccuracy });
      return addXP(withTasks, correct ? xp : 0);
    });
  }, []);

  const handleAddMinutes = useCallback((minutes: number) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      return updateDayProgress(prev, { totalMinutes: dayProg.totalMinutes + minutes });
    });
  }, []);

  const handleSetMinutes = useCallback((totalMinutes: number) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      if (dayProg.totalMinutes === totalMinutes) return prev;
      return updateDayProgress(prev, { totalMinutes });
    });
  }, []);

  const handleNextDay = useCallback(() => {
    handleReturnToToday();
  }, [handleReturnToToday]);

  const handleUndoLastAnswer = useCallback((taskId: string) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      const completedTasks = dayProg.completedTasks.filter(id => id !== taskId);
      return updateDayProgress(prev, { completedTasks });
    });
  }, []);

  const dayProgress      = getCurrentDayProgress(state);
  const lessonUnlockable = canAdvanceToNextLesson(state);

  const isViewingCatchUpDay =
    state.currentDay  !== calendarSync.calendarDay ||
    state.currentWeek !== calendarSync.calendarWeek;

  return {
    state,
    dayProgress,
    calendarSync,
    lessonUnlockable,
    isViewingCatchUpDay,
    // Auth
    user,
    authLoading,
    isAuthenticated,
    login,
    logout,
    syncStatus,
    // Handlers
    handleMasterReset,
    handleWeekReset,
    handleCompleteTask,
    handleAddMinutes,
    handleSetMinutes,
    handleNextDay,
    handleUndoLastAnswer,
    handleViewDay,
    handleReturnToToday,
  };
}
