import { describe, expect, it } from 'vitest';
import { aheadFadeLine, aheadRightLine, homeLine, spunLine, squareLine, startLine, turnLine } from './lines';

describe('the Voice’s lines', () => {
  it('start the Race, say the spin, and say each Square as a number', () => {
    expect(startLine('Bunny', 'Frog', 10)).toBe('Bunny and Frog are racing to 10!');
    expect(spunLine(1)).toBe('One hop!');
    expect(spunLine(2)).toBe('Two hops!');
    expect(squareLine(4)).toBe('4');
  });

  it('call whoever’s turn it is by name', () => {
    expect(turnLine('Pig')).toBe("Pig's turn.");
    expect(homeLine('Pig')).toBe('Pig is home! Keep hopping!');
  });

  it('say where both are, and which number is more', () => {
    expect(aheadRightLine('Bunny', 5, 3)).toBe('Yes! Bunny is on 5. 5 is more than 3.');
    expect(aheadFadeLine('Frog', 3)).toBe('Frog is on 3.');
  });
});
