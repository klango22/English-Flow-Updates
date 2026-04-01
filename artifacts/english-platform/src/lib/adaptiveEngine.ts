/**
 * adaptiveEngine.ts — Adaptive Level System
 * Calculates CEFR level from totalXP and adjusts content difficulty.
 */

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Difficulty = "easy" | "medium" | "hard" | "advanced";

export interface LevelProfile {
  level: CEFRLevel;
  label: string;
  minXP: number;
  maxXP: number;
  color: string;
  difficulties: Difficulty[];
  xpMultiplier: number;
}

export const LEVEL_PROFILES: LevelProfile[] = [
  {
    level: "A1",
    label: "Beginner",
    minXP: 0,
    maxXP: 500,
    color: "#94a3b8",
    difficulties: ["easy"],
    xpMultiplier: 1.0,
  },
  {
    level: "A2",
    label: "Elementary",
    minXP: 501,
    maxXP: 1500,
    color: "#60a5fa",
    difficulties: ["easy", "medium"],
    xpMultiplier: 1.1,
  },
  {
    level: "B1",
    label: "Intermediate",
    minXP: 1501,
    maxXP: 3000,
    color: "#34d399",
    difficulties: ["medium"],
    xpMultiplier: 1.2,
  },
  {
    level: "B2",
    label: "Upper-Intermediate",
    minXP: 3001,
    maxXP: 6000,
    color: "#fbbf24",
    difficulties: ["medium", "hard"],
    xpMultiplier: 1.3,
  },
  {
    level: "C1",
    label: "Advanced",
    minXP: 6001,
    maxXP: 10000,
    color: "#f97316",
    difficulties: ["hard", "advanced"],
    xpMultiplier: 1.5,
  },
  {
    level: "C2",
    label: "Mastery",
    minXP: 10001,
    maxXP: Infinity,
    color: "#a855f7",
    difficulties: ["advanced"],
    xpMultiplier: 2.0,
  },
];

export function getLevelProfile(totalXP: number): LevelProfile {
  return (
    LEVEL_PROFILES.find((p) => totalXP >= p.minXP && totalXP <= p.maxXP) ??
    LEVEL_PROFILES[LEVEL_PROFILES.length - 1]
  );
}

export function getNextLevel(totalXP: number): LevelProfile | null {
  const current = getLevelProfile(totalXP);
  const idx = LEVEL_PROFILES.findIndex((p) => p.level === current.level);
  return idx < LEVEL_PROFILES.length - 1 ? LEVEL_PROFILES[idx + 1] : null;
}

export function getProgressToNextLevel(totalXP: number): number {
  const current = getLevelProfile(totalXP);
  const next = getNextLevel(totalXP);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const earned = totalXP - current.minXP;
  return Math.min(100, Math.round((earned / range) * 100));
}

/**
 * Filters tasks by the difficulties appropriate for the current level.
 * Always keeps at least 20 tasks by falling back if filtered set is too small.
 */
export function adaptTasks<T extends { difficulty: string; xp: number }>(
  tasks: T[],
  totalXP: number,
): T[] {
  const profile = getLevelProfile(totalXP);
  const filtered = tasks.filter((t) =>
    profile.difficulties.includes(t.difficulty as Difficulty),
  );

  // Fallback: if not enough tasks, use all
  const result = filtered.length >= 10 ? filtered : tasks;

  // Apply XP multiplier
  return result.map((t) => ({
    ...t,
    xp: Math.round(t.xp * profile.xpMultiplier),
  }));
}

/**
 * Returns a human-readable description of the current level for display.
 */
export function getLevelBadge(totalXP: number): string {
  const p = getLevelProfile(totalXP);
  return `${p.level} · ${p.label}`;
}
