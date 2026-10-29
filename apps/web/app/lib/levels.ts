export const LEVEL_THRESHOLDS = [
  { level: 1, title: "Novice", minXp: 0 },
  { level: 2, title: "Apprentice", minXp: 400 },
  { level: 3, title: "Practitioner", minXp: 900 },
  { level: 4, title: "Craftsman", minXp: 1600 },
  { level: 5, title: "Artisan", minXp: 2500 },
  { level: 6, title: "Specialist", minXp: 3600 },
  { level: 7, title: "Engineer", minXp: 5000 },
  { level: 8, title: "Architect", minXp: 6800 },
  { level: 9, title: "Maestro", minXp: 9000 },
  { level: 10, title: "GoCraft Master", minXp: 12000 },
] as const;

export type LevelInfo = {
  level: number;
  title: string;
  minXp: number;
  nextLevel: (typeof LEVEL_THRESHOLDS)[number] | null;
  progress: number;
  xpIntoLevel: number;
  xpForLevel: number;
};

export function getLevelInfo(xp: number): LevelInfo {
  let current: { level: number; title: string; minXp: number } =
    LEVEL_THRESHOLDS[0] ?? {
      level: 1,
      title: "Novice",
      minXp: 0,
    };

  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.minXp) current = threshold;
    else break;
  }

  const next = LEVEL_THRESHOLDS.find((t) => t.level === current.level + 1) ?? null;
  const span = next ? next.minXp - current.minXp : 1;
  const into = xp - current.minXp;

  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextLevel: next,
    progress: next ? Math.min(1, into / span) : 1,
    xpIntoLevel: into,
    xpForLevel: span,
  };
}
