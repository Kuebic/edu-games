export type Op = 'add' | 'take';

export interface Problem {
  op: Op;
  start: number;
  change: number;
  result: number;
}

export interface Stage {
  ops: readonly Op[];
  max: number;
  label: string;
}

export type Rng = () => number;

export const ROUND_LENGTH = 5;
export const PLATE_SIZE = 10;

export const STAGES: readonly Stage[] = [
  { ops: ['add'], max: 5, label: 'Add up to 5' },
  { ops: ['take'], max: 5, label: 'Take away from up to 5' },
  { ops: ['add', 'take'], max: 5, label: 'Mixed up to 5' },
  { ops: ['add'], max: 10, label: 'Add up to 10' },
  { ops: ['take'], max: 10, label: 'Take away from up to 10' },
  { ops: ['add', 'take'], max: 10, label: 'Mixed up to 10' },
];

/** Every Problem of one kind whose numbers stay within 1..max (no zeros anywhere). */
export function allProblems(op: Op, max: number): Problem[] {
  const out: Problem[] = [];
  if (op === 'add') {
    for (let start = 1; start < max; start++) {
      for (let change = 1; start + change <= max; change++) {
        out.push({ op, start, change, result: start + change });
      }
    }
  } else {
    for (let start = 2; start <= max; start++) {
      for (let change = 1; change < start; change++) {
        out.push({ op, start, change, result: start - change });
      }
    }
  }
  return out;
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Five distinct Problems for a Stage. Mixed Stages always include both kinds. */
export function makeRound(stageIndex: number, rng: Rng = Math.random): Problem[] {
  const stage = STAGES[stageIndex];
  if (stage.ops.length === 1) {
    return shuffle(allProblems(stage.ops[0], stage.max), rng).slice(0, ROUND_LENGTH);
  }
  const addCount = rng() < 0.5 ? 2 : 3;
  const adds = shuffle(allProblems('add', stage.max), rng).slice(0, addCount);
  const takes = shuffle(allProblems('take', stage.max), rng).slice(0, ROUND_LENGTH - addCount);
  return shuffle([...adds, ...takes], rng);
}

/** The correct result plus two neighbours 1 or 2 away, kept within 1..10, in random order. */
export function answerChoices(result: number, rng: Rng = Math.random): number[] {
  const near = [result - 1, result + 1, result - 2, result + 2].filter(
    (n) => n >= 1 && n <= PLATE_SIZE,
  );
  const distractors = shuffle(near, rng).slice(0, 2);
  return shuffle([result, ...distractors], rng);
}
