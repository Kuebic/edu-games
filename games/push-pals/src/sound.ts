// Tiny Web Audio player. Sounds are Kenney's CC0 interface sounds.

import goalUrl from './assets/sounds/goal.ogg';
import pushUrl from './assets/sounds/push.ogg';
import tapUrl from './assets/sounds/tap.ogg';
import undoUrl from './assets/sounds/undo.ogg';
import winUrl from './assets/sounds/win.ogg';

export type Sound = 'push' | 'goal' | 'win' | 'undo' | 'tap';

const URLS: Record<Sound, string> = { push: pushUrl, goal: goalUrl, win: winUrl, undo: undoUrl, tap: tapUrl };

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
  for (const [name, url] of Object.entries(URLS) as [Sound, string][]) {
    fetch(url)
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
