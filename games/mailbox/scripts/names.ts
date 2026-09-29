// Builds the Name clips: src/assets/names/<letter>.mp3, each letter's name, a to z, from one speaker:
// tim.kahn's "The Alphabet" pack on Freesound (pack 4371), CC BY 4.0 (credits: docs/credits.md). Freesound
// serves each sound's preview without a login; the preview is an MP3 of the original. Each is trimmed of
// silence, levelled, faded, and starts with LEAD_MS of silence, as Tidy Up's Words are.
// Usage: npm run game mailbox names [letters...]    e.g. `npm run game mailbox names a b`
// Needs ffmpeg. Raw files go in scripts/raw/ (gitignored, not shipped); a missing one is downloaded.
// Change the source here and in docs/credits.md together.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LETTERS = [...'abcdefghijklmnopqrstuvwxyz'];
/** Freesound's id of "a.wav"; the pack's other letters follow it in order, to z at 67737. */
const FIRST_ID = 67712;
const preview = (letter: string) => {
  const id = FIRST_ID + LETTERS.indexOf(letter);
  return `https://cdn.freesound.org/previews/${Math.floor(id / 1000)}/${id}_7037-hq.mp3`;
};
const USER_AGENT = 'edu-games-names/1.0 (https://github.com/kuebic/edu-games)';

const LOUDNESS = -18; // mean dBFS, as Tidy Up's Words and My Letter's Letter sounds
const PEAK = 0.89; // limiter ceiling, about -1 dBFS
const FADE = 0.03;
/** A pause this long and this quiet (dB under the peak) ends the name. */
const GAP_S = 0.2;
const GAP_DB = -32;
const TAIL = 0.06;
// Silence in front of every clip: iOS drops the first moments of a clip as its audio wakes.
const LEAD_MS = 150;

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const rawDir = here('./raw/');
const outDir = here('../src/assets/names/');
const rawFile = (letter: string) => join(rawDir, `${letter}.mp3`);

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

async function download(letter: string): Promise<void> {
  const response = await fetch(preview(letter), { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} for ${preview(letter)}`);
  writeFileSync(rawFile(letter), Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded ${letter}.wav`);
}

function build(letter: string, work: string): void {
  const mono = join(work, `${letter}-mono.wav`);
  ffmpeg(['-i', rawFile(letter), '-af', 'aformat=channel_layouts=mono,aresample=44100,highpass=f=70', mono]);

  // Trim the silence at both ends, relative to the clip's own peak, then fade.
  const { max } = levels(mono);
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01';
  const shaped = join(work, `${letter}-shaped.wav`);
  ffmpeg(['-i', mono, '-af', [`volume=${-max}dB`, trim, 'areverse', trim, `afade=t=in:d=${FADE}`, 'areverse', `afade=t=in:d=${FADE}`].join(','), shaped]);

  // The recordings run on after the name with breaths and room noise. Keep the name only: up to the first
  // pause of GAP_S under GAP_DB, with a little tail, faded again.
  const log = ffmpeg(['-i', shaped, '-af', `silencedetect=n=${GAP_DB}dB:d=${GAP_S}`, '-f', 'null', '-']);
  const end = [...log.matchAll(/silence_start: ([\d.]+)/g)].map(([, t]) => Number(t)).find((t) => t > 0.1);
  const name = join(work, `${letter}-name.wav`);
  if (end === undefined) ffmpeg(['-i', shaped, name]);
  else ffmpeg(['-i', shaped, '-af', `atrim=end=${end + TAIL},areverse,afade=t=in:d=${TAIL},areverse`, name]);

  const { mean } = levels(name);
  const out = join(outDir, `${letter}.mp3`);
  ffmpeg(['-i', name, '-af', `volume=${LOUDNESS - mean}dB,alimiter=limit=${PEAK}:level=false,adelay=${LEAD_MS}`,
    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-id3v2_version', '0', out]);
}

const wanted = process.argv.slice(2).filter((a) => a !== '--').map((a) => a.toLowerCase());
const letters = wanted.length ? wanted : LETTERS;
const unknown = letters.filter((l) => !LETTERS.includes(l));
if (unknown.length) {
  console.error(`Not a letter: ${unknown.join(', ')}`);
  process.exit(1);
}

mkdirSync(rawDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
for (const letter of letters) {
  if (existsSync(rawFile(letter))) continue;
  await download(letter);
  await pause(1000);
}

const work = mkdtempSync(join(tmpdir(), 'mailbox-names-'));
try {
  for (const letter of letters) {
    build(letter, work);
    const out = join(outDir, `${letter}.mp3`);
    const { mean, max } = levels(out);
    console.log(`${letter}.mp3  ${duration(out).toFixed(3)} s  mean ${mean} dB  peak ${max} dB`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
