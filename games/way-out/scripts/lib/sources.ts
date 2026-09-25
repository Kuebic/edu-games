// Where candidate boards come from: our own random generator (the easy end) and
// Michael Fogleman's Rush Hour database (the middle and hard end).

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';
import { canonical, cellOf, EMPTY, EXIT_ROW, HERO, isSolved, SIZE, solve, type Board } from '../../src/game/board';
import type { Level } from '../../src/packs';

export interface Candidate {
  board: Board;
  par: number;
  source: Level['source'];
}

/** Seeded random numbers (mulberry32): same seed, same boards. */
export function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random board: the red car, then up to `others` more Vehicles wherever they fit. */
function randomBoard(rand: () => number, others: number): Board {
  const board = Array<string>(SIZE * SIZE).fill(EMPTY);
  const heroAt = Math.floor(rand() * (SIZE - 2));
  board[cellOf(EXIT_ROW, heroAt)] = board[cellOf(EXIT_ROW, heroAt + 1)] = HERO;
  let placed = 0;
  for (let tries = 0; placed < others && tries < 200; tries++) {
    const length = rand() < 0.3 ? 3 : 2;
    const horizontal = rand() < 0.5;
    const line = Math.floor(rand() * SIZE);
    // A Vehicle lying across the red car's row could never let it out.
    if (horizontal && line === EXIT_ROW) continue;
    const at = Math.floor(rand() * (SIZE - length + 1));
    const where = Array.from({ length }, (_, i) => (horizontal ? cellOf(line, at + i) : cellOf(at + i, line)));
    if (where.some((cell) => board[cell] !== EMPTY)) continue;
    const id = String.fromCharCode('B'.charCodeAt(0) + placed++);
    for (const cell of where) board[cell] = id;
  }
  return canonical(board.join(''));
}

/**
 * Random boards with 2 to `maxVehicles` Vehicles whose par is at most `maxPar`.
 * Cheap: easy boards solve in microseconds.
 */
export function generate(seed: number, count: number, maxVehicles: number, maxPar: number): Candidate[] {
  const rand = random(seed);
  const found = new Map<Board, Candidate>();
  for (let tries = 0; found.size < count && tries < count * 200; tries++) {
    const board = randomBoard(rand, 1 + Math.floor(rand() * (maxVehicles - 1)));
    if (found.has(board) || isSolved(board)) continue;
    const moves = solve(board, { limit: 20_000 });
    if (!moves || moves.length > maxPar) continue;
    found.set(board, { board, par: moves.length, source: 'generated' });
  }
  return [...found.values()];
}

export interface DatabaseFilter {
  par: [number, number];
  vehicles: [number, number];
  walls: boolean;
}

/**
 * Reads the database (`moves board cluster-size` per line, gzipped) and keeps a seeded
 * random sample of up to `perCell` boards for every par and Vehicle count in each filter.
 * Sampling per cell keeps the rare, hard ends of a range from being crowded out.
 */
export async function readDatabase(
  path: string,
  filters: readonly DatabaseFilter[],
  perCell: number,
  seed: number,
): Promise<Candidate[][]> {
  const rand = random(seed);
  const cells = filters.map(() => new Map<string, { seen: number; kept: Candidate[] }>());
  const lines = createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of lines) {
    const [moves, board] = line.split(' ');
    if (!moves || !board) continue;
    const par = Number(moves);
    const vehicles = new Set(board.replace(/[ox]/g, '')).size;
    const hasWalls = board.includes('x');
    filters.forEach((f, i) => {
      if (par < f.par[0] || par > f.par[1] || vehicles < f.vehicles[0] || vehicles > f.vehicles[1]) return;
      if (hasWalls && !f.walls) return;
      const key = `${par}/${vehicles}`;
      const cell = cells[i]!.get(key) ?? { seen: 0, kept: [] };
      cells[i]!.set(key, cell);
      cell.seen++;
      const candidate: Candidate = { board, par, source: 'fogleman' };
      if (cell.kept.length < perCell) cell.kept.push(candidate);
      else {
        const slot = Math.floor(rand() * cell.seen);
        if (slot < perCell) cell.kept[slot] = candidate;
      }
    });
  }
  return cells.map((byCell) => [...byCell.values()].flatMap((cell) => cell.kept));
}
