// The Sound: every noise a Game makes goes through here, on one Web Audio context (ADR 0011).
// A Game keeps its clips and its jingle recipes; this keeps the context, the unlock, the switch and the decoding.

import cheerUrl from './assets/cheer.ogg';

/** One note: a frequency glide with a quick fade in and out. Times are seconds. */
export interface Note {
  from: number;
  /** Glides to this by the end; `from` if left out. */
  to?: number;
  /** Seconds from now. */
  at?: number;
  length?: number;
  volume?: number;
  wave?: OscillatorType;
}

export interface Sound {
  /** The Grown-up Corner's Sound switch. Off also stops the buzz. Saved progress saves it. */
  setSoundEnabled(on: boolean): void;
  /**
   * Call from inside a touch or key press. Browsers only start audio after one, and may suspend it
   * again later, so this runs every time: it makes the context once, then resumes it while suspended.
   * The shell calls it for every Game; a Game never has to.
   */
  unlockAudio(): void;
  /** The context, for a Game's own recipes, when sound is on and the context is running; else undefined. */
  audio(): AudioContext | undefined;
  note(note: Note): void;
  /**
   * A clip to play. Fetched and decoded once the context exists, so register clips at load and play
   * them any time: a play before the clip is ready, or with sound off, is silent. A failed fetch is too.
   * Playing resolves when the clip ends, or at once when it's silent; `ready()` says which it will be.
   */
  clip(url: string): Clip;
  /** The site's cheer jingle (Kenney's CC0), for a Level done. */
  cheer(): void;
  /** A little vibration, where the device can, and only while sound is on. */
  buzz(ms: number): void;
}

/** A registered clip: play it, or ask first whether it would be heard. */
export interface Clip {
  /** Plays it. Resolves when it ends, or at once when it's silent. */
  (): Promise<void>;
  /** True when a play now would be heard: decoded, with sound on and the context running. */
  ready(): boolean;
}

/** What the Sound uses of the browser. Tests pass fakes; missing pieces mean silence. */
export interface SoundEnv {
  AudioContext?: typeof AudioContext;
  fetch?: typeof fetch;
  vibrate?: (ms: number) => void;
}

export function createSound(env: SoundEnv): Sound {
  let context: AudioContext | undefined;
  let enabled = true;
  /** Every registered clip's URL and, once decoded, its buffer. The cheer is one from the start. */
  const clips = new Map<string, AudioBuffer | undefined>([[cheerUrl, undefined]]);

  function decode(url: string): void {
    if (!context || !env.fetch) return;
    env
      .fetch(url)
      .then((response) => response.arrayBuffer())
      .then((data) => context!.decodeAudioData(data))
      .then((buffer) => clips.set(url, buffer))
      .catch(() => {});
  }

  const audio = (): AudioContext | undefined => (enabled && context?.state === 'running' ? context : undefined);

  const play = (url: string): Promise<void> => {
    const buffer = clips.get(url);
    const live = audio();
    if (!buffer || !live) return Promise.resolve();
    const source = live.createBufferSource();
    source.buffer = buffer;
    source.connect(live.destination);
    return new Promise((resolve) => {
      // A context suspended mid-clip never ends it; don't let a Game hang waiting.
      const guard = Number.isFinite(buffer.duration) ? setTimeout(resolve, buffer.duration * 1000 + 500) : undefined;
      source.onended = () => {
        clearTimeout(guard);
        resolve();
      };
      source.start();
    });
  };

  return {
    setSoundEnabled(on) {
      enabled = on;
    },

    unlockAudio() {
      if (!context) {
        if (!env.AudioContext) return;
        try {
          context = new env.AudioContext();
        } catch {
          return;
        }
        for (const url of clips.keys()) decode(url);
      }
      if (context.state === 'suspended') void context.resume();
    },

    audio,

    note({ from, to = from, at = 0, length = 0.12, volume = 0.08, wave = 'sine' }) {
      const live = audio();
      if (!live) return;
      const start = live.currentTime + at;
      const gain = live.createGain();
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + length);
      gain.connect(live.destination);
      const tone = live.createOscillator();
      tone.type = wave;
      tone.frequency.setValueAtTime(from, start);
      tone.frequency.exponentialRampToValueAtTime(to, start + length);
      tone.connect(gain);
      tone.start(start);
      tone.stop(start + length + 0.02);
    },

    clip(url) {
      if (!clips.has(url)) {
        clips.set(url, undefined);
        if (context) decode(url);
      }
      return Object.assign(() => play(url), { ready: () => clips.get(url) !== undefined && audio() !== undefined });
    },

    cheer() {
      void play(cheerUrl);
    },

    buzz(ms) {
      if (!enabled) return;
      try {
        env.vibrate?.(ms);
      } catch {
        // Not allowed here: fine.
      }
    },
  };
}

const browser = createSound(
  typeof window === 'undefined'
    ? {}
    : {
        AudioContext: window.AudioContext,
        fetch: window.fetch?.bind(window),
        vibrate: navigator.vibrate?.bind(navigator),
      },
);
export const setSoundEnabled = browser.setSoundEnabled;
export const unlockAudio = browser.unlockAudio;
export const audio = browser.audio;
export const note = browser.note;
export const clip = browser.clip;
export const cheer = browser.cheer;
export const buzz = browser.buzz;
