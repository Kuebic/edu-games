import { describe, expect, it } from 'vitest';
import { isUnlocked, nextLevel, withSolved } from './progress';

describe('progress', () => {
  const fresh = { solved: [], muted: false };

  it('starts with only the first level unlocked', () => {
    expect(isUnlocked(fresh, 0)).toBe(true);
    expect(isUnlocked(fresh, 1)).toBe(false);
    expect(nextLevel(fresh, 40)).toBe(0);
  });

  it('solving a level unlocks the next one', () => {
    const p = withSolved(withSolved(fresh, 0), 1);
    expect(isUnlocked(p, 2)).toBe(true);
    expect(isUnlocked(p, 3)).toBe(false);
    expect(nextLevel(p, 40)).toBe(2);
  });

  it('offers the last level once everything is solved', () => {
    const p = { solved: [0, 1, 2], muted: false };
    expect(nextLevel(p, 3)).toBe(2);
  });
});
