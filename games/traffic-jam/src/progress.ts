// What the child has cleared, on the site's Saved progress (ADR 0012). Levels are numbered across
// Chapters here, as the play screen counts them: Chapter c, Level i is c·8 + i.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { CHAPTERS, LEVELS_PER_CHAPTER } from './chapters';

export type Progress = SiteProgress<Record<string, never>>;

/** Saved as "traffic-jam:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: CHAPTERS.map(() => LEVELS_PER_CHAPTER),
    // Before ADR 0012: `cleared`, Levels numbered across Chapters, and `muted`.
    legacy(saved) {
      const done: Record<string, number[]> = {};
      if (Array.isArray(saved.cleared)) {
        for (const n of saved.cleared) {
          if (Number.isInteger(n) && n >= 0) (done[Math.floor(n / LEVELS_PER_CHAPTER)] ??= []).push(n % LEVELS_PER_CHAPTER);
        }
      }
      return { done, settings: { sound: saved.muted !== true } };
    },
  });
}

/** Where Next goes from a Level: the next one, on into the next Chapter, or undefined after the very last. */
export function levelAfter(progress: Progress, level: number): number | undefined {
  const to = progress.after(Math.floor(level / LEVELS_PER_CHAPTER), level % LEVELS_PER_CHAPTER);
  return to && to.group * LEVELS_PER_CHAPTER + to.level;
}
