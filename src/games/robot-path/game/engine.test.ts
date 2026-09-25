import { describe, expect, it } from 'vitest';
import { run, STEP_LIMIT, type Event } from './engine';
import type { Level, PlainCommand } from './level';
import { shortest } from './solver';

function level(grid: string[], rest: Partial<Level> = {}): Level {
  return {
    id: 'w9-01',
    world: 9,
    index: 1,
    voice: 'Test.',
    grid,
    start: { facing: 'E' },
    items: [],
    goals: { flag: true },
    palette: ['up', 'down', 'left', 'right', 'repeat'],
    maxSlots: 20,
    starterProgram: [],
    solution: [],
    par: 1,
    ...rest,
  };
}

const p = (...ops: string[]) => ops.map((op) => ({ op })) as PlainCommand[];
const types = (events: Event[]) => events.map((event) => event.type);

describe('run', () => {
  it('walks to the flag and wins', () => {
    const trace = run(level(['R.F']), p('right', 'right'));
    expect(trace.result).toBe('win');
    expect(trace.steps.map((step) => step.at)).toEqual([{ slot: 0 }, { slot: 1 }]);
    expect(types(trace.steps[1]!.events)).toEqual(['move', 'win']);
  });

  it('wins the moment the goals are met, even with Commands left', () => {
    const trace = run(level(['RF.']), p('right', 'right', 'up'));
    expect(trace.result).toBe('win');
    expect(trace.steps).toHaveLength(1);
  });

  it('bonks on walls and the edge, and stops there', () => {
    const wall = run(level(['R#F']), p('right', 'right'));
    expect(wall.result).toBe('bonk');
    expect(wall.steps).toHaveLength(1);
    expect(wall.steps[0]!.events).toEqual([{ type: 'bonk', toward: { x: 1, y: 0 } }]);
    expect(wall.steps[0]!.state).toMatchObject({ x: 0, y: 0 });

    const edge = run(level(['R.F']), p('up'));
    expect(edge.result).toBe('bonk');
    expect(edge.steps[0]!.state.facing).toBe('N');
  });

  it('ends unfinished with the missing Goal', () => {
    const trace = run(level(['R..F']), p('right'));
    expect(trace.result).toBe('unfinished');
    expect(trace.steps.at(-1)).toMatchObject({ at: null, events: [{ type: 'unfinished', missing: { kind: 'flag' } }] });
    expect(run(level(['R.F']), []).result).toBe('unfinished');
  });

  it('unrolls Repeat Blocks with a loopTick on each pass', () => {
    const trace = run(level(['R....F']), [{ op: 'repeat', times: 5, body: p('right') }]);
    expect(trace.result).toBe('win');
    expect(trace.steps.map((step) => step.at)).toEqual(Array(5).fill({ slot: 0, inner: 0 }));
    expect(trace.steps[2]!.events[0]).toEqual({ type: 'loopTick', slot: 0, pass: 3, of: 5 });
  });

  it('stops a Run at the step limit', () => {
    const back = [{ op: 'repeat' as const, times: 5, body: p('right', 'left', 'right', 'left') }];
    const trace = run(level(['R.#F']), Array(15).fill(back[0]));
    expect(trace.result).toBe('unfinished');
    expect(trace.steps).toHaveLength(STEP_LIMIT + 1);
  });

  it('turns and goes forward with world 8 Commands', () => {
    const turns = level(['..F', '.##', 'R##'], { start: { facing: 'N' } });
    const trace = run(turns, p('forward', 'forward', 'turnRight', 'forward', 'forward'));
    expect(trace.result).toBe('win');
    expect(trace.steps[2]!.events).toEqual([{ type: 'turn', from: 'N', to: 'E' }]);
    const facingDown = level(['R##', '.##', '..F'], { start: { facing: 'S' } });
    expect(run(facingDown, p('forward', 'forward', 'turnLeft', 'forward', 'forward')).result).toBe('win');
  });
});

describe('items', () => {
  it('picks up gems and needs every one', () => {
    const gems = level(['R..F'], { goals: { flag: true, collectAll: true }, items: [{ x: 1, y: 0, type: 'gem' }, { x: 2, y: 0, type: 'gem' }] });
    const trace = run(gems, p('right', 'right', 'right'));
    expect(trace.result).toBe('win');
    expect(trace.steps[0]!.events).toContainEqual({ type: 'pickup', item: 0 });
    const shortOfGems = level(['R.F.'], { goals: { flag: true, collectAll: true }, items: [{ x: 3, y: 0, type: 'gem' }] });
    expect(run(shortOfGems, p('right', 'right')).result).toBe('unfinished');
  });

  it('only picks up the next letter; others wiggle', () => {
    const spell = level(['R....'], {
      goals: { spell: 'CA' },
      items: [
        { x: 1, y: 0, type: 'letter', value: 'A' },
        { x: 2, y: 0, type: 'letter', value: 'C' },
      ],
    });
    const trace = run(spell, p('right', 'right', 'left'));
    expect(trace.steps[0]!.events).toContainEqual({ type: 'reject', item: 0 });
    expect(trace.steps[1]!.events).toContainEqual({ type: 'pickup', item: 1 });
    expect(trace.result).toBe('win');
  });

  it('adds numbers in sum mode, and needs the exact total', () => {
    const sum = level(['R...F'], {
      goals: { flag: true, sum: 5 },
      items: [
        { x: 1, y: 0, type: 'number', value: 2 },
        { x: 2, y: 0, type: 'number', value: 3 },
      ],
    });
    const trace = run(sum, p('right', 'right', 'right', 'right'));
    expect(trace.steps[1]!.state.sum).toBe(5);
    expect(trace.result).toBe('win');
    const over = { ...sum, goals: { flag: true, sum: 4 } };
    expect(run(over, p('right', 'right', 'right', 'right')).steps.at(-1)!.events).toEqual([
      { type: 'unfinished', missing: { kind: 'sum', value: 4 } },
    ]);
  });

  it('pushes a crate onto its target', () => {
    const crates = level(['R..x'], { goals: { cratesOnTargets: true }, items: [{ x: 1, y: 0, type: 'crate' }] });
    const trace = run(crates, p('right', 'right'));
    expect(trace.steps[0]!.events).toEqual([
      { type: 'move', from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
      { type: 'push', item: 0, from: { x: 1, y: 0 }, to: { x: 2, y: 0 } },
    ]);
    expect(trace.result).toBe('win');
  });

  it("bonks on a crate that can't move, and never pushes two", () => {
    const wall = level(['R.#x'], { goals: { cratesOnTargets: true }, items: [{ x: 1, y: 0, type: 'crate' }] });
    expect(run(wall, p('right')).steps[0]!.events).toEqual([{ type: 'bonk', toward: { x: 1, y: 0 }, item: 0 }]);
    const two = level(['R..xx'], {
      goals: { cratesOnTargets: true },
      items: [
        { x: 1, y: 0, type: 'crate' },
        { x: 2, y: 0, type: 'crate' },
      ],
    });
    expect(run(two, p('right')).result).toBe('bonk');
  });
});

describe('shortest', () => {
  it('finds the fewest Commands, going round walls', () => {
    expect(shortest(level(['.....', 'R.#F.', '.....']))).toHaveLength(5);
  });

  it('uses turns in world 8', () => {
    const turns = level(['..F', '.##', 'R##'], { start: { facing: 'N' }, palette: ['forward', 'turnLeft', 'turnRight'] });
    expect(shortest(turns)).toEqual(['forward', 'forward', 'turnRight', 'forward', 'forward']);
  });

  it('says so when there is no way', () => {
    expect(shortest(level(['R#F']))).toBeNull();
  });
});
