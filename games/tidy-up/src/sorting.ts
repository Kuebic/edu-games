// What Tidy Up asks: which Bins a Round has and the Pile of Things that go in them. Pure, with the random
// source passed in, so it's tested as data. A Round sorts by one rule only, color or shape, because most
// three-year-olds can't switch rules partway (docs/spec.md).

import { binsFrom, pileOf, shuffle, PER_BIN, type Rng } from '@shared/sort';

/** The Topics this module deals: sorting by color or by shape. Kinds has its own, in kinds.ts. */
export type SortTopic = 'colors' | 'shapes';
export type Topic = SortTopic | 'kinds';
/** The Topics in tab order. */
export const TOPICS: readonly Topic[] = ['colors', 'shapes', 'kinds'];

export type Colour = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple' | 'pink';
export type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'heart';
/** What a Bin takes: a color on Colors, a shape on Shapes. Each is also its Word. */
export type Sort = Colour | Shape;

/** Every color in Scope order. The new save's red and blue, and the first Range's yellow, are told apart by a red-green color-blind child too. */
export const COLOURS: readonly Colour[] = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'];
export const SHAPES: readonly Shape[] = ['circle', 'square', 'triangle', 'star', 'heart'];
export const SORTS: Readonly<Record<SortTopic, readonly Sort[]>> = { colors: COLOURS, shapes: SHAPES };

/** What a Scope button shows. */
export const GLYPHS: Readonly<Record<Sort, string>> = {
  red: '🔴',
  blue: '🔵',
  yellow: '🟡',
  green: '🟢',
  orange: '🟠',
  purple: '🟣',
  pink: '🩷',
  circle: '⚪',
  square: '🟦',
  triangle: '🔺',
  star: '⭐',
  heart: '❤️',
};

/** Each color's paint, with clearly different lightness so no two are told apart by hue alone. */
export const PAINT: Readonly<Record<Colour, string>> = {
  red: '#e5372f',
  blue: '#1f6fd6',
  yellow: '#ffd21a',
  green: '#2f9e4c',
  orange: '#ff8a1c',
  purple: '#8a45c8',
  pink: '#ff94c8',
};

/** The Plain shapes' one soft color. */
export const GREY = '#9aa3b2';

/** The Ranges a grown-up turns on in one tap, before All. */
export const RANGES: Readonly<Record<SortTopic, readonly Sort[]>> = {
  colors: ['red', 'blue', 'yellow'],
  shapes: ['circle', 'square', 'triangle'],
};

/** Blocks: one toy block, only its color differs. Things: everyday things, each its own color. */
export type ColourWay = 'blocks' | 'things';
/** Plain: every shape one grey. Colorful: each a color the child has to look past. */
export type ShapeWay = 'plain' | 'colorful';
export type Way = ColourWay | ShapeWay;
export const WAYS: Readonly<Record<SortTopic, readonly Way[]>> = { colors: ['blocks', 'things'], shapes: ['plain', 'colorful'] };

/** Everyday things mainly one color, as emoji. Each is under one color only. */
export const THINGS: Readonly<Record<Colour, readonly string[]>> = {
  red: ['🍎', '🍓', '🍅', '🚒', '🌹'],
  blue: ['🫐', '🐳', '🧢', '👖', '🐬'],
  yellow: ['🍌', '🌻', '🐤', '🧀', '🍋'],
  green: ['🥦', '🐸', '🥒', '🌲', '🍏'],
  orange: ['🍊', '🥕', '🎃', '🏀', '🦊'],
  purple: ['🍇', '🍆', '🔮', '🪻', '☂️'],
  pink: ['🌸', '🐷', '🦩', '🎀', '🌷'],
};


/** One Thing on the Pile: the Bin it goes in, and how it's drawn. */
export type Thing =
  | { sort: Colour; look: 'block' }
  | { sort: Colour; look: 'emoji'; emoji: string }
  | { sort: Shape; look: 'shape'; paint: string };

export interface Round {
  topic: SortTopic;
  bins: Sort[];
  /** In the order they come off the Pile. */
  pile: Thing[];
}

export const isColour = (sort: Sort): sort is Colour => COLOURS.includes(sort as Colour);

/** The Things for one Bin, drawn by the Way. */
function thingsFor(sort: Sort, way: Way, count: number, rng: Rng): Thing[] {
  if (isColour(sort)) {
    if (way === 'things') return shuffle(THINGS[sort], rng).slice(0, count).map((emoji) => ({ sort, look: 'emoji', emoji }));
    return Array.from({ length: count }, () => ({ sort, look: 'block' }));
  }
  return Array.from({ length: count }, () => ({
    sort,
    look: 'shape',
    paint: way === 'colorful' ? PAINT[COLOURS[Math.floor(rng() * COLOURS.length)]!] : GREY,
  }));
}

/**
 * The Rounds of a Scope, one per call, for as long as it's played. Each Round has as many Bins as the
 * Scope has items, up to three, each item once before any comes again (the site's sorting rules).
 */
export function rounds(topic: SortTopic, scope: readonly Sort[], way: Way, rng: Rng = Math.random): () => Round {
  if (scope.length < 2) throw new Error('Tidy Up: sorting needs a Scope of two at least');
  const nextBins = binsFrom(scope, rng);
  return () => {
    const bins = nextBins();
    const count = PER_BIN[bins.length]!;
    return { topic, bins, pile: pileOf(bins.flatMap((sort) => thingsFor(sort, way, count, rng)), (t) => t.sort, rng) };
  };
}

/** The grown-up's card after a Round: something to look for at home. */
export function lookFor(sort: Sort): string {
  switch (sort) {
    case 'circle':
      return 'Find something round at home!';
    case 'square':
      return 'Find something square at home!';
    case 'triangle':
      return 'Find a triangle at home!';
    case 'star':
      return 'Find a star at home!';
    case 'heart':
      return 'Find a heart at home!';
    default:
      return `Find something ${sort} at home!`;
  }
}
