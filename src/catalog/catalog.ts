// Browser side of the Catalog: every games/*/game.json, gathered at build time.
import { byAdded, parseEntry, type Game } from './entry.ts';

const entries = import.meta.glob<unknown>('/games/*/game.json', { eager: true, import: 'default' });

/** Every Game, oldest first. */
export const GAMES: readonly Game[] = Object.entries(entries)
  .map(([path, raw]) => parseEntry(path.split('/')[2]!, raw))
  .sort(byAdded);

export { CATEGORIES, type Category, type CategoryId } from './categories.ts';
export type { Game } from './entry.ts';
