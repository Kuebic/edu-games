import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LETTERS } from './letters';
import { clipsByLetter } from './sounds';

describe('Name clips', () => {
  it('are found by file name, one letter each', () => {
    const clips = clipsByLetter({ './assets/names/a.mp3': '/assets/a-1a2b.mp3', './assets/names/z.mp3': '/assets/z-3c4d.mp3' });
    expect([...clips.keys()].sort()).toEqual(['a', 'z']);
    expect(clips.get('a')).toBe('/assets/a-1a2b.mp3');
  });

  it('are there for every letter, since nothing else says them', () => {
    const shipped = readdirSync(new URL('./assets/names/', import.meta.url));
    for (const l of LETTERS) expect(shipped).toContain(`${l}.mp3`);
  });

  it('come with the Letter font', () => {
    expect(readdirSync(new URL('./assets/font/', import.meta.url))).toEqual(['mailbox-letters.woff2']);
  });
});
