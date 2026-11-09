import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { clipsByWord, COLOUR_THINGS, COLOURS, GROUP_WORDS, GROUPS, membersOf, POOLS } from './kinds';

const shipped = readdirSync(new URL('./assets/words/', import.meta.url));
const file = (said: string) => `${said.replace(/ /g, '-')}.mp3`;

describe('the pictures', () => {
  it('have a group for every GROUP_WORDS entry, animals first', () => {
    expect(GROUPS[0]).toBe('animals');
    expect([...GROUPS].sort()).toEqual(Object.keys(GROUP_WORDS).sort());
  });

  it('never put one emoji under two colors', () => {
    const seen = new Map<string, string>();
    for (const colour of COLOURS) {
      for (const emoji of COLOUR_THINGS[colour]) {
        expect(seen.get(emoji) ?? colour, emoji).toBe(colour);
        seen.set(emoji, colour);
      }
    }
  });

  it('give every group at least four clear members, enough for a Bin or a group of four', () => {
    for (const group of GROUPS) expect(membersOf(group).length, group).toBeGreaterThanOrEqual(4);
  });
});

describe('the Word clips', () => {
  it('are found by file name, one word each, a hyphen for a space', () => {
    const clips = clipsByWord({ './assets/words/red.mp3': '/assets/red-1a2b.mp3', './assets/words/fire-truck.mp3': '/a.mp3' });
    expect([...clips.keys()].sort()).toEqual(['fire-truck', 'red']);
    expect(clips.get('red')).toBe('/assets/red-1a2b.mp3');
  });

  it('are there for every color, since nothing else says the words', () => {
    for (const colour of COLOURS) expect(shipped).toContain(file(colour));
  });

  it('are there for every group and every Thing’s own name, so a Thing with no recording is left out', () => {
    const names = Object.values(POOLS).flatMap((p) => [...p.clear, ...(p.wide ?? []), ...(p.odd ?? [])].map((t) => t.name));
    for (const said of [...Object.values(GROUP_WORDS), ...names]) expect(shipped).toContain(file(said));
  });
});
