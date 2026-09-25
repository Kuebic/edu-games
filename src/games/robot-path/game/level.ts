// Levels and Programs: the shapes in the level files, and a schema check for them.

export type Facing = 'N' | 'E' | 'S' | 'W';
/** Screen arrows (worlds 1-7). */
export type Arrow = 'up' | 'down' | 'left' | 'right';
/** Robot-relative commands (world 8). */
export type Relative = 'forward' | 'turnLeft' | 'turnRight';
/** A Command that isn't a Repeat Block. */
export type Plain = Arrow | Relative;
export type Op = Plain | 'repeat';

export const ARROWS: readonly Arrow[] = ['up', 'down', 'left', 'right'];
export const PLAINS: readonly Plain[] = [...ARROWS, 'forward', 'turnLeft', 'turnRight'];
export const OPS: readonly Op[] = [...PLAINS, 'repeat'];

export interface PlainCommand {
  op: Plain;
}

export interface RepeatCommand {
  op: 'repeat';
  times: number;
  body: PlainCommand[];
}

export type Command = PlainCommand | RepeatCommand;
export type Program = Command[];

export const MIN_TIMES = 2;
export const MAX_TIMES = 5;
export const MAX_BODY = 4;
export const MAX_WIDTH = 7;
export const MAX_HEIGHT = 9;

export type ItemType = 'gem' | 'letter' | 'number' | 'crate';

export interface Item {
  x: number;
  y: number;
  type: ItemType;
  /** The letter or number, for those types. */
  value?: string | number;
}

/** Every Goal a Level lists must be met at once. */
export interface Goals {
  flag?: boolean;
  /** Every Gem. */
  collectAll?: boolean;
  /** Letters, in this order. */
  spell?: string;
  /** Numbers, in this order. */
  numberOrder?: number[];
  /** Numbers walked over add up to exactly this. */
  sum?: number;
  cratesOnTargets?: boolean;
}

export interface Level {
  id: string;
  world: number;
  /** 1-based within its World. */
  index: number;
  /** The goal line the speaker button reads. */
  voice: string;
  /** Terrain rows: `#` wall, `.` floor, `R` start, `F` flag, `x` crate target. */
  grid: string[];
  start: { facing: Facing };
  items: Item[];
  goals: Goals;
  palette: Op[];
  maxSlots: number;
  /** A broken Program already in the bar: this is a Fix-it Level. */
  starterProgram: Program;
  solution: Program;
  par: number;
  /** What the tutorial hand points at, in order: palette ops, `go`, or `count` (a Repeat Block's number). */
  tutorial?: string[];
}

export interface Pos {
  x: number;
  y: number;
}

export type Terrain = 'wall' | 'floor' | 'out';

export const width = (level: Level) => level.grid[0]!.length;
export const height = (level: Level) => level.grid.length;

export function terrain(level: Level, { x, y }: Pos): Terrain {
  const row = level.grid[y];
  if (!row || x < 0 || x >= row.length) return 'out';
  return row[x] === '#' ? 'wall' : 'floor';
}

function find(level: Level, char: string): Pos[] {
  const found: Pos[] = [];
  level.grid.forEach((row, y) => [...row].forEach((c, x) => c === char && found.push({ x, y })));
  return found;
}

export const startOf = (level: Level): Pos => find(level, 'R')[0]!;
export const flagOf = (level: Level): Pos | undefined => find(level, 'F')[0];
export const targetsOf = (level: Level): Pos[] => find(level, 'x');

export const isFixIt = (level: Level) => level.starterProgram.length > 0;

/** Slots a Program uses: a Repeat Block is one Slot plus its body. */
export function programLength(program: Program): number {
  return program.reduce((n, command) => n + (command.op === 'repeat' ? 1 + command.body.length : 1), 0);
}

/** Every op a Program uses, including inside Repeat Blocks. */
export function opsOf(program: Program): Op[] {
  return program.flatMap((command) => (command.op === 'repeat' ? ['repeat' as Op, ...command.body.map((c) => c.op)] : [command.op]));
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function programProblems(raw: unknown, name: string): string[] {
  if (!Array.isArray(raw)) return [`${name} must be a list`];
  const problems: string[] = [];
  raw.forEach((command, i) => {
    if (!isObject(command) || !OPS.includes(command.op as Op)) return problems.push(`${name}[${i}] has an unknown op`);
    if (command.op !== 'repeat') return;
    const { times, body } = command;
    if (!Number.isInteger(times) || (times as number) < MIN_TIMES || (times as number) > MAX_TIMES)
      problems.push(`${name}[${i}] repeats ${String(times)} times; must be ${MIN_TIMES}-${MAX_TIMES}`);
    if (!Array.isArray(body)) return problems.push(`${name}[${i}] has no body`);
    if (body.length > MAX_BODY) problems.push(`${name}[${i}] body is longer than ${MAX_BODY}`);
    body.forEach((inner, j) => {
      if (!isObject(inner) || !PLAINS.includes(inner.op as Plain))
        problems.push(`${name}[${i}].body[${j}] must be a plain command (no nesting)`);
    });
  });
  return problems;
}

/** Schema problems in a raw level file entry; empty when it's a valid Level. */
export function schemaProblems(raw: unknown): string[] {
  if (!isObject(raw)) return ['not an object'];
  const problems: string[] = [];
  const need = (ok: boolean, message: string) => ok || problems.push(message);

  need(typeof raw.id === 'string', 'id must be a string');
  need(Number.isInteger(raw.world), 'world must be a whole number');
  need(Number.isInteger(raw.index), 'index must be a whole number');
  need(typeof raw.voice === 'string' && raw.voice.length > 0, 'voice must be a sentence');

  const grid = raw.grid;
  if (!Array.isArray(grid) || grid.length === 0 || !grid.every((row) => typeof row === 'string')) {
    problems.push('grid must be a list of strings');
  } else {
    const w = (grid[0] as string).length;
    need(grid.every((row: string) => row.length === w), 'grid rows must all be the same length');
    need(grid.every((row: string) => /^[#.RFx]*$/.test(row)), 'grid may only use # . R F x');
    need(w <= MAX_WIDTH && grid.length <= MAX_HEIGHT, `grid must fit ${MAX_WIDTH} x ${MAX_HEIGHT}`);
    need(grid.join('').split('R').length === 2, 'grid needs exactly one R');
    need(grid.join('').split('F').length <= 2, 'grid has more than one F');
  }

  need(isObject(raw.start) && ['N', 'E', 'S', 'W'].includes(raw.start.facing as string), 'start.facing must be N, E, S or W');

  if (!Array.isArray(raw.items)) problems.push('items must be a list');
  else
    raw.items.forEach((item, i) => {
      if (!isObject(item) || !Number.isInteger(item.x) || !Number.isInteger(item.y))
        return problems.push(`items[${i}] needs x and y`);
      if (item.type === 'letter') need(typeof item.value === 'string' && /^[A-Z]$/.test(item.value), `items[${i}] letter needs one capital`);
      else if (item.type === 'number') need(Number.isInteger(item.value) && (item.value as number) >= 0 && (item.value as number) <= 9, `items[${i}] number needs a digit`);
      else need(item.type === 'gem' || item.type === 'crate', `items[${i}] has an unknown type`);
    });

  const goals = raw.goals;
  if (!isObject(goals)) problems.push('goals must be an object');
  else {
    const known = ['flag', 'collectAll', 'spell', 'numberOrder', 'sum', 'cratesOnTargets'];
    need(Object.keys(goals).every((key) => known.includes(key)), 'goals has an unknown key');
    need(Object.keys(goals).length > 0, 'goals is empty');
    if ('spell' in goals) need(typeof goals.spell === 'string' && /^[A-Z]+$/.test(goals.spell), 'goals.spell must be capitals');
    if ('numberOrder' in goals)
      need(Array.isArray(goals.numberOrder) && goals.numberOrder.every(Number.isInteger), 'goals.numberOrder must be numbers');
    if ('sum' in goals) need(Number.isInteger(goals.sum) && (goals.sum as number) > 0, 'goals.sum must be a whole number');
    need(!('numberOrder' in goals && 'sum' in goals), 'goals cannot have both numberOrder and sum');
  }

  need(Array.isArray(raw.palette) && raw.palette.length > 0 && raw.palette.every((op) => OPS.includes(op as Op)), 'palette must list known ops');
  need(Number.isInteger(raw.maxSlots) && (raw.maxSlots as number) > 0, 'maxSlots must be a whole number');
  need(Number.isInteger(raw.par) && (raw.par as number) > 0, 'par must be a whole number');
  problems.push(...programProblems(raw.starterProgram, 'starterProgram'), ...programProblems(raw.solution, 'solution'));
  if ('tutorial' in raw) need(Array.isArray(raw.tutorial) && raw.tutorial.every((t) => typeof t === 'string'), 'tutorial must be a list of strings');
  return problems;
}
