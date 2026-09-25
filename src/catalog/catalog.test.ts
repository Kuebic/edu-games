// The contract every Game folder keeps. A copied folder that still points at the
// Game it came from fails here, with the folder named.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
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

/** Every file under a folder, as absolute paths. */
const filesIn = (dir: string): string[] =>
  !existsSync(dir)
    ? []
    : readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) => join(d.parentPath, d.name));

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

    // ADR 0005: code imports its files from src/assets/, so the build hashes them and
    // fails if one is missing. Only the Tile and the page's icons need a fixed address.
    const dir = join(fileURLToPath(gamesDir), game.slug);
    const code = filesIn(join(dir, 'src')).filter((f) => /\.(ts|css)$/.test(f) && !f.endsWith('.test.ts'));

    it('its code finds files relative to itself, never by site path', () => {
      const sitePath = new RegExp(`(?<![\\w-])(${folders.join('|')})/|url\\(\\s*['"]?/|BASE_URL`);
      for (const f of code) expect(readFileSync(f, 'utf8'), relative(dir, f)).not.toMatch(sitePath);
    });

    it('every url() in its CSS points at a file', () => {
      for (const f of code.filter((c) => c.endsWith('.css'))) {
        for (const [, url] of readFileSync(f, 'utf8').matchAll(/url\(\s*['"]?([^'")]+)/g)) {
          if (url!.startsWith('data:')) continue;
          expect(existsSync(join(dirname(f), url!)), `${relative(dir, f)}: ${url}`).toBe(true);
        }
      }
    });

    it('keeps in public/ only the Tile picture and the files its page links', () => {
      const own = `/${game.slug}/`;
      const linked = [...readFileSync(join(dir, 'index.html'), 'utf8').matchAll(/(?:href|src)="([^"]+)"/g)]
        .map(([, url]) => url!)
        .filter((url) => url.startsWith(own))
        .map((url) => url.slice(own.length));
      for (const f of filesIn(join(dir, 'public'))) {
        const name = relative(join(dir, 'public'), f);
        expect([game.tile, ...linked], `public/${name}`).toContain(name);
      }
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
