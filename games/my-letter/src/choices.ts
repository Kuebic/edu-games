// A Level's Finds: the letter each asks for, and its three Choices, the others never Looking alike it.
// Pure, with the random source passed in, so it's tested as data.

import { looksAlike, nameCapitals, nameLetters } from './letters';

export type Rng = () => number;

/** Choices in a Find. */
export const CHOICES = 3;

/** Finds in a New letters Level: its letter twice, and two Met letters. */
export const NEW_LETTER_FINDS = 4;

const CAPITALS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/** One Find: the letter asked for, and the three Choices left to right, one of them that letter. */
export interface Find {
  letter: string;
  choices: string[];
}

const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)]!;

/** `items` in a random order. */
function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * The other two Choices: never the letter itself or one that Looks alike, and never each other. Taken from
 * `tiers` in order, at random within each, then from any capital that fits.
 */
export function otherChoices(letter: string, tiers: readonly (readonly string[])[], rng: Rng): string[] {
  const fits = (l: string) => l !== letter && !looksAlike(l, letter);
  const others: string[] = [];
  for (const tier of [...tiers, CAPITALS]) {
    for (const l of shuffle(tier, rng)) if (others.length < CHOICES - 1 && fits(l) && !others.includes(l)) others.push(l);
  }
  return others;
}

/** Finds for these asks, each letter in a random slot, but never the same slot a third time running. */
function lay(asks: readonly { letter: string; tiers: readonly (readonly string[])[] }[], rng: Rng): Find[] {
  const slots: number[] = [];
  return asks.map(({ letter, tiers }) => {
    const choices = otherChoices(letter, tiers, rng);
    const twice = slots.length >= 2 && slots.at(-1) === slots.at(-2);
    const slot = pick([0, 1, 2].filter((s) => !twice || s !== slots.at(-1)), rng);
    slots.push(slot);
    choices.splice(slot, 0, letter);
    return { letter, choices };
  });
}

/** My name's Level: the Name spelt, a Find per capital left to right, the others from the Name's own letters. */
export function spellFinds(name: string, rng: Rng = Math.random): Find[] {
  const mine = nameLetters(name);
  return lay([...nameCapitals(name)].map((letter) => ({ letter, tiers: [mine] })), rng);
}

/**
 * A New letters Level: its letter first, then two Met letters with its letter again after one of them, so
 * it's never asked twice running. A Met letter's others are the Level's letter when it fits, then Met
 * letters. Too few Met letters (no Name, the first Levels), and the Level's letter is asked instead.
 */
export function newLetterFinds(letter: string, met: readonly string[], rng: Rng = Math.random): Find[] {
  const reviews = shuffle(
    met.filter((l) => l !== letter),
    rng,
  ).slice(0, NEW_LETTER_FINDS - 2);
  while (reviews.length < NEW_LETTER_FINDS - 2) reviews.push(letter);
  reviews.splice(1 + Math.floor(rng() * 2), 0, letter);
  return lay(
    [letter, ...reviews].map((asked) => ({ letter: asked, tiers: asked === letter ? [met] : [[letter], met] })),
    rng,
  );
}
