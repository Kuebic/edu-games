// A Level is parsed from the standard Sokoban text format:
//   #  wall        $  box         .  goal
//   @  player      *  box on goal +  player on goal
//   space, - or _  floor (or outside, if not reachable from the player)

export type Cell = 'outside' | 'wall' | 'floor';

export interface Position {
  readonly player: number;
  /** Box squares. Order is stable across steps so each box keeps its identity. */
  readonly boxes: readonly number[];
}

export interface Level {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly Cell[];
  readonly goals: ReadonlySet<number>;
  readonly start: Position;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right'];

export function offset(level: Level, dir: Direction): number {
  switch (dir) {
    case 'up':
      return -level.width;
    case 'down':
      return level.width;
    case 'left':
      return -1;
    case 'right':
      return 1;
  }
}

/** Square one step from `square` in `dir`, or undefined if that leaves the grid. */
export function neighbour(level: Level, square: number, dir: Direction): number | undefined {
  const x = square % level.width;
  if (dir === 'left' && x === 0) return undefined;
  if (dir === 'right' && x === level.width - 1) return undefined;
  const next = square + offset(level, dir);
  return next >= 0 && next < level.cells.length ? next : undefined;
}

export function parseLevel(text: string): Level {
  const rows = text.split('\n').filter((row) => row.trim() !== '');
  const height = rows.length;
  const width = Math.max(...rows.map((row) => row.length));
  const walls = new Set<number>();
  const goals = new Set<number>();
  const boxes: number[] = [];
  let player: number | undefined;

  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) {
      const ch = row[x] ?? ' ';
      const square = y * width + x;
      if (ch === '#') walls.add(square);
      if (ch === '.' || ch === '*' || ch === '+') goals.add(square);
      if (ch === '$' || ch === '*') boxes.push(square);
      if (ch === '@' || ch === '+') {
        if (player !== undefined) throw new Error('Level has more than one player');
        player = square;
      }
      if (!'#.*+$@ -_'.includes(ch)) throw new Error(`Unknown level character "${ch}"`);
    }
  });

  if (player === undefined) throw new Error('Level has no player');
  if (boxes.length === 0) throw new Error('Level has no boxes');
  if (boxes.length !== goals.size) {
    throw new Error(`Level has ${boxes.length} boxes but ${goals.size} goals`);
  }

  // Floor is whatever the player could reach if there were no boxes; everything else
  // that is not a wall is outside.
  const cells: Cell[] = Array.from({ length: width * height }, (_, i) =>
    walls.has(i) ? 'wall' : 'outside',
  );
  const level: Level = { width, height, cells, goals, start: { player, boxes } };
  const pending = [player];
  cells[player] = 'floor';
  while (pending.length > 0) {
    const square = pending.pop()!;
    for (const dir of DIRECTIONS) {
      const next = neighbour(level, square, dir);
      if (next === undefined) throw new Error('Level floor is not enclosed by walls');
      if (cells[next] === 'outside') {
        cells[next] = 'floor';
        pending.push(next);
      }
    }
  }

  for (const square of [...goals, ...boxes]) {
    if (cells[square] !== 'floor') throw new Error('Box or goal is outside the walls');
  }

  return level;
}
