// What Find It remembers, on the site's Saved progress (ADR 0012): which Rounds of each Box are done,
// and its own slot: which way round each Box goes, as a grown-up set it in the Grown-up Corner.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { BOXES, WAYS, type BoxKind, type Way } from './rounds';

/** What only Find It saves. */
export interface Save {
  /** Each Box's Way. A setting, so a reset leaves it. */
  ways: Record<BoxKind, Way>;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readWay = (raw: unknown): Way => (WAYS.includes(raw as Way) ? (raw as Way) : 'mix');

/** Saved as "find-it:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: BOXES.map((box) => box.rounds),
    game: {
      read(raw) {
        const ways = isRecord(raw) && isRecord(raw.ways) ? raw.ways : {};
        return { ways: { number: readWay(ways.number), letter: readWay(ways.letter) } };
      },
    },
  });
}

/** Where Next goes from a Round: the next one, on into the next Box, or undefined after the very last. */
export function roundAfter(progress: Progress, box: number, round: number): { box: number; round: number } | undefined {
  const to = progress.after(box, round);
  return to && { box: to.group, round: to.level };
}
