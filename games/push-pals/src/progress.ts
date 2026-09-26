// What the child has solved, on the site's Saved progress (ADR 0012). Levels are numbered across
// Chapters here, as the play screen counts them: Chapter c, Level i is FIRST[c] + i.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { CHAPTERS, FIRST, LEVELS } from './levels';

export type Progress = SiteProgress<Record<string, never>>;

/** The Chapter a Level is in, from its index across Chapters. */
export function chapterOf(level: number): number {
  return FIRST.filter((first) => first <= level).length - 1;
}

/**
 * Saved as "push-pals:v2": the shell puts the Slug in front.
 * v2: the level set was remade, so v1 progress points at different levels.
 */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v2',
    sizes: CHAPTERS.map((c) => c.levels.length),
    // Before ADR 0012: `solved`, Levels numbered across Chapters, and `muted`.
    legacy(saved) {
      const done: Record<string, number[]> = {};
      if (Array.isArray(saved.solved)) {
        for (const n of saved.solved) {
          if (!Number.isInteger(n) || n < 0 || n >= LEVELS.length) continue;
          const c = chapterOf(n);
          (done[c] ??= []).push(n - FIRST[c]!);
        }
      }
      return { done, settings: { sound: saved.muted !== true } };
    },
  });
}

/** Where Next goes from a Level: the next one, on into the next Chapter, or undefined after the very last. */
export function levelAfter(progress: Progress, level: number): number | undefined {
  const chapter = chapterOf(level);
  const to = progress.after(chapter, level - FIRST[chapter]!);
  return to && FIRST[to.group]! + to.level;
}
