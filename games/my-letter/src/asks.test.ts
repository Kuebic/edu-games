import { describe, expect, it } from 'vitest';
import { ask, fadeLine, foundLine, saysLine, spellAsk } from './asks';

describe('the ask', () => {
  it('in My words, for a word’s first capital, is for the word', () => {
    expect(spellAsk('Sam', 0)).toBe('Find the letter S for Sam!');
    expect(spellAsk('Anna', 0)).toBe('Find the letter A for Anna!');
  });

  it('in My words, for its other capitals, is in the word, even a letter that was first too', () => {
    expect(spellAsk('Sam', 1)).toBe('Find the letter A in Sam!');
    expect(spellAsk('Anna', 2)).toBe('Find the letter N in Anna!');
    expect(spellAsk('Anna', 3)).toBe('Find the letter A in Anna!');
    // The Name as typed, accents and all; the letters from its capitals.
    expect(spellAsk('Zoë', 0)).toBe('Find the letter Z for Zoë!');
    expect(spellAsk('Zoë', 2)).toBe('Find the letter E in Zoë!');
  });

  it('in My words, is the same for a Word as for the Name', () => {
    expect(spellAsk('Mama', 0)).toBe('Find the letter M for Mama!');
    expect(spellAsk('Mama', 1)).toBe('Find the letter A in Mama!');
  });

  it('in New letters, is the letter alone', () => {
    expect(ask('B')).toBe('Find the letter B!');
  });
});

describe('the lines', () => {
  it('name a letter so the Voice reads it as the letter, not a word', () => {
    expect(fadeLine('M')).toBe("That's the letter M.");
    expect(saysLine('A')).toBe('The letter A says');
    expect(foundLine('S')).toBe("That's the letter S!");
  });
});
