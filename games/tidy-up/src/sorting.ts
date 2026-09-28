// What Tidy Up asks: which Bins a Round has and the Pile of Things that go in them. Pure, with the random
// source passed in, so it's tested as data. A Round sorts by one rule only, color or shape, because most
// three-year-olds can't switch rules partway (docs/spec.md).

export type Rng = () => number;

export type Topic = 'colors' | 'shapes';
export const TOPICS: readonly Topic[] = ['colors', 'shapes'];

export type Colour = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple' | 'pink';
export type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'heart';
/** What a Bin takes: a color on Colors, a shape on Shapes. Each is also its Word. */
export type Sort = Colour | Shape;

/** Every color in Scope order. The new save's red and blue, and the first Range's yellow, are told apart by a red-green color-blind child too. */
export const COLOURS: readonly Colour[] = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'];
export const SHAPES: readonly Shape[] = ['circle', 'square', 'triangle', 'star', 'heart'];
export const SORTS: Readonly<Record<Topic, readonly Sort[]>> = { colors: COLOURS, shapes: SHAPES };

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
export const RANGES: Readonly<Record<Topic, readonly Sort[]>> = {
  colors: ['red', 'blue', 'yellow'],
  shapes: ['circle', 'square', 'triangle'],
};

/** Blocks: one toy block, only its color differs. Things: everyday things, each its own color. */
export type ColourWay = 'blocks' | 'things';
/** Plain: every shape one grey. Colorful: each a color the child has to look past. */
export type ShapeWay = 'plain' | 'colorful';
export type Way = ColourWay | ShapeWay;
export const WAYS: Readonly<Record<Topic, readonly Way[]>> = { colors: ['blocks', 'things'], shapes: ['plain', 'colorful'] };

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

/** The most Bins a Round has, side by side on a phone. */
export const MOST_BINS = 3;
/** How many Things each Bin gets: 8 in all with 2 Bins, 9 with 3. */
export const PER_BIN: Readonly<Record<number, number>> = { 2: 4, 3: 3 };

/** One Thing on the Pile: the Bin it goes in, and how it's drawn. */
export type Thing =
  | { sort: Colour; look: 'block' }
  | { sort: Colour; look: 'emoji'; emoji: string }
  | { sort: Shape; look: 'shape'; paint: string };

export interface Round {
  topic: Topic;
  bins: Sort[];
  /** In the order they come off the Pile. */
  pile: Thing[];
}

export const isColour = (sort: Sort): sort is Colour => COLOURS.includes(sort as Colour);

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** True when no three in a row go to the same Bin. */
const noThreeInARow = (pile: readonly Thing[]) => pile.every((t, i) => i < 2 || t.sort !== pile[i - 1]!.sort || t.sort !== pile[i - 2]!.sort);

/** Shuffles the Pile until no Bin gets three in a row, which with 3 or 4 each takes a few tries at most. */
function order(pile: readonly Thing[], rng: Rng): Thing[] {
  let out = shuffle(pile, rng);
  for (let tries = 0; tries < 200 && !noThreeInARow(out); tries++) out = shuffle(pile, rng);
  return out;
}

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
 * Scope has items, up to three, taken from a bag so each item comes up once before any comes again.
 */
export function rounds(topic: Topic, scope: readonly Sort[], way: Way, rng: Rng = Math.random): () => Round {
  if (scope.length < 2) throw new Error('Tidy Up: sorting needs a Scope of two at least');
  const size = Math.min(scope.length, MOST_BINS);
  let bag: Sort[] = [];
  const draw = (taken: readonly Sort[]): Sort => {
    if (bag.every((s) => taken.includes(s))) bag = [...bag, ...shuffle(scope, rng)];
    const i = bag.findIndex((s) => !taken.includes(s));
    return bag.splice(i, 1)[0]!;
  };

  return () => {
    const bins: Sort[] = [];
    while (bins.length < size) bins.push(draw(bins));
    const count = PER_BIN[size]!;
    return { topic, bins, pile: order(bins.flatMap((sort) => thingsFor(sort, way, count, rng)), rng) };
  };
}

/**
 * Which Bin a finger let go over, counting from the left, or undefined over the top half, where a
 * Thing just stays. The Bins share the width of the play area evenly.
 */
export function binAt(point: { x: number; y: number }, area: { left: number; top: number; width: number; height: number }, bins: number): number | undefined {
  if (point.y < area.top + area.height / 2) return undefined;
  const i = Math.floor(((point.x - area.left) / area.width) * bins);
  return Math.min(Math.max(i, 0), bins - 1);
}

/** Wrong Bins for one Thing before it goes into its own by itself. */
export const MISSES_BEFORE_HELP = 2;

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
