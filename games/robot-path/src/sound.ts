// Sound effects, all made with Web Audio: nothing to download. Short and cheerful, the bonk too.
// Each Skin gets its own flavour of the bonk and the win tune.

import type { SkinId } from './progress';

let context: AudioContext | undefined;
let muted = false;

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

export function setMuted(value: boolean): void {
  muted = value;
}

export function setSkinSound(skin: SkinId): void {
  flavour = FLAVOURS[skin];
}

/** Call from a user gesture: browsers only allow audio after one. */
export function unlockAudio(): void {
  if (context) {
    if (context.state === 'suspended') void context.resume();
    return;
  }
  try {
    context = new AudioContext();
  } catch {
    // No Web Audio: play silently.
  }
}

function ready(): AudioContext | undefined {
  return muted || !context ? undefined : context;
}

interface Note {
  from: number;
  to?: number;
  /** Seconds from now. */
  at?: number;
  length?: number;
  volume?: number;
  wave?: OscillatorType;
}

/** One note: a frequency glide with a quick fade in and out. */
function note(audio: AudioContext, { from, to = from, at = 0, length = 0.12, volume = 0.08, wave = 'sine' }: Note): void {
  const start = audio.currentTime + at;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + length);
  gain.connect(audio.destination);
  const tone = audio.createOscillator();
  tone.type = wave;
  tone.frequency.setValueAtTime(from, start);
  tone.frequency.exponentialRampToValueAtTime(to, start + length);
  tone.connect(gain);
  tone.start(start);
  tone.stop(start + length + 0.02);
}

export function tap(): void {
  const audio = ready();
  if (audio) note(audio, { from: 880, length: 0.05, volume: 0.05 });
}

/** A little footstep blip for each move. */
export function step(): void {
  const audio = ready();
  if (audio) note(audio, { from: 300, to: 360, length: 0.07, volume: 0.05, wave: 'triangle' });
}

export function whirr(): void {
  const audio = ready();
  if (audio) note(audio, { from: 400, to: 700, length: 0.18, volume: 0.04, wave: 'sawtooth' });
}

export function push(): void {
  const audio = ready();
  if (audio) note(audio, { from: 140, to: 90, length: 0.16, volume: 0.1, wave: 'triangle' });
}

/** The bonk: a silly boing, never a buzzer. */
export function boing(): void {
  const audio = ready();
  if (!audio) return;
  const [high, low] = flavour.boing;
  note(audio, { from: high, to: low, length: 0.14, volume: 0.1, wave: flavour.wave });
  note(audio, { from: low, to: high * 1.2, at: 0.13, length: 0.22, volume: 0.08, wave: flavour.wave });
}

export function pickup(): void {
  const audio = ready();
  if (!audio) return;
  note(audio, { from: 988, length: 0.1, volume: 0.07 });
  note(audio, { from: 1319, at: 0.08, length: 0.18, volume: 0.07 });
}

/** A wrong letter or number: a soft bloop. */
export function bloop(): void {
  const audio = ready();
  if (audio) note(audio, { from: 500, to: 380, length: 0.15, volume: 0.06, wave: 'triangle' });
}

/** The program ran out: a questioning "hm?". */
export function hmm(): void {
  const audio = ready();
  if (!audio) return;
  note(audio, { from: 330, to: 330, length: 0.12, volume: 0.06, wave: 'triangle' });
  note(audio, { from: 330, to: 494, at: 0.14, length: 0.2, volume: 0.06, wave: 'triangle' });
}

export function fanfare(): void {
  const audio = ready();
  if (!audio) return;
  const { root, wave } = flavour;
  [1, 1.26, 1.5, 2].forEach((ratio, i) =>
    note(audio, { from: root * ratio, at: i * 0.11, length: i === 3 ? 0.5 : 0.14, volume: 0.07, wave: wave === 'square' ? 'square' : 'triangle' }),
  );
}

export function sparkle(): void {
  const audio = ready();
  if (!audio) return;
  for (let i = 0; i < 6; i++) note(audio, { from: 1500 + i * 220, at: 0.5 + i * 0.06, length: 0.12, volume: 0.035 });
}
