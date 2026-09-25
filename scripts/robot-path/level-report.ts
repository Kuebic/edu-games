// The level validator, for before a deploy: checks every Level and prints each World's
// difficulty knobs, marking the ones that changed from the Level before so jumps stand out.
// Exits 1 if any Level has a problem.
import { levelProblems } from '../../src/games/robot-path/game/check';
import { run } from '../../src/games/robot-path/game/engine';
import { height, isFixIt, width, type Level } from '../../src/games/robot-path/game/level';
import { shortest } from '../../src/games/robot-path/game/solver';
import { WORLDS } from '../../src/games/robot-path/levels';

interface Knobs {
  par: number;
  slack: number;
  /** Plain Commands the shortest route needs, with no Repeat Blocks. */
  flat: number;
  turns: number;
  items: number;
  /** Which way the robot starts looking: world 8's knob. */
  face: string;
}

function knobs(level: Level): Knobs {
  const facings = run(level, level.solution).steps.flatMap((step) => (step.at ? [step.state.facing] : []));
  const turns = facings.filter((facing, i) => i > 0 && facing !== facings[i - 1]).length;
  return {
    par: level.par,
    slack: level.maxSlots - level.par,
    flat: shortest(level)?.length ?? NaN,
    turns,
    items: level.items.length,
    face: level.start.facing,
  };
}

let failed = 0;
for (const world of WORLDS) {
  console.log(`\nWorld ${world.levels[0]!.world}: ${world.name}`);
  console.log('  level  size  par  slots  slack  flat  turns  items  face  notes');
  let before: Knobs | undefined;
  for (const level of world.levels) {
    const k = knobs(level);
    const cell = (key: keyof Knobs, pad: number) => `${before && before[key] !== k[key] ? '*' : ' '}${String(k[key]).padStart(pad - 1)}`;
    const notes = [
      isFixIt(level) && `fix-it (starter ${run(level, level.starterProgram).result})`,
      k.flat > level.maxSlots && 'needs repeat',
      level.tutorial && 'tutorial',
      Object.keys(level.goals).join('+'),
    ].filter(Boolean);
    const problems = levelProblems(level);
    failed += problems.length > 0 ? 1 : 0;
    console.log(
      `  ${level.id}  ${`${width(level)}x${height(level)}`.padEnd(4)}  ${cell('par', 3)}  ${String(level.maxSlots).padStart(5)}  ${cell('slack', 5)}  ${cell('flat', 4)}  ${cell('turns', 5)}  ${cell('items', 5)}  ${cell('face', 4)}  ${notes.join(', ')}`,
    );
    for (const problem of problems) console.log(`         ✗ ${problem}`);
    before = k;
  }
}
console.log(failed ? `\n${failed} level(s) have problems.` : '\nEvery level passes. (* = changed from the level before)');
process.exit(failed ? 1 : 0);
