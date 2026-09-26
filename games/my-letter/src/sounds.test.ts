import { describe, expect, it } from 'vitest';
import { clipsByLetter } from './sounds';

describe('Letter sound clips', () => {
  it('are found by file name, one letter each, whatever the format', () => {
    const clips = clipsByLetter({
      './assets/sounds/s.ogg': '/assets/s-1a2b.ogg',
      './assets/sounds/a.mp3': '/assets/a-3c4d.mp3',
      './assets/sounds/a.ogg': '/assets/a-5e6f.ogg',
      './assets/sounds/cheer.ogg': '/assets/cheer.ogg',
    });
    expect([...clips.keys()].sort()).toEqual(['A', 'S']);
    expect(clips.get('S')).toBe('/assets/s-1a2b.ogg');
  });

  it('are none when there are no files yet', () => {
    expect(clipsByLetter({}).size).toBe(0);
  });
});
