// Sounds. The engine and horn are made with Web Audio on the site's Sound, so there are no clips
// to download; the cheer is the site's.

import { audio, cheer } from '@shared/sound';

/** A soft two-tone toot: friendly, never a buzzer. `pitch` shifts it for a chorus. */
export function honk(pitch = 1, delay = 0): void {
  const live = audio();
  if (!live) return;
  const start = live.currentTime + delay;
  const gain = live.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
  gain.gain.setValueAtTime(0.09, start + 0.16);
  gain.gain.linearRampToValueAtTime(0, start + 0.24);
  const filter = live.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.connect(gain).connect(live.destination);
  for (const frequency of [370, 466]) {
    const tone = live.createOscillator();
    tone.type = 'square';
    tone.frequency.value = frequency * pitch;
    tone.connect(filter);
    tone.start(start);
    tone.stop(start + 0.26);
  }
}

/** Engine revving up as a Vehicle pulls away, fading as it drives off. */
export function vroom(seconds: number): void {
  const live = audio();
  if (!live) return;
  const start = live.currentTime;
  const end = start + Math.max(0.3, seconds);
  const gain = live.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.07, start + 0.05);
  gain.gain.linearRampToValueAtTime(0, end);
  const filter = live.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.connect(gain).connect(live.destination);
  for (const detune of [0, 7]) {
    const engine = live.createOscillator();
    engine.type = 'sawtooth';
    engine.frequency.setValueAtTime(55 + detune, start);
    engine.frequency.exponentialRampToValueAtTime(140 + detune, end);
    engine.connect(filter);
    engine.start(start);
    engine.stop(end);
  }
}

/** Streets clear: the cheer, and a chorus of happy honks. */
export function celebrate(): void {
  cheer();
  [1, 1.26, 1.5, 1.26, 2].forEach((pitch, i) => honk(pitch, 0.35 + i * 0.16));
}
