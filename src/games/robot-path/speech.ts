// All spoken words go through here, with the browser's speech synthesis (docs/adr/0001).
// Swap this module to use recorded clips.

const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined;

let enabled = true;
let voice: SpeechSynthesisVoice | null = null;

const PREFERRED = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];

/** Picked once, then cached; picked again only if the browser's voice list changes. */
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

if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

/** No speech in this browser: the speaker button hides. */
export const canSpeak = synth !== undefined;

export function setVoiceEnabled(on: boolean): void {
  enabled = on;
  if (!on) hush();
}

/** Call from inside a tap: mobile browsers only allow speech after a user gesture. */
export function unlockSpeech(): void {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  synth.speak(u);
}

export function hush(): void {
  synth?.cancel();
}

/** Speak a line, cutting off whatever was being said. */
export function say(text: string): void {
  if (!synth || !enabled) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'en-US';
  u.rate = 0.9;
  u.pitch = 1.1;
  synth.speak(u);
}

/** "C, A, T. Cat!" Letter names, not phonics (docs/adr/0001). */
export function spellOut(word: string): string {
  return `${[...word].join(', ')}. ${word[0]}${word.slice(1).toLowerCase()}!`;
}
