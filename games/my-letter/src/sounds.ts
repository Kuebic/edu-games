// My Letter's noises on the site's Sound: a Letter sound clip per letter (ADR 0001), found by looking at
// which files are in assets/sounds/ rather than a hand list, the ABC song (ADR 0005), and two little notes.
// The cheer is the site's.

import { clip, note, type Clip } from '@shared/sound';
import songUrl from './assets/abc-song.mp3';

/** Each Letter sound clip's URL by its letter: s.mp3 is S. */
export function clipsByLetter(files: Readonly<Record<string, string>>): Map<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [/([a-z])\.mp3$/.exec(path)![1]!.toUpperCase(), url]));
}

// Imported like any file (ADR 0005), so the build hashes each one and ships only what's there.
const files = import.meta.glob<string>('./assets/sounds/[a-z].mp3', { eager: true, query: '?url', import: 'default' });
const letterSounds = new Map([...clipsByLetter(files)].map(([letter, url]) => [letter, clip(url)]));

/** A letter's Letter sound, or undefined for a letter with no clip. */
export const letterSound = (letter: string): Clip | undefined => letterSounds.get(letter);

/** The ABC song, sung by a girl; src/song.ts says when each letter comes. */
export const abcSong = clip(songUrl);

/** A soft pop when the letter asked for is found, and a low boop for a Fade. */
export function play(sound: 'pop' | 'boop'): void {
  if (sound === 'pop') note({ from: 420, to: 900, length: 0.12, volume: 0.25 });
  else note({ from: 300, to: 200, length: 0.25, volume: 0.18 });
}
