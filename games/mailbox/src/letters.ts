// What Mailbox asks: the 26 letters, their Ranges, which ones look alike, and the Rounds of each Way. Pure,
// with the random source passed in, so it's tested as data. A Letter is its lowercase form: the Things are
// lowercase, the Mailboxes wear capitals (docs/spec.md).

import { binsFrom, pileOf, PER_BIN, type Rng } from '@shared/sort';

export type Letter = string;
/** Every letter, in Scope order. Each is also its Name clip's file name. */
export const LETTERS: readonly Letter[] = [...'abcdefghijklmnopqrstuvwxyz'];
export const isLetter = (value: unknown): value is Letter => typeof value === 'string' && LETTERS.includes(value);

export const capital = (letter: Letter): string => letter.toUpperCase();
/** What a Scope button shows: "Aa". */
export const pairOf = (letter: Letter): string => capital(letter) + letter;

/**
 * The Ranges, easiest first, by how much a lowercase letter looks like its capital: the Same shape (c o s),
 * Close (one change: k p u), Unlike (a r m) and Tricky (b d g l q, which also look like each other).
 * Preschoolers name them in this order (Bowles et al. 2014; docs/research/letter-case-matching.md).
 */
export const RANGES: readonly { label: string; letters: readonly Letter[] }[] = [
  { label: 'Same', letters: [...'cosvwxz'] },
  { label: 'Close', letters: [...'ijkpuy'] },
  { label: 'Unlike', letters: [...'aefhmnrt'] },
  { label: 'Tricky', letters: [...'bdglq'] },
];

/** Unlike and Tricky letters: their lowercase has to be learnt, so a Hint shows it at first. */
export const HINTED: readonly Letter[] = [...RANGES[2]!.letters, ...RANGES[3]!.letters];

/**
 * Letters a young child mixes up, as lowercase letters or as capitals: every two in a group look alike.
 * The lowercase b d p q are mirror images of each other, which children mix up until six or seven.
 */
const LOOK_ALIKES: readonly string[] = [
  // lowercase
  'bdpq', 'gq', 'nu', 'mw', 'hn', 'nr', 'ijl', 'ft', 'ao', 'ad', 'ce', 'uvy', 'vw',
  // capitals, as My Letter keeps apart
  'bdpr', 'cgoq', 'ef', 'mnw', 'uvy', 'ijlt', 'kx',
];

/** Whether two letters look alike: they never share a Round when the Scope leaves another way. */
export const lookAlike = (a: Letter, b: Letter): boolean => a !== b && LOOK_ALIKES.some((g) => g.includes(a) && g.includes(b));

/** Sort: each lowercase letter into the Mailbox with its capital. Find: one Mailbox asks for its letter. */
export type Way = 'sort' | 'find';
export const WAYS: readonly Way[] = ['sort', 'find'];

/** Asks in a Find Round. */
export const ASKS = 6;

export interface SortRound {
  /** The Mailboxes' letters, left to right. */
  boxes: Letter[];
  /** The Bag, in the order it's served. */
  bag: Letter[];
}

export interface FindRound {
  /** The letters on the table, one of each. */
  kinds: Letter[];
  /** What the Mailbox asks for, in order. */
  asks: Letter[];
}

/** Each Round's letters from the Scope: up to three, each once before any comes again, look-alikes apart. */
function lettersOf(scope: readonly Letter[], rng: Rng): () => Letter[] {
  if (scope.length < 2) throw new Error('Mailbox: a Round needs a Scope of two at least');
  return binsFrom(scope, rng, undefined, lookAlike);
}

/** Sort's Rounds, one per call, for as long as it's played. */
export function sortRounds(scope: readonly Letter[], rng: Rng = Math.random): () => SortRound {
  const next = lettersOf(scope, rng);
  return () => {
    const boxes = next();
    const each = PER_BIN[boxes.length]!;
    return { boxes, bag: pileOf(boxes.flatMap((l) => Array<Letter>(each).fill(l)), (l) => l, rng) };
  };
}

/** Find's Rounds: the Asks go round the Round's letters evenly, shuffled, never three in a row. */
export function findRounds(scope: readonly Letter[], rng: Rng = Math.random): () => FindRound {
  const next = lettersOf(scope, rng);
  return () => {
    const kinds = next();
    const asks = Array.from({ length: ASKS }, (_, i) => kinds[i % kinds.length]!);
    return { kinds, asks: pileOf(asks, (l) => l, rng) };
  };
}

// ---- Hints --------------------------------------------------------------------------------------------

/** Clean Rounds before a Hint has gone: it fades after the first and is gone after the second. */
export const HINT_ROUNDS = 2;

/** How faint a letter's Hint is: 0 when it has none. */
export function hintOf(learnt: Readonly<Record<Letter, number>>, letter: Letter): number {
  if (!HINTED.includes(letter)) return 0;
  const clean = learnt[letter] ?? 0;
  return clean >= HINT_ROUNDS ? 0 : clean === 0 ? 0.45 : 0.2;
}

/**
 * After a Round: each of its letters with no Miss counts one more clean Round, and one with a Miss starts
 * again, so its Hint comes back.
 */
export function afterRound(learnt: Readonly<Record<Letter, number>>, letters: readonly Letter[], missed: ReadonlySet<Letter>): Record<Letter, number> {
  const next = { ...learnt };
  for (const l of letters) next[l] = missed.has(l) ? 0 : Math.min((next[l] ?? 0) + 1, HINT_ROUNDS);
  return next;
}

/** The grown-up's card after a Round. */
export const lookFor = (letter: Letter): string => `Find ${/[aefhilmnorsx]/.test(letter) ? 'an' : 'a'} ${letter} in a book together!`;
