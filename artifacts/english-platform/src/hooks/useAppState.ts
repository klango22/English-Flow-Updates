import { useState, useCallback, useEffect, useRef } from 'react';
import {
  AppState,
  CalendarSync,
  loadState,
  saveState,
  masterReset,
  resetCurrentWeek,
  addXP,
  updateDayProgress,
  getCurrentDayProgress,
  canAdvanceToNextLesson,
  getLocalDateStr,
  computeCalendarSync,
} from '@/lib/store';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  // Derived: recomputed on every render so it's always current local-time
  const calendarSync: CalendarSync = computeCalendarSync(state);

  // ── First-launch: stamp startDate & sync currentDay/Week to calendar ────────

  useEffect(() => {
    setState(prev => {
      const today = getLocalDateStr();
      const sync  = computeCalendarSync(prev);

      let next = { ...prev };
      let changed = false;

      // 1. Record start date if missing
      if (!next.startDate) {
        next = { ...next, startDate: today };
        changed = true;
      }

      // 2. Update streak & lastPlayDate
      if (!next.lastPlayDate || next.lastPlayDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = getLocalDateStr(yesterday);

        const streak = next.lastPlayDate === yStr ? next.streak + 1 : 0;
        next = { ...next, streak, lastPlayDate: today };
        changed = true;
      }

      // 3. Sync currentDay / currentWeek to calendar (if not in catch-up view)
      if (
        next.currentDay  !== sync.calendarDay ||
        next.currentWeek !== sync.calendarWeek
      ) {
        next = { ...next, currentDay: sync.calendarDay, currentWeek: sync.calendarWeek };
        changed = true;
      }

      if (changed) {
        saveState(next);
        return next;
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally once on mount

  // ── Midnight tick — re-sync when local date changes ───────────────────────
  // Polls every 60s; on a date change it updates the state so the UI
  // immediately reflects the new calendar day without a page reload.

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
            startDate:    prev.startDate || today,
            lastPlayDate: today,
            currentDay:   sync.calendarDay,
            currentWeek:  sync.calendarWeek,
          };
          saveState(next);
          return next;
        });
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── View-day switching (catch-up mode) ────────────────────────────────────
  // When the user is behind, they can navigate to the incomplete day.
  // We update currentDay/currentWeek in state so the chronometer and
  // all progress functions automatically track the right day.

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

  const handleAddXP = useCallback((amount: number) => {
    setState(prev => addXP(prev, amount));
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

  // Exact absolute value — used by chronometer for drift-free tracking
  const handleSetMinutes = useCallback((totalMinutes: number) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      if (dayProg.totalMinutes === totalMinutes) return prev;
      return updateDayProgress(prev, { totalMinutes });
    });
  }, []);

  const handleNextDay = useCallback(() => {
    // "Next Lesson" just returns to today — the calendar drives the day
    handleReturnToToday();
  }, [handleReturnToToday]);

  const handleUndoLastAnswer = useCallback((taskId: string) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      const completedTasks = dayProg.completedTasks.filter(id => id !== taskId);
      return updateDayProgress(prev, { completedTasks });
    });
  }, []);

  const dayProgress    = getCurrentDayProgress(state);
  const lessonUnlockable = canAdvanceToNextLesson(state);

  // Is the user currently viewing a catch-up day (not today)?
  const isViewingCatchUpDay =
    state.currentDay  !== calendarSync.calendarDay ||
    state.currentWeek !== calendarSync.calendarWeek;

  return {
    state,
    dayProgress,
    calendarSync,
    lessonUnlockable,
    isViewingCatchUpDay,
    handleMasterReset,
    handleWeekReset,
    handleAddXP,
    handleCompleteTask,
    handleAddMinutes,
    handleSetMinutes,
    handleNextDay,
    handleUndoLastAnswer,
    handleViewDay,
    handleReturnToToday,
  };
}
