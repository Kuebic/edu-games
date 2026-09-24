// Sound effects synthesised with Web Audio, so there are no audio files to ship.

export type Sound = 'pop' | 'crunch' | 'chime' | 'boop' | 'tick' | 'fanfare';

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

/** Call from inside a tap handler: mobile browsers keep audio suspended until a user gesture. */
export function unlockAudio() {
  if (typeof AudioContext === 'undefined') return;
  ctx ??= new AudioContext();
  void ctx.resume();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.25, slideTo?: number) {
  const c = ctx!;
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(start: number, dur: number, gain = 0.3) {
  const c = ctx!;
  const t = c.currentTime + start;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
}

export function play(sound: Sound) {
  if (!enabled || !ctx || ctx.state !== 'running') return;
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

export function buzz(ms = 30) {
  if (enabled) navigator.vibrate?.(ms);
}
