// What the child has solved, on the site's Saved progress (ADR 0012). Levels are numbered across
// Chapters here, as the play screen counts them: Chapter c, Level i is FIRST[c] + i.

import { openProgress, type LegacySave, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { CHAPTERS, FIRST, LEVELS } from './levels';

export type Progress = SiteProgress<Record<string, never>>;

/** The Chapter a Level is in, from its index across Chapters. */
export function chapterOf(level: number): number {
  return FIRST.filter((first) => first <= level).length - 1;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The easy Chapters put in front in v3. A v2 save's Chapter c is Chapter c + ADDED now. */
const ADDED = 3;

/**
 * Saved as "push-pals:v3": the shell puts the Slug in front.
 * v2: the level set was remade, so v1 progress points at different levels.
 * v3: three easy Chapters went in front, so a v2 save is read with its Chapters moved on.
 */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v3',
    formerKey: 'v2',
    sizes: CHAPTERS.map((c) => c.levels.length),
    legacy(saved) {
      const moved = (marks: unknown) =>
        Object.fromEntries(Object.entries(isRecord(marks) ? marks : {}).map(([c, levels]) => [String(Number(c) + ADDED), levels as number[]]));
      // A v2 save on the site's shape (ADR 0012).
      if (saved.format === 1) return { done: moved(saved.done), sparkle: moved(saved.sparkle), settings: saved.settings as LegacySave['settings'] };
      // Before ADR 0012: `solved`, Levels numbered across Chapters, and `muted`.
      const done: Record<string, number[]> = {};
      if (Array.isArray(saved.solved)) {
        for (const old of saved.solved) {
          if (!Number.isInteger(old) || old < 0) continue;
          const n = old + FIRST[ADDED]!;
          if (n >= LEVELS.length) continue;
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
