// What Find It remembers, on the site's Saved progress (ADR 0012). Practice has no Levels, so there's
// nothing done to keep; its own slot holds the picks: the Topic that's up, each Topic's Scope and Way, and
// the Skin.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { ITEMS, LETTER_RANGES, NUMBER_RANGES, TOPICS, WAYS, type Topic, type Way } from './finds';
import { isSkin, type Skin } from './skins';

/** What only Find It saves. All of it is a setting. */
export interface Save {
  /** The Topic Practice shows. */
  topic: Topic;
  /** Each Topic's Scope, in the Topic's order. May be empty. */
  scopes: Record<Topic, string[]>;
  /** Each Topic's Way. */
  ways: Record<Topic, Way>;
  /** What the beans on a Tray are. */
  skin: Skin;
}

export type Progress = SiteProgress<Save>;

/** Where a new save starts: the first Range of each Topic, on Mix, with beans. */
const START: Readonly<Record<Topic, readonly string[]>> = { number: NUMBER_RANGES[0]!, letter: LETTER_RANGES[0]! };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readWay = (raw: unknown): Way => (WAYS.includes(raw as Way) ? (raw as Way) : 'mix');

/** A saved Scope, only the Topic's own items, in order; the first Range if it isn't a list at all. */
const readScope = (topic: Topic, raw: unknown): string[] =>
  Array.isArray(raw) ? ITEMS[topic].filter((item) => raw.includes(item)) : [...START[topic]];

/** Saved as "find-it:v1": the shell puts the Slug in front. Done marks from when it had Rounds are ignored. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: [],
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        const ways = isRecord(r.ways) ? r.ways : {};
        const scopes = isRecord(r.scopes) ? r.scopes : {};
        return {
          topic: TOPICS.includes(r.topic as Topic) ? (r.topic as Topic) : 'number',
          scopes: { number: readScope('number', scopes.number), letter: readScope('letter', scopes.letter) },
          ways: { number: readWay(ways.number), letter: readWay(ways.letter) },
          skin: isSkin(r.skin) ? r.skin : 'bean',
        };
      },
    },
  });
}
