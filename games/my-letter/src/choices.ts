// A Level's four Finds: the Level's letter and one other that never Looks alike, on either side.
// Pure, with the random source passed in, so it's tested as data.

import { looksAlike } from './letters';

export type Rng = () => number;

/** Finds in a Level. */
export const FINDS = 4;

const CAPITALS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/** One Find: the letter asked for, and the two Choices left to right, one of them that letter. */
export interface Find {
  letter: string;
  choices: [string, string];
}

const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)]!;

/**
 * The other Choice: never the letter itself or one that Looks alike; a Met letter when one qualifies, else
 * any capital that does; and not `before` (the last Find's other) when there's another to take.
 */
export function otherChoice(letter: string, met: readonly string[], before: string | undefined, rng: Rng): string {
  const fits = (l: string) => l !== letter && !looksAlike(l, letter);
  const metFits = met.filter(fits);
  const pool = metFits.length > 0 ? metFits : CAPITALS.filter(fits);
  const fresh = pool.filter((l) => l !== before);
  return pick(fresh.length > 0 ? fresh : pool, rng);
}

/** Four Finds of `letter`. Its side is random, but never the same side a third time running. */
export function makeFinds(letter: string, met: readonly string[], rng: Rng = Math.random): Find[] {
  const finds: Find[] = [];
  const sides: number[] = [];
  let before: string | undefined;
  for (let i = 0; i < FINDS; i++) {
    const other = otherChoice(letter, met, before, rng);
    const twice = sides.length >= 2 && sides.at(-1) === sides.at(-2);
    const side = twice ? 1 - sides.at(-1)! : rng() < 0.5 ? 0 : 1;
    sides.push(side);
    before = other;
    finds.push({ letter, choices: side === 0 ? [letter, other] : [other, letter] });
  }
  return finds;
}
