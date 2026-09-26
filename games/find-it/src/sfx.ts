// Little noises on the site's Sound: notes only, so there are no audio files to ship. The cheer is the site's.

import { note } from '@shared/sound';

export type Sound = 'pop' | 'boop' | 'tick' | 'chime';

const tone = (from: number, at: number, length: number, wave: OscillatorType = 'sine', volume = 0.22, to?: number) =>
  note({ from, to, at, length, wave, volume });

export function play(sound: Sound): void {
  switch (sound) {
    case 'pop':
      tone(420, 0, 0.12, 'sine', 0.3, 900);
      break;
    case 'boop':
      tone(300, 0, 0.25, 'sine', 0.2, 200);
      break;
    case 'tick':
      tone(660, 0, 0.08, 'sine', 0.15);
      break;
    case 'chime':
      tone(784, 0, 0.35, 'triangle', 0.2);
      tone(988, 0.08, 0.35, 'triangle', 0.2);
      tone(1319, 0.16, 0.5, 'triangle', 0.2);
      break;
  }
}
