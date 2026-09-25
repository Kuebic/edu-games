// Runs a Game task: npm run game [<slug> [<task> [args...]]].
// A task is games/<slug>/scripts/<task>.ts. With no task, lists the tasks.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { discoverGames } from '../src/catalog/discover.ts';

const gamesDir = new URL('../games/', import.meta.url);
const slugs = discoverGames(fileURLToPath(gamesDir))
  .map((game) => game.slug)
  .sort();

function tasksOf(slug: string): string[] {
  const dir = new URL(`${slug}/scripts/`, gamesDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

const listing = (slug: string) => `${slug}: ${tasksOf(slug).join(', ') || '(no tasks)'}`;

const [slug, task, ...args] = process.argv.slice(2);
if (!slug) {
  for (const s of slugs) console.log(listing(s));
  process.exit(0);
}
if (!slugs.includes(slug)) {
  console.error(`No Game "${slug}". Games: ${slugs.join(', ')}`);
  process.exit(1);
}
if (!task) {
  console.log(listing(slug));
  process.exit(0);
}
if (!tasksOf(slug).includes(task)) {
  console.error(`No task "${task}" for ${slug}. ${listing(slug)}`);
  process.exit(1);
}
const file = fileURLToPath(new URL(`${slug}/scripts/${task}.ts`, gamesDir));
const run = spawnSync('npx', ['vite-node', file, ...args], { stdio: 'inherit' });
process.exit(run.status ?? 1);
