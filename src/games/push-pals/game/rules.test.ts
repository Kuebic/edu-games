import { describe, expect, it } from 'vitest';
import { parseLevel } from './level';
import { hasCorneredBox, isSolved, step } from './rules';

const corridor = parseLevel(`
#####
#@$.#
#####
`);

describe('parseLevel', () => {
  it('reads walls, floor, player, boxes and goals', () => {
    expect(corridor.width).toBe(5);
    expect(corridor.height).toBe(3);
    expect(corridor.start).toEqual({ player: 6, boxes: [7] });
    expect([...corridor.goals]).toEqual([8]);
    expect(corridor.cells[6]).toBe('floor');
    expect(corridor.cells[0]).toBe('wall');
  });

  it('treats unreachable spaces as outside', () => {
    const level = parseLevel(`
  ###
###@#
#.$ #
#####
`);
    expect(level.cells[0]).toBe('outside');
    expect(level.cells[5 + 3]).toBe('floor');
  });

  it('rejects mismatched boxes and goals', () => {
    expect(() => parseLevel('####\n#@$#\n####')).toThrow(/1 boxes but 0 goals/);
  });

  it('rejects floor that leaks off the board', () => {
    expect(() => parseLevel('####\n#@$.\n####')).toThrow(/not enclosed/);
  });
});

describe('step', () => {
  it('pushes a box into free floor', () => {
    const result = step(corridor, corridor.start, 'right');
    expect(result).toEqual({ kind: 'push', box: 0, position: { player: 7, boxes: [8] } });
    if (result.kind === 'push') expect(isSolved(corridor, result.position)).toBe(true);
  });

  it('is blocked by walls', () => {
    expect(step(corridor, corridor.start, 'left').kind).toBe('blocked');
    expect(step(corridor, corridor.start, 'up').kind).toBe('blocked');
  });

  it('cannot push a box into a wall or another box', () => {
    const level = parseLevel(`
######
#@$$.#
#  . #
######
`);
    expect(step(level, level.start, 'right').kind).toBe('blocked');
    const pushed = step(level, { player: 9, boxes: [10, 11] }, 'right');
    expect(pushed.kind).toBe('blocked');
  });

  it('walks without touching boxes', () => {
    const level = parseLevel(`
#####
#@  #
#$. #
#####
`);
    expect(step(level, level.start, 'right')).toEqual({
      kind: 'step',
      position: { player: 7, boxes: [11] },
    });
  });
});

describe('hasCorneredBox', () => {
  const room = parseLevel(`
#####
#@  #
# $.#
#   #
#####
`);

  it('spots a box jammed into a corner off its goal', () => {
    expect(hasCorneredBox(room, { player: 7, boxes: [16] })).toBe(true);
  });

  it('ignores boxes along one wall or on a goal', () => {
    expect(hasCorneredBox(room, room.start)).toBe(false);
    expect(hasCorneredBox(room, { player: 12, boxes: [17] })).toBe(false);
    expect(hasCorneredBox(room, { player: 7, boxes: [13] })).toBe(false);
  });
});
