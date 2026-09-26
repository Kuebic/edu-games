// What Find It remembers, on the site's Saved progress (ADR 0012): which Rounds of each Box are done.
// It saves nothing of its own.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { BOXES } from './rounds';

export type Progress = SiteProgress<Record<string, never>>;

/** Saved as "find-it:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, { key: 'v1', sizes: BOXES.map((box) => box.rounds) });
}

/** Where Next goes from a Round: the next one, on into the next Box, or undefined after the very last. */
export function roundAfter(progress: Progress, box: number, round: number): { box: number; round: number } | undefined {
  const to = progress.after(box, round);
  return to && { box: to.group, round: to.level };
}
