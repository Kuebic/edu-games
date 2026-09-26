// Which letters My Letter teaches: the Name's own, then the eight New letters, and which capitals Look alike.
// Pure, so it's tested as data.

/** The two Groups, in the order Saved progress counts them. My name is Group 0 even with no Name, so New letters never moves. */
export const GROUPS = ['My name', 'New letters'] as const;

/** Letters whose name starts with their sound, so saying the letter teaches the sound. The same eight for every child. */
export const NEW_LETTERS: readonly string[] = ['B', 'D', 'K', 'P', 'T', 'V', 'Z', 'J'];

/** The most letters of a Name that count: enough for a first name, and a Name line that fits a phone. */
const MOST = 10;

/** The Name as the Name line shows it: accents gone, only A to Z, in capitals, the first ten. */
export function nameLine(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, MOST);
}

/** The different letters in the Name, in the order they first appear: SAM is S, A, M; ANNA is A, N. None means no Name. */
export function nameLetters(name: string): string[] {
  return [...new Set(nameLine(name))];
}

/** A Group's Levels as their letters: one per Name letter, or always all eight New letters. */
export function levelLetters(name: string, group: number): readonly string[] {
  return group === 0 ? nameLetters(name) : NEW_LETTERS;
}

/** The letters of every Level before this one in play order (My name's, then New letters'), each once. */
export function metLetters(name: string, group: number, level: number): string[] {
  const before = group === 0 ? nameLetters(name).slice(0, level) : [...nameLetters(name), ...NEW_LETTERS.slice(0, level)];
  return [...new Set(before)];
}

/** Capitals a three-year-old mixes up, never offered side by side. */
export const LOOK_ALIKES: readonly string[] = ['BPRD', 'CGOQ', 'EF', 'MNW', 'UVY', 'ILTJ', 'KX'];

/** Whether two different capitals are in the same Looks alike family. */
export function looksAlike(a: string, b: string): boolean {
  return LOOK_ALIKES.some((family) => family.includes(a) && family.includes(b));
}
