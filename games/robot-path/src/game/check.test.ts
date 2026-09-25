import { describe, expect, it } from 'vitest';
import { levelProblems } from './check';

const good = {
  id: 'w1-02',
  world: 1,
  index: 2,
  voice: 'Go to the flag.',
  grid: ['R..F'],
  start: { facing: 'E' },
  items: [],
  goals: { flag: true },
  palette: ['up', 'down', 'left', 'right'],
  maxSlots: 5,
  starterProgram: [],
  solution: [{ op: 'right' }, { op: 'right' }, { op: 'right' }],
  par: 3,
};

describe('levelProblems', () => {
  it('passes a good Level', () => {
    expect(levelProblems(good)).toEqual([]);
  });

  it('catches a broken schema before anything else', () => {
    expect(levelProblems({ ...good, grid: ['R..F', '..'] })).toEqual(['grid rows must all be the same length']);
    expect(levelProblems({ ...good, solution: [{ op: 'repeat', times: 9, body: [] }] })).toEqual([
      'solution[0] repeats 9 times; must be 2-5',
    ]);
  });

  it('catches a wrong Par, using the solver in worlds 1-5', () => {
    const detour = { ...good, solution: [{ op: 'down' }, { op: 'right' }, { op: 'right' }, { op: 'right' }, { op: 'up' }], grid: ['R..F', '....'], par: 5, maxSlots: 6 };
    expect(levelProblems(detour)).toEqual(['solver finds 3, par is 5']);
  });

  it('catches a Fix-it whose starter Program already wins', () => {
    expect(levelProblems({ ...good, starterProgram: good.solution })).toEqual(['starterProgram wins; a Fix-it must be broken']);
  });

  it('catches ops missing from the palette, and a solution that loses', () => {
    expect(levelProblems({ ...good, palette: ['up'] })).toEqual(['solution uses right, not in the palette', 'solver finds no path']);
    expect(levelProblems({ ...good, solution: [{ op: 'right' }], par: 1 })).toEqual(['solution does not win', 'solver finds 3, par is 1']);
  });
});
