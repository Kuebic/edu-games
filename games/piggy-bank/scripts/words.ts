// Builds the Word clips: src/assets/words/<money>.mp3, one per kind of money, from free recordings on
// Wikimedia Commons (credits: docs/credits.md). Nobody there recorded a US "dime" on its own, so it's
// joined from two of Grendelkhan's words: the "d" of "die" and the "ime" of "crime" (ADR 0002). Speech
// recognition heard the join as "dime" in every cut tried. Each clip is trimmed of silence, levelled,
// faded, and starts with LEAD_MS of silence, as Tidy Up's Words are.
// Usage: npm run game piggy-bank words [words...]    e.g. `npm run game piggy-bank words dime`
// Needs ffmpeg. Raw files go in scripts/raw/ (gitignored, not shipped); a missing one is downloaded.
// Change a source here and in docs/credits.md together.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE_PATH = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
// Commons asks for a User-Agent that says who's calling.
const USER_AGENT = 'edu-games-words/1.0 (https://github.com/kuebic/edu-games)';

const grendelkhan = (word: string) => `LL-Q1860 (eng)-Grendelkhan-${word}.wav`;

/** Each recording on Commons, by the name it's saved under in raw/. */
const FILES: Record<string, string> = {
  penny: grendelkhan('penny'),
  quarter: grendelkhan('quarter'),
  dollar: grendelkhan('dollar'),
  // Grendelkhan never recorded nickel; one Wiktionary speaker did.
  nickel: 'En-us-nickel.ogg',
  die: grendelkhan('die'),
  crime: grendelkhan('crime'),
};

/** A Word from a stretch of one recording, or from stretches joined; times in ms from the file's start. */
type Part = { file: string; from?: number; to?: number };
const WORDS: Record<string, Part[]> = {
  penny: [{ file: 'penny' }],
  nickel: [{ file: 'nickel' }],
  dime: [
    { file: 'die', from: 240, to: 290 },
    { file: 'crime', from: 300 },
  ],
  quarter: [{ file: 'quarter' }],
  dollar: [{ file: 'dollar' }],
};

const RATE = 44100;
/** Where two parts meet, they cross-fade over this many ms. */
const JOIN_MS = 8;
const LOUDNESS = -18; // mean dBFS, as Tidy Up's Words
const PEAK = 0.89; // limiter ceiling, about -1 dBFS
const FADE = 0.03;
// Silence in front of every clip: iOS drops the first moments of a clip as its audio wakes.
const LEAD_MS = 150;

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const rawDir = here('./raw/');
const outDir = here('../src/assets/words/');
const rawFile = (name: string) => join(rawDir, name + extname(FILES[name]!));

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

async function download(name: string): Promise<void> {
  const url = FILE_PATH + encodeURIComponent(FILES[name]!);
  let response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  // Commons turns away quick runs of requests; wait as long as it asks, once.
  if (response.status === 429) {
    await pause(1000 * Number(response.headers.get('retry-after') ?? 10));
    response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  }
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  writeFileSync(rawFile(name), Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded ${FILES[name]}`);
}

/** A recording as mono samples at RATE. */
function samples(name: string, work: string): Float32Array {
  const raw = join(work, `${name}.f32`);
  ffmpeg(['-i', rawFile(name), '-ac', '1', '-ar', String(RATE), '-f', 'f32le', raw]);
  const bytes = readFileSync(raw);
  return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
}

/** The Word's parts, cut and cross-faded into one mono WAV. */
function joined(word: string, work: string): string {
  const at = (ms: number) => Math.round((ms * RATE) / 1000);
  const fade = at(JOIN_MS);
  let out = new Float32Array(0);
  for (const part of WORDS[word]!) {
    const all = samples(part.file, work);
    const piece = all.subarray(at(part.from ?? 0), part.to === undefined ? all.length : at(part.to));
    if (out.length === 0) {
      out = piece.slice();
      continue;
    }
    const next = new Float32Array(out.length + piece.length - fade);
    next.set(out);
    for (let i = 0; i < piece.length; i++) {
      const j = out.length - fade + i;
      next[j] = i < fade ? out[j]! * (1 - i / fade) + piece[i]! * (i / fade) : piece[i]!;
    }
    out = next;
  }
  const raw = join(work, `${word}-joined.f32`);
  writeFileSync(raw, Buffer.from(out.buffer));
  const wav = join(work, `${word}-joined.wav`);
  ffmpeg(['-f', 'f32le', '-ar', String(RATE), '-ac', '1', '-i', raw, wav]);
  return wav;
}

function build(word: string, work: string): void {
  const mono = join(work, `${word}-mono.wav`);
  ffmpeg(['-i', joined(word, work), '-af', 'highpass=f=70', mono]);

  // Trim the silence at both ends, relative to the clip's own peak, then fade.
  const { max } = levels(mono);
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01';
  const shaped = join(work, `${word}-shaped.wav`);
  ffmpeg(['-i', mono, '-af', [`volume=${-max}dB`, trim, 'areverse', trim, `afade=t=in:d=${FADE}`, 'areverse', `afade=t=in:d=${FADE}`].join(','), shaped]);

  const { mean } = levels(shaped);
  const out = join(outDir, `${word}.mp3`);
  ffmpeg(['-i', shaped, '-af', `volume=${LOUDNESS - mean}dB,alimiter=limit=${PEAK}:level=false,adelay=${LEAD_MS}`,
    '-ac', '1', '-ar', String(RATE), '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-id3v2_version', '0', out]);
}

const wanted = process.argv.slice(2).filter((a) => a !== '--').map((a) => a.toLowerCase());
const words = wanted.length ? wanted : Object.keys(WORDS);
const unknown = words.filter((w) => !WORDS[w]);
if (unknown.length) {
  console.error(`No source for ${unknown.join(', ')}. Words: ${Object.keys(WORDS).join(' ')}`);
  process.exit(1);
}

mkdirSync(rawDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
for (const name of new Set(words.flatMap((w) => WORDS[w]!.map((p) => p.file)))) {
  if (existsSync(rawFile(name))) continue;
  await download(name);
  await pause(1500);
}

const work = mkdtempSync(join(tmpdir(), 'piggy-bank-words-'));
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
