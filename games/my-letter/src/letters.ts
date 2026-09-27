// Which letters My Letter teaches: the Name, spelt, then the eight New letters, and which capitals Look alike.
// Pure, so it's tested as data.

/** The Groups, as Saved progress counts them. My name is Group 0 even with no Name, so New letters never moves. */
export const MY_NAME = 0;
export const NEW_LETTERS = 1;

/** Each Group's name, for screen readers, by its number. */
export const GROUP_NAMES = ['My name', 'New letters'] as const;

/** The New letters in play order: letters whose name starts with their sound. The same eight for every child. */
export const NEW_LETTER_ORDER: readonly string[] = ['B', 'D', 'K', 'P', 'T', 'V', 'Z', 'J'];

/** The most letters of a Name that count: enough for a first name, and a Name line that fits a phone. */
const NAME_MAX_LETTERS = 10;

/** The Name as the Name line shows it: accents gone, only A to Z, in capitals, the first ten. */
export function nameCapitals(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, NAME_MAX_LETTERS);
}

/** The different letters in the Name, in the order they first appear: SAM is S, A, M; ANNA is A, N. None means no Name. */
export function nameLetters(name: string): string[] {
  return [...new Set(nameCapitals(name))];
}

/**
 * A Group's Levels as their cards say them: My name is one Level, its card the Name's capitals (none without a
 * Name); New letters is always all eight, a card per letter.
 */
export function levelLabels(name: string, group: number): readonly string[] {
  if (group !== MY_NAME) return NEW_LETTER_ORDER;
  const capitals = nameCapitals(name);
  return capitals === '' ? [] : [capitals];
}

/** The letters met before a New letters Level: the Name letters, then the New letters before it, each once. */
export function metLetters(name: string, level: number): string[] {
  return [...new Set([...nameLetters(name), ...NEW_LETTER_ORDER.slice(0, level)])];
}

/** Capitals a three-year-old mixes up, never offered side by side. */
export const LOOK_ALIKES: readonly string[] = ['BPRD', 'CGOQ', 'EF', 'MNW', 'UVY', 'ILTJ', 'KX'];

/** Whether two different capitals are in the same Looks alike family. */
export function looksAlike(a: string, b: string): boolean {
  return LOOK_ALIKES.some((family) => family.includes(a) && family.includes(b));
}

/** The Letter board: every capital A to Z in order, each marked if it's one of the Name letters. */
export function boardLetters(name: string): { letter: string; mine: boolean }[] {
  const mine = new Set(nameLetters(name));
  return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter) => ({ letter, mine: mine.has(letter) }));
}
