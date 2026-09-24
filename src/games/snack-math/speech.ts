// All spoken words go through here (see docs/adr/0002). Swap this module to use recorded clips.

const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined;

let enabled = true;
let voice: SpeechSynthesisVoice | null = null;

const PREFERRED = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];

function pickVoice() {
  if (!synth) return;
  const english = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
  voice =
    PREFERRED.map((name) => english.find((v) => v.name.includes(name))).find(Boolean) ??
    english.find((v) => v.lang === 'en-US' && v.localService) ??
    english.find((v) => v.lang === 'en-US') ??
    english[0] ??
    null;
}

if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export function setVoiceEnabled(on: boolean) {
  enabled = on;
  if (!on) hush();
}

/** Call from inside a tap handler: mobile browsers only allow speech after a user gesture. */
export function unlockSpeech() {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  synth.speak(u);
}

export function hush() {
  synth?.cancel();
}

/** Speak a line, cutting off whatever was being said. Resolves when done (or cut off). */
export function say(text: string): Promise<void> {
  if (!synth || !enabled) return Promise.resolve();
  synth.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-US';
    u.rate = 0.9;
    u.pitch = 1.15;
    // Some engines never fire `end`; don't let the game hang waiting.
    const guard = setTimeout(resolve, 1500 + text.length * 90);
    const done = () => {
      clearTimeout(guard);
      resolve();
    };
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
  });
}
