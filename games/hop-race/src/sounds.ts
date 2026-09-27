// Hop Race's noises on the site's Sound: notes only, so there are no files to ship. The cheer is the site's.

import { note } from '@shared/sound';

/** A major scale up from middle C, so a Hop onto a bigger number sounds higher. */
const SCALE = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698];

/** A Hop landing on a Square: a little rising boing, pitched by its number. */
export function hopNote(square: number): void {
  const pitch = SCALE[Math.min(square, SCALE.length - 1)]!;
  note({ from: pitch * 0.75, to: pitch, length: 0.18, volume: 0.22, wave: 'triangle' });
}

/** The Spinner's clicks, slowing down as it stops. */
export function whirr(seconds: number): void {
  let at = 0;
  for (let gap = 0.05; at < seconds; gap *= 1.18) {
    note({ from: 1200, at, length: 0.03, volume: 0.06, wave: 'square' });
    at += gap;
  }
}

/** A soft pop for a right pick, and a low boop for a Fade. */
export function play(sound: 'pop' | 'boop'): void {
  if (sound === 'pop') note({ from: 420, to: 900, length: 0.12, volume: 0.25 });
  else note({ from: 300, to: 200, length: 0.25, volume: 0.18 });
}
