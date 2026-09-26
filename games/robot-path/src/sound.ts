// Sound effects, all notes on the site's Sound: nothing to download. Short and cheerful, the bonk too.
// Each Skin gets its own flavour of the bonk and the win tune.

import { note } from '@shared/sound';
import type { SkinId } from './progress';

interface Flavour {
  wave: OscillatorType;
  /** Bonk: a "boing" that dips and springs back. */
  boing: [number, number];
  /** Win tune root, Hz. */
  root: number;
}

const FLAVOURS: Record<SkinId, Flavour> = {
  garden: { wave: 'triangle', boing: [330, 150], root: 523 },
  planet: { wave: 'square', boing: [260, 110], root: 440 },
  sea: { wave: 'sine', boing: [220, 420], root: 587 },
};
let flavour = FLAVOURS.garden;

export function setSkinSound(skin: SkinId): void {
  flavour = FLAVOURS[skin];
}

export function tap(): void {
  note({ from: 880, length: 0.05, volume: 0.05 });
}

/** A little footstep blip for each move. */
export function step(): void {
  note({ from: 300, to: 360, length: 0.07, volume: 0.05, wave: 'triangle' });
}

export function whirr(): void {
  note({ from: 400, to: 700, length: 0.18, volume: 0.04, wave: 'sawtooth' });
}

export function push(): void {
  note({ from: 140, to: 90, length: 0.16, volume: 0.1, wave: 'triangle' });
}

/** The bonk: a silly boing, never a buzzer. */
export function boing(): void {
  const [high, low] = flavour.boing;
  note({ from: high, to: low, length: 0.14, volume: 0.1, wave: flavour.wave });
  note({ from: low, to: high * 1.2, at: 0.13, length: 0.22, volume: 0.08, wave: flavour.wave });
}

export function pickup(): void {
  note({ from: 988, length: 0.1, volume: 0.07 });
  note({ from: 1319, at: 0.08, length: 0.18, volume: 0.07 });
}

/** A wrong letter or number: a soft bloop. */
export function bloop(): void {
  note({ from: 500, to: 380, length: 0.15, volume: 0.06, wave: 'triangle' });
}

/** The program ran out: a questioning "hm?". */
export function hmm(): void {
  note({ from: 330, to: 330, length: 0.12, volume: 0.06, wave: 'triangle' });
  note({ from: 330, to: 494, at: 0.14, length: 0.2, volume: 0.06, wave: 'triangle' });
}

export function fanfare(): void {
  const { root, wave } = flavour;
  [1, 1.26, 1.5, 2].forEach((ratio, i) =>
    note({ from: root * ratio, at: i * 0.11, length: i === 3 ? 0.5 : 0.14, volume: 0.07, wave: wave === 'square' ? 'square' : 'triangle' }),
  );
}

export function sparkle(): void {
  for (let i = 0; i < 6; i++) note({ from: 1500 + i * 220, at: 0.5 + i * 0.06, length: 0.12, volume: 0.035 });
}
