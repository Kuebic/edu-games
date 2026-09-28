// Little noises on the site's Sound: notes only, so there are no audio files to ship. The cheer is the site's.

import { note } from '@shared/sound';
import type { Skin } from './skins';

const tone = (from: number, at: number, length: number, wave: OscillatorType = 'sine', volume = 0.2, to?: number) =>
  note({ from, to, at, length, wave, volume });

/** The Mover setting off, or tapped: a yip, a boing, a vroom. */
export function setOff(skin: Skin): void {
  switch (skin) {
    case 'puppy':
      tone(700, 0, 0.09, 'triangle', 0.22, 1100);
      tone(750, 0.12, 0.12, 'triangle', 0.22, 1250);
      break;
    case 'ball':
      tone(220, 0, 0.28, 'sine', 0.3, 660);
      break;
    case 'car':
      tone(70, 0, 0.5, 'sawtooth', 0.09, 160);
      tone(90, 0.05, 0.45, 'square', 0.04, 200);
      break;
  }
}

/** The Mover at its Treat: a crunch, a cheer-note, a ding. */
export function treat(skin: Skin): void {
  switch (skin) {
    case 'puppy':
      tone(300, 0, 0.06, 'square', 0.08, 180);
      tone(280, 0.09, 0.06, 'square', 0.08, 160);
      tone(784, 0.2, 0.3, 'triangle', 0.2);
      tone(1047, 0.28, 0.4, 'triangle', 0.2);
      break;
    case 'ball':
      tone(523, 0, 0.2, 'triangle', 0.2);
      tone(659, 0.1, 0.2, 'triangle', 0.2);
      tone(784, 0.2, 0.4, 'triangle', 0.2);
      break;
    case 'car':
      tone(1319, 0, 0.5, 'sine', 0.2);
      tone(988, 0.18, 0.6, 'sine', 0.2);
      break;
  }
}

/** A Wrong way's shrug: soft and low, never a buzz. */
export function shrug(): void {
  tone(330, 0, 0.18, 'sine', 0.18, 262);
  tone(294, 0.2, 0.28, 'sine', 0.18, 220);
}
