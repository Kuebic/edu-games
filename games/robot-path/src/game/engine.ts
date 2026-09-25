// The rules. Pure functions, no DOM: `run` turns a Level and a Program into a Trace of
// Steps that the board plays back as animation. Same input, same Trace.

import {
  flagOf,
  startOf,
  targetsOf,
  terrain,
  type Facing,
  type Level,
  type Plain,
  type Pos,
  type Program,
} from './level';

export interface ItemState {
  x: number;
  y: number;
  /** Picked up. Crates are never taken; they move. */
  taken: boolean;
}

export interface RunState {
  x: number;
  y: number;
  facing: Facing;
  /** One per Level item, in the same order. */
  items: ItemState[];
  /** Letters of the word picked up so far. */
  spelled: number;
  /** Numbers of `numberOrder` picked up so far. */
  counted: number;
  /** Total of numbers picked up in sum mode. */
  sum: number;
}

/** Where a Command sits in the Program: its Slot, and its place in a Repeat Block's body. */
export interface Address {
  slot: number;
  inner?: number;
}

export type Missing =
  | { kind: 'flag' }
  | { kind: 'gem' }
  | { kind: 'letter'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'sum'; value: number }
  | { kind: 'crate' };

export type Event =
  | { type: 'move'; from: Pos; to: Pos }
  | { type: 'turn'; from: Facing; to: Facing }
  | { type: 'push'; item: number; from: Pos; to: Pos }
  /** The robot tried to walk into a wall, off the grid, or into a crate that can't move (`item`). */
  | { type: 'bonk'; toward: Pos; item?: number }
  | { type: 'pickup'; item: number }
  /** Walked over a letter or number that isn't next: it wiggles. */
  | { type: 'reject'; item: number }
  | { type: 'loopTick'; slot: number; pass: number; of: number }
  | { type: 'win' }
  | { type: 'unfinished'; missing: Missing };

export interface Step {
  /** The Command that ran; null for the closing `unfinished` step. */
  at: Address | null;
  events: Event[];
  /** Everything after this Step. */
  state: RunState;
}

export type Result = 'win' | 'bonk' | 'unfinished';

export interface Trace {
  steps: Step[];
  result: Result;
}

/** A Run stops here, so a Program can never loop for ever. */
export const STEP_LIMIT = 200;

const DELTA: Record<Facing, Pos> = { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } };
const ARROW_FACING = { up: 'N', right: 'E', down: 'S', left: 'W' } as const;
const CLOCKWISE: Facing[] = ['N', 'E', 'S', 'W'];

export function turned(facing: Facing, by: 1 | -1): Facing {
  return CLOCKWISE[(CLOCKWISE.indexOf(facing) + by + 4) % 4]!;
}

export function initialState(level: Level): RunState {
  const start = startOf(level);
  return {
    ...start,
    facing: level.start.facing,
    items: level.items.map(({ x, y }) => ({ x, y, taken: false })),
    spelled: 0,
    counted: 0,
    sum: 0,
  };
}

function crateAt(level: Level, state: RunState, { x, y }: Pos): number {
  return state.items.findIndex((item, i) => level.items[i]!.type === 'crate' && item.x === x && item.y === y);
}

/** What entering a tile does to the letters, numbers and gems on it. */
function arrive(level: Level, state: RunState, events: Event[]): void {
  const { goals } = level;
  state.items.forEach((item, i) => {
    const { type, value } = level.items[i]!;
    if (item.taken || type === 'crate' || item.x !== state.x || item.y !== state.y) return;
    let take = false;
    if (type === 'gem') take = true;
    else if (type === 'letter' && goals.spell?.[state.spelled] === value) {
      take = true;
      state.spelled++;
    } else if (type === 'number' && goals.numberOrder?.[state.counted] === value) {
      take = true;
      state.counted++;
    } else if (type === 'number' && goals.sum !== undefined) {
      take = true;
      state.sum += value as number;
    }
    if (take) item.taken = true;
    events.push({ type: take ? 'pickup' : 'reject', item: i });
  });
}

/** One Command. Doesn't change `state`. */
export function stepOnce(level: Level, state: RunState, op: Plain): { state: RunState; events: Event[]; bonked: boolean } {
  const next: RunState = { ...state, items: state.items.map((item) => ({ ...item })) };
  const events: Event[] = [];

  if (op === 'turnLeft' || op === 'turnRight') {
    next.facing = turned(state.facing, op === 'turnLeft' ? -1 : 1);
    events.push({ type: 'turn', from: state.facing, to: next.facing });
    return { state: next, events, bonked: false };
  }

  if (op !== 'forward') next.facing = ARROW_FACING[op];
  const delta = DELTA[next.facing];
  const from = { x: state.x, y: state.y };
  const to = { x: from.x + delta.x, y: from.y + delta.y };
  const bonk = (item?: number) => {
    events.push(item === undefined ? { type: 'bonk', toward: to } : { type: 'bonk', toward: to, item });
    return { state: next, events, bonked: true };
  };

  if (terrain(level, to) !== 'floor') return bonk();
  const crate = crateAt(level, next, to);
  if (crate >= 0) {
    const beyond = { x: to.x + delta.x, y: to.y + delta.y };
    if (terrain(level, beyond) !== 'floor' || crateAt(level, next, beyond) >= 0) return bonk(crate);
    next.items[crate]!.x = beyond.x;
    next.items[crate]!.y = beyond.y;
    events.push({ type: 'move', from, to }, { type: 'push', item: crate, from: to, to: beyond });
  } else {
    events.push({ type: 'move', from, to });
  }
  next.x = to.x;
  next.y = to.y;
  arrive(level, next, events);
  return { state: next, events, bonked: false };
}

/** The first Goal not yet met, or null when the Level is won. Letters and numbers first, the flag last. */
export function missing(level: Level, state: RunState): Missing | null {
  const { goals } = level;
  if (goals.spell && state.spelled < goals.spell.length) return { kind: 'letter', value: goals.spell[state.spelled]! };
  if (goals.numberOrder && state.counted < goals.numberOrder.length)
    return { kind: 'number', value: goals.numberOrder[state.counted]! };
  if (goals.sum !== undefined && state.sum !== goals.sum) return { kind: 'sum', value: goals.sum };
  if (goals.collectAll && state.items.some((item, i) => level.items[i]!.type === 'gem' && !item.taken)) return { kind: 'gem' };
  if (goals.cratesOnTargets) {
    const targets = targetsOf(level);
    const onTarget = (item: ItemState) => targets.some((t) => t.x === item.x && t.y === item.y);
    if (state.items.some((item, i) => level.items[i]!.type === 'crate' && !onTarget(item))) return { kind: 'crate' };
  }
  if (goals.flag) {
    const flag = flagOf(level);
    if (!flag || flag.x !== state.x || flag.y !== state.y) return { kind: 'flag' };
  }
  return null;
}

/** Every Command in the order it runs, with Repeat Block passes unrolled. */
function* unroll(program: Program): Generator<{ at: Address; op: Plain; tick?: Event }> {
  for (let slot = 0; slot < program.length; slot++) {
    const command = program[slot]!;
    if (command.op !== 'repeat') {
      yield { at: { slot }, op: command.op };
      continue;
    }
    for (let pass = 1; pass <= command.times; pass++) {
      for (let inner = 0; inner < command.body.length; inner++) {
        const tick: Event | undefined = inner === 0 ? { type: 'loopTick', slot, pass, of: command.times } : undefined;
        yield { at: { slot, inner }, op: command.body[inner]!.op, ...(tick && { tick }) };
      }
    }
  }
}

/**
 * Runs a Program from the start of the Level. Stops the moment every Goal is met
 * (even with Commands left), at the first bonk, or when the Program runs out.
 */
export function run(level: Level, program: Program): Trace {
  let state = initialState(level);
  const steps: Step[] = [];
  for (const { at, op, tick } of unroll(program)) {
    if (steps.length >= STEP_LIMIT) break;
    const result = stepOnce(level, state, op);
    state = result.state;
    const events = tick ? [tick, ...result.events] : result.events;
    steps.push({ at, events, state });
    if (result.bonked) return { steps, result: 'bonk' };
    if (!missing(level, state)) {
      events.push({ type: 'win' });
      return { steps, result: 'win' };
    }
  }
  steps.push({ at: null, events: [{ type: 'unfinished', missing: missing(level, state)! }], state });
  return { steps, result: 'unfinished' };
}
