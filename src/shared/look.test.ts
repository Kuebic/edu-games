// The Shared look (ADR 0007): base.css draws what every Game shares, and a Game only adds its own.
// A Game that copies a shared rule back, or uses a --site-* token base.css doesn't have, fails here.
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GAMES } from '../catalog/catalog.ts';
import { filesIn } from '../catalog/discover.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(join(root, path), 'utf8');

/** Every non-test .ts and .css file under a folder, relative to the repo. */
const sources = (dir: string): string[] =>
  filesIn(join(root, dir))
    .filter((f) => /\.(ts|css)$/.test(f) && !f.endsWith('.test.ts'))
    .map((f) => relative(root, f));

const base = read('src/shared/base.css');
const shared = sources('src/shared');
const pages = [
  { name: 'Hub', files: sources('src/hub') },
  ...GAMES.map((g) => ({ name: g.slug, files: sources(`games/${g.slug}/src`) })),
];

/** The house drawings Games have used. Only the House button may draw one. */
const HOUSES = ['M8 23 24 9l16 14', 'M3.5 11.2 12 4l8.5 7.2'];

/** Where a Game has drifted from the Shared look; empty when it hasn't. */
function drift(slug: string): string[] {
  const files = sources(`games/${slug}/src`).map((f) => ({ f, text: read(f) }));
  const found: string[] = [];
  for (const { f, text } of files) {
    for (const house of HOUSES) if (text.includes(house)) found.push(`${f}: draws its own house`);
    if (f.endsWith('.css')) {
      const stack = /font-family:(?!\s*(?:var\(|inherit))[^;]+|--[\w-]+:\s*[^;]*\b(?:ui-rounded|system-ui)\b/.exec(text);
      if (stack) found.push(`${f}: a font stack of its own (${stack[0]}); use --site-font or site-grownup`);
    }
  }
  if (!files.some(({ text }) => text.includes('site-screen'))) found.push("its screens aren't site-screens");
  const houses = files.filter(({ text }) => text.includes('houseButton('));
  const calls = houses.flatMap(({ text }) => [...text.matchAll(/houseButton\(([^)]*)\)/g)].map(([, arg]) => arg));
  if (calls.length !== 1 || calls[0] !== '') found.push(`one houseButton(), not ${calls.length} (${calls.join(' + ')})`);
  for (const { f, text } of houses) if (!text.includes("'site-bar'")) found.push(`${f}: its House button isn't in a site-bar`);
  return found;
}

describe('the Shared look', () => {
  // catalog.test.ts checks that every page imports the shell before its own CSS.
  it('comes in through the shell, so it loads before every page’s own CSS', () => {
    expect(read('src/shared/shell.ts')).toMatch(/^import '\.\/base\.css';$/m);
  });

  it('has every --site-* token that anything uses', () => {
    const defined = new Set([
      ...[...base.matchAll(/^\s*(--site-[\w-]+):/gm)].map(([, name]) => name),
      ...shared.flatMap((f) => [...read(f).matchAll(/setProperty\('(--site-[\w-]+)'/g)].map(([, name]) => name)),
    ]);
    for (const f of [...shared, ...pages.flatMap((p) => p.files)]) {
      for (const [, name] of read(f).matchAll(/var\((--site-[\w-]+)/g)) expect(defined, `${f}: ${name}`).toContain(name);
    }
  });

  describe.each(pages)('$name', ({ files }) => {
    it('leaves the page basics to base.css', () => {
      for (const f of files.filter((f) => f.endsWith('.css'))) {
        const css = read(f);
        expect(css, f).not.toMatch(/-webkit-tap-highlight-color|-webkit-touch-callout/);
        expect(css, `${f}: a button reset`).not.toMatch(/^button\s*\{[^}]*\b(font|border|background|cursor)\s*:/m);
      }
    });
  });

  describe.each(GAMES.map((g) => g.slug))('%s', (slug) => {
    it('has the Shared look', () => expect(drift(slug)).toEqual([]));
  });
});
