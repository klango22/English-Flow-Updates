import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@workspace/replit-auth-web";
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
} from "@/lib/store";

export type SyncStatus = "idle" | "syncing" | "saved" | "error";

async function fetchRemoteProgress(): Promise<AppState | null> {
  try {
    const res = await fetch("/api/progress", { credentials: "include" });
    if (!res.ok) return null;
    const { data } = (await res.json()) as { data: unknown };
    if (!data || typeof data !== "object") return null;
    return { ...getDefaultState(), ...(data as Partial<AppState>) };
  } catch {
    return null;
  }
}

async function pushRemoteProgress(state: AppState): Promise<boolean> {
  try {
    const res = await fetch("/api/progress", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: state }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useAppState() {
  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    login,
    logout,
  } = useAuth();
  const [state, setState] = useState<AppState>(() => loadState());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const calendarSync: CalendarSync = computeCalendarSync(state);

  // ── First-launch: stamp startDate ─────────────────────────────────────────
  useEffect(() => {
    setState((prev) => {
      const today = getLocalDateStr();
      let next = { ...prev };
      let changed = false;

      // Novo usuário ou após reset — começa do Dia 1 hoje
      if (!next.startDate) {
        next = { ...next, startDate: today, currentDay: 1, currentWeek: 1 };
        changed = true;
      } else {
        // Usuário existente — sincroniza dia/semana com calendário
        const freshSync = computeCalendarSync(next);
        if (
          next.currentDay !== freshSync.calendarDay ||
          next.currentWeek !== freshSync.calendarWeek
        ) {
          next = {
            ...next,
            currentDay: freshSync.calendarDay,
            currentWeek: freshSync.calendarWeek,
          };
          changed = true;
        }
      }

      if (!next.lastPlayDate || next.lastPlayDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = getLocalDateStr(yesterday);
        const streak = next.lastPlayDate === yStr ? next.streak + 1 : 0;
        next = { ...next, streak, lastPlayDate: today };
        changed = true;
      }

      if (changed) {
        saveState(next);
        return next;
      }
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
        setState((prev) => {
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
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || authLoading || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setSyncStatus("syncing");
    fetchRemoteProgress().then((remote) => {
      if (remote && remote.startDate) {
        const today = getLocalDateStr();
        const sync = computeCalendarSync(remote);
        const merged: AppState = {
          ...remote,
          lastPlayDate: today,
          currentDay: sync.calendarDay,
          currentWeek: sync.calendarWeek,
        };
        saveState(merged);
        setState(merged);
      } else {
        // Sem progresso remoto — mantém estado local (já iniciado em Dia 1)
      }
      setSyncStatus("saved");
    });
  }, [isAuthenticated, authLoading]);

  // ── Remote sync: debounced push ───────────────────────────────────────────
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      setSyncStatus("syncing");
      pushRemoteProgress(state).then((ok) => {
        setSyncStatus(ok ? "saved" : "error");
      });
    }, 4_000);
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [state, isAuthenticated]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleViewDay = useCallback((day: number, week: number) => {
    setState((prev) => {
      const next = { ...prev, currentDay: day, currentWeek: week };
      saveState(next);
      return next;
    });
  }, []);

  const handleReturnToToday = useCallback(() => {
    setState((prev) => {
      const sync = computeCalendarSync(prev);
      const next = {
        ...prev,
        currentDay: sync.calendarDay,
        currentWeek: sync.calendarWeek,
      };
      saveState(next);
      return next;
    });
  }, []);

  const handleMasterReset = useCallback(async () => {
    if (isAuthenticated) {
      const today = getLocalDateStr();
      const fresh = {
        ...getDefaultState(),
        startDate: today,
        lastPlayDate: today,
      };
      await fetch("/api/progress", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: fresh }),
      });
    }
    masterReset();
  }, [isAuthenticated]);

  const handleWeekReset = useCallback(() => {
    setState((prev) => resetCurrentWeek(prev));
  }, []);

  const handleCompleteTask = useCallback(
    (taskId: string, xp: number, correct: boolean) => {
      setState((prev) => {
        const dayProg = getCurrentDayProgress(prev);
        if (dayProg.completedTasks.includes(taskId)) return prev;
        const completedTasks = [...dayProg.completedTasks, taskId];
        const total = completedTasks.length;
        const correctCount = correct
          ? Math.round((dayProg.accuracy / 100) * (total - 1)) + 1
          : Math.round((dayProg.accuracy / 100) * (total - 1));
        const newAccuracy =
          total > 0 ? Math.round((correctCount / total) * 100) : 0;
        const withTasks = updateDayProgress(prev, {
          completedTasks,
          accuracy: newAccuracy,
        });
        return addXP(withTasks, correct ? xp : 0);
      });
    },
    [],
  );

  const handleAddMinutes = useCallback((minutes: number) => {
    setState((prev) => {
      const dayProg = getCurrentDayProgress(prev);
      return updateDayProgress(prev, {
        totalMinutes: dayProg.totalMinutes + minutes,
      });
    });
  }, []);

  const handleSetMinutes = useCallback((totalMinutes: number) => {
    setState((prev) => {
      const dayProg = getCurrentDayProgress(prev);
      if (dayProg.totalMinutes === totalMinutes) return prev;
      return updateDayProgress(prev, { totalMinutes });
    });
  }, []);

  const handleNextDay = useCallback(() => {
    handleReturnToToday();
  }, [handleReturnToToday]);

  const handleUndoLastAnswer = useCallback((taskId: string) => {
    setState((prev) => {
      const dayProg = getCurrentDayProgress(prev);
      const completedTasks = dayProg.completedTasks.filter(
        (id) => id !== taskId,
      );
      return updateDayProgress(prev, { completedTasks });
    });
  }, []);

  const dayProgress = getCurrentDayProgress(state);
  const lessonUnlockable = canAdvanceToNextLesson(state);
  const isViewingCatchUpDay =
    state.currentDay !== calendarSync.calendarDay ||
    state.currentWeek !== calendarSync.calendarWeek;

  return {
    state,
    dayProgress,
    calendarSync,
    lessonUnlockable,
    isViewingCatchUpDay,
    user,
    authLoading,
    isAuthenticated,
    login,
    logout,
    syncStatus,
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
