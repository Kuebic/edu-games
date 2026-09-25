// Every spoken line goes through here, using the browser's own voice (as Snack Math does).

const synth: SpeechSynthesis | undefined =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined;

let enabled = true;
let voice: SpeechSynthesisVoice | null = null;

const PREFERRED = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];

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

/** False when the browser can't speak; the speaker button hides. */
export const canSpeak = synth !== undefined;

export function setVoiceEnabled(on: boolean): void {
  enabled = on;
  if (!on) synth?.cancel();
}

export function voiceEnabled(): boolean {
  return canSpeak && enabled;
}

/** Speak a line, cutting off whatever was being said. */
export function say(text: string): void {
  if (!synth || !enabled) return;
  synth.cancel();
  const line = new SpeechSynthesisUtterance(text);
  if (voice) line.voice = voice;
  line.lang = voice?.lang ?? 'en-US';
  line.rate = 0.9;
  line.pitch = 1.1;
  synth.speak(line);
}

export function hush(): void {
  synth?.cancel();
}
