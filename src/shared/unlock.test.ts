import { describe, expect, it } from 'vitest';
import { currentLevel, isLevelOpen, nextLevel } from './unlock';

/** A Group's done marks from a picture: x done, . not done. */
const marks = (row: string) => [...row].map((c) => c === 'x');
const open = (done: boolean[], everyOpen?: boolean) => done.map((_, i) => isLevelOpen(done, i, everyOpen));

describe('isLevelOpen', () => {
  it('opens only Level 0 in a fresh Group', () => {
    expect(open(marks('........'))).toEqual(marks('x.......'));
  });

  it('opens each Level after a done one', () => {
    expect(open(marks('xxx.....'))).toEqual(marks('xxxx....'));
  });

  it('keeps a done Level open after an undone one, and opens the one after it', () => {
    // Done out of order, e.g. under "Every level open": 3 stays open though 2 isn't done.
    expect(open(marks('xx.x....'))).toEqual(marks('xxxxx...'));
  });

  it('opens everything with "Every level open"', () => {
    expect(open(marks('........'), true)).toEqual(marks('xxxxxxxx'));
  });
});

describe('currentLevel', () => {
  it('is the first open Level not done', () => {
    expect(currentLevel(marks('........'))).toBe(0);
    expect(currentLevel(marks('xxx.....'))).toBe(3);
    expect(currentLevel(marks('xx.x....'))).toBe(2);
    expect(currentLevel(marks('..x.x...'), true)).toBe(0);
  });

  it('is undefined when every Level is done', () => {
    expect(currentLevel(marks('xxxx'))).toBeUndefined();
    expect(currentLevel(marks('xxxx'), true)).toBeUndefined();
  });
});

describe('nextLevel', () => {
  const sizes = [12, 12, 4];

  it('goes on inside a Group', () => {
    expect(nextLevel(sizes, 0, 0)).toEqual({ group: 0, level: 1 });
    expect(nextLevel(sizes, 1, 10)).toEqual({ group: 1, level: 11 });
  });

  it("goes from a Group's last Level to the next Group's first", () => {
    expect(nextLevel(sizes, 0, 11)).toEqual({ group: 1, level: 0 });
    expect(nextLevel(sizes, 1, 11)).toEqual({ group: 2, level: 0 });
  });

  it('stops after the very last Level', () => {
    expect(nextLevel(sizes, 2, 3)).toBeUndefined();
  });
});
