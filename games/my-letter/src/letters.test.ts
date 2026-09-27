import { describe, expect, it } from 'vitest';
import {
  GROUP_NAMES,
  MY_WORDS,
  NEW_LETTERS,
  NEW_LETTER_ORDER,
  boardLetters,
  levelLabels,
  looksAlike,
  metLetters,
  myWords,
  nameCapitals,
  nameLetters,
  splitWords,
} from './letters';

describe('Name letters', () => {
  it('are the different letters of the Name, in the order they first appear', () => {
    expect(nameLetters('Sam')).toEqual(['S', 'A', 'M']);
    expect(nameLetters('Anna')).toEqual(['A', 'N']);
    expect(nameLetters('bob')).toEqual(['B', 'O']);
  });

  it('drop accents and keep only A to Z', () => {
    expect(nameLetters('Zoë')).toEqual(['Z', 'O', 'E']);
    expect(nameLetters('José-Luis')).toEqual(['J', 'O', 'S', 'E', 'L', 'U', 'I']);
    expect(nameLetters("  O'Neil 2 ")).toEqual(['O', 'N', 'E', 'I', 'L']);
  });

  it('come from the first ten letters of the Name', () => {
    expect(nameCapitals('Maximilianus')).toBe('MAXIMILIAN');
    expect(nameLetters('Maximilianus')).toEqual(['M', 'A', 'X', 'I', 'L', 'N']);
    expect(nameLetters('Abcdefghijklm')).toHaveLength(10);
  });

  it('are none for a Name with no letters, or none at all', () => {
    expect(nameLetters('')).toEqual([]);
    expect(nameLetters('   ')).toEqual([]);
    expect(nameLetters('42 ☺')).toEqual([]);
    expect(nameCapitals('李')).toBe('');
  });
});

describe('the Name line', () => {
  it('is the Name in capitals, accents gone, up to ten', () => {
    expect(nameCapitals('Anna')).toBe('ANNA');
    expect(nameCapitals('Zoë')).toBe('ZOE');
    expect(nameCapitals('Mary Jane')).toBe('MARYJANE');
  });
});

describe('My words', () => {
  it('are the Name, then the Words, as typed', () => {
    expect(myWords('Sam', ['Mama', 'Dada', 'Leo'])).toEqual(['Sam', 'Mama', 'Dada', 'Leo']);
    expect(myWords('', ['Mama'])).toEqual(['Mama']);
    expect(myWords('Zoë', [])).toEqual(['Zoë']);
    expect(myWords('', [])).toEqual([]);
  });

  it('leave out a word with no letters, and one spelt the same as one before it', () => {
    expect(myWords('42', ['Mama', '☺', 'MAMA', 'Anna', 'anna'])).toEqual(['Mama', 'Anna']);
    expect(myWords('Sam', ['sam', 'Dada'])).toEqual(['Sam', 'Dada']);
  });

  it('take up to ten Words after the Name', () => {
    const words = [...'ABCDEFGHIJKL'].map((l) => `${l}o`);
    expect(myWords('Sam', words)).toEqual(['Sam', ...words.slice(0, 10)]);
  });

  it('are typed in one box, split at commas', () => {
    expect(splitWords(' Mama, Dada,,Leo ,  ')).toEqual(['Mama', 'Dada', 'Leo']);
    expect(splitWords('')).toEqual([]);
    expect(splitWords('Nana Jo')).toEqual(['Nana Jo']);
  });
});

describe('the Groups', () => {
  it('are My words, then New letters', () => {
    expect([GROUP_NAMES[MY_WORDS], GROUP_NAMES[NEW_LETTERS]]).toEqual(['My words', 'New letters']);
    expect(NEW_LETTER_ORDER).toEqual(['B', 'D', 'K', 'P', 'T', 'V', 'Z', 'J']);
  });

  it('have a Level per word in My words, then always all eight New letters', () => {
    expect(levelLabels(['Ben'], MY_WORDS)).toEqual(['BEN']);
    expect(levelLabels(['Zoë', 'Mama', 'Dada'], MY_WORDS)).toEqual(['ZOE', 'MAMA', 'DADA']);
    expect(levelLabels(['Ben'], NEW_LETTERS)).toEqual(NEW_LETTER_ORDER);
    expect(levelLabels([], MY_WORDS)).toEqual([]);
    expect(levelLabels([], NEW_LETTERS)).toEqual(NEW_LETTER_ORDER);
  });
});

describe('Met letters', () => {
  it('before a New letters Level are the letters of My words, then the New letters before it', () => {
    expect(metLetters(['Sam'], 0)).toEqual(['S', 'A', 'M']);
    expect(metLetters(['Sam'], 2)).toEqual(['S', 'A', 'M', 'B', 'D']);
    expect(metLetters(['Sam', 'Mama', 'Leo'], 0)).toEqual(['S', 'A', 'M', 'L', 'E', 'O']);
    expect(metLetters([], 0)).toEqual([]);
    expect(metLetters([], 1)).toEqual(['B']);
  });

  it('are each letter once, even one met in both Groups', () => {
    expect(metLetters(['Ben'], 3)).toEqual(['B', 'E', 'N', 'D', 'K']);
  });
});

describe('Looks alike', () => {
  it('pairs letters in the same family, both ways', () => {
    expect(looksAlike('B', 'D')).toBe(true);
    expect(looksAlike('D', 'B')).toBe(true);
    expect(looksAlike('Q', 'O')).toBe(true);
    expect(looksAlike('E', 'F')).toBe(true);
    expect(looksAlike('W', 'M')).toBe(true);
    expect(looksAlike('Y', 'V')).toBe(true);
    expect(looksAlike('J', 'I')).toBe(true);
    expect(looksAlike('K', 'X')).toBe(true);
  });

  it('keeps apart letters in different families, and a letter from none', () => {
    expect(looksAlike('B', 'S')).toBe(false);
    expect(looksAlike('M', 'A')).toBe(false);
    expect(looksAlike('S', 'Z')).toBe(false);
  });
});

describe('the Letter board', () => {
  it('is every capital A to Z in order, the Name letters marked', () => {
    const board = boardLetters('Sam');
    expect(board.map((b) => b.letter).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(board.filter((b) => b.mine).map((b) => b.letter)).toEqual(['A', 'M', 'S']);
  });

  it('marks none without a Name', () => {
    expect(boardLetters('').some((b) => b.mine)).toBe(false);
    expect(boardLetters('42').some((b) => b.mine)).toBe(false);
  });
});
