// The rules, with no drawing. A Board is the puzzle database's 36-character string,
// read row by row: `o` empty, `x` a Wall, `A` the red car, `B`-`Z` other Vehicles.
// Shared by the game, its solver worker, the level scripts and the tests.

export const SIZE = 6;
/** The row the red car sits on; the Exit is at its right-hand end. */
export const EXIT_ROW = 2;
export const HERO = 'A';
export const EMPTY = 'o';
export const WALL = 'x';

export type Board = string;

export interface Piece {
  id: string;
  horizontal: boolean;
  length: number;
  /** The row a horizontal Vehicle sits on, or the column of a vertical one. */
  line: number;
  /** Where its top or left end is along that line. */
  at: number;
}

/** One Move: a Vehicle slides `delta` cells. Negative is up or left, as in the database. */
export interface Move {
  piece: string;
  delta: number;
}

export const cellOf = (row: number, col: number) => row * SIZE + col;

export function cells(piece: Piece, at = piece.at): number[] {
  return Array.from({ length: piece.length }, (_, i) =>
    piece.horizontal ? cellOf(piece.line, at + i) : cellOf(at + i, piece.line),
  );
}

/** Everything wrong with a board string. Empty means it can be played. */
export function boardProblems(board: string): string[] {
  const problems: string[] = [];
  if (board.length !== SIZE * SIZE) return [`board is ${board.length} characters, not ${SIZE * SIZE}`];
  if (!/^[oxA-Z]+$/.test(board)) problems.push('board uses a character other than o, x or A-Z');
  const seen = new Map<string, number[]>();
  [...board].forEach((ch, i) => {
    if (/[A-Z]/.test(ch)) seen.set(ch, [...(seen.get(ch) ?? []), i]);
  });
  if (!seen.has(HERO)) problems.push('there is no red car (A)');
  for (const [id, where] of seen) {
    const rows = new Set(where.map((i) => Math.floor(i / SIZE)));
    const cols = new Set(where.map((i) => i % SIZE));
    const straight = rows.size === 1 || cols.size === 1;
    const step = rows.size === 1 ? 1 : SIZE;
    const joined = where.every((cell, k) => k === 0 || cell - where[k - 1]! === step);
    if (where.length < 2 || where.length > 3 || !straight || !joined) {
      problems.push(`${id} is not a straight Vehicle of length 2 or 3`);
    } else if (id === HERO && !(rows.size === 1 && rows.has(EXIT_ROW))) {
      problems.push(`the red car must lie across row ${EXIT_ROW + 1}`);
    }
  }
  return problems;
}

/** The Vehicles on a valid board, in letter order (A first). */
export function parse(board: Board): Piece[] {
  const pieces = new Map<string, Piece>();
  for (let i = 0; i < board.length; i++) {
    const id = board[i]!;
    if (id === EMPTY || id === WALL) continue;
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;
    const piece = pieces.get(id);
    if (!piece) {
      const horizontal = col + 1 < SIZE && board[i + 1] === id;
      pieces.set(id, { id, horizontal, length: 1, line: horizontal ? row : col, at: horizontal ? col : row });
    } else piece.length++;
  }
  return [...pieces.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
}

export function walls(board: Board): number[] {
  return [...board].flatMap((ch, i) => (ch === WALL ? [i] : []));
}

/** How far a Vehicle can slide back (negative) and forward from where it is. */
export function reach(board: Board, piece: Piece): { back: number; forward: number } {
  const free = (at: number) => {
    const cell = piece.horizontal ? cellOf(piece.line, at) : cellOf(at, piece.line);
    return at >= 0 && at < SIZE && board[cell] === EMPTY;
  };
  let back = 0;
  while (free(piece.at + back - 1)) back--;
  let forward = 0;
  while (free(piece.at + piece.length + forward)) forward++;
  return { back, forward };
}

export function legalMoves(board: Board): Move[] {
  const moves: Move[] = [];
  for (const piece of parse(board)) {
    const { back, forward } = reach(board, piece);
    for (let delta = back; delta <= forward; delta++) if (delta !== 0) moves.push({ piece: piece.id, delta });
  }
  return moves;
}

/** The board after a Move. Assumes the Move is legal. */
export function apply(board: Board, move: Move): Board {
  const piece = parse(board).find((p) => p.id === move.piece);
  if (!piece) throw new Error(`no Vehicle ${move.piece}`);
  const next = [...board];
  for (const cell of cells(piece)) next[cell] = EMPTY;
  for (const cell of cells(piece, piece.at + move.delta)) next[cell] = piece.id;
  return next.join('');
}

/** Solved: the red car fills the two right-hand cells of its row, at the Exit. */
export function isSolved(board: Board): boolean {
  return board[cellOf(EXIT_ROW, SIZE - 1)] === HERO && board[cellOf(EXIT_ROW, SIZE - 2)] === HERO;
}

/** True when nothing stands between the red car and the Exit. */
export function exitIsClear(board: Board): boolean {
  const hero = parse(board).find((p) => p.id === HERO)!;
  return hero.at + hero.length + reach(board, hero).forward === SIZE;
}

export interface SolveOptions {
  /** Leave these Moves out of the search, to ask "can it be done without...?" */
  forbid?: (move: Move) => boolean;
  /** Give up past this many board positions. */
  limit?: number;
}

/**
 * The shortest list of Moves that solves the board, or null if none does.
 * Breadth-first over positions; one slide of any length is one Move.
 */
export function solve(board: Board, options: SolveOptions = {}): Move[] | null {
  const pieces = parse(board);
  const count = pieces.length;
  const wallCells = walls(board);
  const hero = pieces.findIndex((p) => p.id === HERO);
  const goal = SIZE - pieces[hero]!.length;
  const limit = options.limit ?? 2_000_000;

  // A position is where each Vehicle is along its line, packed into a string key.
  const start = pieces.map((p) => p.at);
  const positions: number[][] = [start];
  const parents: number[] = [-1];
  const via: Move[] = [];
  const seen = new Set([String.fromCharCode(...start)]);
  if (start[hero] === goal) return [];

  const grid = new Uint8Array(SIZE * SIZE);
  for (let n = 0; n < positions.length; n++) {
    const at = positions[n]!;
    grid.fill(0);
    for (const cell of wallCells) grid[cell] = 1;
    for (let p = 0; p < count; p++) {
      const { horizontal, line, length } = pieces[p]!;
      for (let k = 0; k < length; k++) grid[horizontal ? line * SIZE + at[p]! + k : (at[p]! + k) * SIZE + line] = 1;
    }
    for (let p = 0; p < count; p++) {
      const { id, horizontal, line, length } = pieces[p]!;
      const free = (along: number) =>
        along >= 0 && along < SIZE && grid[horizontal ? line * SIZE + along : along * SIZE + line] === 0;
      for (const sign of [-1, 1]) {
        for (let delta = sign; ; delta += sign) {
          const edge = sign < 0 ? at[p]! + delta : at[p]! + length - 1 + delta;
          if (!free(edge)) break;
          const move = { piece: id, delta };
          if (options.forbid?.(move)) continue;
          const next = at.slice();
          next[p] = at[p]! + delta;
          const key = String.fromCharCode(...next);
          if (seen.has(key)) continue;
          seen.add(key);
          positions.push(next);
          parents.push(n);
          via.push(move);
          if (p === hero && next[p] === goal) return path(positions.length - 1);
          if (positions.length > limit) return null;
        }
      }
    }
  }
  return null;

  function path(n: number): Move[] {
    const moves: Move[] = [];
    for (; parents[n]! !== -1; n = parents[n]!) moves.push(via[n - 1]!);
    return moves.reverse();
  }
}

/** Every position reachable from a board, and the Moves between them. */
export interface Space {
  pieces: Piece[];
  /** Where each Vehicle is along its line, per position. Position 0 is the start. */
  positions: number[][];
  /** Moves out of each position: which position they lead to, and the Move. */
  edges: { to: number; move: Move }[][];
  solved: (n: number) => boolean;
}

/** Explores every position reachable from `board`, or returns null past `limit` positions. */
export function explore(board: Board, limit = 500_000): Space | null {
  const pieces = parse(board);
  const wallCells = walls(board);
  const hero = pieces.findIndex((p) => p.id === HERO);
  const goal = SIZE - pieces[hero]!.length;
  const positions = [pieces.map((p) => p.at)];
  const index = new Map([[String.fromCharCode(...positions[0]!), 0]]);
  const edges: Space['edges'] = [];
  const grid = new Uint8Array(SIZE * SIZE);
  for (let n = 0; n < positions.length; n++) {
    const at = positions[n]!;
    const out: Space['edges'][number] = [];
    grid.fill(0);
    for (const cell of wallCells) grid[cell] = 1;
    pieces.forEach(({ horizontal, line, length }, p) => {
      for (let k = 0; k < length; k++) grid[horizontal ? line * SIZE + at[p]! + k : (at[p]! + k) * SIZE + line] = 1;
    });
    pieces.forEach(({ id, horizontal, line, length }, p) => {
      const free = (along: number) =>
        along >= 0 && along < SIZE && grid[horizontal ? line * SIZE + along : along * SIZE + line] === 0;
      for (const sign of [-1, 1]) {
        for (let delta = sign; free(sign < 0 ? at[p]! + delta : at[p]! + length - 1 + delta); delta += sign) {
          const next = at.slice();
          next[p] = at[p]! + delta;
          const key = String.fromCharCode(...next);
          let to = index.get(key);
          if (to === undefined) {
            to = positions.length;
            index.set(key, to);
            positions.push(next);
            if (positions.length > limit) return null;
          }
          out.push({ to, move: { piece: id, delta } });
        }
      }
    });
    edges.push(out);
  }
  return { pieces, positions, edges, solved: (n) => positions[n]![hero] === goal };
}

/** Relabels Vehicles B, C, D... in reading order, as the database does, so equal puzzles get equal strings. */
export function canonical(board: Board): Board {
  const names = new Map<string, string>([[HERO, HERO]]);
  let next = 'B'.charCodeAt(0);
  return [...board]
    .map((ch) => {
      if (ch === EMPTY || ch === WALL) return ch;
      if (!names.has(ch)) names.set(ch, String.fromCharCode(next++));
      return names.get(ch)!;
    })
    .join('');
}
