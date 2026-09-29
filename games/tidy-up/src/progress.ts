// What Tidy Up remembers, on the site's Saved progress (ADR 0012). Practice has no Levels, so there's
// nothing done to keep; its own slot holds the picks and the Patterns switch, all of them settings.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { isSkin, type Skin } from './skins';
import { KINDS_WAYS, STEPS, type KindsWay, type Step } from './kinds';
import { COLOURS, SHAPES, TOPICS, WAYS, type Colour, type ColourWay, type Shape, type ShapeWay, type Topic } from './sorting';

/** What only Tidy Up saves. */
export interface Save {
  topic: Topic;
  /** Each Topic's Scope, in its own order. May be short; then Play waits. */
  colors: Colour[];
  shapes: Shape[];
  /** Kinds' Steps, in STEPS order. */
  kinds: Step[];
  colorsWay: ColourWay;
  shapesWay: ShapeWay;
  kindsWay: KindsWay;
  skin: Skin;
  /** The Grown-up Corner's Patterns: each color carries a pattern too, for a color-blind child. */
  patterns: boolean;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The items of `all` that `raw` holds, in order, or `start` when it isn't a list. */
function scope<T extends string>(raw: unknown, all: readonly T[], start: readonly T[]): T[] {
  return Array.isArray(raw) ? all.filter((item) => raw.includes(item)) : [...start];
}

const pick = <T extends string>(raw: unknown, all: readonly T[], start: T): T => (all.includes(raw as T) ? (raw as T) : start);

/** Saved as "tidy-up:v1": the shell puts the Slug in front. A new save starts on Colors, red and blue, Blocks and Buckets; Kinds on its first Step, Clear. */
export function loadProgress(storage: GameStorage): Progress {
  return openProgress(storage, {
    key: 'v1',
    sizes: [],
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return {
          topic: pick(r.topic, TOPICS, 'colors'),
          colors: scope(r.colors, COLOURS, ['red', 'blue']),
          shapes: scope(r.shapes, SHAPES, ['circle', 'square']),
          kinds: scope(r.kinds, STEPS, ['animals-vehicles']),
          colorsWay: pick(r.colorsWay, WAYS.colors as readonly ColourWay[], 'blocks'),
          shapesWay: pick(r.shapesWay, WAYS.shapes as readonly ShapeWay[], 'plain'),
          kindsWay: pick(r.kindsWay, KINDS_WAYS, 'clear'),
          skin: isSkin(r.skin) ? r.skin : 'buckets',
          patterns: r.patterns === true,
        };
      },
    },
  });
}
