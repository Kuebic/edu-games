// What Piggy Bank asks: the Money, and the Rounds of each Way. Pure, with the random source passed in, so
// it's tested as data. It teaches names and looks, never values: nothing here knows a dime is worth more
// than a nickel (docs/spec.md).

export type Rng = () => number;

export type Money = 'penny' | 'nickel' | 'dime' | 'quarter' | 'dollar';
/** Every kind in Scope order. Each is also its Word. */
export const MONEY: readonly Money[] = ['penny', 'nickel', 'dime', 'quarter', 'dollar'];

export type Side = 'heads' | 'tails';

/** What a Scope button shows. Only a grown-up reads these; the child never sees ¢ or $. */
export const LABELS: Readonly<Record<Money, string>> = { penny: '1¢', nickel: '5¢', dime: '10¢', quarter: '25¢', dollar: '$1' };

/**
 * Each coin's real diameter in mm, so every coin is drawn at its true size times one scale. The bill has
 * its width here instead, not to scale: a real one wouldn't fit beside the coins on a phone.
 */
export const SIZE_MM: Readonly<Record<Money, number>> = { penny: 19.05, nickel: 21.21, dime: 17.91, quarter: 24.26, dollar: 28 };

export const isBill = (money: Money): boolean => money === 'dollar';

/** The Ranges a grown-up turns on in one tap, before All: the first pair differs in color and size. */
export const RANGES: readonly (readonly Money[])[] = [
  ['penny', 'quarter'],
  ['penny', 'dime', 'quarter'],
];

/** Sort: each piece into the Bank with its picture. Find: one pig asks for a piece by name. */
export type Way = 'sort' | 'find';
export const WAYS: readonly Way[] = ['sort', 'find'];

/** The most kinds in a Round: Banks side by side on a phone, or coins on the table in Find. */
export const MOST_KINDS = 3;
/** How many pieces each Bank gets in Sort: 8 in all with 2 Banks, 9 with 3. */
export const PER_BANK: Readonly<Record<number, number>> = { 2: 4, 3: 3 };
/** Asks in a Find Round. */
export const ASKS = 6;

export interface SortRound {
  banks: Money[];
  /** The Purse, in the order it's served. */
  purse: Money[];
}

export interface FindRound {
  /** The coins on the table, one of each. */
  kinds: Money[];
  /** What the pig asks for, in order. */
  asks: Money[];
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** True when no three in a row are the same. */
const noThreeInARow = (list: readonly Money[]) => list.every((m, i) => i < 2 || m !== list[i - 1] || m !== list[i - 2]);

/** Shuffles until no kind comes three times in a row, which with this few takes a few tries at most. */
function order(list: readonly Money[], rng: Rng): Money[] {
  let out = shuffle(list, rng);
  for (let tries = 0; tries < 200 && !noThreeInARow(out); tries++) out = shuffle(list, rng);
  return out;
}

/**
 * Picks each Round's kinds from the Scope: as many as it has, up to three, taken from a bag so each
 * kind comes up once before any comes again.
 */
function kindsOf(scope: readonly Money[], rng: Rng): () => Money[] {
  if (scope.length < 2) throw new Error('Piggy Bank: a Round needs a Scope of two at least');
  const size = Math.min(scope.length, MOST_KINDS);
  let bag: Money[] = [];
  const draw = (taken: readonly Money[]): Money => {
    if (bag.every((m) => taken.includes(m))) bag = [...bag, ...shuffle(scope, rng)];
    const i = bag.findIndex((m) => !taken.includes(m));
    return bag.splice(i, 1)[0]!;
  };
  return () => {
    const kinds: Money[] = [];
    while (kinds.length < size) kinds.push(draw(kinds));
    return kinds;
  };
}

/** Sort's Rounds, one per call, for as long as it's played. */
export function sortRounds(scope: readonly Money[], rng: Rng = Math.random): () => SortRound {
  const next = kindsOf(scope, rng);
  return () => {
    const banks = next();
    const each = PER_BANK[banks.length]!;
    return { banks, purse: order(banks.flatMap((m) => Array<Money>(each).fill(m)), rng) };
  };
}

/** Find's Rounds: the Asks go round the Round's kinds evenly, shuffled, never three in a row. */
export function findRounds(scope: readonly Money[], rng: Rng = Math.random): () => FindRound {
  const next = kindsOf(scope, rng);
  return () => {
    const kinds = next();
    const asks = Array.from({ length: ASKS }, (_, i) => kinds[i % kinds.length]!);
    return { kinds, asks: order(asks, rng) };
  };
}

/**
 * Which Bank a finger let go over, counting from the left, or undefined over the top half, where a
 * piece just stays. The Banks share the width of the play area evenly.
 */
export function bankAt(point: { x: number; y: number }, area: { left: number; top: number; width: number; height: number }, banks: number): number | undefined {
  if (point.y < area.top + area.height / 2) return undefined;
  const i = Math.floor(((point.x - area.left) / area.width) * banks);
  return Math.min(Math.max(i, 0), banks - 1);
}

/** Misses on one piece, or one Ask, before the right one goes in by itself. */
export const MISSES_BEFORE_HELP = 2;

/** The grown-up's card after a Round. Real coins are a choking risk, so real-coin play is the grown-up's. */
export const lookFor = (money: Money): string => `Find a ${money} with a grown-up!`;
