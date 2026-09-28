// Piggy Bank's noises on the site's Sound: a Word clip per kind of money, found by looking at which files
// are in assets/words/ rather than a hand list, and little notes. No Voice: every word the child needs is a
// clip (ADR 0002). The cheer is the site's.

import { clip, note, type Clip } from '@shared/sound';
import type { Money } from './money';

/** Each Word clip's URL by its word: dime.mp3 is dime. */
export function clipsByWord(files: Readonly<Record<string, string>>): Map<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [/([a-z]+)\.mp3$/.exec(path)![1]!, url]));
}

// Imported like any file (ADR 0005), so the build hashes each one and ships only what's there.
const files = import.meta.glob<string>('./assets/words/*.mp3', { eager: true, query: '?url', import: 'default' });
const words = new Map([...clipsByWord(files)].map(([word, url]) => [word, clip(url)]));

/** A kind of money's Word clip. */
export const word = (money: Money): Clip | undefined => words.get(money);

/** Stops every Word, so a new grab or tap never talks over the last one. */
export function hushWords(): void {
  for (const w of words.values()) w.stop();
}

const tone = (from: number, at: number, length: number, wave: OscillatorType = 'sine', volume = 0.2, to?: number) =>
  note({ from, to, at, length, wave, volume });

/** A piece lifted off the Spot or the table. */
export function pickUp(): void {
  tone(520, 0, 0.09, 'triangle', 0.14, 700);
}

/** A coin into a pig: a bright metal clink, two high partials that ring off. A bill goes in with a soft swish. */
export function clink(bill = false, at = 0): void {
  if (bill) {
    tone(900, at, 0.18, 'triangle', 0.06, 400);
    return;
  }
  tone(2350, at, 0.22, 'sine', 0.16);
  tone(3710, at + 0.005, 0.16, 'sine', 0.09);
  tone(1560, at + 0.07, 0.12, 'sine', 0.08);
}

/** A wrong pig, or the wrong coin: a soft low bump, never a buzz. */
export function bump(): void {
  tone(200, 0, 0.16, 'sine', 0.22, 150);
}

/** A coin turned over. */
export function flip(): void {
  tone(1200, 0, 0.06, 'triangle', 0.08, 1800);
}

/** The pig asks: a little rising "oink" of a note before the Word. */
export function ask(): void {
  tone(330, 0, 0.12, 'triangle', 0.12, 440);
}

/** A Round's end: the full pigs jingle. */
export function jingle(): void {
  for (let i = 0; i < 7; i++) clink(false, i * 0.09 + (i % 2) * 0.02);
}
