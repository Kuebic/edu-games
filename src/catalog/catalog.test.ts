// The contract every Game folder keeps. A copied folder that still points at the
// Game it came from fails here, with the folder named.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GAMES } from './catalog.ts';
import { discoverGames, filesIn } from './discover.ts';
import { parseEntry } from './entry.ts';

const gamesDir = new URL('../../games/', import.meta.url);
const inGames = (path: string) => new URL(path, gamesDir);
const folders = readdirSync(gamesDir, { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((dir) => dir.name);

/** A module's first import statement. Imports run in order, and so does the CSS they bring in. */
const firstImport = (code: string) => /^import\b[^;]*;/m.exec(code)?.[0];

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
    it('has a README headed with its name', () => {
      expect(existsSync(file('README.md'))).toBe(true);
      expect(readFileSync(file('README.md'), 'utf8').split('\n')[0]).toBe(`# ${game.name}`);
    });

    // ADR 0005: code imports its files from src/assets/, so the build hashes them and
    // fails if one is missing. Only the Tile and the page's icons need a fixed address.
    const dir = join(fileURLToPath(gamesDir), game.slug);
    const code = filesIn(join(dir, 'src')).filter((f) => /\.(ts|css)$/.test(f) && !f.endsWith('.test.ts'));

    it('its code finds files relative to itself, never by site path', () => {
      // A slug path, a root url() in CSS, a string that starts with a root path ('/cheer.ogg', `/${dir}/…`), or BASE_URL.
      const sitePath = new RegExp(`(?<![\\w-])(${folders.join('|')})/|url\\(\\s*['"]?/|['"\`]/[\\w$.]|BASE_URL`);
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

    // ADR 0006: every page starts through the shell, and a Game saves only through it.
    const main = readFileSync(join(dir, 'src/main.ts'), 'utf8');
    const scripts = code.filter((f) => f.endsWith('.ts'));

    it('starts through the shell under its own Slug', () => {
      expect(main).toMatch(new RegExp(`startGame\\('${game.slug}'[,)]`));
    });

    it('imports the shell first, so base.css loads before any of its own CSS', () => {
      expect(firstImport(main)).toMatch(/['"]@shared\/shell['"]/);
    });

    it('saves and registers offline only through the shell', () => {
      for (const f of scripts) {
        expect(readFileSync(f, 'utf8'), relative(dir, f)).not.toMatch(/\blocalStorage\b|@shared\/pwa|virtual:pwa-register/);
      }
    });

    // The level select draws it on a Game's first screen (ADR 0008); look.test.ts checks where.
    it('has a House button back to the Hub', () => {
      expect(scripts.some((f) => /from '@shared\/(?:house-button|level-select)'/.test(readFileSync(f, 'utf8')))).toBe(true);
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

  it('the Hub also starts through the shell, imported first', () => {
    const hub = readFileSync(new URL('../hub/main.ts', import.meta.url), 'utf8');
    expect(hub).toMatch(/\bstartPage\(\)/);
    expect(firstImport(hub)).toMatch(/['"](@shared|\.\.\/shared)\/shell['"]/);
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
