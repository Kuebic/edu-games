// Tidy Up's noises on the site's Sound: the site's Word clips and little notes. No Voice: every word the
// child needs is a clip (docs/spec.md). The cheer is the site's.

import { hushWords, word } from '@shared/kinds';
import { note } from '@shared/sound';
import type { Skin } from './skins';

// The Words are the site's (@shared/kinds, site ADR 0018): a color, a shape, a group or a Thing's name.
export { hushWords, word };

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
