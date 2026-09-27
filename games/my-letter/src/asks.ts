// What the Voice says in a Level. Letters go as "the letter A", as in Find It, so a speech engine says
// the letter's name and never reads A as a word ("uh") or a capital as a sound.

import { nameCapitals } from './letters';

const theLetter = (letter: string) => `the letter ${letter}`;

/** A New letters ask. */
export const ask = (letter: string) => `Find ${theLetter(letter)}!`;

/** A My words ask, for the capital at `index` of a word (the Name or a Word): "for Sam" on its first, "in Sam" on the rest. `name` is as typed. */
export function spellAsk(name: string, index: number): string {
  return `Find ${theLetter(nameCapitals(name)[index]!)} ${index === 0 ? 'for' : 'in'} ${name}!`;
}

/** A Fade: the name of the letter that fades. */
export const fadeLine = (letter: string) => `That's ${theLetter(letter)}.`;

/** Before the Letter sound clip plays. */
export const saysLine = (letter: string) => `The letter ${letter} says`;

/** A find where there's no Letter sound to play: its name instead. */
export const foundLine = (letter: string) => `That's ${theLetter(letter)}!`;
