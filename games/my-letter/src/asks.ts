// What the Voice says in a Level. Letters go as "the letter A", as in Find It, so a speech engine says
// the letter's name and never reads A as a word ("uh") or a capital as a sound.

import { nameLetters } from './letters';

const theLetter = (letter: string) => `the letter ${letter}`;

/** The ask. In My name `name` is the Name as typed: "for Sam" on its first letter, "in Sam" on the rest. */
export function ask(letter: string, name?: string): string {
  if (name === undefined) return `Find ${theLetter(letter)}!`;
  return `Find ${theLetter(letter)} ${nameLetters(name)[0] === letter ? 'for' : 'in'} ${name}!`;
}

/** A Fade: the name of the letter that fades. */
export const fadeLine = (letter: string) => `That's ${theLetter(letter)}.`;

/** Before the Letter sound clip plays. */
export const saysLine = (letter: string) => `The letter ${letter} says`;

/** A find where there's no Letter sound to play: its name instead. */
export const foundLine = (letter: string) => `That's ${theLetter(letter)}!`;
