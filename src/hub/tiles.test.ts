import { describe, expect, it } from 'vitest';
import type { Game } from '../catalog/catalog';
import { tilesFor } from './tiles';

const game = (slug: string, category: Game['category'], shelf: Game['shelf']): Game => ({
  slug,
  name: slug,
  category,
  tile: 'icon.svg',
  shelf,
  added: '2026-01-01',
});

const games = [
  game('a', 'logic', 'on'),
  game('b', 'logic', 'hidden'),
  game('c', 'math', 'on'),
  game('d', 'logic', 'off'),
  game('e', 'logic', 'on'),
];
const slugs = (list: Game[]) => list.map((g) => g.slug);

describe('tilesFor', () => {
  it('shows only On Games on the real site, in Catalog order', () => {
    expect(slugs(tilesFor(games, 'logic', false))).toEqual(['a', 'e']);
  });

  it('shows Hidden and Off Games too on the dev server', () => {
    expect(slugs(tilesFor(games, 'logic', true))).toEqual(['a', 'b', 'd', 'e']);
  });

  it('keeps to one Category', () => {
    expect(slugs(tilesFor(games, 'math', false))).toEqual(['c']);
    expect(tilesFor(games, 'strategy', true)).toEqual([]);
  });

  it('leaves a Shelf empty when none of its Games is On', () => {
    expect(tilesFor([game('b', 'logic', 'hidden'), game('d', 'logic', 'off')], 'logic', false)).toEqual([]);
  });
});
