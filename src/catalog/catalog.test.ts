// The contract every Game folder keeps. A copied folder that still points at the
// Game it came from fails here, with the folder named.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GAMES } from './catalog.ts';
import { discoverGames } from './discover.ts';
import { parseEntry } from './entry.ts';

const gamesDir = new URL('../../games/', import.meta.url);
const inGames = (path: string) => new URL(path, gamesDir);
const folders = readdirSync(gamesDir, { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((dir) => dir.name);

const entry = { name: 'X', category: 'logic', tile: 'icon.svg', shelf: 'on', added: '2026-01-01' };

describe('Catalog', () => {
  it.each(folders)('%s has a game.json if it holds a Game', (slug) => {
    const holdsGame = existsSync(inGames(`${slug}/src`)) || existsSync(inGames(`${slug}/index.html`));
    if (holdsGame) expect(existsSync(inGames(`${slug}/game.json`))).toBe(true);
  });

  it('the Hub and the build see the same Games in the same order', () => {
    expect(GAMES.map((g) => g.slug)).toEqual(discoverGames(fileURLToPath(gamesDir)).map((g) => g.slug));
  });

  it('Game names are unique', () => {
    const names = GAMES.map((g) => g.name);
    expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([]);
  });

  describe.each(GAMES)('$slug', (game) => {
    const file = (path: string) => inGames(`${game.slug}/${path}`);
    it('has its Tile picture in public/', () => expect(existsSync(file(`public/${game.tile}`))).toBe(true));
    it('has a README', () => expect(existsSync(file('README.md'))).toBe(true));
    it('has a page that loads its own code', () => {
      expect(readFileSync(file('index.html'), 'utf8')).toContain(`src="/games/${game.slug}/src/main.ts"`);
    });
  });

  it('accepts a good entry', () => {
    expect(parseEntry('x', entry)).toEqual({ slug: 'x', ...entry });
  });

  it('rejects a bad folder name', () => {
    expect(() => parseEntry('Bad Slug', entry)).toThrow(/games\/Bad Slug\/game.json: .*folder name/);
    expect(() => parseEntry('assets', entry)).toThrow(/folder name/);
  });

  it('rejects an unknown field', () => {
    expect(() => parseEntry('x', { ...entry, icon: 'y' })).toThrow(/unknown field "icon"/);
  });

  it('rejects a missing or unknown Shelf status', () => {
    const { shelf: _, ...noShelf } = entry;
    expect(() => parseEntry('x', noShelf)).toThrow(/"shelf" must be on, hidden or off/);
    expect(() => parseEntry('x', { ...entry, shelf: 'shelved' })).toThrow(/shelf/);
  });

  it('rejects a bad category or date', () => {
    expect(() => parseEntry('x', { ...entry, category: 'art' })).toThrow(/category/);
    expect(() => parseEntry('x', { ...entry, added: 'today' })).toThrow(/added/);
  });
});
