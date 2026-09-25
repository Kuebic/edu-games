// Breadth-first search for the shortest Program with no Repeat Blocks. Worlds 1-5 use it
// for Par; the level report shows it for every Level so slot limits can be checked.

import { initialState, missing, stepOnce, type RunState } from './engine';
import { PLAINS, type Level, type Plain } from './level';

const MAX_STATES = 200_000;

function keyOf(state: RunState, withFacing: boolean): string {
  const items = state.items.map((item) => (item.taken ? '-' : `${item.x},${item.y}`)).join(' ');
  return `${state.x},${state.y}${withFacing ? state.facing : ''}|${items}|${state.spelled},${state.counted},${state.sum}`;
}

/** The shortest winning list of plain Commands from the Level's palette, or null if none. */
export function shortest(level: Level): Plain[] | null {
  const ops = PLAINS.filter((op) => level.palette.includes(op));
  // Arrows set the facing themselves, so it only matters when the robot can go forward.
  const withFacing = ops.includes('forward');
  const start = initialState(level);
  const seen = new Map<string, { parent: string | null; op?: Plain }>([[keyOf(start, withFacing), { parent: null }]]);
  let frontier: RunState[] = [start];

  while (frontier.length > 0 && seen.size < MAX_STATES) {
    const next: RunState[] = [];
    for (const state of frontier) {
      const key = keyOf(state, withFacing);
      for (const op of ops) {
        const result = stepOnce(level, state, op);
        if (result.bonked) continue;
        const childKey = keyOf(result.state, withFacing);
        if (seen.has(childKey)) continue;
        seen.set(childKey, { parent: key, op });
        if (!missing(level, result.state)) {
          const path: Plain[] = [];
          for (let at: string | null = childKey; at; at = seen.get(at)!.parent) {
            const { op: step } = seen.get(at)!;
            if (step) path.unshift(step);
          }
          return path;
        }
        next.push(result.state);
      }
    }
    frontier = next;
  }
  return null;
}
