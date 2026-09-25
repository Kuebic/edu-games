// Saved on the device only. One profile.

import type { GameStorage } from '@shared/storage';
import { nextLevel } from '@shared/unlock';
import { CHAPTERS, FIRST } from './levels';

// Saved as "push-pals:v2": the shell puts the Slug in front.
// v2: the level set was remade, so v1 progress points at different levels.
const KEY = 'v2';

export interface Progress {
  /** Indices of solved levels, numbered across Chapters (FIRST). */
  readonly solved: readonly number[];
  readonly muted: boolean;
}

export function loadProgress(storage: GameStorage): Progress {
  const saved = (storage.read(KEY) ?? {}) as Partial<Progress>;
  return {
    solved: Array.isArray(saved.solved) ? saved.solved.filter(Number.isInteger) : [],
    muted: saved.muted === true,
  };
}

export function saveProgress(progress: Progress, storage: GameStorage): void {
  storage.write(KEY, progress);
}

export function withSolved(progress: Progress, level: number): Progress {
  if (progress.solved.includes(level)) return progress;
  return { ...progress, solved: [...progress.solved, level].sort((a, b) => a - b) };
}

/** Which of a Chapter's Levels are solved, in play order. Chapters count from 0. Which are open is the site's rule (ADR 0009). */
export function solvedIn(progress: Progress, chapter: number): boolean[] {
  return CHAPTERS[chapter]!.levels.map((_, i) => progress.solved.includes(FIRST[chapter]! + i));
}

/** The Chapter a Level is in, from its index across Chapters. */
export function chapterOf(level: number): number {
  return FIRST.filter((first) => first <= level).length - 1;
}

/** Where Next goes from a Level: the next one, on into the next Chapter, or undefined after the very last. */
export function levelAfter(level: number): number | undefined {
  const chapter = chapterOf(level);
  const to = nextLevel(
    CHAPTERS.map((c) => c.levels.length),
    chapter,
    level - FIRST[chapter]!,
  );
  return to && FIRST[to.group]! + to.level;
}
