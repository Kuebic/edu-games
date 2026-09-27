// What My Letter remembers, on the site's Saved progress (ADR 0012): which Levels of each Group are done,
// and its own slot: the Name and the Words a grown-up typed, and whether they closed the Corner without a Name.

import { openProgress, type Progress as SiteProgress } from '@shared/progress';
import type { GameStorage } from '@shared/storage';
import { GROUP_NAMES, MY_WORDS, levelLabels, myWords as myWordsOf, nameCapitals, nameLetters } from './letters';

/** What only My Letter saves. All settings, so a reset leaves them. */
export interface Save {
  /** The child's first name as typed, trimmed. Empty for none. */
  name: string;
  /** The Words a grown-up added after the Name (Mama, Dada, a sibling), each as typed, trimmed. */
  words: string[];
  /** A grown-up closed the Corner without a Name, so it doesn't open by itself again. */
  skipped: boolean;
}

export type Progress = SiteProgress<Save>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Saved as "my-letter:v1": the shell puts the Slug in front. */
export function loadProgress(storage: GameStorage): Progress {
  const progress: Progress = openProgress(storage, {
    key: 'v1',
    // My words has a Level per word, none without one; it keeps its place, so New letters never moves.
    sizes: () => GROUP_NAMES.map((_, group) => levelLabels(myWords(progress), group).length),
    game: {
      read(raw) {
        const r = isRecord(raw) ? raw : {};
        return {
          name: typeof r.name === 'string' ? r.name.trim() : '',
          words: Array.isArray(r.words) ? r.words.filter((w): w is string => typeof w === 'string').map((w) => w.trim()) : [],
          skipped: r.skipped === true,
        };
      },
    },
  });
  return progress;
}

/** My words as typed, a Level each: the Name, then the Words. */
export const myWords = (progress: Progress) => myWordsOf(progress.game.name, progress.game.words);

/** There's a Name with letters in it. */
export const hasName = (progress: Progress) => nameLetters(progress.game.name).length > 0;

/**
 * Changes the Name or the Words. My words' Levels are Done by position, so unless the old words are all still
 * first in the same order (a Word added at the end), My words starts fresh (ADR 0002); New letters stays. Says
 * whether it did, since a My words Level being played may then be spelling a word that has gone.
 */
function change(progress: Progress, edit: () => void): boolean {
  const before = myWords(progress).map(nameCapitals);
  edit();
  const after = myWords(progress).map(nameCapitals);
  const fresh = before.some((capitals, i) => after[i] !== capitals);
  if (fresh) progress.forget(MY_WORDS);
  progress.save();
  return fresh;
}

/** Saves a Name typed in the Corner. */
export function setName(progress: Progress, typed: string): boolean {
  return change(progress, () => (progress.game.name = typed.trim()));
}

/** Saves the Words typed in the Corner. */
export function setWords(progress: Progress, words: readonly string[]): boolean {
  return change(progress, () => (progress.game.words = words.map((w) => w.trim())));
}
