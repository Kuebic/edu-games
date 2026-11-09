// Go Together's noises on the site's Sound: the site's Word clips and little notes. No Voice: the only word
// the child hears is a gathered group's Word, once (docs/spec.md). The cheer is the site's.

import { hushWords, word } from '@shared/kinds';
import { note } from '@shared/sound';

export { hushWords, word };

const tone = (from: number, at: number, length: number, wave: OscillatorType = 'sine', volume = 0.2, to?: number) =>
  note({ from, to, at, length, wave, volume });

/** A Card lifted: a soft pop. */
export function pop(): void {
  tone(520, 0, 0.09, 'triangle', 0.14, 700);
}

/** A Card put down: the pop, downward. */
export function unpop(): void {
  tone(600, 0, 0.09, 'triangle', 0.1, 420);
}

/** A Card outside the group: a soft low bump, never a buzz. */
export function bump(): void {
  tone(200, 0, 0.16, 'sine', 0.22, 150);
}

/** A group gathered: a bright chime, up three notes. */
export function chime(): void {
  tone(660, 0, 0.12, 'triangle', 0.2);
  tone(880, 0.09, 0.12, 'triangle', 0.18);
  tone(1320, 0.18, 0.24, 'triangle', 0.16);
}

/** Every Frame full: a little shimmer before the cheer. */
export function shine(): void {
  [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.1, 0.2, 'sine', 0.12));
}
