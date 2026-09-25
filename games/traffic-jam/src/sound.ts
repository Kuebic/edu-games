// Sounds. The engine and horn are made with Web Audio, so there are no clips to download;
// the cheer is Kenney's CC0 jingle (the same one Push Pals plays).

import clearUrl from './assets/sounds/clear.ogg';

let context: AudioContext | undefined;
let cheer: AudioBuffer | undefined;
let muted = false;

export function setMuted(value: boolean): void {
  muted = value;
}

/** Call from a user gesture: browsers only allow audio after one. */
export function unlockAudio(): void {
  if (context) {
    if (context.state === 'suspended') void context.resume();
    return;
  }
  context = new AudioContext();
  fetch(clearUrl)
    .then((response) => response.arrayBuffer())
    .then((data) => context!.decodeAudioData(data))
    .then((buffer) => (cheer = buffer))
    .catch(() => {});
}

function ready(): AudioContext | undefined {
  return muted || !context ? undefined : context;
}

/** A soft two-tone toot: friendly, never a buzzer. `pitch` shifts it for a chorus. */
export function honk(pitch = 1, delay = 0): void {
  const audio = ready();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
  gain.gain.setValueAtTime(0.09, start + 0.16);
  gain.gain.linearRampToValueAtTime(0, start + 0.24);
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.connect(gain).connect(audio.destination);
  for (const frequency of [370, 466]) {
    const tone = audio.createOscillator();
    tone.type = 'square';
    tone.frequency.value = frequency * pitch;
    tone.connect(filter);
    tone.start(start);
    tone.stop(start + 0.26);
  }
}

/** Engine revving up as a Vehicle pulls away, fading as it drives off. */
export function vroom(seconds: number): void {
  const audio = ready();
  if (!audio) return;
  const start = audio.currentTime;
  const end = start + Math.max(0.3, seconds);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.07, start + 0.05);
  gain.gain.linearRampToValueAtTime(0, end);
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.connect(gain).connect(audio.destination);
  for (const detune of [0, 7]) {
    const engine = audio.createOscillator();
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
  const audio = ready();
  if (!audio) return;
  if (cheer) {
    const source = audio.createBufferSource();
    source.buffer = cheer;
    source.connect(audio.destination);
    source.start();
  }
  [1, 1.26, 1.5, 1.26, 2].forEach((pitch, i) => honk(pitch, 0.35 + i * 0.16));
}
