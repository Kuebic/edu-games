// The Shared look (ADR 0007): base.css draws what every Game shares, and a Game only adds its own.
// A Game that copies a shared rule back, or uses a --site-* token base.css doesn't have, fails here.
// Every Game opens on the shared level select (ADR 0008) with the one unlock rule (ADR 0009).
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
const classesIn = (css: string) => new Set([...css.matchAll(/\.(site-[\w-]+)/g)].map(([, name]) => name!));
const pages = [
  { name: 'Hub', files: sources('src/hub') },
  ...GAMES.map((g) => ({ name: g.slug, files: sources(`games/${g.slug}/src`) })),
];

/** The house drawings Games have used. Only the House button may draw one. */
const HOUSES = ['M8 23 24 9l16 14', 'M3.5 11.2 12 4l8.5 7.2'];
/** The lock drawings Games have used. Only the level select may draw one. */
const LOCKS = ['M16 22v-6a8 8', 'M8 11V7a4 4'];
/** The unlock rules Games have had. The one rule is src/shared/unlock.ts. */
const OWN_RULES = /\b(?:isUnlocked|isPackOpen|isWorldUnlocked|isLevelUnlocked|OPENS_NEXT|WORLD_UNLOCK_AT)\b/;
/** The level select's own classes, which no Game restyles. */
const baseClasses = classesIn(base);
const SELECT_CLASSES = [...classesIn(read('src/shared/level-select.css'))].filter((c) => !baseClasses.has(c));

/**
 * Games that still draw their own level select, with their own House button and unlock rule.
 * A Game leaves this list when it moves to showLevelSelect(), and nothing joins it.
 */
const OWN_LEVEL_SELECT = ['push-pals', 'snack-math'];

/** Where a Game has drifted from the Shared look; empty when it hasn't. */
function drift(slug: string): string[] {
  const files = sources(`games/${slug}/src`).map((f) => ({ f, text: read(f) }));
  const found: string[] = [];
  for (const { f, text } of files) {
    for (const house of HOUSES) if (text.includes(house)) found.push(`${f}: draws its own house`);
    if (f.endsWith('.css')) {
      const stack = /font-family:(?!\s*(?:var\(|inherit))[^;]+|--[\w-]+:\s*[^;]*\b(?:ui-rounded|system-ui)\b/.exec(text);
      if (stack) found.push(`${f}: a font stack of its own (${stack[0]}); use --site-font or site-grownup`);
      for (const c of SELECT_CLASSES) if (new RegExp(`\\.${c}(?![\\w-])`).test(text)) found.push(`${f}: restyles the level select's .${c}`);
    }
  }
  if (!files.some(({ text }) => text.includes('site-screen'))) found.push("its screens aren't site-screens");
  const calls = (name: string) => files.flatMap(({ text }) => [...text.matchAll(new RegExp(`\\b${name}\\(([^)]*)\\)`, 'g'))].map(([, arg]) => arg));
  if (OWN_LEVEL_SELECT.includes(slug)) {
    const houses = calls('houseButton');
    if (houses.length !== 1 || houses[0] !== '') found.push(`one houseButton(), not ${houses.length} (${houses.join(' + ')})`);
    for (const { f, text } of files) if (text.includes('houseButton(') && !text.includes("'site-bar'")) found.push(`${f}: its House button isn't in a site-bar`);
    return found;
  }
  // The level select draws the House button, the locks and the unlock rule.
  const selects = calls('showLevelSelect').length;
  if (selects !== 1) found.push(`one showLevelSelect(), not ${selects}`);
  for (const { f, text } of files) {
    if (text.includes('houseButton(')) found.push(`${f}: a House button of its own; the level select draws it`);
    for (const lock of LOCKS) if (text.includes(lock)) found.push(`${f}: draws its own lock`);
    const rule = OWN_RULES.exec(text);
    if (rule) found.push(`${f}: an unlock rule of its own (${rule[0]}); use @shared/unlock`);
  }
  return found;
}

describe('the Shared look', () => {
  // catalog.test.ts checks that every page imports the shell first.
  it('comes in through the shell, so it loads before every page’s own CSS', () => {
    expect(read('src/shared/shell.ts')).toMatch(/^import '\.\/base\.css';$/m);
  });

  it('has every --site-* token that anything uses', () => {
    const defined = new Set([
      ...shared.filter((f) => f.endsWith('.css')).flatMap((f) => [...read(f).matchAll(/^\s*(--site-[\w-]+):/gm)].map(([, name]) => name)),
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

  it.each(OWN_LEVEL_SELECT)('%s is on the list of Games with their own level select only until it moves', (slug) => {
    expect(GAMES.map((g) => g.slug)).toContain(slug);
    const moved = sources(`games/${slug}/src`).some((f) => read(f).includes('showLevelSelect('));
    expect(moved, `${slug} uses showLevelSelect(); take it off OWN_LEVEL_SELECT`).toBe(false);
  });
});
