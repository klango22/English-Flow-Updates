import { useEffect, useRef, useCallback } from 'react';

// Global singleton to prevent multiple intervals across re-renders
let globalIntervalId: ReturnType<typeof setInterval> | null = null;
let sessionStartTime: number | null = null;
let lastSavedMinutes = 0;

const SAVE_INTERVAL_MS = 30_000; // save every 30 seconds
let lastSaveTime = 0;

interface Options {
  currentMinutes: number;
  onTick: (totalMinutes: number) => void;
  onSave: (totalMinutes: number) => void;
}

export function useChronometer({ currentMinutes, onTick, onSave }: Options) {
  const currentMinutesRef = useRef(currentMinutes);
  const onTickRef = useRef(onTick);
  const onSaveRef = useRef(onSave);

  // Keep refs in sync without triggering effect restarts
  useEffect(() => { currentMinutesRef.current = currentMinutes; }, [currentMinutes]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

  const stopTimer = useCallback(() => {
    if (globalIntervalId !== null) {
      clearInterval(globalIntervalId);
      globalIntervalId = null;
    }
    sessionStartTime = null;
  }, []);

  const startTimer = useCallback(() => {
    // Always clear any existing interval first
    if (globalIntervalId !== null) {
      clearInterval(globalIntervalId);
      globalIntervalId = null;
    }

    lastSavedMinutes = currentMinutesRef.current;
    lastSaveTime = Date.now();
    sessionStartTime = Date.now() - (currentMinutesRef.current * 60_000);

    globalIntervalId = setInterval(() => {
      if (sessionStartTime === null) return;

      const now = Date.now();
      const elapsedMs = now - sessionStartTime;
      const totalMinutes = Math.floor(elapsedMs / 60_000);

      // Only fire tick when minutes actually changed
      if (totalMinutes !== currentMinutesRef.current) {
        currentMinutesRef.current = totalMinutes;
        onTickRef.current(totalMinutes);
      }

      // Save every 30 seconds
      if (now - lastSaveTime >= SAVE_INTERVAL_MS) {
        lastSaveTime = now;
        onSaveRef.current(totalMinutes);
      }
    }, 1000); // check every second for precision
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      // On unmount: save final value and clean up
      if (sessionStartTime !== null) {
        const elapsedMs = Date.now() - sessionStartTime;
        const totalMinutes = Math.floor(elapsedMs / 60_000);
        onSaveRef.current(totalMinutes);
      }
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runs once, ref pattern handles updates

  return { stopTimer, startTimer };
}
