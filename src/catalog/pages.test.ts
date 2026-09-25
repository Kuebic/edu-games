// Every page on the site has the same head. A copied index.html that still names the
// Game it came from, or a page missing a tag, fails here with the file named.
// Pages stay hand-written rather than generated from game.json: a template would hide
// about as much as it adds, and a Game needing one extra tag would fork it anyway.
// Extra tags are fine; only a second copy of a required tag, or a manifest, fails.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { discoverGames } from './discover.ts';

const root = new URL('../../', import.meta.url);
const VIEWPORT = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';

type Tag = { name: string; attrs: Record<string, string | undefined> };

/** Reads tags and their double-quoted attributes. A single-quoted attribute reads as missing. */
function readPage(html: string) {
  const tags: Tag[] = [...html.matchAll(/<([a-z]+)\b([^>]*)>/g)].map(([, name, rest]) => ({
    name: name!,
    attrs: Object.fromEntries([...rest!.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(([, k, v]) => [k, v ?? ''])),
  }));
  const meta = (name: string) =>
    tags.filter((t) => t.name === 'meta' && t.attrs.name === name).map((t) => t.attrs.content);
  const link = (rel: string) => tags.filter((t) => t.name === 'link' && t.attrs.rel === rel).map((t) => t.attrs.href);
  return {
    lang: tags.find((t) => t.name === 'html')?.attrs.lang,
    charset: tags.some((t) => t.name === 'meta' && t.attrs.charset?.toLowerCase() === 'utf-8'),
    title: /<title>([^<]*)<\/title>/.exec(html)?.[1],
    meta,
    link,
    scripts: tags.filter((t) => t.name === 'script').map((t) => t.attrs.src),
    hasApp: tags.some((t) => t.name === 'div' && t.attrs.id === 'app'),
  };
}

/** A root-relative href is a file in the Game's public/ (/<slug>/…) or in the site's public/. */
const fileFor = (href: string, slug?: string) =>
  slug && href.startsWith(`/${slug}/`)
    ? new URL(`games/${slug}/public/${href.slice(slug.length + 2)}`, root)
    : new URL(`public${href}`, root);

const pages = [
  { file: 'index.html', name: 'Game Shelf', icon: '/icon.svg', script: '/src/hub/main.ts', slug: undefined },
  ...discoverGames(fileURLToPath(new URL('games/', root))).map((g) => ({
    file: `games/${g.slug}/index.html`,
    name: g.name,
    icon: `/${g.slug}/${g.tile}`,
    script: `/games/${g.slug}/src/main.ts`,
    slug: g.slug,
  })),
];

// A copied page keeps the old Game's description, and nothing else would notice.
it('every page has its own description', () => {
  const seen = new Map<string | undefined, string>();
  for (const { file } of pages) {
    const [description] = readPage(readFileSync(new URL(file, root), 'utf8')).meta('description');
    expect(seen.get(description), `${file} has the same description as`).toBeUndefined();
    seen.set(description, file);
  }
});

describe.each(pages)('$file', ({ file, name, icon, script, slug }) => {
  const html = readFileSync(new URL(file, root), 'utf8');
  const page = readPage(html);

  it('is English UTF-8 with the site viewport', () => {
    expect(page.lang).toBe('en');
    expect(page.charset).toBe(true);
    expect(page.meta('viewport')).toEqual([VIEWPORT]);
  });

  it('is titled with its name, for the tab and the home screen', () => {
    expect(page.title).toBe(name);
    expect(page.meta('apple-mobile-web-app-title')).toEqual([name]);
    expect(page.meta('apple-mobile-web-app-capable')).toEqual(['yes']);
  });

  it('has one description and one theme colour', () => {
    expect(page.meta('description')).toEqual([expect.stringMatching(/\S{3}/)]);
    expect(page.meta('theme-color')).toEqual([expect.stringMatching(/^#[0-9a-f]{6}$/)]);
  });

  it('uses its Tile picture as the favicon, and a touch icon that exists', () => {
    expect(page.link('icon')).toEqual([icon]);
    const touchIcons = page.link('apple-touch-icon');
    expect(touchIcons).toHaveLength(1);
    expect(existsSync(fileFor(touchIcons[0]!, slug)), touchIcons[0]).toBe(true);
  });

  // Anything else a Game uses is imported from src/assets/ (ADR 0005).
  it('links only its own public files and site files', () => {
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (url === script) continue;
      const own = !!slug && url!.startsWith(`/${slug}/`);
      const site = /^\/[^/]+$/.test(url!);
      expect((own || site) && existsSync(fileFor(url!, slug)), url).toBe(true);
    }
  });

  it('leaves the manifest to the site-wide app (ADR 0002)', () => {
    expect(page.link('manifest')).toEqual([]);
  });

  it('loads its own code into #app', () => {
    expect(page.scripts).toEqual([script]);
    expect(page.hasApp).toBe(true);
  });
});
