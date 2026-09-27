// The rules of a Race, with no screen: the Tracks, the Spinner, whose turn it is, where the hops land,
// and when to ask who's ahead. The random source is passed in, so tests can fix it.

/** Who's moving: the child's animal, or the Race's other one. */
export type Mover = 'hopper' | 'friend';

/** A spin: one hop or two. */
export type Spin = 1 | 2;

export interface Track {
  /** Its name for screen readers. */
  name: string;
  /** Its last Square. */
  home: number;
  /** How many Races it has. */
  races: number;
  /** Who's ahead? is asked between turns. */
  ahead: boolean;
}

/** The Tracks, easiest first. Their order and Race counts are Saved progress, so they only ever grow at the end. */
export const TRACKS: readonly Track[] = [
  { name: 'To 5', home: 5, races: 3, ahead: false },
  { name: 'To 10', home: 10, races: 4, ahead: false },
  { name: "Who's ahead", home: 10, races: 4, ahead: true },
];

/** The Squares a spin lands on in turn, from `from` (0 is Start). Stops at Home: a 2 from the Square before is one Hop. */
export function hopsFrom(from: number, spin: Spin, home: number): number[] {
  const squares: number[] = [];
  for (let at = from + 1; at <= Math.min(from + spin, home); at++) squares.push(at);
  return squares;
}

/** Who's further along, or undefined on the same Square. */
export function aheadOf(hopper: number, friend: number): Mover | undefined {
  return hopper === friend ? undefined : hopper > friend ? 'hopper' : 'friend';
}

/** One turn: who moved, what the Spinner said, and the Squares they hopped onto. */
export interface Turn {
  mover: Mover;
  spin: Spin;
  squares: number[];
}

export interface Race {
  readonly home: number;
  /** Where an animal is: 0 is Start, `home` is Home. */
  at(mover: Mover): number;
  /** Whose turn it is, or undefined once the Hopper is Home and the Race is done. */
  next(): Mover | undefined;
  /** Spins for whoever's turn it is and moves them. Throws when the Race is done. */
  turn(): Turn;
  /**
   * After a round, in a Track that asks: whether to ask who's ahead now. Yes when the two are apart and the
   * last round didn't ask. A round ends after the Friend's turn, or after the Hopper's when the Friend is Home.
   */
  askAhead(): boolean;
}

export function createRace(home: number, random: () => number = Math.random): Race {
  const at: Record<Mover, number> = { hopper: 0, friend: 0 };
  /** Each animal's last two spins, so neither gets the same one three times running. */
  const spins: Record<Mover, Spin[]> = { hopper: [], friend: [] };
  let mover: Mover = 'hopper';
  let askedLast = false;

  function spin(who: Mover): Spin {
    const last = spins[who];
    const spun: Spin = last.length === 2 && last[0] === last[1] ? (last[0] === 1 ? 2 : 1) : random() < 0.5 ? 1 : 2;
    spins[who] = [...last, spun].slice(-2);
    return spun;
  }

  const next = () => (at.hopper >= home ? undefined : mover);

  return {
    home,
    at: (who) => at[who],
    next,
    turn() {
      const who = next();
      if (!who) throw new Error('Hop Race: the Race is done');
      const spun = spin(who);
      const squares = hopsFrom(at[who], spun, home);
      at[who] = squares.at(-1)!;
      // The Friend goes next, unless it's Home.
      mover = who === 'hopper' && at.friend < home ? 'friend' : 'hopper';
      return { mover: who, spin: spun, squares };
    },
    askAhead() {
      const ask = !askedLast && aheadOf(at.hopper, at.friend) !== undefined;
      askedLast = ask;
      return ask;
    },
  };
}

/** A Race's Friend, by Track and Race: each Race of a Track has a different one. */
export function friendFor(track: number, race: number, count: number): number {
  const before = TRACKS.slice(0, track).reduce((sum, t) => sum + t.races, 0);
  return (before + race) % count;
}
