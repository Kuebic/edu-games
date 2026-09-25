import type { CategoryId, Game } from '../catalog/catalog';

/**
 * The Games with a Tile on a Category's Shelf, in Catalog order. Only On Games have
 * one, except on the dev server, which shows every Game so an Off one can be worked on.
 */
export function tilesFor(games: readonly Game[], category: CategoryId, dev: boolean): Game[] {
  return games.filter((game) => game.category === category && (dev || game.shelf === 'on'));
}
