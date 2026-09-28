import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { clipsByWord } from './sounds';
import { COLOURS, SHAPES } from './sorting';

describe('Word clips', () => {
  it('are found by file name, one word each', () => {
    const clips = clipsByWord({ './assets/words/red.mp3': '/assets/red-1a2b.mp3', './assets/words/circle.mp3': '/assets/circle-3c4d.mp3' });
    expect([...clips.keys()].sort()).toEqual(['circle', 'red']);
    expect(clips.get('red')).toBe('/assets/red-1a2b.mp3');
  });

  it('are there for every color and shape, since nothing else says the words', () => {
    const shipped = readdirSync(new URL('./assets/words/', import.meta.url));
    for (const sort of [...COLOURS, ...SHAPES]) expect(shipped).toContain(`${sort}.mp3`);
  });
});
