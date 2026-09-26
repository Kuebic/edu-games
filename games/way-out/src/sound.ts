// Sounds, notes and engines on the site's Sound, so there's nothing to download. The cheer is the site's.

import { audio, cheer, note } from '@shared/sound';
import type { Skin } from './skins';

export { cheer };

/** A soft click each time a sliding Vehicle crosses into a new cell. */
export function tick(): void {
  note({ from: 520, length: 0.05, volume: 0.05, wave: 'triangle' });
}

/** A soft thump when a Vehicle meets another Vehicle, a Wall or the edge. Never a buzzer. */
export function bump(): void {
  const live = audio();
  if (!live) return;
  const start = live.currentTime;
  const gain = live.createGain();
  gain.gain.setValueAtTime(0.18, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
  gain.connect(live.destination);
  const osc = live.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, start);
  osc.frequency.exponentialRampToValueAtTime(70, start + 0.14);
  osc.connect(gain);
  osc.start(start);
  osc.stop(start + 0.18);
}

/** A little pop when a tapped Vehicle lifts up. */
export function pop(): void {
  note({ from: 660, length: 0.09, volume: 0.08 });
}

/** The red Vehicle leaving: a car engine, a tractor putt-putt, or a rocket whoosh. */
export function engine(kind: Skin['engine'], seconds: number): void {
  const live = audio();
  if (!live) return;
  const start = live.currentTime;
  const end = start + seconds;
  const gain = live.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(kind === 'rocket' ? 0.12 : 0.08, start + 0.06);
  gain.gain.linearRampToValueAtTime(0, end);
  const filter = live.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = kind === 'rocket' ? 1400 : 520;
  filter.connect(gain).connect(live.destination);

  if (kind === 'rocket') {
    const noise = live.createBuffer(1, Math.ceil(live.sampleRate * seconds), live.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = live.createBufferSource();
    source.buffer = noise;
    filter.frequency.setValueAtTime(300, start);
    filter.frequency.exponentialRampToValueAtTime(2400, end);
    source.connect(filter);
    source.start(start);
    return;
  }

  const [low, high] = kind === 'tractor' ? [38, 70] : [55, 150];
  for (const detune of [0, 6]) {
    const osc = live.createOscillator();
    osc.type = kind === 'tractor' ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(low + detune, start);
    osc.frequency.exponentialRampToValueAtTime(high + detune, end);
    osc.connect(filter);
    osc.start(start);
    osc.stop(end);
  }
  if (kind === 'tractor') {
    // Putt-putt: wobble the volume.
    const wobble = live.createOscillator();
    const depth = live.createGain();
    wobble.frequency.value = 9;
    depth.gain.value = 0.04;
    wobble.connect(depth).connect(gain.gain);
    wobble.start(start);
    wobble.stop(end);
  }
}

/** A rising twinkle for a Sparkle. */
export function twinkle(): void {
  [1047, 1319, 1568, 2093, 2637].forEach((frequency, i) => note({ from: frequency, at: 0.5 + i * 0.09, length: 0.4, volume: 0.07 }));
}
