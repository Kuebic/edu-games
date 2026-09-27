// Which letters My Letter teaches: My words, spelt, then the eight New letters, and which capitals Look alike.
// Pure, so it's tested as data.

/** The Groups, as Saved progress counts them. My words is Group 0 even with no words, so New letters never moves. */
export const MY_WORDS = 0;
export const NEW_LETTERS = 1;

/** Each Group's name, for screen readers, by its number. */
export const GROUP_NAMES = ['My words', 'New letters'] as const;

/** The New letters in play order: letters whose name starts with their sound. The same eight for every child. */
export const NEW_LETTER_ORDER: readonly string[] = ['B', 'D', 'K', 'P', 'T', 'V', 'Z', 'J'];

/** The most letters of a Name that count: enough for a first name, and a Name line that fits a phone. */
const NAME_MAX_LETTERS = 10;

/** The most Words a grown-up adds after the Name: a Group that still fits a phone without scrolling. */
const MAX_WORDS = 10;

/** The Words as a grown-up types them in one box: split at commas, trimmed, empty ones dropped. */
export function splitWords(typed: string): string[] {
  return typed
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word !== '');
}

/**
 * My words as typed, each a Level: the Name, then the Words. One with no letters is left out, and so is one
 * spelt the same as one before it (Anna and ANNA), so no two Levels are the same.
 */
export function myWords(name: string, words: readonly string[]): string[] {
  const seen = new Set<string>();
  return [name, ...words.slice(0, MAX_WORDS)].filter((word) => {
    const capitals = nameCapitals(word);
    if (capitals === '' || seen.has(capitals)) return false;
    seen.add(capitals);
    return true;
  });
}

/** The Name (or a Word) as the Name line shows it: accents gone, only A to Z, in capitals, the first ten. */
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
 * A Group's Levels as their cards say them: My words is a Level per word of `mine` (from myWords), its card
 * the word's capitals; New letters is always all eight, a card per letter.
 */
export function levelLabels(mine: readonly string[], group: number): readonly string[] {
  return group === MY_WORDS ? mine.map(nameCapitals) : NEW_LETTER_ORDER;
}

/** The letters met before a New letters Level: the letters of My words, then the New letters before it, each once. */
export function metLetters(mine: readonly string[], level: number): string[] {
  return [...new Set([...mine.flatMap(nameLetters), ...NEW_LETTER_ORDER.slice(0, level)])];
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
