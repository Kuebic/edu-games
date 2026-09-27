// What Find It asks in Practice: Finds from a Topic's Scope, each item once before any comes again, the
// Way round or each way in turn. Pure, with the random source passed in, so it's tested as data.

export type Rng = () => number;

/** Finds between Cheers. */
export const CHEER_EVERY = 6;
export const NUMBER_MAX = 20;

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

/** A Topic's items, as the Scope holds them: the numbers 0 to 20 and the capitals A to Z, in order. */
export const NUMBERS: readonly string[] = Array.from({ length: NUMBER_MAX + 1 }, (_, i) => String(i));
export const LETTERS: readonly string[] = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/** The Ranges a grown-up turns on in one tap: numbers to 10 and to 20, letters by fives. */
export const NUMBER_RANGES: readonly (readonly string[])[] = [NUMBERS.slice(0, 11), NUMBERS.slice(11)];
export const LETTER_RANGES: readonly (readonly string[])[] = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXYZ'].map((r) => [...r]);

export type Topic = 'number' | 'letter';

/** The Topics in tab order, Numbers first. Saved progress counts on it. */
export const TOPICS: readonly Topic[] = ['number', 'letter'];

/** Each Topic's items. */
export const ITEMS: Readonly<Record<Topic, readonly string[]>> = { number: NUMBERS, letter: LETTERS };

/**
 * Which way round a Find goes. Find the symbol: the child sees beans or a picture and finds the numeral or
 * the letter. Find the picture: the child sees the numeral or the letter and finds the beans or a picture.
 */
export type Direction = 'find-symbol' | 'find-picture';

/** Which way round a Topic's Finds go, as a grown-up sets it: always one way, or each way in turn. */
export type Way = Direction | 'mix';
export const WAYS: readonly Way[] = ['find-symbol', 'find-picture', 'mix'];

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
 * The target and two neighbours 1 or 2 away, in random order, so a Find is about telling close amounts
 * apart. Neighbours in the Scope come first; the rest are anywhere from 0 to 20.
 */
export function numberChoices(target: number, scope: readonly string[], rng: Rng = Math.random): number[] {
  const near = [target - 1, target + 1, target - 2, target + 2].filter((n) => n >= 0 && n <= NUMBER_MAX);
  const inScope = (n: number) => scope.includes(String(n));
  const others = [...shuffle(near.filter(inScope), rng), ...shuffle(near.filter((n) => !inScope(n)), rng)];
  return shuffle([target, ...others.slice(0, 2)], rng);
}

/** Two other letters: from the Scope when it has them, else the target's nearest in the alphabet. */
function otherLetters(target: string, scope: readonly string[], rng: Rng): string[] {
  const away = (l: string) => Math.abs(l.charCodeAt(0) - target.charCodeAt(0));
  const fromScope = shuffle(scope.filter((l) => l !== target), rng);
  // Stable, so letters as far away as each other stay in their shuffled order.
  const nearest = shuffle(LETTERS.filter((l) => l !== target && !scope.includes(l)), rng).sort((a, b) => away(a) - away(b));
  return [...fromScope, ...nearest].slice(0, 2);
}

/** The target letter and two others, in random order. */
export function letterChoices(target: string, scope: readonly string[], rng: Rng = Math.random): string[] {
  return shuffle([target, ...otherLetters(target, scope, rng)], rng);
}

/** A picture for the target letter and one each for two other letters, in random order. */
export function pictureChoices(target: string, scope: readonly string[], rng: Rng = Math.random): Picture[] {
  return shuffle([target, ...otherLetters(target, scope, rng)].map((l) => pictureFor(l, rng)), rng);
}

export function pictureFor(letter: string, rng: Rng = Math.random): Picture {
  return pick(PICTURES.filter((p) => p.letter === letter), rng);
}

/**
 * Practice's Finds for a Topic's Scope, one per call, for as long as it's played: every item of the Scope
 * once in a random order, then again, never the same one twice running. On Mix they take turns each way round.
 */
export function practice(topic: Topic, scope: readonly string[], way: Way = 'mix', rng: Rng = Math.random): () => Find {
  const items = scope.filter((item) => ITEMS[topic].includes(item));
  if (items.length === 0) throw new Error(`Find It: nothing in the Scope of ${topic}s`);
  let bag: string[] = [];
  let last: string | undefined;
  let i = 0;
  return () => {
    if (bag.length === 0) {
      bag = shuffle(items, rng);
      if (bag.length > 1 && bag[0] === last) bag.push(bag.shift()!);
    }
    const item = bag.shift()!;
    last = item;
    const direction: Direction = way !== 'mix' ? way : i++ % 2 === 0 ? 'find-symbol' : 'find-picture';
    if (topic === 'number') {
      const target = Number(item);
      return { kind: 'number', direction, target, choices: numberChoices(target, items, rng) };
    }
    if (direction === 'find-symbol') {
      return { kind: 'letter', direction, letter: item, picture: pictureFor(item, rng), choices: letterChoices(item, items, rng) };
    }
    const choices = pictureChoices(item, items, rng);
    return { kind: 'letter', direction, letter: item, picture: choices.find((p) => p.letter === item)!, choices };
  };
}
