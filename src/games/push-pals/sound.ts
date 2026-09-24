// Tiny Web Audio player. Sounds are Kenney's CC0 interface sounds.

export type Sound = 'push' | 'goal' | 'win' | 'undo' | 'tap';

const NAMES: readonly Sound[] = ['push', 'goal', 'win', 'undo', 'tap'];

let context: AudioContext | undefined;
const buffers = new Map<Sound, AudioBuffer>();
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
  for (const name of NAMES) {
    fetch(`${import.meta.env.BASE_URL}push-pals/sounds/${name}.ogg`)
      .then((response) => response.arrayBuffer())
      .then((data) => context!.decodeAudioData(data))
      .then((buffer) => buffers.set(name, buffer))
      .catch(() => {});
  }
}

export function play(name: Sound): void {
  const buffer = buffers.get(name);
  if (muted || !context || !buffer) return;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
}
