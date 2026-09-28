// Builds the Word clips: src/assets/words/<word>.mp3, one per color and shape, from free recordings on
// Wikimedia Commons (credits: docs/word-credits.md): ten from one speaker, and the two they never recorded
// from another. Each is trimmed of silence, levelled, faded, and starts with LEAD_MS of silence. Each was
// also run through speech recognition: another speaker's "orange" came out as "all right".
// Usage: npm run game tidy-up words [words...]    e.g. `npm run game tidy-up words red blue`
// Needs ffmpeg. Raw files go in scripts/raw/ (gitignored, not shipped); a missing one is downloaded.
// Change a source here and in docs/word-credits.md together.
//
// MP3, not the site's Ogg: Safari decodes Ogg Vorbis only from iOS 18.4, and these clips are the Game.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE_PATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
// Commons asks for a User-Agent that says who's calling.
const USER_AGENT = 'edu-games-words/1.0 (https://github.com/kuebic/edu-games)';

const grendelkhan = (word: string) => `LL-Q1860 (eng)-Grendelkhan-${word}.wav`;

/** Each word's file on Commons. */
const SOURCES: Record<string, string> = {
  red: grendelkhan('red'),
  blue: grendelkhan('blue'),
  yellow: grendelkhan('yellow'),
  green: grendelkhan('green'),
  orange: grendelkhan('orange'),
  pink: grendelkhan('pink'),
  circle: grendelkhan('circle'),
  square: grendelkhan('square'),
  star: grendelkhan('star'),
  heart: grendelkhan('heart'),
  // Grendelkhan never recorded these two on their own; one Wiktionary speaker did both.
  purple: 'En-us-purple.ogg',
  triangle: 'En-us-triangle.ogg',
};

const LOUDNESS = -18; // mean dBFS, as My Letter's Letter sounds; the site's cheer is about -15
const PEAK = 0.89; // limiter ceiling, about -1 dBFS
const FADE = 0.03;
// Silence in front of every clip: iOS drops the first moments of a clip as its audio wakes.
const LEAD_MS = 150;

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const rawDir = here('./raw/');
const outDir = here('../src/assets/words/');
const rawFile = (word: string) => join(rawDir, word + extname(SOURCES[word]!));

function ffmpeg(args: string[]): string {
  const run = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-y', ...args], { encoding: 'utf8' });
  if (run.error) throw new Error(`ffmpeg didn't run (is it installed?): ${run.error.message}`);
  if (run.status !== 0) throw new Error(`ffmpeg failed:\n${run.stderr}`);
  return run.stderr;
}

/** Mean and peak level, in dBFS. */
function levels(file: string): { mean: number; max: number } {
  const log = ffmpeg(['-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
  const read = (name: string) => Number(new RegExp(`${name}: (-?[\\d.]+) dB`).exec(log)?.[1] ?? NaN);
  return { mean: read('mean_volume'), max: read('max_volume') };
}

/** Length in seconds. */
function duration(file: string): number {
  const run = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return Number(run.stdout.trim());
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(word: string): Promise<void> {
  const url = FILE_PATH + encodeURIComponent(SOURCES[word]!);
  let response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  // Commons turns away quick runs of requests; wait as long as it asks, once.
  if (response.status === 429) {
    await pause(1000 * Number(response.headers.get('retry-after') ?? 10));
    response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  }
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  writeFileSync(rawFile(word), Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded ${SOURCES[word]}`);
}

function build(word: string, work: string): void {
  const mono = join(work, `${word}-mono.wav`);
  ffmpeg(['-i', rawFile(word), '-af', 'aformat=channel_layouts=mono,aresample=44100,highpass=f=70', mono]);

  // Trim the silence at both ends, relative to the clip's own peak, then fade.
  const { max } = levels(mono);
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01';
  const shaped = join(work, `${word}-shaped.wav`);
  ffmpeg(['-i', mono, '-af', [`volume=${-max}dB`, trim, 'areverse', trim, `afade=t=in:d=${FADE}`, 'areverse', `afade=t=in:d=${FADE}`].join(','), shaped]);

  const { mean } = levels(shaped);
  const out = join(outDir, `${word}.mp3`);
  ffmpeg(['-i', shaped, '-af', `volume=${LOUDNESS - mean}dB,alimiter=limit=${PEAK}:level=false,adelay=${LEAD_MS}`,
    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-id3v2_version', '0', out]);
}

const wanted = process.argv.slice(2).filter((a) => a !== '--').map((a) => a.toLowerCase());
const words = wanted.length ? wanted : Object.keys(SOURCES);
const unknown = words.filter((w) => !SOURCES[w]);
if (unknown.length) {
  console.error(`No source for ${unknown.join(', ')}. Words: ${Object.keys(SOURCES).join(' ')}`);
  process.exit(1);
}

mkdirSync(rawDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
for (const word of words) {
  if (existsSync(rawFile(word))) continue;
  await download(word);
  await pause(1500);
}

const work = mkdtempSync(join(tmpdir(), 'tidy-up-words-'));
try {
  for (const word of words) {
    build(word, work);
    const out = join(outDir, `${word}.mp3`);
    const { mean, max } = levels(out);
    console.log(`${word}.mp3  ${duration(out).toFixed(3)} s  mean ${mean} dB  peak ${max} dB`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
