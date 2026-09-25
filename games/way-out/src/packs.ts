// The Pack ladder. The level scripts pick Levels and Pool puzzles to these limits;
// levels.test.ts fails any board that breaks them.

import { boardProblems, isSolved, type Board } from './game/board';
import { measure, type Measures } from './game/measure';

/** One Level as shipped in levels.ts. */
export interface Level {
  /** `p<pack>-<index>`, the key its progress is saved under. */
  id: string;
  pack: number;
  index: number;
  board: Board;
  par: number;
  /** Where it came from, for tracking only. */
  source: 'generated' | 'fogleman';
}

/** A "more like this" puzzle: its board and par. */
export type PoolPuzzle = readonly [board: Board, par: number];

export interface PackSpec {
  /** For grown-ups and the level report; never shown to the child. */
  name: string;
  par: [number, number];
  /** Vehicles on the board, the red car included. */
  vehicles: [number, number];
  /** Most links in a blocking chain. */
  depth: number;
  /** May a Level need a Vehicle moved twice? */
  repeats: boolean;
  walls: boolean;
  /** May a Level need the red car to back up first? */
  backwards: boolean;
  /** Something at least one Level in the Pack must show. */
  needs?: 'depth-2' | 'repeats' | 'depth-3' | 'walls';
}

export const LEVELS_PER_PACK = 12;
/** Solve this many of a Pack's Levels to open the next Pack. */
export const OPENS_NEXT = 9;

export const PACKS: readonly PackSpec[] = [
  { name: 'First drive', par: [1, 3], vehicles: [2, 5], depth: 1, repeats: false, walls: false, backwards: false },
  { name: 'Busy street', par: [4, 6], vehicles: [5, 8], depth: 2, repeats: false, walls: false, backwards: false, needs: 'depth-2' },
  { name: 'Traffic', par: [7, 10], vehicles: [7, 10], depth: 2, repeats: true, walls: false, backwards: false, needs: 'repeats' },
  { name: 'Jam', par: [11, 16], vehicles: [9, 12], depth: 3, repeats: true, walls: false, backwards: false, needs: 'depth-3' },
  { name: 'Gridlock', par: [17, 25], vehicles: [10, 13], depth: 6, repeats: true, walls: true, backwards: true, needs: 'walls' },
  // The bonus Pack, opened from the grown-up menu.
  { name: 'Grown-up', par: [26, 60], vehicles: [2, 16], depth: 6, repeats: true, walls: true, backwards: true },
];

/** Pack number (1-based) of the bonus Pack. It doesn't count toward opening anything. */
export const GROWN_UP_PACK = PACKS.length;

export function fitsPack(m: Measures, spec: PackSpec): boolean {
  return (
    m.par >= spec.par[0] &&
    m.par <= spec.par[1] &&
    m.vehicles >= spec.vehicles[0] &&
    m.vehicles <= spec.vehicles[1] &&
    m.depth <= spec.depth &&
    (spec.repeats || !m.repeats) &&
    (spec.walls || m.walls === 0) &&
    (spec.backwards || !m.backwards)
  );
}

export function showsNeed(m: Measures, need: NonNullable<PackSpec['needs']>): boolean {
  switch (need) {
    case 'depth-2': return m.depth >= 2;
    case 'depth-3': return m.depth >= 3;
    case 'repeats': return m.repeats;
    case 'walls': return m.walls > 0;
  }
}

/** Everything wrong with one board for its Pack. Empty means it can ship. */
export function puzzleProblems(board: Board, par: number, spec: PackSpec): string[] {
  const problems = boardProblems(board);
  if (problems.length) return problems;
  if (isSolved(board)) return ['already solved'];
  let m: Measures;
  try {
    m = measure(board);
  } catch {
    return ['cannot be solved'];
  }
  if (m.par !== par) return [`par says ${par} but it takes ${m.par}`];
  return fitsPack(m, spec) ? [] : [`outside the ${spec.name} limits: ${JSON.stringify(m)}`];
}
