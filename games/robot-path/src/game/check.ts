// The level validator. `levels.test.ts` and `npm run game robot-path levels` both run it on every Level.

import { initialState, missing, run } from './engine';
import {
  flagOf,
  isFixIt,
  opsOf,
  programLength,
  schemaProblems,
  startOf,
  targetsOf,
  terrain,
  type Level,
} from './level';
import { shortest } from './solver';

/** Worlds whose Par must equal the solver's shortest path (every move is one Command). */
export const SOLVER_PAR_WORLDS = [1, 2, 3, 4, 5];

const count = <T>(list: readonly T[], value: T) => list.filter((v) => v === value).length;

/** Everything wrong with a raw level file entry; empty when it's good to ship. */
export function levelProblems(raw: unknown): string[] {
  const schema = schemaProblems(raw);
  if (schema.length > 0) return schema;
  const level = raw as Level;
  const problems: string[] = [];
  const need = (ok: boolean, message: string) => ok || problems.push(message);
  const { goals, items } = level;

  need(level.id === `w${level.world}-${String(level.index).padStart(2, '0')}`, `id should be w${level.world}-${String(level.index).padStart(2, '0')}`);

  // Board and items.
  const start = startOf(level);
  const taken = new Set<string>();
  items.forEach((item, i) => {
    const key = `${item.x},${item.y}`;
    need(terrain(level, item) === 'floor', `items[${i}] is not on floor`);
    need(!(item.x === start.x && item.y === start.y), `items[${i}] is on the start`);
    need(!taken.has(key), `items[${i}] shares a tile`);
    taken.add(key);
  });
  const types = items.map((item) => item.type);
  need(!!goals.flag === !!flagOf(level), goals.flag ? 'flag goal but no F' : 'F on the grid but no flag goal');
  need(count(types, 'gem') === 0 || !!goals.collectAll, 'gems need the collectAll goal');
  need(!goals.collectAll || count(types, 'gem') > 0, 'collectAll but no gems');
  need(count(types, 'letter') === 0 || !!goals.spell, 'letters need the spell goal');
  need(count(types, 'number') === 0 || !!goals.numberOrder || goals.sum !== undefined, 'numbers need numberOrder or sum');
  need(count(types, 'crate') === 0 || !!goals.cratesOnTargets, 'crates need the cratesOnTargets goal');
  if (goals.cratesOnTargets)
    need(count(types, 'crate') > 0 && count(types, 'crate') === targetsOf(level).length, 'needs one x per crate');
  else need(targetsOf(level).length === 0, 'x targets but no crate goal');
  if (goals.spell) {
    const letters = items.filter((item) => item.type === 'letter').map((item) => item.value);
    for (const letter of new Set(goals.spell))
      need(count(letters, letter) >= count([...goals.spell], letter), `not enough ${letter} for ${goals.spell}`);
  }
  if (goals.numberOrder) {
    const numbers = items.filter((item) => item.type === 'number').map((item) => item.value);
    for (const n of goals.numberOrder) need(numbers.includes(n), `no ${n} for numberOrder`);
  }
  need(missing(level, initialState(level)) !== null, 'already won at the start');

  // Programs.
  for (const [name, program] of [['solution', level.solution], ['starterProgram', level.starterProgram]] as const)
    for (const op of new Set(opsOf(program))) need(level.palette.includes(op), `${name} uses ${op}, not in the palette`);
  need(run(level, level.solution).result === 'win', 'solution does not win');
  need(programLength(level.solution) === level.par, `solution is ${programLength(level.solution)} long, par is ${level.par}`);
  need(programLength(level.solution) <= level.maxSlots, 'solution does not fit maxSlots');
  if (isFixIt(level)) {
    need(run(level, level.starterProgram).result !== 'win', 'starterProgram wins; a Fix-it must be broken');
    need(programLength(level.starterProgram) <= level.maxSlots, 'starterProgram does not fit maxSlots');
  }
  if (SOLVER_PAR_WORLDS.includes(level.world)) {
    const best = shortest(level);
    if (!best) problems.push('solver finds no path');
    else need(best.length === level.par, `solver finds ${best.length}, par is ${level.par}`);
  }

  const targets = ['go', 'count', ...level.palette];
  for (const target of level.tutorial ?? []) need(targets.includes(target), `tutorial points at ${target}, which isn't on screen`);
  return problems;
}
