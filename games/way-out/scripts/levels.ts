// Prints every Way Out Level's difficulty measures, Pack by Pack, and marks any step
// where more than one measure changed at once. Usage: npm run game way-out levels

import { measure, type Measures } from '../src/game/measure';
import { LEVELS } from '../src/levels';
import { PACKS, puzzleProblems } from '../src/packs';
import { POOLS } from '../src/pools';

const STEPS: [string, (m: Measures) => number][] = [
  ['par', (m) => m.par],
  ['vehicles', (m) => m.vehicles],
  ['moved', (m) => m.moved],
  ['depth', (m) => m.depth],
  ['repeats', (m) => Number(m.repeats)],
  ['backwards', (m) => Number(m.backwards)],
  ['walls', (m) => Number(m.walls > 0)],
];

const pad = (value: string | number, width: number) => String(value).padStart(width);
let problems = 0;

PACKS.forEach((spec, i) => {
  const pack = i + 1;
  console.log(`\nPack ${pack}: ${spec.name}  (par ${spec.par.join('-')}, vehicles ${spec.vehicles.join('-')})`);
  console.log('   #  par  veh  trk  wall  moved  depth  repeat  back  source     changed');
  let prev: Measures | undefined;
  for (const level of LEVELS.filter((l) => l.pack === pack)) {
    const m = measure(level.board);
    const changed = prev ? STEPS.filter(([, get]) => get(m) !== get(prev!)).map(([name]) => name) : [];
    // Par and "moved" climb together on easy boards, so count them as one step.
    const steps = changed.filter((name) => !(name === 'moved' && changed.includes('par'))).length;
    console.log(
      `  ${pad(level.index, 2)}  ${pad(m.par, 3)}  ${pad(m.vehicles, 3)}  ${pad(m.trucks, 3)}  ${pad(m.walls, 4)}  ${pad(m.moved, 5)}  ${pad(m.depth, 5)}  ${pad(m.repeats ? 'yes' : '', 6)}  ${pad(m.backwards ? 'yes' : '', 4)}  ${level.source.padEnd(9)}  ${steps > 1 ? '! ' : '  '}${changed.join(' ')}`,
    );
    for (const p of puzzleProblems(level.board, level.par, spec)) {
      problems++;
      console.log(`      PROBLEM: ${p}`);
    }
    prev = m;
  }
  const pool = POOLS[i] ?? [];
  const bad = pool.filter(([board, par]) => puzzleProblems(board, par, spec).length > 0).length;
  problems += bad;
  const pars = pool.map(([, par]) => par);
  console.log(`  pool: ${pool.length} puzzles, par ${Math.min(...pars)}-${Math.max(...pars)}${bad ? `, ${bad} with PROBLEMS` : ''}`);
});

console.log(problems ? `\n${problems} problems` : '\nall boards check out');
process.exitCode = problems ? 1 : 0;
