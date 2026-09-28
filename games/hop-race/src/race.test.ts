import { describe, expect, it } from 'vitest';
import { FRIENDS } from './animals';
import { TRACKS, aheadOf, createRace, friendFor, hopsFrom, type Race, type Turn } from './race';

/** A random source that gives these numbers in turn, then repeats them. */
const fixed = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length]!;
};
const ONE = 0.1;
const TWO = 0.9;

/** Plays a Race to its end, giving every turn. */
function playOut(race: Race): Turn[] {
  const turns: Turn[] = [];
  while (race.next()) turns.push(race.turn());
  return turns;
}

describe('the Tracks', () => {
  it('are To 5, To 10 and Who’s ahead, with 3, 4 and 4 Races, and only the last asks', () => {
    expect(TRACKS.map((t) => [t.home, t.races, t.ahead])).toEqual([
      [5, 3, false],
      [10, 4, false],
      [10, 4, true],
    ]);
  });
});

describe('a Hop', () => {
  it('lands on each next Square in turn, from Start too', () => {
    expect(hopsFrom(0, 1, 10)).toEqual([1]);
    expect(hopsFrom(0, 2, 10)).toEqual([1, 2]);
    expect(hopsFrom(3, 2, 10)).toEqual([4, 5]);
  });

  it('stops at Home, so a 2 from the Square before is one Hop', () => {
    expect(hopsFrom(9, 2, 10)).toEqual([10]);
    expect(hopsFrom(4, 2, 5)).toEqual([5]);
  });
});

describe('a Race', () => {
  it('starts both animals on Start, the Hopper first', () => {
    const race = createRace(10);
    expect([race.at('hopper'), race.at('friend')]).toEqual([0, 0]);
    expect(race.next()).toBe('hopper');
  });

  it('takes turns, moving whoever spun onto their last Square', () => {
    const race = createRace(10, fixed(TWO, ONE));
    expect(race.turn()).toEqual({ mover: 'hopper', spin: 2, squares: [1, 2] });
    expect(race.next()).toBe('friend');
    expect(race.turn()).toEqual({ mover: 'friend', spin: 1, squares: [1] });
    expect([race.at('hopper'), race.at('friend')]).toEqual([2, 1]);
    expect(race.next()).toBe('hopper');
  });

  it('ends when the Hopper is Home, and a turn after that throws', () => {
    const race = createRace(5, fixed(TWO));
    const turns = playOut(race);
    expect(turns.at(-1)!.mover).toBe('hopper');
    expect(race.at('hopper')).toBe(5);
    expect(race.next()).toBeUndefined();
    expect(() => race.turn()).toThrow(/done/);
  });

  it('skips a Friend who got Home first, and the Hopper goes on alone', () => {
    // The Hopper spins 1s where it can, the Friend 2s.
    const race = createRace(5, fixed(ONE, TWO));
    const turns = playOut(race);
    const friendHome = turns.findIndex((t) => t.mover === 'friend' && t.squares.at(-1) === 5);
    expect(friendHome).toBeGreaterThan(-1);
    expect(turns.slice(friendHome + 1).every((t) => t.mover === 'hopper')).toBe(true);
    expect(race.at('hopper')).toBe(5);
  });

  it('with Two players, ends only when both are Home, skipping whoever got there first', () => {
    // The Hopper spins 2s where it can, the Friend 1s: the Hopper is Home first.
    const race = createRace(5, fixed(TWO, ONE), 2);
    const turns = playOut(race);
    const hopperHome = turns.findIndex((t) => t.mover === 'hopper' && t.squares.at(-1) === 5);
    expect(hopperHome).toBeGreaterThan(-1);
    expect(hopperHome).toBeLessThan(turns.length - 1);
    expect(turns.slice(hopperHome + 1).every((t) => t.mover === 'friend')).toBe(true);
    expect([race.at('hopper'), race.at('friend')]).toEqual([5, 5]);
    expect(race.next()).toBeUndefined();
    // One player: the same spins end the Race as soon as the Hopper is Home.
    const alone = createRace(5, fixed(TWO, ONE));
    expect(playOut(alone)).toHaveLength(hopperHome + 1);
  });

  it('spins 1 or 2, never the same three times running for one animal', () => {
    const race = createRace(10, fixed(ONE));
    const spins = playOut(race)
      .filter((t) => t.mover === 'hopper')
      .map((t) => t.spin);
    expect(spins).toEqual([1, 1, 2, 1, 1, 2, 1, 1].slice(0, spins.length));
    for (let i = 2; i < spins.length; i++) expect(spins.slice(i - 2, i + 1)).not.toEqual([spins[i], spins[i], spins[i]]);
  });

  it('asks who’s ahead only when the two are apart, and not two rounds running', () => {
    const race = createRace(10, fixed(TWO, ONE));
    race.turn();
    race.turn();
    // 2 and 1: apart.
    expect(race.askAhead()).toBe(true);
    race.turn();
    race.turn();
    // Asked last round.
    expect(race.askAhead()).toBe(false);
    expect(race.askAhead()).toBe(true);
    const level = createRace(10, fixed(ONE));
    level.turn();
    level.turn();
    // Both on 1.
    expect(level.askAhead()).toBe(false);
  });
});

describe('who’s ahead', () => {
  it('is whoever is on the bigger number, or nobody on the same Square', () => {
    expect(aheadOf(5, 3)).toBe('hopper');
    expect(aheadOf(2, 7)).toBe('friend');
    expect(aheadOf(4, 4)).toBeUndefined();
  });
});

describe('the Friends', () => {
  it('are different in every Race of a Track, and every one comes up', () => {
    const all = TRACKS.flatMap((t, track) => {
      const friends = Array.from({ length: t.races }, (_, race) => friendFor(track, race, FRIENDS.length));
      expect(new Set(friends).size).toBe(t.races);
      return friends;
    });
    expect(new Set(all).size).toBe(FRIENDS.length);
  });
});
