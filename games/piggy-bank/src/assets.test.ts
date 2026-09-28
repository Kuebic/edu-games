import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MONEY } from './money';
import { picturesByName } from './pictures';
import { clipsByWord } from './sounds';

const shipped = (dir: string) => readdirSync(new URL(`./assets/${dir}/`, import.meta.url));

describe('Word clips', () => {
  it('are found by file name, one word each', () => {
    const clips = clipsByWord({ './assets/words/dime.mp3': '/assets/dime-1a2b.mp3' });
    expect(clips.get('dime')).toBe('/assets/dime-1a2b.mp3');
  });

  it('are there for every kind of money, since nothing else says the names', () => {
    for (const m of MONEY) expect(shipped('words')).toContain(`${m}.mp3`);
  });
});

describe('pictures', () => {
  it('are found by file name, money and side', () => {
    const pictures = picturesByName({ './assets/pictures/dime-tails.webp': '/assets/dime-tails-9f.webp' });
    expect(pictures.get('dime-tails')).toBe('/assets/dime-tails-9f.webp');
  });

  it('are there for both sides of every kind of money', () => {
    for (const m of MONEY) for (const side of ['heads', 'tails']) expect(shipped('pictures')).toContain(`${m}-${side}.webp`);
  });
});
