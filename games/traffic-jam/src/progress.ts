// What the child has cleared, saved on the device.

import type { GameStorage } from '@shared/storage';
import { nextLevel } from '@shared/unlock';
import { CHAPTERS, LEVELS_PER_CHAPTER } from './chapters';

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

/** Which of a Chapter's Levels are cleared, in play order. Chapters count from 0. Which are open is the site's rule (ADR 0009). */
export function clearedIn(progress: Progress, chapter: number): boolean[] {
  return Array.from({ length: LEVELS_PER_CHAPTER }, (_, i) => progress.cleared.includes(chapter * LEVELS_PER_CHAPTER + i));
}

/** Where Next goes from a Level: the next one, on into the next Chapter, or undefined after the very last. */
export function levelAfter(level: number): number | undefined {
  const to = nextLevel(
    CHAPTERS.map(() => LEVELS_PER_CHAPTER),
    Math.floor(level / LEVELS_PER_CHAPTER),
    level % LEVELS_PER_CHAPTER,
  );
  return to && to.group * LEVELS_PER_CHAPTER + to.level;
}
