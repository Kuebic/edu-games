// The Chapter ladder. Each Chapter adds one idea and keeps everything before it.
// The generator builds Levels to these limits; levels.test.ts fails any Level that breaks them.

import { isIntersection, layoutProblems, streetAt, axisOf, type Arrow, type Kind, type Level } from './game/level';
import { routeOf, solve, tap } from './game/rules';

export type Feature =
  /** A Vehicle is first blocked by one on a crossing Street. */
  | 'crossing-block'
  | 'turn'
  | 'uturn'
  | 'truck'
  | 'two-lane'
  | 't-junction'
  | 'bus';

export interface ChapterSpec {
  /** For grown-ups and the level report; never shown to the child. */
  name: string;
  board: { w: number; h: number };
  /** How many Streets run up and down, and across. */
  vStreets: [number, number];
  hStreets: [number, number];
  vehicles: [number, number];
  /** How many Waves it takes to clear the board, easiest to hardest Level. */
  waves: [number, number];
  arrows: readonly Arrow[];
  kinds: readonly Kind[];
  twoLane: boolean;
  tJunctions: boolean;
  /** Features every Level in the Chapter must show. */
  needs: readonly Feature[];
}

const TURNS: readonly Arrow[] = ['straight', 'left', 'right'];
const ALL: readonly Arrow[] = [...TURNS, 'uturn-left', 'uturn-right'];

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    name: 'Straight streets',
    board: { w: 7, h: 11 },
    vStreets: [1, 2],
    hStreets: [0, 0],
    vehicles: [4, 7],
    waves: [2, 5],
    arrows: ['straight'],
    kinds: ['car'],
    twoLane: false,
    tJunctions: false,
    needs: [],
  },
  {
    name: 'Crossings',
    board: { w: 7, h: 11 },
    vStreets: [2, 2],
    hStreets: [1, 2],
    vehicles: [5, 9],
    waves: [3, 7],
    arrows: ['straight'],
    kinds: ['car', 'truck'],
    twoLane: false,
    tJunctions: false,
    needs: ['crossing-block'],
  },
  {
    name: 'Turns',
    board: { w: 8, h: 12 },
    vStreets: [2, 3],
    hStreets: [2, 3],
    vehicles: [7, 10],
    waves: [4, 8],
    arrows: TURNS,
    kinds: ['car', 'truck'],
    twoLane: false,
    tJunctions: false,
    needs: ['turn'],
  },
  {
    name: 'U-turns',
    board: { w: 8, h: 13 },
    vStreets: [2, 3],
    hStreets: [3, 3],
    vehicles: [8, 11],
    waves: [5, 9],
    arrows: ALL,
    kinds: ['car', 'truck'],
    twoLane: false,
    tJunctions: false,
    needs: ['uturn'],
  },
  {
    name: 'Trucks',
    board: { w: 8, h: 13 },
    vStreets: [2, 3],
    hStreets: [3, 3],
    vehicles: [8, 11],
    waves: [5, 10],
    arrows: ALL,
    kinds: ['car', 'truck'],
    twoLane: false,
    tJunctions: false,
    needs: ['truck'],
  },
  {
    name: 'Two-lane streets',
    board: { w: 8, h: 14 },
    vStreets: [2, 2],
    hStreets: [3, 3],
    vehicles: [9, 12],
    waves: [6, 10],
    arrows: ALL,
    kinds: ['car', 'truck'],
    twoLane: true,
    tJunctions: false,
    needs: ['two-lane'],
  },
  {
    name: 'T-junctions',
    board: { w: 8, h: 14 },
    vStreets: [2, 3],
    hStreets: [3, 4],
    vehicles: [10, 13],
    waves: [6, 11],
    arrows: ALL,
    kinds: ['car', 'truck'],
    twoLane: true,
    tJunctions: true,
    needs: ['t-junction'],
  },
  {
    name: 'Buses and everything',
    board: { w: 8, h: 14 },
    vStreets: [2, 3],
    hStreets: [3, 4],
    vehicles: [11, 15],
    waves: [7, 13],
    arrows: ALL,
    kinds: ['car', 'truck', 'bus'],
    twoLane: true,
    tJunctions: true,
    needs: ['bus'],
  },
];

export const LEVELS_PER_CHAPTER = 8;

export interface Report {
  vehicles: number;
  waves: number;
  freeAtStart: number;
  /** Rough ordering within a Chapter: more Waves and fewer free Vehicles is harder. */
  difficulty: number;
  features: Set<Feature>;
}

export function report(level: Level): Report {
  const { waves } = solve(level);
  const features = new Set<Feature>();
  const vehicles = level.vehicles;
  for (const vehicle of vehicles) {
    if (vehicle.arrow === 'left' || vehicle.arrow === 'right') features.add('turn');
    if (vehicle.arrow.startsWith('uturn')) features.add('uturn');
    if (vehicle.kind === 'truck') features.add('truck');
    if (vehicle.kind === 'bus') features.add('bus');
    if (streetAt(level, vehicle, axisOf(vehicle.dir))?.lanes === 2) features.add('two-lane');
  }
  if (level.streets.some((street) => street.from !== undefined || street.to !== undefined)) {
    features.add('t-junction');
  }
  vehicles.forEach((vehicle, i) => {
    const result = tap(level, vehicles, i);
    if (result.kind === 'bump' && axisOf(vehicles[result.blocker]!.dir) !== axisOf(vehicle.dir)) {
      const step = result.route[result.reached]!;
      if (isIntersection(level, step)) features.add('crossing-block');
    }
  });
  const freeAtStart = waves[0]?.length ?? 0;
  return {
    vehicles: vehicles.length,
    waves: waves.length,
    freeAtStart,
    difficulty: waves.length * 2 + vehicles.length * 0.4 - freeAtStart,
    features,
  };
}

/** Everything wrong with a Level for its Chapter, or [] when it's fine. */
export function levelProblems(level: Level, spec: ChapterSpec): string[] {
  const problems = layoutProblems(level);
  if (problems.length > 0) return problems;
  const { w, h } = spec.board;
  if (level.w !== w || level.h !== h) problems.push(`board is ${level.w}x${level.h}, not ${w}x${h}`);
  level.vehicles.forEach((vehicle, i) => {
    if (!routeOf(level, vehicle)) problems.push(`vehicle ${i} can't follow its arrow`);
    if (!spec.arrows.includes(vehicle.arrow)) problems.push(`vehicle ${i} has a ${vehicle.arrow} arrow`);
    if (!spec.kinds.includes(vehicle.kind)) problems.push(`vehicle ${i} is a ${vehicle.kind}`);
    // Only a truck or bus tail may start in an Intersection. A front in one looks like it's already turning there.
    if (isIntersection(level, vehicle)) problems.push(`vehicle ${i} starts in an intersection`);
  });
  if (problems.length > 0) return problems;
  if (solve(level).stuck.length > 0) problems.push("can't be cleared");
  if (!spec.twoLane && level.streets.some((street) => street.lanes === 2)) problems.push('has a two-lane street');
  if (!spec.tJunctions && level.streets.some((street) => street.from !== undefined || street.to !== undefined)) {
    problems.push('has a T-junction');
  }
  const stats = report(level);
  const count = (axis: 'v' | 'h') => level.streets.filter((street) => street.axis === axis).length;
  const within = ([min, max]: [number, number], value: number) => value >= min && value <= max;
  if (!within(spec.vStreets, count('v'))) problems.push(`${count('v')} up-down streets`);
  if (!within(spec.hStreets, count('h'))) problems.push(`${count('h')} across streets`);
  if (!within(spec.vehicles, stats.vehicles)) problems.push(`${stats.vehicles} vehicles`);
  if (!within(spec.waves, stats.waves)) problems.push(`${stats.waves} waves`);
  for (const feature of spec.needs) if (!stats.features.has(feature)) problems.push(`no ${feature}`);
  return problems;
}
