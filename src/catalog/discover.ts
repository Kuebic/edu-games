// Node side of the Catalog: the Vite plugin and the tests find Games by scanning games/.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { byAdded, parseEntry, type Game } from './entry.ts';

/** Every folder in gamesDir with a game.json, oldest first. */
export function discoverGames(gamesDir: string): Game[] {
  return readdirSync(gamesDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && existsSync(join(gamesDir, dir.name, 'game.json')))
    .map((dir) => parseEntry(dir.name, JSON.parse(readFileSync(join(gamesDir, dir.name, 'game.json'), 'utf8'))))
    .sort(byAdded);
}
