import { type Direction, type Level, type Position, neighbour } from './level';

export type StepResult =
  | { readonly kind: 'blocked' }
  | { readonly kind: 'step'; readonly position: Position }
  | { readonly kind: 'push'; readonly position: Position; readonly box: number };

function isOpen(level: Level, square: number | undefined): square is number {
  return square !== undefined && level.cells[square] === 'floor';
}

export function step(level: Level, from: Position, dir: Direction): StepResult {
  const next = neighbour(level, from.player, dir);
  if (!isOpen(level, next)) return { kind: 'blocked' };

  const box = from.boxes.indexOf(next);
  if (box === -1) return { kind: 'step', position: { player: next, boxes: from.boxes } };

  const beyond = neighbour(level, next, dir);
  if (!isOpen(level, beyond) || from.boxes.includes(beyond)) return { kind: 'blocked' };

  const boxes = from.boxes.slice();
  boxes[box] = beyond;
  return { kind: 'push', position: { player: next, boxes }, box };
}

export function isSolved(level: Level, position: Position): boolean {
  return position.boxes.every((box) => level.goals.has(box));
}

/**
 * Cheap check for the most common way to get stuck: a box off its goal, jammed into a
 * corner. Used to nudge the player toward undo. The solver has the exact answer.
 */
export function hasCorneredBox(level: Level, position: Position): boolean {
  const blocked = (square: number | undefined) =>
    square === undefined || level.cells[square] !== 'floor';
  return position.boxes.some((box) => {
    if (level.goals.has(box)) return false;
    const up = blocked(neighbour(level, box, 'up'));
    const down = blocked(neighbour(level, box, 'down'));
    const left = blocked(neighbour(level, box, 'left'));
    const right = blocked(neighbour(level, box, 'right'));
    return (up || down) && (left || right);
  });
}
