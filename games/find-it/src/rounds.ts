// What a Round asks: six Finds over one Box's Round, each way round in turn. Pure, so it's tested as data.

export type Rng = () => number;

export const ROUND_LENGTH = 6;
export const NUMBER_MAX = 100;

/** One picture a child can name: its emoji, its word and the letter the word starts with. */
export interface Picture {
  emoji: string;
  word: string;
  letter: string;
}

/** Every picture, at least one per letter A to Z. The word is what the Voice says. */
export const PICTURES: readonly Picture[] = (
  [
    ['🍎', 'apple'], ['🐜', 'ant'],
    ['📖', 'book'], ['🍌', 'banana'], ['🐻', 'bear'],
    ['🐱', 'cat'], ['🚗', 'car'], ['🎂', 'cake'],
    ['🐶', 'dog'], ['🦆', 'duck'], ['🥁', 'drum'],
    ['🥚', 'egg'], ['🐘', 'elephant'],
    ['🐟', 'fish'], ['🐸', 'frog'], ['🌸', 'flower'],
    ['🍇', 'grapes'], ['🎁', 'gift'], ['🐐', 'goat'],
    ['🎩', 'hat'], ['🐴', 'horse'], ['🏠', 'house'],
    ['🍦', 'ice cream'], ['🧊', 'ice'],
    ['🧃', 'juice'], ['👖', 'jeans'],
    ['🔑', 'key'], ['🪁', 'kite'], ['🐨', 'koala'],
    ['🦁', 'lion'], ['🍋', 'lemon'], ['🍃', 'leaf'],
    ['🌙', 'moon'], ['🐭', 'mouse'], ['🥛', 'milk'],
    ['👃', 'nose'], ['🥜', 'nut'],
    ['🍊', 'orange'], ['🦉', 'owl'], ['🐙', 'octopus'],
    ['🐷', 'pig'], ['🍕', 'pizza'], ['✏️', 'pencil'],
    ['👸', 'queen'],
    ['🐰', 'rabbit'], ['🌈', 'rainbow'], ['🚀', 'rocket'],
    ['⭐', 'star'], ['☀️', 'sun'], ['🐍', 'snake'],
    ['🐯', 'tiger'], ['🌳', 'tree'], ['🚂', 'train'],
    ['☂️', 'umbrella'], ['🦄', 'unicorn'],
    ['🎻', 'violin'], ['🌋', 'volcano'],
    ['🐳', 'whale'], ['🍉', 'watermelon'],
    ['🩻', 'x-ray'],
    ['🧶', 'yarn'], ['🪀', 'yo-yo'],
    ['🦓', 'zebra'],
  ] as const
).map(([emoji, word]) => ({ emoji, word, letter: word[0]!.toUpperCase() }));

/** The Letters Box's Rounds: five letters each, six in the last. */
export const LETTER_RANGES = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ'] as const;

/** The Numbers Box's Rounds: 0 to 10, then 11 to 20, and so on up to 100. */
export const NUMBER_RANGES = Array.from({ length: 10 }, (_, i) => (i === 0 ? { lo: 0, hi: 10 } : { lo: i * 10 + 1, hi: i * 10 + 10 }));

export type BoxKind = 'number' | 'letter';

export interface Box {
  kind: BoxKind;
  name: string;
  rounds: number;
}

/** The two Boxes, as Groups: Numbers first. Their order never changes, since Saved progress counts on it. */
export const BOXES: readonly Box[] = [
  { kind: 'number', name: 'Numbers', rounds: NUMBER_RANGES.length },
  { kind: 'letter', name: 'Letters', rounds: LETTER_RANGES.length },
];

/**
 * Which way round a Find goes. Find the symbol: the child sees beans or a picture and finds the numeral or
 * the letter. Find the picture: the child sees the numeral or the letter and finds the beans or a picture.
 */
export type Direction = 'find-symbol' | 'find-picture';

export type Find =
  | { kind: 'number'; direction: Direction; target: number; choices: number[] }
  | { kind: 'letter'; direction: 'find-symbol'; letter: string; picture: Picture; choices: string[] }
  | { kind: 'letter'; direction: 'find-picture'; letter: string; picture: Picture; choices: Picture[] };

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const pick = <T>(items: readonly T[], rng: Rng): T => items[Math.floor(rng() * items.length)]!;

/**
 * The target and two neighbours 1 or 2 away, in random order. Neighbours stay inside the Round's range
 * where it has two, so the Find is about the numbers being learnt; else anywhere from 0 to 100.
 */
export function numberChoices(target: number, range: { lo: number; hi: number }, rng: Rng = Math.random): number[] {
  const near = [target - 1, target + 1, target - 2, target + 2];
  const inside = near.filter((n) => n >= range.lo && n <= range.hi);
  const anywhere = near.filter((n) => n >= 0 && n <= NUMBER_MAX);
  const from = inside.length >= 2 ? inside : anywhere;
  return shuffle([target, ...shuffle(from, rng).slice(0, 2)], rng);
}

/** The target letter and two others from its Round, in random order. */
export function letterChoices(target: string, letters: string, rng: Rng = Math.random): string[] {
  const others = [...letters].filter((l) => l !== target);
  return shuffle([target, ...shuffle(others, rng).slice(0, 2)], rng);
}

/** A picture for the target letter and one each for two other letters of its Round, in random order. */
export function pictureChoices(target: string, letters: string, rng: Rng = Math.random): Picture[] {
  const others = shuffle([...letters].filter((l) => l !== target), rng).slice(0, 2);
  return shuffle([target, ...others].map((l) => pictureFor(l, rng)), rng);
}

export function pictureFor(letter: string, rng: Rng = Math.random): Picture {
  return pick(PICTURES.filter((p) => p.letter === letter), rng);
}

/** Six Finds for a Round of a Box, both counting from 0: different targets, each way round in turn. */
export function makeRound(box: number, round: number, rng: Rng = Math.random): Find[] {
  const kind = BOXES[box]?.kind;
  if (kind === undefined) throw new Error(`Find It: no Box ${box}`);
  const direction = (i: number): Direction => (i % 2 === 0 ? 'find-symbol' : 'find-picture');
  if (kind === 'number') {
    const range = NUMBER_RANGES[round];
    if (!range) throw new Error(`Find It: no Round ${round} of Numbers`);
    const targets = shuffle(Array.from({ length: range.hi - range.lo + 1 }, (_, i) => range.lo + i), rng).slice(0, ROUND_LENGTH);
    return targets.map((target, i) => ({ kind: 'number', direction: direction(i), target, choices: numberChoices(target, range, rng) }));
  }
  const letters = LETTER_RANGES[round];
  if (!letters) throw new Error(`Find It: no Round ${round} of Letters`);
  const order = shuffle([...letters], rng);
  return Array.from({ length: ROUND_LENGTH }, (_, i) => {
    const letter = order[i % order.length]!;
    if (direction(i) === 'find-symbol') {
      return { kind: 'letter', direction: 'find-symbol', letter, picture: pictureFor(letter, rng), choices: letterChoices(letter, letters, rng) };
    }
    const choices = pictureChoices(letter, letters, rng);
    return { kind: 'letter', direction: 'find-picture', letter, picture: choices.find((p) => p.letter === letter)!, choices };
  });
}
