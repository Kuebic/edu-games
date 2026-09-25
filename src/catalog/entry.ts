// A Game's Catalog entry: games/<slug>/game.json. Pure (no DOM, no fs), so the Hub,
// the Vite plugin and the tests all read entries the same way.
import { CATEGORIES, type CategoryId } from './categories.ts';

export interface Game {
  /** The folder name. Used in the Game's address and saved progress, so it never changes. */
  slug: string;
  name: string;
  category: CategoryId;
  /** Tile picture: a file in the Game's public/ folder, shown at /<slug>/<tile>. */
  tile: string;
  /** YYYY-MM-DD. Tiles sit oldest first, so a new Game never moves a familiar Tile. */
  added: string;
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Folder names that would collide with the build's output or the dev server's paths. */
const RESERVED = ['assets', 'games', 'src', 'public', 'scripts'];
const KEYS = ['name', 'category', 'tile', 'added'];

/** Checks one game.json. Throws an error that names the file. */
export function parseEntry(slug: string, raw: unknown): Game {
  const fail = (why: string): never => {
    throw new Error(`games/${slug}/game.json: ${why}`);
  };
  if (!SLUG.test(slug) || RESERVED.includes(slug)) fail(`"${slug}" can't be a Game's folder name`);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) fail('not a JSON object');
  const entry = raw as Record<string, unknown>;
  for (const key of Object.keys(entry)) if (!KEYS.includes(key)) fail(`unknown field "${key}"`);
  if (typeof entry.name !== 'string' || !entry.name) fail('"name" is missing');
  if (!CATEGORIES.some((c) => c.id === entry.category)) {
    fail(`"category" must be one of ${CATEGORIES.map((c) => c.id).join(', ')}`);
  }
  if (typeof entry.tile !== 'string' || !entry.tile) fail('"tile" is missing');
  if (typeof entry.added !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.added)) fail('"added" must be YYYY-MM-DD');
  return { slug, ...(entry as Omit<Game, 'slug'>) };
}

/** Oldest first, then by slug. */
export function byAdded(a: Game, b: Game): number {
  return a.added.localeCompare(b.added) || a.slug.localeCompare(b.slug);
}
