// Builds the Letter sound clips (ADR 0001): src/assets/sounds/<letter>.mp3 from Curious Learning's
// Feed The Monster US English letter sounds, one native US English voice (credits: docs/sound-credits.md).
// Each is trimmed of silence, levelled and faded, and starts with LEAD_MS of silence. A stop that carries
// a long vowel ("buh") is cut down to its release and a breath of the vowel. A clip still shorter than
// TWICE_UNDER is said twice with a GAP, "b … b", so it can be heard.
// Usage: npm run game my-letter sounds [letters...]    e.g. `npm run game my-letter sounds b d`
// Needs ffmpeg. Raw files go in scripts/raw/ (gitignored, not shipped); a missing one is downloaded.
// Change a source here and in docs/sound-credits.md together.
//
// MP3, not the site's Ogg: Safari decodes Ogg Vorbis only from iOS 18.4, and these clips are the Game.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Pinned to the commit the files were last changed in, so a rebuild gets the same recordings.
const SOURCE = 'https://raw.githubusercontent.com/curiouslearning/ftm-languagepacks/b0f50baf7ee6c3b6cac9ecd9e5488f6249bab0ea/USENGLISH/sounds/letters/';

/** A raw file, optionally cut to seconds [from, to]; fades in seconds (a stop's burst needs a short fade in). */
type Clip = { file: string; from?: number; to?: number; fadeIn?: number; fadeOut?: number };

// Seconds measured on the raw files (voicing and silence), not by ear. Stops end ~90 ms into the vowel
// with a fade over it, so "b" keeps a breath of vowel instead of "buh"; P and T end as their voicing starts.
const stop = (letter: string, from: number, to: number, fadeOut = 0.05): Clip => ({ file: `${letter}.WAV`, from, to, fadeIn: 0.005, fadeOut });

// Every letter's file as it is, except the stops, cut, and Q.
const CLIPS: Record<string, Clip> = {
  ...Object.fromEntries([...'abcdefghijklmnopqrstuvwxyz'].map((letter) => [letter, { file: `${letter}.WAV` }])),
  b: stop('b', 0.01, 0.115), // release 0.015, vowel to 0.26
  d: stop('d', 0.035, 0.165), // release 0.04, vowel 0.07 to 0.30
  g: stop('g', 0.05, 0.18), // release 0.055, vowel 0.085 to 0.36
  k: stop('k', 0, 0.18), // aspiration to 0.085, vowel to 0.28
  p: stop('p', 0, 0.06, 0.02), // burst and aspiration to 0.045, then vowel to 0.17
  t: stop('t', 0, 0.085, 0.02), // burst and aspiration to 0.075, then vowel to 0.15
  q: { file: 'qu.WAV' }, // /kw/ and a short vowel; there's no q.WAV
};

const LOUDNESS = -18; // mean dBFS of every clip; the site's cheer is about -15
const PEAK = 0.89; // limiter ceiling, about -1 dBFS
const FADE = 0.03;
const GAP = 0.25; // between the two of a clip said twice
const TWICE_UNDER = 0.25; // seconds: a clip shorter than this, lead-in aside, is said twice
// Silence in front of every clip. iOS switches its audio over from the Voice when a clip starts and
// drops the first moments of it, which was a whole stop.
const LEAD_MS = 150;

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const rawDir = here('./raw/');
const outDir = here('../src/assets/sounds/');

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

async function download(file: string): Promise<void> {
  const response = await fetch(SOURCE + file);
  if (!response.ok) throw new Error(`${response.status} for ${SOURCE + file}`);
  writeFileSync(join(rawDir, file), Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded ${file}`);
}

/** Length in seconds. */
function duration(file: string): number {
  const run = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return Number(run.stdout.trim());
}

/** Builds one clip and says whether it's said twice. */
function build(letter: string, clip: Clip, work: string): boolean {
  const cutTo = clip.from !== undefined || clip.to !== undefined ? `,atrim=${clip.from ?? 0}${clip.to ? `:${clip.to}` : ''},asetpts=PTS-STARTPTS` : '';
  const cut = join(work, `${letter}-cut.wav`);
  ffmpeg(['-i', join(rawDir, clip.file), '-af', `aformat=channel_layouts=mono,aresample=44100${cutTo},highpass=f=70`, cut]);

  // Trim what's left of the silence at both ends, relative to the clip's own peak, then fade.
  const { max } = levels(cut);
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.005';
  const fadeIn = clip.fadeIn ?? FADE, fadeOut = clip.fadeOut ?? FADE;
  const shaped = join(work, `${letter}-shaped.wav`);
  ffmpeg(['-i', cut, '-af', [
    `volume=${-max}dB`, trim, 'areverse', trim, `afade=t=in:d=${fadeOut}`, 'areverse', `afade=t=in:d=${fadeIn}`,
  ].join(','), shaped]);

  const twice = duration(shaped) < TWICE_UNDER;
  const { mean } = levels(shaped);
  const out = join(outDir, `${letter}.mp3`);
  const level = `volume=${LOUDNESS - mean}dB,alimiter=limit=${PEAK}:level=false`;
  const said = twice ? `${level},asplit[a][b];[a]apad=pad_dur=${GAP}[a2];[a2][b]concat=n=2:v=0:a=1` : level;
  ffmpeg(['-i', shaped, '-filter_complex', `[0:a]${said},adelay=${LEAD_MS}[out]`, '-map', '[out]',
    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-id3v2_version', '0', out]);
  return twice;
}

const wanted = process.argv.slice(2).filter((a) => a !== '--').map((a) => a.toLowerCase());
const letters = wanted.length ? wanted : Object.keys(CLIPS);
const unknown = letters.filter((l) => !CLIPS[l]);
if (unknown.length) {
  console.error(`No clip for ${unknown.join(', ')}. Letters: ${Object.keys(CLIPS).join(' ')}`);
  process.exit(1);
}

mkdirSync(rawDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
const files = new Set(letters.map((l) => CLIPS[l]!.file));
for (const file of files) if (!existsSync(join(rawDir, file))) await download(file);

const work = mkdtempSync(join(tmpdir(), 'my-letter-sounds-'));
try {
  for (const letter of letters) {
    const twice = build(letter, CLIPS[letter]!, work);
    const out = join(outDir, `${letter}.mp3`);
    const { mean, max } = levels(out);
    console.log(`${letter}.mp3  ${duration(out).toFixed(3)} s${twice ? ' (said twice)' : ''}  mean ${mean} dB  peak ${max} dB`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
