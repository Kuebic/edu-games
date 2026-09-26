import { describe, expect, it } from 'vitest';
import { clipsByLetter } from './sounds';

describe('Letter sound clips', () => {
  it('are found by file name, one letter each', () => {
    const clips = clipsByLetter({ './assets/sounds/s.mp3': '/assets/s-1a2b.mp3', './assets/sounds/a.mp3': '/assets/a-3c4d.mp3' });
    expect([...clips.keys()].sort()).toEqual(['A', 'S']);
    expect(clips.get('S')).toBe('/assets/s-1a2b.mp3');
  });

  it('are none when there are no files', () => {
    expect(clipsByLetter({}).size).toBe(0);
  });
});
