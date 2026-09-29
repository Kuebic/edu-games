// What Mailbox remembers, on the site's Saved progress (ADR 0012). Practice has no Levels, so there's
// nothing done to keep; its own slot holds the picks, and how far each letter's Hint has faded.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { HINT_ROUNDS, isLetter, LETTERS, WAYS, type Letter, type Way } from './letters';

/** What only Mailbox saves. */
export interface Save {
  /** The Scope, in LETTERS order. May be short; then Play waits. */
  letters: Letter[];
  way: Way;
  /** Clean Rounds in a row for each letter, up to HINT_ROUNDS: its Hint fades with them. */
  learnt: Record<Letter, number>;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function learntFrom(raw: unknown): Record<Letter, number> {
  const out: Record<Letter, number> = {};
  if (!isRecord(raw)) return out;
  for (const [letter, n] of Object.entries(raw)) {
    if (isLetter(letter) && Number.isInteger(n) && (n as number) > 0) out[letter] = Math.min(n as number, HINT_ROUNDS);
  }
  return out;
}

/** Saved as "mailbox:v1": the shell puts the Slug in front. A new save starts on Sort, O and S, every Hint showing. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: [],
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return {
          letters: Array.isArray(r.letters) ? LETTERS.filter((l) => (r.letters as unknown[]).includes(l)) : ['o', 's'],
          way: WAYS.includes(r.way as Way) ? (r.way as Way) : 'sort',
          learnt: learntFrom(r.learnt),
        };
      },
    },
  });
}
