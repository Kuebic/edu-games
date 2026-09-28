// Tidy Up's noises on the site's Sound: a Word clip per color and shape, found by looking at which files
// are in assets/words/ rather than a hand list, and little notes. No Voice: every word the child needs is a
// clip (docs/spec.md). The cheer is the site's.

import { clip, note, type Clip } from '@shared/sound';
import type { Skin } from './skins';
import type { Sort } from './sorting';

/** Each Word clip's URL by its word: red.mp3 is red. */
export function clipsByWord(files: Readonly<Record<string, string>>): Map<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [/([a-z]+)\.mp3$/.exec(path)![1]!, url]));
}

// Imported like any file (ADR 0005), so the build hashes each one and ships only what's there.
const files = import.meta.glob<string>('./assets/words/*.mp3', { eager: true, query: '?url', import: 'default' });
const words = new Map([...clipsByWord(files)].map(([word, url]) => [word, clip(url)]));

/** A color's or shape's Word clip. */
export const word = (sort: Sort): Clip | undefined => words.get(sort);

/** Stops every Word, so a new grab or tap never talks over the last one. */
export function hushWords(): void {
  for (const w of words.values()) w.stop();
}

const tone = (from: number, at: number, length: number, wave: OscillatorType = 'sine', volume = 0.2, to?: number) =>
  note({ from, to, at, length, wave, volume });

/** A Thing lifted off the Spot. */
export function pickUp(): void {
  tone(520, 0, 0.09, 'triangle', 0.14, 700);
}

/** A Thing into its own Bin: a bright plink, up two notes. */
export function drop(): void {
  tone(660, 0, 0.12, 'triangle', 0.22);
  tone(990, 0.08, 0.2, 'triangle', 0.2);
}

/** A wrong Bin: a soft low bump, never a buzz. */
export function bump(): void {
  tone(200, 0, 0.16, 'sine', 0.22, 150);
}

/** A Round tidied: the Buckets wobble, the Trucks drive off, the Boxes rattle. */
export function tidy(skin: Skin | 'box'): void {
  switch (skin) {
    case 'buckets':
      tone(392, 0, 0.14, 'triangle', 0.18);
      tone(523, 0.14, 0.14, 'triangle', 0.18);
      tone(659, 0.28, 0.24, 'triangle', 0.18);
      break;
    case 'trucks':
      tone(70, 0, 0.9, 'sawtooth', 0.08, 180);
      tone(90, 0.05, 0.85, 'square', 0.035, 230);
      break;
    case 'box':
      for (let i = 0; i < 6; i++) tone(900 + (i % 2) * 300, i * 0.07, 0.04, 'square', 0.06);
      break;
  }
}
