import { useState, useCallback, useEffect } from 'react';
import {
  AppState,
  loadState,
  saveState,
  masterReset,
  resetCurrentWeek,
  addXP,
  updateDayProgress,
  getCurrentDayProgress,
  canAdvanceToNextLesson,
  getDayKey,
} from '@/lib/store';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastPlayDate && state.lastPlayDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (state.lastPlayDate === yesterday.toDateString()) {
        setState(prev => {
          const next = { ...prev, streak: prev.streak + 1, lastPlayDate: today };
          saveState(next);
          return next;
        });
      } else {
        setState(prev => {
          const next = { ...prev, streak: 0, lastPlayDate: today };
          saveState(next);
          return next;
        });
      }
    } else if (!state.lastPlayDate) {
      setState(prev => {
        const next = { ...prev, lastPlayDate: today };
        saveState(next);
        return next;
      });
    }
  }, []);

  const handleMasterReset = useCallback(() => {
    masterReset();
  }, []);

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

      const withTasks = updateDayProgress(prev, {
        completedTasks,
        accuracy: newAccuracy,
      });
      
      const withXP = addXP(withTasks, correct ? xp : 0);
      return withXP;
    });
  }, []);

  const handleAddMinutes = useCallback((minutes: number) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      return updateDayProgress(prev, {
        totalMinutes: dayProg.totalMinutes + minutes,
      });
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setState(prev => {
      if (!canAdvanceToNextLesson(prev)) return prev;
      
      const nextDay = prev.currentDay + 1;
      const nextWeek = nextDay > 7 ? prev.currentWeek + 1 : prev.currentWeek;
      const actualDay = nextDay > 7 ? 1 : nextDay;

      const next = {
        ...prev,
        currentDay: actualDay,
        currentWeek: nextWeek,
      };
      saveState(next);
      return next;
    });
  }, []);

  const handleUndoLastAnswer = useCallback((taskId: string) => {
    setState(prev => {
      const dayProg = getCurrentDayProgress(prev);
      const completedTasks = dayProg.completedTasks.filter(id => id !== taskId);
      return updateDayProgress(prev, { completedTasks });
    });
  }, []);

  const dayProgress = getCurrentDayProgress(state);
  const lessonUnlockable = canAdvanceToNextLesson(state);

  return {
    state,
    dayProgress,
    lessonUnlockable,
    handleMasterReset,
    handleWeekReset,
    handleAddXP,
    handleCompleteTask,
    handleAddMinutes,
    handleNextDay,
    handleUndoLastAnswer,
  };
}
