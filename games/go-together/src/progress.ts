// What Go Together remembers, on the site's Saved progress (ADR 0012). Practice has no Levels, so there's
// nothing done to keep; its own slot holds the picks: the Topic, each Topic's Scope and the Board.

import { COLOURS, type Colour } from '@shared/kinds';
import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { BOARDS, EASY_KINDS, KIND_GROUPS, POOL_LIST, TOPICS, type Board, type KindsGroup, type Pool, type Topic } from './boards';

/** What only Go Together saves. */
export interface Save {
  topic: Topic;
  /** Same's pools, in POOL_LIST order. One is enough. */
  same: Pool[];
  /** Colors' Scope, in COLOURS order. May be short of the Board's groups; then Play waits. */
  colors: Colour[];
  /** Kinds' Scope, in KIND_GROUPS order. */
  kinds: KindsGroup[];
  /** The Board, the same for every Topic. */
  board: Board;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The items of `all` that `raw` holds, in order, or `start` when it isn't a list. */
function scope<T extends string>(raw: unknown, all: readonly T[], start: readonly T[]): T[] {
  return Array.isArray(raw) ? all.filter((item) => raw.includes(item)) : [...start];
}

const pick = <T>(raw: unknown, all: readonly T[], start: T): T => (all.includes(raw as T) ? (raw as T) : start);

/** Saved as "go-together:v1": the shell puts the Slug in front. A new save starts on Kinds, the Easy groups, a Board of 6. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: [],
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return {
          topic: pick(r.topic, TOPICS, 'kinds'),
          same: scope(r.same, POOL_LIST, ['animals', 'vehicles']),
          colors: scope(r.colors, COLOURS, ['red', 'blue']),
          kinds: scope(r.kinds, KIND_GROUPS, EASY_KINDS),
          board: pick(r.board, BOARDS, 6),
        };
      },
    },
  });
}
