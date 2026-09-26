// What Snack Math remembers, on the site's Saved progress (ADR 0012): which Rounds are done, and
// in its own slot the Stickers and whose turn it is among the Friends.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { STAGES, type Rng } from './problems';

/** Every Stage is a Group of this many Rounds (ADR 0003). */
export const ROUNDS_PER_STAGE = 4;

export const STICKERS = [
  '🦄', '🐙', '🦋', '🌈', '🚀', '🦖', '🐢', '🌟',
  '🍭', '🐳', '🦒', '🎈', '🐞', '🌻', '🐧', '🦊',
  '🐸', '🦁', '🍩', '🚂', '🐝', '🦉', '🐬', '🍉',
];

/** What only Snack Math saves. */
export interface Save {
  stickers: string[];
  nextFriend: number;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Saved as "snack-math:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: STAGES.map(() => ROUNDS_PER_STAGE),
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return {
          stickers: Array.isArray(r.stickers) ? r.stickers.filter((s): s is string => typeof s === 'string') : [],
          nextFriend: Number.isInteger(r.nextFriend) && (r.nextFriend as number) >= 0 ? (r.nextFriend as number) : 0,
        };
      },
      reset(save) {
        save.stickers = [];
      },
    },
    // Before ADR 0012: how many of each Stage's Rounds were done, in `rounds`. Before Stages were Groups
    // (its ADR 0003), only the Stage a child had moved up to: the Stages below it count as done.
    legacy(saved) {
      const stage = Number.isInteger(saved.stage) && (saved.stage as number) >= 0 && (saved.stage as number) < STAGES.length ? (saved.stage as number) : 0;
      const rounds = saved.rounds;
      const counts = Array.isArray(rounds)
        ? STAGES.map((_, s) => {
            const n: unknown = rounds[s];
            return Number.isInteger(n) && (n as number) >= 0 ? Math.min(n as number, ROUNDS_PER_STAGE) : 0;
          })
        : 'rounds' in saved
          ? STAGES.map(() => 0)
          : STAGES.map((_, s) => (s < stage ? ROUNDS_PER_STAGE : 0));
      const done: Record<string, number[]> = {};
      counts.forEach((n, s) => {
        if (n > 0) done[s] = Array.from({ length: n }, (_, i) => i);
      });
      return { done, settings: { sound: saved.sound !== false, voice: saved.voice !== false }, game: saved };
    },
  });
}

/**
 * Marks a Round finished. Returns true the first time this finishes the Stage's last Round,
 * which is when the child hears how good they're getting.
 */
export function finishRound(progress: Progress, stage: number, round: number): boolean {
  return progress.finish(stage, round).done && round === ROUNDS_PER_STAGE - 1;
}

/** Where Next goes from a Round: the next one, on into the next Stage, or undefined after the very last. */
export function roundAfter(progress: Progress, stage: number, round: number): { stage: number; round: number } | undefined {
  const to = progress.after(stage, round);
  return to && { stage: to.group, round: to.level };
}

/** A Sticker the child doesn't have yet; once all are owned, any Sticker. */
export function pickSticker(owned: readonly string[], rng: Rng = Math.random): string {
  const fresh = STICKERS.filter((s) => !owned.includes(s));
  const pool = fresh.length > 0 ? fresh : STICKERS;
  return pool[Math.floor(rng() * pool.length)];
}
