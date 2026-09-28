// What Piggy Bank remembers, on the site's Saved progress (ADR 0012). Practice has no Levels, so there's
// nothing done to keep; its own slot holds the picks.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { MONEY, WAYS, type Money, type Way } from './money';

/** What only Piggy Bank saves. */
export interface Save {
  /** The Scope, in MONEY order. May be short; then Play waits. */
  money: Money[];
  way: Way;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Saved as "piggy-bank:v1": the shell puts the Slug in front. A new save starts on Sort, penny and quarter. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: [],
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return {
          money: Array.isArray(r.money) ? MONEY.filter((m) => (r.money as unknown[]).includes(m)) : ['penny', 'quarter'],
          way: WAYS.includes(r.way as Way) ? (r.way as Way) : 'sort',
        };
      },
    },
  });
}
