// Random Level builder for Traffic Jam. Proposes boards for a Chapter; the checker
// in chapters.ts decides which are good enough, and the difficulty ranks them.

import { levelProblems, report, type ChapterSpec } from '../../src/games/traffic-jam/chapters';
import {
  cellsOf,
  covers,
  inBoard,
  isIntersection,
  key,
  laneOf,
  streetEnd,
  streetStart,
  type Arrow,
  type Dir,
  type Kind,
  type Level,
  type Street,
  type Vehicle,
} from '../../src/games/traffic-jam/game/level';
import { routeOf } from '../../src/games/traffic-jam/game/rules';

export type Random = () => number;

/** mulberry32: small, fast, and the same everywhere for a given seed. */
export function seeded(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pick = <T>(random: Random, items: readonly T[]): T => items[Math.floor(random() * items.length)]!;

function weighted<T>(random: Random, items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [item, weight] of items) {
    roll -= weight;
    if (roll < 0) return item;
  }
  return items[items.length - 1]![0];
}

/** Streets of one axis: at least one grass cell from the edge and two between Streets. */
function placeStreets(random: Random, axis: 'v' | 'h', count: number, width: number, twoLane: boolean): Street[] | null {
  for (let attempt = 0; attempt < 50; attempt++) {
    const streets: Street[] = [];
    let cursor = 1;
    for (let i = 0; i < count; i++) {
      const lanes: 1 | 2 = twoLane && random() < 0.6 ? 2 : 1;
      const left = count - i - 1;
      // Leave room for the Streets still to come, at 3 cells each (one lane + two grass).
      const latest = width - 1 - lanes - left * 3;
      if (latest < cursor) break;
      const at = int(random, cursor, Math.min(latest, cursor + 3));
      streets.push({ axis, at, lanes });
      cursor = at + lanes + 2;
    }
    if (streets.length === count) return streets;
  }
  return null;
}

/** Turns some Streets into T-junction stems: cut one end at a crossing Street. */
function cutStreets(random: Random, level: Level): void {
  for (const street of level.streets) {
    if (random() > 0.45) continue;
    const crossings = level.streets.filter((other) => other.axis !== street.axis);
    // Keep at least one crossing on the stem, so it still meets the grid.
    if (crossings.length < 2) continue;
    const at = pick(random, crossings);
    const cell = (along: number) => (street.axis === 'v' ? { x: street.at, y: along } : { x: along, y: street.at });
    if (!covers(level, at, cell(at.at))) continue;
    const before = { ...street };
    if (random() < 0.5) street.from = at.at;
    else street.to = at.at + at.lanes - 1;
    // Undo cuts that strand a crossing Street's own stem end.
    const stranded = level.streets.some(
      (other) =>
        other !== street &&
        [other.from, other.to].some((end) => end !== undefined && !level.streets.some((s) => s.axis !== other.axis && covers(level, s, other.axis === 'v' ? { x: other.at, y: end } : { x: end, y: other.at }))),
    );
    if (stranded || streetEnd(street, level) - streetStart(street) < 3) {
      delete street.from;
      delete street.to;
      Object.assign(street, before);
    }
  }
}

const ARROW_WEIGHT: Record<Arrow, number> = {
  straight: 3,
  left: 3,
  right: 3,
  'uturn-left': 2,
  'uturn-right': 2,
};

function placeVehicles(random: Random, level: Level, spec: ChapterSpec, count: number): void {
  const taken = new Set<string>();
  const kinds = spec.kinds.map((kind): [Kind, number] => [kind, kind === 'car' ? 3 : kind === 'truck' ? 2 : 1.5]);
  for (let attempt = 0; attempt < 400 && level.vehicles.length < count; attempt++) {
    const street = pick(random, level.streets);
    const dir: Dir = street.axis === 'v' ? pick(random, ['N', 'S'] as const) : pick(random, ['E', 'W'] as const);
    const lane = laneOf(street, dir);
    const along = int(random, streetStart(street), streetEnd(street, level));
    const [x, y] = street.axis === 'v' ? [lane, along] : [along, lane];
    const kind = weighted(random, kinds);
    const vehicle: Vehicle = { kind, x, y, dir, arrow: 'straight' };
    const cells = cellsOf(vehicle);
    if (cells.some((cell) => !inBoard(level, cell) || !covers(level, street, cell) || taken.has(key(cell)))) continue;
    if (cells.length > 1 && cells.every((cell) => isIntersection(level, cell))) continue;
    const arrows = spec.arrows.filter((arrow) => routeOf(level, { ...vehicle, arrow }));
    if (arrows.length === 0) continue;
    vehicle.arrow = weighted(random, arrows.map((arrow) => [arrow, ARROW_WEIGHT[arrow]] as const));
    level.vehicles.push(vehicle);
    for (const cell of cells) taken.add(key(cell));
  }
}

/** One random Level for the Chapter, or null if it doesn't pass the Chapter's checks. */
export function propose(random: Random, spec: ChapterSpec): Level | null {
  const { w, h } = spec.board;
  const vs = placeStreets(random, 'v', int(random, ...spec.vStreets), w, spec.twoLane);
  const hs = placeStreets(random, 'h', int(random, ...spec.hStreets), h, spec.twoLane);
  if (!vs || !hs) return null;
  const level: Level = { w, h, streets: [...vs, ...hs], vehicles: [] };
  if (spec.tJunctions) cutStreets(random, level);
  placeVehicles(random, level, spec, int(random, ...spec.vehicles));
  return levelProblems(level, spec).length === 0 ? level : null;
}

/**
 * A Chapter's Levels, easiest first: many candidates, ranked by difficulty,
 * sampled evenly from the easy end to near the hard end.
 */
export function chapterLevels(spec: ChapterSpec, seed: number, count: number, candidates = 400): Level[] {
  const random = seeded(seed);
  const found = new Map<string, { level: Level; difficulty: number }>();
  for (let attempt = 0; attempt < candidates * 200 && found.size < candidates; attempt++) {
    const level = propose(random, spec);
    if (!level) continue;
    found.set(JSON.stringify(level), { level, difficulty: report(level).difficulty });
  }
  const ranked = [...found.values()].sort((a, b) => a.difficulty - b.difficulty);
  if (ranked.length < count) throw new Error(`only ${ranked.length} levels for "${spec.name}"`);
  return Array.from({ length: count }, (_, i) => {
    const quantile = 0.02 + (i / (count - 1)) * 0.93;
    return ranked[Math.round(quantile * (ranked.length - 1))]!.level;
  });
}
