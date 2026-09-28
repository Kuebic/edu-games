// Builds the pictures: src/assets/pictures/<money>-<side>.webp, heads and tails of each kind of money,
// from free photos on Wikimedia Commons (credits: docs/credits.md). The coins are one photographer's set,
// shot under the same light on white; each is trimmed, cut to a circle and made 360 px. The dollar bill's
// scans are made 480 px wide, one side to a file (ADR 0003).
// Usage: npm run game piggy-bank pictures
// Needs ImageMagick 7 (`magick`). Raw files go in scripts/raw/ (gitignored, not shipped).
// Change a source here and in docs/credits.md together.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE_PATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const USER_AGENT = 'edu-games-pictures/1.0 (https://github.com/kuebic/edu-games)';

/** Each picture's file on Commons. */
const SOURCES: Record<string, string> = {
  'penny-heads': 'Penny Head (Front) (3600131465).jpg',
  'penny-tails': 'Penny Tail (Back) (3600942160).jpg',
  'nickel-heads': 'Older Nickle Head (Front) (3600941488).jpg',
  'nickel-tails': 'Nickle Tail (Back) (3600941044).jpg',
  'dime-heads': 'Dime Head (Front) (3600981182).jpg',
  'dime-tails': 'Dime Tail (Back) (3600981098).jpg',
  'quarter-heads': 'Newer Quarter Head (Front) (3600939280).jpg',
  'quarter-tails': 'Old Quarter Tail (Back) (3600940260).jpg',
  'dollar-heads': 'Obverse of the series 2021 $1 Federal Reserve Note.jpg',
  'dollar-tails': 'Reverse of the series 2021 $1 Federal Reserve Note.jpg',
};

const COIN = 360;
const BILL = 480;

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const rawDir = here('./raw/');
const outDir = here('../src/assets/pictures/');
const rawFile = (name: string) => join(rawDir, name + extname(SOURCES[name]!));

function magick(args: string[]): void {
  const run = spawnSync('magick', args, { encoding: 'utf8' });
  if (run.error) throw new Error(`magick didn't run (is ImageMagick 7 installed?): ${run.error.message}`);
  if (run.status !== 0) throw new Error(`magick failed:\n${run.stderr}`);
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(name: string): Promise<void> {
  const url = FILE_PATH + encodeURIComponent(SOURCES[name]!);
  let response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (response.status === 429) {
    await pause(1000 * Number(response.headers.get('retry-after') ?? 10));
    response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  }
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  writeFileSync(rawFile(name), Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded ${SOURCES[name]}`);
}

function build(name: string): void {
  const out = join(outDir, `${name}.webp`);
  if (name.startsWith('dollar')) {
    magick([rawFile(name), '-fuzz', '10%', '-trim', '+repage', '-resize', `${BILL}x`, '-strip', '-quality', '80', out]);
    return;
  }
  // Trim the white, square it up, then keep only the coin's circle.
  const r = COIN / 2;
  magick([
    rawFile(name), '-fuzz', '12%', '-trim', '+repage',
    '-gravity', 'center', '-background', 'white', '-extent', '%[fx:max(w,h)]x%[fx:max(w,h)]', '-resize', `${COIN}x${COIN}`,
    '(', '+clone', '-alpha', 'extract', '-fill', 'black', '-colorize', '100', '-fill', 'white', '-draw', `circle ${r},${r} ${r},2`, ')',
    '-alpha', 'off', '-compose', 'copyopacity', '-composite', '-strip', '-quality', '82', out,
  ]);
}

mkdirSync(rawDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
for (const name of Object.keys(SOURCES)) {
  if (existsSync(rawFile(name))) continue;
  await download(name);
  await pause(1500);
}
for (const name of Object.keys(SOURCES)) {
  build(name);
  console.log(`${name}.webp  ${(statSync(join(outDir, `${name}.webp`)).size / 1024).toFixed(0)} KB`);
}
