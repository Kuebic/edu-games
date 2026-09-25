// Saved on the device only. One profile.

// v2: the level set was remade, so v1 progress points at different levels.
const KEY = 'push-pals:v2';

export interface Progress {
  /** Indices of solved levels. */
  readonly solved: readonly number[];
  readonly muted: boolean;
}

export function loadProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Progress>;
    return {
      solved: Array.isArray(saved.solved) ? saved.solved.filter(Number.isInteger) : [],
      muted: saved.muted === true,
    };
  } catch {
    return { solved: [], muted: false };
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

/** Level 0 is always unlocked; solving a level unlocks the one after it. */
export function isUnlocked(progress: Progress, level: number): boolean {
  return level === 0 || progress.solved.includes(level - 1) || progress.solved.includes(level);
}

/** The level to offer next: the first unlocked one not yet solved, else the last. */
export function nextLevel(progress: Progress, total: number): number {
  for (let i = 0; i < total; i++) {
    if (isUnlocked(progress, i) && !progress.solved.includes(i)) return i;
  }
  return total - 1;
}

export function withSolved(progress: Progress, level: number): Progress {
  if (progress.solved.includes(level)) return progress;
  return { ...progress, solved: [...progress.solved, level].sort((a, b) => a - b) };
}
