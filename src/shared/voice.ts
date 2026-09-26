// The Voice: every line a Game speaks goes through here, using the browser's speech synthesis (ADR 0010).
// One place to swap for recorded clips. Games never touch speechSynthesis themselves.

export interface Voice {
  /** True when this browser can speak. A Game hides its speaker button and Voice switch when it can't. */
  readonly canSpeak: boolean;
  /** The Grown-up Corner's Voice switch. Off hushes at once. The Game saves it, under its Slug. */
  setVoiceEnabled(on: boolean): void;
  /**
   * Call from inside a touch. iOS speaks nothing until a line has been spoken from a gesture, so this
   * speaks a silent one. It runs once; later calls do nothing. Pass it in a Game's `unlock` to
   * `startGame`, or call it from the tap that starts play.
   */
  unlockVoice(): void;
  /**
   * Say a line, cutting off whatever was being said. Resolves when the line ends or is cut off, at
   * once when the browser can't speak or the Voice is off. Never rejects, and never hangs: a guard
   * timer of 1.5 s + 90 ms a character resolves it when the engine never fires `end`.
   */
  say(text: string): Promise<void>;
  /** Stop speaking. */
  hush(): void;
}

/** Just what the Voice uses of the page: whether it's hidden, and the event that says so. */
export type Page = EventTarget & { hidden: boolean };

const PREFERRED = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];

/** The Voice over a given speech engine and page. Tests pass fakes; the browser gets the default below. */
export function createVoice(synth: SpeechSynthesis | undefined, page?: Page): Voice {
  let enabled = true;
  let unlocked = false;
  let voice: SpeechSynthesisVoice | null = null;
  // Chrome garbage-collects an unreferenced utterance mid-line, and its `end` never fires.
  let current: SpeechSynthesisUtterance | undefined;

  /** English, preferring the names that sound kindest; picked again whenever the list changes, since iOS and Chrome fill it late. */
  function pickVoice(): void {
    if (!synth) return;
    const english = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
    voice =
      PREFERRED.map((name) => english.find((v) => v.name.includes(name))).find(Boolean) ??
      english.find((v) => v.lang === 'en-US' && v.localService) ??
      english.find((v) => v.lang === 'en-US') ??
      english[0] ??
      null;
  }

  function hush(): void {
    synth?.cancel();
  }

  if (synth) {
    pickVoice();
    synth.addEventListener('voiceschanged', pickVoice);
    // A locked phone mustn't keep talking.
    page?.addEventListener('visibilitychange', () => {
      if (page.hidden) hush();
    });
  }

  return {
    canSpeak: synth !== undefined,

    setVoiceEnabled(on) {
      enabled = on;
      if (!on) hush();
    },

    unlockVoice() {
      // Even with the Voice off: a grown-up who turns it on later still gets speech.
      if (!synth || unlocked) return;
      unlocked = true;
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0;
      synth.speak(silent);
    },

    say(text) {
      if (!synth || !enabled) return Promise.resolve();
      synth.cancel();
      return new Promise((resolve) => {
        const line = new SpeechSynthesisUtterance(text);
        if (voice) line.voice = voice;
        line.lang = voice?.lang ?? 'en-US';
        line.rate = 0.9;
        line.pitch = 1.1;
        // Some engines never fire `end`; don't let a Game hang waiting.
        const guard = setTimeout(done, 1500 + text.length * 90);
        function done(): void {
          clearTimeout(guard);
          if (current === line) current = undefined;
          resolve();
        }
        line.onend = done;
        line.onerror = done;
        current = line;
        synth.speak(line);
      });
    },

    hush,
  };
}

const browser = createVoice(
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined,
  typeof document !== 'undefined' ? document : undefined,
);

export const canSpeak = browser.canSpeak;
export const setVoiceEnabled = browser.setVoiceEnabled;
export const unlockVoice = browser.unlockVoice;
export const say = browser.say;
export const hush = browser.hush;
