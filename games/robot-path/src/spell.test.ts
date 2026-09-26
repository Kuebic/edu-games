import { expect, it } from 'vitest';
import { spellOut } from './spell';

it('spells a word by letter name, then says it', () => {
  expect(spellOut('CAT')).toBe('C, A, T. Cat!');
  expect(spellOut('A')).toBe('A. A!');
});
