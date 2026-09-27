import { describe, expect, it } from 'vitest';
import { NOW_I_KNOW, SONG_LENGTH, SUNG_AT, sungBy } from './song';

describe('the ABC song', () => {
  it('sings the 26 letters one after another, then "Now I know", before it ends', () => {
    expect(SUNG_AT).toHaveLength(26);
    const times = [...SUNG_AT, NOW_I_KNOW, SONG_LENGTH];
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThan(times[i - 1]!);
  });

  it('counts the letters sung so far', () => {
    expect(sungBy(0)).toBe(0);
    expect(sungBy(SUNG_AT[0]!)).toBe(1);
    expect(sungBy(SUNG_AT[6]! + 0.01)).toBe(7);
    expect(sungBy(NOW_I_KNOW)).toBe(26);
  });
});
