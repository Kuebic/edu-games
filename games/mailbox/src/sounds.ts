// Mailbox's noises on the site's Sound: a Name clip per letter, found by looking at which files are in
// assets/names/ rather than a hand list, and little notes. No Voice: every word the child hears is a
// letter's name, recorded (ADR 0003). The cheer is the site's.

import { clip, note, type Clip } from '@shared/sound';
import type { Letter } from './letters';

/** Each Name clip's URL by its letter: a.mp3 is a. */
export function clipsByLetter(files: Readonly<Record<string, string>>): Map<Letter, string> {
  return new Map(Object.entries(files).map(([path, url]) => [/([a-z])\.mp3$/.exec(path)![1]!, url]));
}

// Imported like any file (ADR 0005), so the build hashes each one and ships only what's there.
const files = import.meta.glob<string>('./assets/names/*.mp3', { eager: true, query: '?url', import: 'default' });
const names = new Map([...clipsByLetter(files)].map(([letter, url]) => [letter, clip(url)]));

/** A letter's Name clip: the same name for its capital and its lowercase. */
export const nameOf = (letter: Letter): Clip | undefined => names.get(letter);

/** Says a letter's name, if its clip is there. Resolves when it ends. */
export const say = (letter: Letter): Promise<void> => nameOf(letter)?.() ?? Promise.resolve();

/** Stops every Name, so a new grab or tap never talks over the last one. */
export function hushNames(): void {
  for (const n of names.values()) n.stop();
}

const tone = (from: number, at: number, length: number, wave: OscillatorType = 'sine', volume = 0.2, to?: number) =>
  note({ from, to, at, length, wave, volume });

/** A letter lifted off the Spot or the table. */
export function pickUp(): void {
  tone(520, 0, 0.09, 'triangle', 0.14, 700);
}

/** A letter into its Mailbox: the soft thump of the door, then the flag's little ding. */
export function post(at = 0): void {
  tone(180, at, 0.1, 'sine', 0.24, 120);
  tone(1320, at + 0.09, 0.22, 'triangle', 0.1);
}

/** A wrong Mailbox, or the wrong letter: a soft low bump, never a buzz. */
export function bump(): void {
  tone(200, 0, 0.16, 'sine', 0.22, 150);
}

/** A Round's end: every flag up, a little mail-carrier's tune. */
export function delivered(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.18, 'triangle', 0.16));
}
