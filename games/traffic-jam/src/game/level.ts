// Board geometry: Streets, Lanes, and where Vehicles may sit.
// Coordinates are cells: x grows right, y grows down; north is up the screen.

export type Dir = 'N' | 'E' | 'S' | 'W';
export type Arrow = 'straight' | 'left' | 'right' | 'uturn-left' | 'uturn-right';
export type Kind = 'car' | 'truck' | 'bus';

export const LENGTH: Record<Kind, number> = { car: 1, truck: 2, bus: 3 };

export const STEP: Record<Dir, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

const CLOCKWISE: readonly Dir[] = ['N', 'E', 'S', 'W'];

export function turnRight(dir: Dir): Dir {
  return CLOCKWISE[(CLOCKWISE.indexOf(dir) + 1) % 4]!;
}

export function turnLeft(dir: Dir): Dir {
  return CLOCKWISE[(CLOCKWISE.indexOf(dir) + 3) % 4]!;
}

/** 'v' Streets run up and down; 'h' Streets run left and right. */
export type Axis = 'h' | 'v';

export function axisOf(dir: Dir): Axis {
  return dir === 'N' || dir === 'S' ? 'v' : 'h';
}

export interface Street {
  axis: Axis;
  /** First column (v) or row (h) the Street covers. A two-lane Street also covers the next one. */
  at: number;
  lanes: 1 | 2;
  /**
   * First and last cell along the Street's length. Omitted means it runs edge to edge.
   * A Street that stops early ends on the far side of the Street it meets, making a T-junction.
   */
  from?: number;
  to?: number;
}

export interface Vehicle {
  kind: Kind;
  /** Front cell. The rest of the Vehicle trails behind it, opposite to `dir`. */
  x: number;
  y: number;
  dir: Dir;
  arrow: Arrow;
}

export interface Level {
  w: number;
  h: number;
  streets: Street[];
  vehicles: Vehicle[];
}

export interface Cell {
  x: number;
  y: number;
}

export function streetStart(street: Street): number {
  return street.from ?? 0;
}

export function streetEnd(street: Street, level: Pick<Level, 'w' | 'h'>): number {
  return street.to ?? (street.axis === 'v' ? level.h : level.w) - 1;
}

export function inBoard(level: Pick<Level, 'w' | 'h'>, { x, y }: Cell): boolean {
  return x >= 0 && y >= 0 && x < level.w && y < level.h;
}

/** Whether the Street covers a cell. */
export function covers(level: Pick<Level, 'w' | 'h'>, street: Street, { x, y }: Cell): boolean {
  const [across, along] = street.axis === 'v' ? [x, y] : [y, x];
  return (
    across >= street.at &&
    across < street.at + street.lanes &&
    along >= streetStart(street) &&
    along <= streetEnd(street, level)
  );
}

/** The Street running along `axis` through a cell, if any. Streets of one axis never overlap. */
export function streetAt(level: Level, cell: Cell, axis: Axis): Street | undefined {
  return level.streets.find((street) => street.axis === axis && covers(level, street, cell));
}

export function isRoad(level: Level, cell: Cell): boolean {
  return level.streets.some((street) => covers(level, street, cell));
}

/** An Intersection cell is covered by one Street of each axis. */
export function isIntersection(level: Level, cell: Cell): boolean {
  return streetAt(level, cell, 'h') !== undefined && streetAt(level, cell, 'v') !== undefined;
}

/**
 * The column (v) or row (h) a Vehicle heading `dir` drives in on this Street.
 * Single-lane Streets have one Lane for both directions; two-lane Streets keep right.
 */
export function laneOf(street: Street, dir: Dir): number {
  if (street.lanes === 1) return street.at;
  // Keep right: heading north the right-hand side is east (the higher column);
  // heading east the right-hand side is south (the higher row).
  return dir === 'N' || dir === 'E' ? street.at + 1 : street.at;
}

export function cellsOf(vehicle: Vehicle): Cell[] {
  const { dx, dy } = STEP[vehicle.dir];
  return Array.from({ length: LENGTH[vehicle.kind] }, (_, k) => ({
    x: vehicle.x - dx * k,
    y: vehicle.y - dy * k,
  }));
}

export const key = ({ x, y }: Cell): string => `${x},${y}`;

/** Problems with a Level's layout, or [] when it's fine. Routes are checked separately. */
export function layoutProblems(level: Level): string[] {
  const problems: string[] = [];
  for (const [i, street] of level.streets.entries()) {
    const width = street.axis === 'v' ? level.w : level.h;
    if (street.at < 0 || street.at + street.lanes > width) problems.push(`street ${i} is off the board`);
    for (const [end, value] of [
      ['from', street.from],
      ['to', street.to],
    ] as const) {
      if (value === undefined) continue;
      // A Street that stops early must end on the far edge of a crossing Street (a T-junction).
      const cell = street.axis === 'v' ? { x: street.at, y: value } : { x: value, y: street.at };
      const meets = level.streets.some(
        (other) =>
          other.axis !== street.axis &&
          (end === 'from' ? other.at === value : other.at + other.lanes - 1 === value) &&
          covers(level, other, cell),
      );
      if (!meets) problems.push(`street ${i} ${end}=${value} doesn't end on a crossing street`);
    }
    for (const [j, other] of level.streets.entries()) {
      if (j <= i || other.axis !== street.axis) continue;
      if (other.at < street.at + street.lanes + 1 && street.at < other.at + other.lanes + 1) {
        problems.push(`streets ${i} and ${j} touch`);
      }
    }
  }
  const taken = new Set<string>();
  for (const [i, vehicle] of level.vehicles.entries()) {
    const street = streetAt(level, vehicle, axisOf(vehicle.dir));
    for (const cell of cellsOf(vehicle)) {
      if (!inBoard(level, cell)) problems.push(`vehicle ${i} is off the board`);
      if (!street || !covers(level, street, cell)) problems.push(`vehicle ${i} is off its street`);
      if (taken.has(key(cell))) problems.push(`vehicle ${i} overlaps another`);
      taken.add(key(cell));
    }
    if (street) {
      const across = vehicle.dir === 'N' || vehicle.dir === 'S' ? vehicle.x : vehicle.y;
      if (across !== laneOf(street, vehicle.dir)) problems.push(`vehicle ${i} is in the wrong lane`);
    }
  }
  return problems;
}
