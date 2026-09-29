import { describe, expect, it } from 'vitest';
import { EASY, GROUP_WORDS, POOLS, STEP_CHIPS, STEP_GROUPS, STEPS, kindsLookFor, kindsRounds, membersIn, type Group, type Step } from './kinds';

/** A seeded random, so a failure can be run again. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

/** Every Thing a group can show in a Step, the odd ones too. */
const everyIn = (group: Group, step: Step) => [...membersIn(group, step), ...(POOLS[group].odd ?? [])];

describe('the Steps', () => {
  it('go from animals and vehicles to mammals and birds, the Easy Range the first four', () => {
    expect(STEPS[0]).toBe('animals-vehicles');
    expect(STEPS.at(-1)).toBe('mammals-birds');
    expect(EASY).toEqual(['animals-vehicles', 'food-clothes', 'toys-clothes', 'animals-clothes-food']);
    expect(new Set(Object.values(STEP_CHIPS)).size).toBe(STEPS.length);
  });

  it('never put a Thing in two of one Step’s groups, odd ones included', () => {
    for (const step of STEPS) {
      const seen = new Map<string, Group>();
      for (const group of STEP_GROUPS[step]) {
        for (const thing of everyIn(group, step)) {
          expect(seen.get(thing.emoji) ?? group, `${step}: ${thing.emoji}`).toBe(group);
          seen.set(thing.emoji, group);
        }
      }
    }
  });

  it('never pair Birds with Animals, nor Toys with Vehicles', () => {
    for (const step of STEPS) {
      const groups = STEP_GROUPS[step];
      expect(groups.includes('birds') && groups.includes('animals'), step).toBe(false);
      expect(groups.includes('toys') && groups.includes('vehicles'), step).toBe(false);
    }
  });

  it('keep wheel-less vehicles out of the first Step, where it’s legs and wheels', () => {
    const first = membersIn('vehicles', 'animals-vehicles').map((t) => t.emoji);
    expect(first).not.toContain('✈️');
    expect(first).not.toContain('⛵');
    expect(membersIn('vehicles', 'animals-vehicles-plants').map((t) => t.emoji)).toContain('✈️');
  });

  it('have enough members in every group to fill its Bin', () => {
    for (const step of STEPS) {
      const count = STEP_GROUPS[step].length === 3 ? 3 : 4;
      for (const group of STEP_GROUPS[step]) expect(membersIn(group, step).length, `${step} ${group}`).toBeGreaterThanOrEqual(count);
    }
  });
});

describe('a Kinds Round', () => {
  it('takes each Step in the Scope once before any comes again, its groups as the Bins', () => {
    const next = kindsRounds(['animals-vehicles', 'birds-fish', 'animals-clothes-food'], 'clear', seeded(4));
    const three = [next(), next(), next()];
    expect(three.map((r) => r.step).sort()).toEqual(['animals-clothes-food', 'animals-vehicles', 'birds-fish']);
    for (const r of three) expect(r.bins).toEqual(STEP_GROUPS[r.step]);
  });

  it('has four Things for each of two Bins, three for each of three, and a card of three others', () => {
    for (let seed = 1; seed < 40; seed++) {
      for (const r of [kindsRounds(['food-clothes'], 'clear', seeded(seed))(), kindsRounds(['animals-clothes-food'], 'clear', seeded(seed))()]) {
        const each = r.bins.length === 2 ? 4 : 3;
        expect(r.pile).toHaveLength(r.bins.length * each);
        for (const group of r.bins) {
          expect(r.pile.filter((p) => p.group === group)).toHaveLength(each);
          const card = r.cards[group]!.map((m) => m.emoji);
          expect(card).toHaveLength(3);
          for (const e of card) expect(r.pile.map((p) => p.emoji)).not.toContain(e);
        }
      }
    }
  });

  it('in Clear has no odd member; in Tricky, exactly one', () => {
    for (let seed = 1; seed < 40; seed++) {
      expect(kindsRounds(STEPS, 'clear', seeded(seed))().pile.some((p) => p.odd)).toBe(false);
      const tricky = kindsRounds(['animals-vehicles'], 'tricky', seeded(seed))();
      const odd = tricky.pile.filter((p) => p.odd);
      expect(odd).toHaveLength(1);
      expect(POOLS[odd[0]!.group].odd!.map((t) => t.emoji)).toContain(odd[0]!.emoji);
    }
  });

  it('needs a Step', () => {
    expect(() => kindsRounds([], 'clear')).toThrow();
  });
});

describe('the words', () => {
  it('are each group’s plural, and "mammal", which nobody recorded as a plural', () => {
    expect(GROUP_WORDS.animals).toBe('animals');
    expect(GROUP_WORDS.mammals).toBe('mammal');
  });

  it('give the grown-up something to look for or name', () => {
    for (const group of Object.keys(POOLS) as Group[]) expect(kindsLookFor(group)).toMatch(/!/);
  });
});
