import { DIRECTIONS, type Direction, type Level, neighbour } from './level';

// Exhaustive search over push positions. Levels are tiny (at most a few boxes on an
// 8x8 board), so we can afford to explore every reachable position. That lets us say
// not just "solvable in N pushes" but "impossible to get stuck".

const MAX_STATES = 500_000;

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export interface Analysis {
  readonly solvable: boolean;
  /** Fewest pushes to solve; Infinity if unsolvable. */
  readonly minPushes: number;
  /** True if no reachable position is stuck. */
  readonly forgiving: boolean;
  /** Distinct positions reachable from the start (player squares that can reach each other count once). */
  readonly states: number;
  /** A solution with the fewest pushes, as player steps. Empty if unsolvable. */
  readonly solution: readonly Direction[];
}

interface Node {
  readonly boxes: readonly number[]; // sorted
  readonly player: number;
  readonly parent: number; // index into nodes, -1 for start
  readonly push?: { readonly box: number; readonly dir: Direction };
}

/** Squares the player can walk to, with a BFS parent map for path finding. */
function walkable(level: Level, player: number, boxes: ReadonlySet<number>): Map<number, number> {
  const parent = new Map<number, number>([[player, -1]]);
  const queue = [player];
  for (let i = 0; i < queue.length; i++) {
    const square = queue[i]!;
    for (const dir of DIRECTIONS) {
      const next = neighbour(level, square, dir);
      if (next === undefined || parent.has(next)) continue;
      if (level.cells[next] !== 'floor' || boxes.has(next)) continue;
      parent.set(next, square);
      queue.push(next);
    }
  }
  return parent;
}

function keyOf(boxes: readonly number[], region: Map<number, number>): string {
  return `${boxes.join(',')}|${Math.min(...region.keys())}`;
}

export function analyse(level: Level): Analysis {
  const nodes: Node[] = [];
  const index = new Map<string, number>();
  const parentsOf: number[][] = [];
  let firstSolved = -1;

  const isSolved = (boxes: readonly number[]) => boxes.every((b) => level.goals.has(b));

  const add = (node: Node, region: Map<number, number>): number => {
    const key = keyOf(node.boxes, region);
    const existing = index.get(key);
    if (existing !== undefined) return existing;
    if (nodes.length >= MAX_STATES) throw new Error('Level too large to analyse');
    const id = nodes.length;
    nodes.push(node);
    parentsOf.push([]);
    index.set(key, id);
    if (firstSolved === -1 && isSolved(node.boxes)) firstSolved = id;
    return id;
  };

  const startBoxes = [...level.start.boxes].sort((a, b) => a - b);
  add(
    { boxes: startBoxes, player: level.start.player, parent: -1 },
    walkable(level, level.start.player, new Set(startBoxes)),
  );

  for (let id = 0; id < nodes.length; id++) {
    const { boxes, player } = nodes[id]!;
    const boxSet = new Set(boxes);
    const region = walkable(level, player, boxSet);
    for (const box of boxes) {
      for (const dir of DIRECTIONS) {
        const behind = neighbour(level, box, OPPOSITE[dir]);
        const target = neighbour(level, box, dir);
        if (behind === undefined || !region.has(behind)) continue;
        if (target === undefined || level.cells[target] !== 'floor' || boxSet.has(target)) continue;
        const next = boxes.map((b) => (b === box ? target : b)).sort((a, b) => a - b);
        const nextRegion = walkable(level, box, new Set(next));
        const child = add({ boxes: next, player: box, parent: id, push: { box, dir } }, nextRegion);
        parentsOf[child]!.push(id);
      }
    }
  }

  // Which positions can still reach a solved one? Walk the push graph backwards.
  const canSolve = new Array<boolean>(nodes.length).fill(false);
  const queue: number[] = [];
  nodes.forEach((node, id) => {
    if (isSolved(node.boxes)) {
      canSolve[id] = true;
      queue.push(id);
    }
  });
  for (let i = 0; i < queue.length; i++) {
    for (const parent of parentsOf[queue[i]!]!) {
      if (!canSolve[parent]) {
        canSolve[parent] = true;
        queue.push(parent);
      }
    }
  }

  const solvable = firstSolved !== -1;
  return {
    solvable,
    minPushes: solvable ? pushCount(nodes, firstSolved) : Infinity,
    forgiving: canSolve.every(Boolean),
    states: nodes.length,
    solution: solvable ? stepsTo(level, nodes, firstSolved) : [],
  };
}

/**
 * True if every solution needs a trick: pushing a box off a goal, or pushing a box back
 * the way it came. Those moves look like undoing progress, so they make a level harder.
 */
export function needsTrick(level: Level): boolean {
  const BIT: Record<Direction, number> = { up: 1, down: 2, left: 4, right: 8 };
  // Search only trick-free pushes. Boxes keep their order so each one's history stays with it.
  const start = { boxes: level.start.boxes, pushed: level.start.boxes.map(() => 0), player: level.start.player };
  const keyOf = (boxes: readonly number[], pushed: readonly number[], region: Map<number, number>) =>
    `${boxes.join(',')}|${pushed.join(',')}|${Math.min(...region.keys())}`;
  const queue = [start];
  const seen = new Set([keyOf(start.boxes, start.pushed, walkable(level, start.player, new Set(start.boxes)))]);

  for (let i = 0; i < queue.length; i++) {
    const { boxes, pushed, player } = queue[i]!;
    if (boxes.every((b) => level.goals.has(b))) return false;
    const boxSet = new Set(boxes);
    const region = walkable(level, player, boxSet);
    boxes.forEach((box, n) => {
      if (level.goals.has(box)) return;
      for (const dir of DIRECTIONS) {
        if (pushed[n]! & BIT[OPPOSITE[dir]]) continue;
        const behind = neighbour(level, box, OPPOSITE[dir]);
        const target = neighbour(level, box, dir);
        if (behind === undefined || !region.has(behind)) continue;
        if (target === undefined || level.cells[target] !== 'floor' || boxSet.has(target)) continue;
        const next = boxes.map((b) => (b === box ? target : b));
        const nextPushed = pushed.map((p, m) => (m === n ? p | BIT[dir] : p));
        const key = keyOf(next, nextPushed, walkable(level, box, new Set(next)));
        if (seen.has(key)) continue;
        seen.add(key);
        queue.push({ boxes: next, pushed: nextPushed, player: box });
      }
    });
  }
  return true;
}

function pushCount(nodes: readonly Node[], id: number): number {
  let count = 0;
  for (let at = id; nodes[at]!.parent !== -1; at = nodes[at]!.parent) count++;
  return count;
}

function stepsTo(level: Level, nodes: readonly Node[], id: number): Direction[] {
  const pushes: { box: number; dir: Direction }[] = [];
  for (let at = id; nodes[at]!.parent !== -1; at = nodes[at]!.parent) pushes.push(nodes[at]!.push!);
  pushes.reverse();

  const steps: Direction[] = [];
  const boxes = new Set(level.start.boxes);
  let player = level.start.player;
  for (const { box, dir } of pushes) {
    const behind = neighbour(level, box, OPPOSITE[dir])!;
    const parent = walkable(level, player, boxes);
    const path: Direction[] = [];
    for (let at = behind; at !== player; at = parent.get(at)!) {
      const from = parent.get(at)!;
      path.push(DIRECTIONS.find((d) => neighbour(level, from, d) === at)!);
    }
    steps.push(...path.reverse(), dir);
    boxes.delete(box);
    boxes.add(neighbour(level, box, dir)!);
    player = box;
  }
  return steps;
}
