import { describe, expect, it } from 'vitest';
import { ask, foundLine, saysLine, wrongLine } from './asks';

describe('the ask', () => {
  it('in My name, for the Name’s first letter, is for the Name', () => {
    expect(ask('S', 'Sam')).toBe('Find the letter S for Sam!');
    expect(ask('A', 'Anna')).toBe('Find the letter A for Anna!');
  });

  it('in My name, for its other letters, is in the Name', () => {
    expect(ask('A', 'Sam')).toBe('Find the letter A in Sam!');
    expect(ask('N', 'Anna')).toBe('Find the letter N in Anna!');
    // The Name as typed, accents and all; the letters from its capitals.
    expect(ask('Z', 'Zoë')).toBe('Find the letter Z for Zoë!');
    expect(ask('E', 'Zoë')).toBe('Find the letter E in Zoë!');
  });

  it('in New letters, is the letter alone', () => {
    expect(ask('B')).toBe('Find the letter B!');
  });
});

describe('the lines', () => {
  it('name a letter so the Voice reads it as the letter, not a word', () => {
    expect(wrongLine('M')).toBe("That's the letter M.");
    expect(saysLine('A')).toBe('The letter A says');
    expect(foundLine('S')).toBe("That's the letter S!");
  });
});
