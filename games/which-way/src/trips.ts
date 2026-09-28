// What Which Way? asks in Practice: which Arrow each Trip follows, from the Scope, each once before any
// comes again. Pure, with the random source passed in, so it's tested as data.

export type Rng = () => number;

/** Which way on the screen. */
export type Arrow = 'left' | 'up' | 'down' | 'right';

/** Every Arrow, in the order the Scope and the Pick buttons show them. */
export const ARROWS: readonly Arrow[] = ['left', 'up', 'down', 'right'];

/** What a Scope button shows. */
export const GLYPHS: Readonly<Record<Arrow, string>> = { left: '←', up: '↑', down: '↓', right: '→' };

/** What the Voice says as the Mover sets off. */
export const WORDS: Readonly<Record<Arrow, string>> = { left: 'Left!', up: 'Up!', down: 'Down!', right: 'Right!' };

/** One step that way, across and down the screen. */
export const STEP: Readonly<Record<Arrow, { x: number; y: number }>> = {
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
};

/** Which way it points, in degrees clockwise from up: how a car or an Arrow drawn facing up is turned. */
export const ANGLE: Readonly<Record<Arrow, number>> = { up: 0, right: 90, down: 180, left: 270 };

/** The Ranges a grown-up turns on in one tap. */
export const RANGES: readonly (readonly Arrow[])[] = [
  ['left', 'right'],
  ['up', 'down'],
];

export type Way = 'watch' | 'go' | 'pick';

/** The Ways in chip order. */
export const WAYS: readonly Way[] = ['watch', 'go', 'pick'];

/** Trips between Cheers. */
export const CHEER_EVERY = 5;

/** Wrong ways in one Trip before the Arrow shows beside the Mover. */
export const SHOW_ARROW_AFTER = 2;

export const isArrow = (raw: unknown): raw is Arrow => ARROWS.includes(raw as Arrow);

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** The Arrows of a Scope, one per call, for as long as it's played: each once, shuffled, before any comes again. */
export function trips(scope: readonly Arrow[], rng: Rng = Math.random): () => Arrow {
  if (scope.length === 0) throw new Error('Which Way?: a Scope with no Arrows has no Trips');
  let bag: Arrow[] = [];
  return () => {
    if (bag.length === 0) bag = shuffle(scope, rng);
    return bag.pop()!;
  };
}

/** Where the Spots are on the field: which directions it has room for, and so how many cells across and down. */
export function fieldOf(scope: readonly Arrow[]): { cols: number; rows: number } {
  const across = scope.includes('left') || scope.includes('right');
  const down = scope.includes('up') || scope.includes('down');
  return { cols: across ? 5 : 1, rows: down ? 5 : 1 };
}
