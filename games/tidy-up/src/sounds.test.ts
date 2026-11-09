import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SHAPES } from './sorting';

describe('Word clips', () => {
  // The colors, the groups and the Things are checked in src/shared/kinds.test.ts; the shapes are Tidy Up's alone.
  it('are there for every shape, since nothing else says the words', () => {
    const shipped = readdirSync(new URL('../../../src/shared/assets/words/', import.meta.url));
    for (const shape of SHAPES) expect(shipped).toContain(`${shape}.mp3`);
  });
});
