// What a Vehicle does when tapped. See CONTEXT.md for the vocabulary and
// docs/adr/0001-tap-rule.md for why a board can never get stuck.

import {
  axisOf,
  cellsOf,
  covers,
  inBoard,
  key,
  laneOf,
  STEP,
  streetAt,
  turnLeft,
  turnRight,
  type Arrow,
  type Cell,
  type Dir,
  type Level,
  type Street,
  type Vehicle,
} from './level';

/** One cell the front of a Vehicle drives into, and the way it's heading there. */
export interface Step extends Cell {
  dir: Dir;
}

const TURNS: Record<Arrow, readonly ('L' | 'R')[]> = {
  straight: [],
  left: ['L'],
  right: ['R'],
  'uturn-left': ['L', 'L'],
  'uturn-right': ['R', 'R'],
};

/**
 * The Route: every cell the front of the Vehicle drives into, in order, until it
 * leaves the board. Returns null when the Arrow can't be followed (a turn that never
 * comes, or a Street that ends in front of a Vehicle going straight).
 */
export function routeOf(level: Level, vehicle: Vehicle): Step[] | null {
  const turns = [...TURNS[vehicle.arrow]];
  let { x, y, dir } = vehicle;
  let street = streetAt(level, vehicle, axisOf(dir));
  let cameFrom: Street | undefined;
  if (!street) return null;
  const steps: Step[] = [];

  for (;;) {
    const turn = turns[0];
    if (turn) {
      const next = turn === 'L' ? turnLeft(dir) : turnRight(dir);
      const crossing = streetAt(level, { x, y }, axisOf(next));
      if (crossing && crossing !== cameFrom && canTurnOnto(level, crossing, street, { x, y }, next)) {
        cameFrom = street;
        street = crossing;
        dir = next;
        turns.shift();
      }
    }
    const { dx, dy } = STEP[dir];
    const cell = { x: x + dx, y: y + dy };
    if (!inBoard(level, cell)) return turns.length === 0 ? steps : null;
    if (!covers(level, street, cell)) return null;
    steps.push({ ...cell, dir });
    ({ x, y } = cell);
  }
}

/**
 * Whether a Vehicle at `cell` on `from` can turn here to drive `dir` along `onto`:
 * it has to be in the Lane it would drive in, and `onto` must carry on past `from`
 * that way (at a T-junction, one side has no road).
 */
function canTurnOnto(level: Level, onto: Street, from: Street, cell: Cell, dir: Dir): boolean {
  const across = onto.axis === 'v' ? cell.x : cell.y;
  if (across !== laneOf(onto, dir)) return false;
  const { dx, dy } = STEP[dir];
  let { x, y } = cell;
  while (covers(level, from, { x, y })) {
    x += dx;
    y += dy;
  }
  return !inBoard(level, { x, y }) || covers(level, onto, { x, y });
}

export type TapResult =
  | { kind: 'leave'; route: Step[] }
  /** `reached` is how many Route steps the front drives before it bumps into `blocker`. */
  | { kind: 'bump'; route: Step[]; reached: number; blocker: number };

/** What happens when the Vehicle at `index` is tapped, given the Vehicles still on the board. */
export function tap(level: Level, vehicles: readonly (Vehicle | null)[], index: number): TapResult {
  const vehicle = vehicles[index];
  if (!vehicle) throw new Error(`no vehicle ${index}`);
  const route = routeOf(level, vehicle);
  if (!route) throw new Error(`vehicle ${index} has no route`);
  const owner = new Map<string, number>();
  vehicles.forEach((other, i) => {
    if (other && i !== index) for (const cell of cellsOf(other)) owner.set(key(cell), i);
  });
  for (const [reached, step] of route.entries()) {
    const blocker = owner.get(key(step));
    if (blocker !== undefined) return { kind: 'bump', route, reached, blocker };
  }
  return { kind: 'leave', route };
}

export interface Solution {
  /**
   * Which Vehicles are free in each Wave: the first Wave is every Vehicle free at the
   * start, the next is every Vehicle freed once those have left, and so on.
   */
  waves: number[][];
  /** Vehicles left that can never leave (a loop of Vehicles blocking each other). */
  stuck: number[];
}

/**
 * Clears the board. Because a Vehicle either leaves or stays exactly where it was,
 * taking Vehicles away only ever frees others, so tapping free Vehicles in any order
 * clears the board if anything does.
 */
export function solve(level: Level): Solution {
  const vehicles: (Vehicle | null)[] = [...level.vehicles];
  const waves: number[][] = [];
  for (;;) {
    const free = vehicles.flatMap((vehicle, i) =>
      vehicle && tap(level, vehicles, i).kind === 'leave' ? [i] : [],
    );
    if (free.length === 0) break;
    waves.push(free);
    for (const i of free) vehicles[i] = null;
  }
  const stuck = vehicles.flatMap((vehicle, i) => (vehicle ? [i] : []));
  return { waves, stuck };
}
