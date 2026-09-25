// What the child has cleared, saved on the device.

import type { GameStorage } from '@shared/storage';
import { LEVELS_PER_CHAPTER } from './chapters';

/** Saved as "traffic-jam:v1": the shell puts the Slug in front. */
const KEY = 'v1';

export interface Progress {
  /** Levels cleared, numbered across all Chapters from 0. */
  cleared: number[];
  muted: boolean;
}

export function loadProgress(storage: GameStorage): Progress {
  const saved = (storage.read(KEY) ?? {}) as Partial<Progress>;
  return {
    cleared: Array.isArray(saved.cleared) ? saved.cleared.filter(Number.isInteger) : [],
    muted: saved.muted === true,
  };
}

export function saveProgress(progress: Progress, storage: GameStorage): void {
  storage.write(KEY, progress);
}

export function withCleared(progress: Progress, level: number): Progress {
  if (progress.cleared.includes(level)) return progress;
  return { ...progress, cleared: [...progress.cleared, level].sort((a, b) => a - b) };
}

/**
 * Clearing a Level unlocks the next. The first Level of every Chapter is always open,
 * so a grown-up can skip ahead.
 */
export function isUnlocked(progress: Progress, level: number): boolean {
  return level % LEVELS_PER_CHAPTER === 0 || progress.cleared.includes(level - 1) || progress.cleared.includes(level);
}
