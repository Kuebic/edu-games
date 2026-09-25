// Sounds, made with Web Audio so there's almost nothing to download. The cheer is Kenney's
// CC0 jingle, the same one Traffic Jam and Push Pals play.

import type { Skin } from './skins';

let context: AudioContext | undefined;
let cheerClip: AudioBuffer | undefined;
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
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
    return;
  }
  fetch('/way-out/sounds/cheer.ogg')
    .then((response) => response.arrayBuffer())
    .then((data) => context!.decodeAudioData(data))
    .then((buffer) => (cheerClip = buffer))
    .catch(() => {});
}

function ready(): AudioContext | undefined {
  return enabled && context?.state === 'running' ? context : undefined;
}

function tone(type: OscillatorType, frequency: number, start: number, length: number, volume: number): void {
  const audio = context!;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  gain.connect(audio.destination);
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(gain);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

/** A soft click each time a sliding Vehicle crosses into a new cell. */
export function tick(): void {
  const audio = ready();
  if (audio) tone('triangle', 520, audio.currentTime, 0.05, 0.05);
}

/** A soft thump when a Vehicle meets another Vehicle, a Wall or the edge. Never a buzzer. */
export function bump(): void {
  const audio = ready();
  if (!audio) return;
  const start = audio.currentTime;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.18, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
  gain.connect(audio.destination);
  const osc = audio.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, start);
  osc.frequency.exponentialRampToValueAtTime(70, start + 0.14);
  osc.connect(gain);
  osc.start(start);
  osc.stop(start + 0.18);
}

/** A little pop when a tapped Vehicle lifts up. */
export function pop(): void {
  const audio = ready();
  if (audio) tone('sine', 660, audio.currentTime, 0.09, 0.08);
}

/** The red Vehicle leaving: a car engine, a tractor putt-putt, or a rocket whoosh. */
export function engine(kind: Skin['engine'], seconds: number): void {
  const audio = ready();
  if (!audio) return;
  const start = audio.currentTime;
  const end = start + seconds;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(kind === 'rocket' ? 0.12 : 0.08, start + 0.06);
  gain.gain.linearRampToValueAtTime(0, end);
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = kind === 'rocket' ? 1400 : 520;
  filter.connect(gain).connect(audio.destination);

  if (kind === 'rocket') {
    const noise = audio.createBuffer(1, Math.ceil(audio.sampleRate * seconds), audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = audio.createBufferSource();
    source.buffer = noise;
    filter.frequency.setValueAtTime(300, start);
    filter.frequency.exponentialRampToValueAtTime(2400, end);
    source.connect(filter);
    source.start(start);
    return;
  }

  const [low, high] = kind === 'tractor' ? [38, 70] : [55, 150];
  for (const detune of [0, 6]) {
    const osc = audio.createOscillator();
    osc.type = kind === 'tractor' ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(low + detune, start);
    osc.frequency.exponentialRampToValueAtTime(high + detune, end);
    osc.connect(filter);
    osc.start(start);
    osc.stop(end);
  }
  if (kind === 'tractor') {
    // Putt-putt: wobble the volume.
    const wobble = audio.createOscillator();
    const depth = audio.createGain();
    wobble.frequency.value = 9;
    depth.gain.value = 0.04;
    wobble.connect(depth).connect(gain.gain);
    wobble.start(start);
    wobble.stop(end);
  }
}

export function cheer(): void {
  const audio = ready();
  if (!audio || !cheerClip) return;
  const source = audio.createBufferSource();
  source.buffer = cheerClip;
  source.connect(audio.destination);
  source.start();
}

/** A rising twinkle for a Sparkle. */
export function twinkle(): void {
  const audio = ready();
  if (!audio) return;
  [1047, 1319, 1568, 2093, 2637].forEach((frequency, i) => tone('sine', frequency, audio.currentTime + 0.5 + i * 0.09, 0.4, 0.07));
}
