// The pictures and their Words (site ADR 0018): everyday things as emoji, each with its own recorded name,
// in groups (animals, vehicles, food…) and in colors, and the Word clips that say them. Tidy Up sorts them
// into Bins and Go Together finds which go together, so they live here, once. The clips were made by Tidy
// Up's `words` task from free recordings on Wikimedia Commons (games/tidy-up/docs/word-credits.md). Pure
// data, except the clips, which play through the Sound.

import { clip, type Clip } from './sound';

// ---- Groups -------------------------------------------------------------------------------------------

/** A group of everyday things. Each is also the Word its Bin or Frame says. */
export type Group = 'animals' | 'vehicles' | 'plants' | 'toys' | 'clothes' | 'food' | 'birds' | 'fish' | 'fruit' | 'vegetables' | 'mammals';

/** Every group, the ones a two-year-old forms first in front. */
export const GROUPS: readonly Group[] = ['animals', 'vehicles', 'food', 'clothes', 'toys', 'plants', 'birds', 'fish', 'fruit', 'vegetables', 'mammals'];

/** The group's Word, its plural or mass noun. Nobody recorded "mammals" alone, so that one says "mammal". */
export const GROUP_WORDS: Readonly<Record<Group, string>> = {
  animals: 'animals',
  vehicles: 'vehicles',
  plants: 'plants',
  toys: 'toys',
  clothes: 'clothes',
  food: 'food',
  birds: 'birds',
  fish: 'fish',
  fruit: 'fruit',
  vegetables: 'vegetables',
  mammals: 'mammal',
};

/** One Thing: its picture, and its own name, which is also its Word clip. */
export interface KindThing {
  emoji: string;
  name: string;
}

const t = (emoji: string, name: string): KindThing => ({ emoji, name });

/** Mammals with legs: Animals in Tidy Up's early Steps, Mammals in the last. */
const MAMMALS = [
  t('🐕', 'dog'), t('🐈', 'cat'), t('🐄', 'cow'), t('🐖', 'pig'), t('🐑', 'sheep'), t('🐐', 'goat'), t('🐎', 'horse'),
  t('🐇', 'rabbit'), t('🐒', 'monkey'), t('🐘', 'elephant'), t('🦒', 'giraffe'), t('🐅', 'tiger'), t('🦓', 'zebra'), t('🐁', 'mouse'),
];
const ODD_MAMMALS = [t('🦇', 'bat'), t('🐋', 'whale'), t('🦘', 'kangaroo')];

/**
 * Each group's members. `clear` are textbook members. `wide` are members the youngest miss, as they sort by
 * parts (legs and wheels), so vehicles without wheels come later. `odd` are atypical members, for a Tricky Way.
 */
export const POOLS: Readonly<Record<Group, { clear: readonly KindThing[]; wide?: readonly KindThing[]; odd?: readonly KindThing[] }>> = {
  animals: { clear: MAMMALS, odd: ODD_MAMMALS },
  mammals: { clear: MAMMALS, odd: ODD_MAMMALS },
  vehicles: {
    clear: [
      t('🚗', 'car'), t('🚕', 'taxi'), t('🚌', 'bus'), t('🚒', 'fire truck'), t('🚑', 'ambulance'), t('🚓', 'police car'),
      t('🚚', 'truck'), t('🚜', 'tractor'), t('🚲', 'bike'), t('🚂', 'train'),
    ],
    wide: [t('✈️', 'plane'), t('🚁', 'helicopter'), t('⛵', 'boat')],
    odd: [t('🚀', 'rocket')],
  },
  plants: {
    clear: [t('🌳', 'tree'), t('🌲', 'pine'), t('🌴', 'palm'), t('🌻', 'sunflower'), t('🌷', 'tulip'), t('🌹', 'rose'), t('🌸', 'flower'), t('🍀', 'clover'), t('🌿', 'leaves')],
    odd: [t('🌵', 'cactus')],
  },
  toys: { clear: [t('🪀', 'yo-yo'), t('🎈', 'balloon'), t('🥁', 'drum'), t('⚽', 'ball'), t('🏀', 'ball'), t('🪆', 'doll')] },
  clothes: {
    clear: [t('👕', 'shirt'), t('👖', 'pants'), t('👗', 'dress'), t('🧦', 'socks'), t('🧢', 'cap'), t('👒', 'hat'), t('🧤', 'gloves'), t('🩳', 'shorts'), t('👟', 'shoes'), t('🧥', 'coat')],
    odd: [t('🥽', 'goggles')],
  },
  food: {
    clear: [
      t('🍞', 'bread'), t('🧀', 'cheese'), t('🍌', 'banana'), t('🍎', 'apple'), t('🍪', 'cookie'), t('🥛', 'milk'), t('🥨', 'pretzel'),
      t('🍝', 'pasta'), t('🥞', 'pancakes'), t('🥐', 'croissant'), t('🍓', 'strawberry'), t('🍇', 'grapes'),
    ],
    odd: [t('🍅', 'tomato')],
  },
  birds: {
    clear: [t('🐦', 'bird'), t('🐓', 'rooster'), t('🦆', 'duck'), t('🦉', 'owl'), t('🦅', 'eagle'), t('🦜', 'parrot'), t('🦢', 'swan'), t('🦃', 'turkey'), t('🐤', 'chick')],
    odd: [t('🐧', 'penguin'), t('🦩', 'flamingo'), t('🦚', 'peacock')],
  },
  // Only four fish emoji exist, so a Round or a group of fish shows each of them.
  fish: { clear: [t('🐟', 'fish'), t('🐠', 'fish'), t('🐡', 'fish'), t('🦈', 'shark')] },
  fruit: {
    clear: [
      t('🍎', 'apple'), t('🍐', 'pear'), t('🍊', 'orange'), t('🍋', 'lemon'), t('🍌', 'banana'), t('🍇', 'grapes'), t('🍓', 'strawberry'),
      t('🫐', 'blueberry'), t('🍒', 'cherry'), t('🍑', 'peach'), t('🥭', 'mango'), t('🍍', 'pineapple'),
    ],
  },
  vegetables: {
    clear: [t('🥕', 'carrot'), t('🥦', 'broccoli'), t('🥬', 'lettuce'), t('🥒', 'cucumber'), t('🧅', 'onion'), t('🥔', 'potato')],
    odd: [t('🍆', 'eggplant')],
  },
};

/** A group's clear members, and its wide ones too when asked: never the odd ones. */
export function membersOf(group: Group, wide = false): readonly KindThing[] {
  const pool = POOLS[group];
  return wide ? [...pool.clear, ...(pool.wide ?? [])] : pool.clear;
}

/**
 * Groups that overlap, so no two of them ever stand side by side: a dog is an animal and a mammal, an apple
 * is food and fruit, and a bird is an animal too.
 */
const OVERLAP: readonly (readonly Group[])[] = [
  ['animals', 'mammals', 'birds', 'fish'],
  ['food', 'fruit', 'vegetables'],
];

export const overlap = (a: Group, b: Group): boolean => a !== b && OVERLAP.some((set) => set.includes(a) && set.includes(b));

// ---- Colors -------------------------------------------------------------------------------------------

export type Colour = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple' | 'pink';

/** In the order they're learnt: the primaries first. */
export const COLOURS: readonly Colour[] = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'];

/** Everyday things mainly one color, as emoji. Each is under one color only. */
export const COLOUR_THINGS: Readonly<Record<Colour, readonly string[]>> = {
  red: ['🍎', '🍓', '🍅', '🚒', '🌹'],
  blue: ['🫐', '🐳', '🧢', '👖', '🐬'],
  yellow: ['🍌', '🌻', '🐤', '🧀', '🍋'],
  green: ['🥦', '🐸', '🥒', '🌲', '🍏'],
  orange: ['🍊', '🥕', '🎃', '🏀', '🦊'],
  purple: ['🍇', '🍆', '🔮', '🪻', '☂️'],
  pink: ['🌸', '🐷', '🦩', '🎀', '🌷'],
};

// ---- Words --------------------------------------------------------------------------------------------

/** Each Word clip's URL by its file name: red.mp3 is red, fire-truck.mp3 is fire-truck. */
export function clipsByWord(files: Readonly<Record<string, string>>): Map<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [/([a-z-]+)\.mp3$/.exec(path)![1]!, url]));
}

// Imported like any file (ADR 0005), so the build hashes each one and ships only what's there.
const files = import.meta.glob<string>('./assets/words/*.mp3', { eager: true, query: '?url', import: 'default' });
const words = new Map([...clipsByWord(files)].map(([word, url]) => [word, clip(url)]));

/** A Word's clip: a color, a shape, a group or a Thing's name. A space in it is a hyphen in the file name. */
export const word = (said: string): Clip | undefined => words.get(said.replace(/ /g, '-'));

/** Stops every Word, so a new grab or tap never talks over the last one. */
export function hushWords(): void {
  for (const w of words.values()) w.stop();
}
