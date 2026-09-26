// My Letter's noises on the site's Sound: a Letter sound clip per letter (ADR 0001), found by looking at
// which files are in assets/sounds/ rather than a hand list, and two little notes. The cheer is the site's.

import { clip, note } from '@shared/sound';

/** Each Letter sound clip's URL by its file name: s.mp3 is S. Other files there aren't Letter sounds. */
export function clipsByLetter(files: Readonly<Record<string, string>>): Map<string, string> {
  const clips = new Map<string, string>();
  for (const [path, url] of Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1))) {
    const letter = /\/([a-z])\.\w+$/.exec(path)?.[1]?.toUpperCase();
    if (letter && !clips.has(letter)) clips.set(letter, url);
  }
  return clips;
}

// Imported like any file (ADR 0005), so the build hashes each one and ships only what's there.
const files = import.meta.glob<string>('./assets/sounds/*.{ogg,opus,mp3}', { eager: true, query: '?url', import: 'default' });
const letterSounds = new Map([...clipsByLetter(files)].map(([letter, url]) => [letter, clip(url)]));

/** A letter's Letter sound: plays it and resolves when it ends. Undefined for a letter with no clip. */
export const letterSound = (letter: string): (() => Promise<void>) | undefined => letterSounds.get(letter);

/** A soft pop when a Choice comes up right, and a low boop for a Fade. */
export function play(sound: 'pop' | 'boop'): void {
  if (sound === 'pop') note({ from: 420, to: 900, length: 0.12, volume: 0.25 });
  else note({ from: 300, to: 200, length: 0.25, volume: 0.18 });
}
