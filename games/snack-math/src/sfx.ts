// Sound effects, notes and a crunch on the site's Sound, so there are no audio files to ship.

import { audio, note } from '@shared/sound';

export type Sound = 'pop' | 'crunch' | 'chime' | 'boop' | 'tick' | 'fanfare';

const tone = (from: number, at: number, length: number, wave: OscillatorType = 'sine', volume = 0.25, to?: number) =>
  note({ from, to, at, length, wave, volume });

function noise(at: number, length: number, volume = 0.3): void {
  const live = audio();
  if (!live) return;
  const start = live.currentTime + at;
  const buffer = live.createBuffer(1, Math.floor(live.sampleRate * length), live.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = live.createBufferSource();
  source.buffer = buffer;
  const filter = live.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  const gain = live.createGain();
  gain.gain.value = volume;
  source.connect(filter).connect(gain).connect(live.destination);
  source.start(start);
}

export function play(sound: Sound): void {
  switch (sound) {
    case 'pop':
      tone(420, 0, 0.12, 'sine', 0.3, 900);
      break;
    case 'crunch':
      noise(0, 0.08);
      noise(0.1, 0.08);
      noise(0.2, 0.1);
      break;
    case 'chime':
      tone(784, 0, 0.35, 'triangle', 0.2);
      tone(988, 0.08, 0.35, 'triangle', 0.2);
      tone(1319, 0.16, 0.5, 'triangle', 0.2);
      break;
    case 'boop':
      tone(300, 0, 0.25, 'sine', 0.2, 200);
      break;
    case 'tick':
      tone(660, 0, 0.08, 'sine', 0.15);
      break;
    case 'fanfare':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.2));
      tone(1047, 0.5, 0.7, 'triangle', 0.22);
      tone(1319, 0.5, 0.7, 'triangle', 0.15);
      break;
  }
}
