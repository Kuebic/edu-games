// Difficulty measures. Par alone doesn't say how hard a board feels to a four-year-old,
// so the level scripts and tests look at all of these.

import { cells, EMPTY, explore, HERO, parse, SIZE, WALL, walls, type Board, type Piece } from './board';

export interface Measures {
  /** Fewest Moves to solve. */
  par: number;
  /** Vehicles on the board, the red car included. */
  vehicles: number;
  trucks: number;
  walls: number;
  /** Distinct Vehicles a shortest solution moves. */
  moved: number;
  /** Every shortest solution moves some Vehicle twice ("move it away, then back"). */
  repeats: boolean;
  /** Every shortest solution backs the red car up first. */
  backwards: boolean;
  /** Longest chain of "this blocks that blocks the red car". */
  depth: number;
}

export function measure(board: Board): Measures {
  const space = explore(board);
  if (!space) throw new Error(`too many positions to measure ${board}`);
  const { pieces, edges } = space;
  const goals = edges.flatMap((_, n) => (space.solved(n) ? [n] : []));
  if (goals.length === 0) throw new Error(`unsolvable board ${board}`);

  // Moves can always be undone, so the distance to the nearest solved position is
  // a breadth-first search out from all of them at once.
  const toGoal = new Int32Array(edges.length).fill(-1);
  for (const n of goals) toGoal[n] = 0;
  for (let i = 0, queue = goals; i < queue.length; i++) {
    for (const { to } of edges[queue[i]!]!) {
      if (toGoal[to] === -1) {
        toGoal[to] = toGoal[queue[i]!]! + 1;
        queue.push(to);
      }
    }
  }
  const par = toGoal[0]!;
  // The Moves that stay on some shortest solution. Solved positions end a solution.
  const onward = (n: number) => (toGoal[n] === 0 ? [] : edges[n]!.filter((e) => toGoal[e.to] === toGoal[n]! - 1));

  const one: string[] = [];
  for (let n = 0; toGoal[n]! > 0; ) {
    const e = onward(n)[0]!;
    one.push(e.move.piece);
    n = e.to;
  }

  const index = new Map(pieces.map((p, i) => [p.id, i]));
  const dead = new Set<string>();
  /** Some shortest solution from `n` moves no Vehicle in `used`, or any Vehicle twice. */
  const eachOnce = (n: number, used: number): boolean => {
    if (toGoal[n] === 0) return true;
    const key = `${n}|${used}`;
    if (dead.has(key)) return false;
    const ok = onward(n).some((e) => {
      const bit = 1 << index.get(e.move.piece)!;
      return !(used & bit) && eachOnce(e.to, used | bit);
    });
    if (!ok) dead.add(key);
    return ok;
  };

  const forward = new Map<number, boolean>();
  /** Some shortest solution from `n` never backs the red car up. */
  const staysForward = (n: number): boolean => {
    if (toGoal[n] === 0) return true;
    if (!forward.has(n)) {
      forward.set(n, onward(n).some((e) => !(e.move.piece === HERO && e.move.delta < 0) && staysForward(e.to)));
    }
    return forward.get(n)!;
  };

  return {
    par,
    vehicles: pieces.length,
    trucks: pieces.filter((p) => p.length === 3).length,
    walls: walls(board).length,
    moved: new Set(one).size,
    repeats: !eachOnce(0, 0),
    backwards: !staysForward(0),
    depth: blockingDepth(board),
  };
}

/**
 * How deep the blocking goes on the starting board. A Vehicle in the red car's way that
 * can simply slide aside is depth 1; one that first needs another Vehicle moved is 2; and so on.
 * Each blocker takes its easier way out (up or down, left or right).
 */
export function blockingDepth(board: Board): number {
  const pieces = parse(board);
  const byId = new Map(pieces.map((p) => [p.id, p]));
  const hero = byId.get(HERO)!;
  const path = new Set<number>();
  for (let col = hero.at + hero.length; col < SIZE; col++) path.add(hero.line * SIZE + col);

  const blockersIn = (area: Iterable<number>, except: string) => {
    const found = new Set<string>();
    for (const cell of area) {
      const ch = board[cell]!;
      if (ch !== EMPTY && ch !== WALL && ch !== except) found.add(ch);
    }
    return [...found];
  };

  /** Moves needed, counting down the chain, for `piece` to get out of `area`. */
  const clear = (piece: Piece, area: Set<number>, chain: Set<string>): number => {
    let best = Infinity;
    for (const sign of [-1, 1]) {
      // Slide one cell at a time until no part of it is in the area.
      let shift = sign;
      let swept: number[] = [];
      let possible = true;
      for (;;) {
        const at = piece.at + shift;
        if (at < 0 || at + piece.length > SIZE) {
          possible = false;
          break;
        }
        const now = cells(piece, at);
        swept = [...swept, ...now.filter((c) => !cells(piece).includes(c) && !swept.includes(c))];
        if (swept.some((c) => board[c] === WALL)) {
          possible = false;
          break;
        }
        if (!now.some((c) => area.has(c))) break;
        shift += sign;
      }
      if (!possible) continue;
      const blockers = blockersIn(swept, piece.id).filter((id) => !chain.has(id));
      const cost =
        1 +
        Math.max(0, ...blockers.map((id) => clear(byId.get(id)!, new Set(swept), new Set([...chain, piece.id]))));
      best = Math.min(best, cost);
    }
    // Stuck both ways on the starting board: it still counts as one link.
    return best === Infinity ? 1 : best;
  };

  return Math.max(0, ...blockersIn(path, HERO).map((id) => clear(byId.get(id)!, path, new Set([HERO]))));
}
