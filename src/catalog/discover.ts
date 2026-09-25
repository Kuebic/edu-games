// Node side of the Catalog: the Vite plugin, the tests and the task runner find Games by scanning games/.
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

/** Every file under a folder, as absolute paths; none if the folder doesn't exist. */
export const filesIn = (dir: string): string[] =>
  !existsSync(dir)
    ? []
    : readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => join(entry.parentPath, entry.name));
