// Builds the Letter sound clips (ADR 0001): src/assets/sounds/<letter>.mp3 from recordings on
// Wikimedia Commons. Each clip is cut out of a raw file (most say the sound in a syllable, "[sa asa]"),
// sometimes slowed so a short /s/ or /m/ lasts, then trimmed of silence, levelled and faded.
// Usage: npm run game my-letter sounds [letters...]    e.g. `npm run game my-letter sounds s m`
// Needs ffmpeg. Raw files go in scripts/raw/ (gitignored, not shipped); a missing one is downloaded.
// Change a source here and in docs/sound-credits.md together.
//
// MP3, not the site's Ogg: Safari decodes Ogg Vorbis only from iOS 18.4, and these clips are the Game.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Seconds [from, to] of one raw file; `slow` < 1 stretches it (ffmpeg atempo, 0.5 at most). */
type Part = { file: string; from: number; to: number; slow?: number };
/**
 * A clip is one or more parts played back to back; fades in seconds (a stop's burst needs a short fade in).
 * `twice` says it again after a short gap: a stop alone lasts about a tenth of a second, too short to hear.
 */
type Clip = { parts: Part[]; fadeIn?: number; fadeOut?: number; twice?: boolean };

const ISOTALO = {
  b: 'Voiced bilabial plosive.ogg',
  d: 'Voiced alveolar plosive.ogg',
  g: 'Voiced velar plosive.ogg',
  p: 'Voiceless bilabial plosive.ogg',
  t: 'Voiceless alveolar plosive.ogg',
  k: 'Voiceless velar plosive.ogg',
  h: 'Voiceless glottal fricative.ogg',
  l: 'Alveolar lateral approximant.ogg',
  m: 'Bilabial nasal.ogg',
  n: 'Alveolar nasal.ogg',
  s: 'Voiceless alveolar sibilant.ogg',
  v: 'Voiced labiodental fricative.ogg',
  w: 'Voiced labio-velar approximant.ogg',
  y: 'Palatal approximant.ogg',
  z: 'Voiced alveolar sibilant.ogg',
};

// A stop: from just before the release to ~130 ms after it, fading out over the start of the vowel
// it was said with, so it's "b" with only a breath of "buh". Said twice, "b … b", as phonics teachers do.
const stop = (file: string, from: number, to: number): Clip => ({ parts: [{ file, from, to }], fadeIn: 0.005, fadeOut: 0.07, twice: true });
const vowel = (file: string, from: number, to: number): Clip => ({ parts: [{ file, from, to }], fadeOut: 0.06 });
const kBurst: Part = { file: ISOTALO.k, from: 0.185, to: 0.222 }; // release and aspiration of [ka], no vowel

const CLIPS: Record<string, Clip> = {
  a: vowel('Near-open front unrounded vowel.ogg', 0, 0.53),
  b: stop(ISOTALO.b, 0.185, 0.32),
  c: stop(ISOTALO.k, 0.185, 0.315),
  d: stop(ISOTALO.d, 0.19, 0.325),
  e: vowel('Open-mid front unrounded vowel(ɛ).ogg', 0, 0.56),
  f: { parts: [{ file: 'PR-voiceless labiodental fricative.ogg', from: 0.1, to: 0.252, slow: 0.6 }] },
  g: stop(ISOTALO.g, 0.19, 0.325),
  h: { parts: [{ file: ISOTALO.h, from: 0.19, to: 0.465 }] },
  i: vowel('Near-close near-front unrounded vowel.ogg', 0.02, 0.52),
  j: { parts: [{ file: 'Voiced palato-alveolar affricate.ogg', from: 0.04, to: 0.17 }], fadeIn: 0.005, fadeOut: 0.05, twice: true },
  k: stop(ISOTALO.k, 0.185, 0.315),
  l: { parts: [{ file: ISOTALO.l, from: 0.2, to: 0.47, slow: 0.8 }] },
  m: { parts: [{ file: ISOTALO.m, from: 0.19, to: 0.375, slow: 0.55 }] },
  n: { parts: [{ file: ISOTALO.n, from: 0.225, to: 0.49, slow: 0.8 }] },
  o: vowel('Open back rounded vowel.ogg', 0.02, 0.55),
  p: stop(ISOTALO.p, 0.575, 0.705),
  q: { parts: [kBurst, { file: ISOTALO.w, from: 0, to: 0.22 }], fadeIn: 0.005, fadeOut: 0.04 },
  r: { parts: [{ file: 'Alveolar approximant.ogg', from: 0.28, to: 0.47, slow: 0.7 }] },
  s: { parts: [{ file: ISOTALO.s, from: 0.225, to: 0.435, slow: 0.6 }] },
  t: stop(ISOTALO.t, 0.2, 0.33),
  u: vowel('Open-mid back unrounded vowel.ogg', 0.02, 0.46),
  v: { parts: [{ file: ISOTALO.v, from: 0.235, to: 0.46, slow: 0.8 }] },
  w: { parts: [{ file: ISOTALO.w, from: 0, to: 0.22 }], fadeOut: 0.04 },
  x: { parts: [kBurst, { file: ISOTALO.s, from: 0.225, to: 0.435, slow: 0.75 }], fadeIn: 0.005 },
  y: { parts: [{ file: ISOTALO.y, from: 0.245, to: 0.43 }], fadeOut: 0.04 },
  z: { parts: [{ file: ISOTALO.z, from: 0.18, to: 0.405, slow: 0.7 }] },
};

const LOUDNESS = -18; // mean dBFS of every clip; the site's cheer is about -15
const PEAK = 0.89; // limiter ceiling, about -1 dBFS
const FADE = 0.03;
const GAP = 0.25; // between the two of a clip said twice
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
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': 'edu-games my-letter sounds task (https://github.com/kuebic/edu-games)' } });
    if (response.ok) {
      writeFileSync(join(rawDir, file), Buffer.from(await response.arrayBuffer()));
      console.log(`downloaded ${file}`);
      return;
    }
    // Commons rate-limits scripts: wait and try again.
    if (response.status !== 429 || attempt === 5) throw new Error(`${response.status} for ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
  }
}

function build(letter: string, clip: Clip, work: string): void {
  const inputs = clip.parts.flatMap((part) => ['-i', join(rawDir, part.file)]);
  const cuts = clip.parts.map((part, i) => {
    const slow = part.slow ? `,atempo=${part.slow}` : '';
    return `[${i}:a]aformat=channel_layouts=mono,aresample=44100,atrim=${part.from}:${part.to},asetpts=PTS-STARTPTS${slow}[p${i}]`;
  });
  const joined = clip.parts.map((_, i) => `[p${i}]`).join('') + `concat=n=${clip.parts.length}:v=0:a=1`;
  const cut = join(work, `${letter}-cut.wav`);
  ffmpeg([...inputs, '-filter_complex', `${cuts.join(';')};${joined},highpass=f=70[out]`, '-map', '[out]', cut]);

  // Trim what's left of the silence at both ends, relative to the clip's own peak, then fade.
  const { max } = levels(cut);
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.005';
  const fadeIn = clip.fadeIn ?? FADE, fadeOut = clip.fadeOut ?? FADE;
  const shaped = join(work, `${letter}-shaped.wav`);
  ffmpeg(['-i', cut, '-af', [
    `volume=${-max}dB`, trim, 'areverse', trim, `afade=t=in:d=${fadeOut}`, 'areverse', `afade=t=in:d=${fadeIn}`,
  ].join(','), shaped]);

  const { mean } = levels(shaped);
  const out = join(outDir, `${letter}.mp3`);
  const level = `volume=${LOUDNESS - mean}dB,alimiter=limit=${PEAK}:level=false`;
  const said = clip.twice ? `${level},asplit[a][b];[a]apad=pad_dur=${GAP}[a2];[a2][b]concat=n=2:v=0:a=1` : level;
  ffmpeg(['-i', shaped, '-filter_complex', `[0:a]${said},adelay=${LEAD_MS}[out]`, '-map', '[out]',
    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-id3v2_version', '0', out]);
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
const files = new Set(letters.flatMap((l) => CLIPS[l]!.parts.map((p) => p.file)));
for (const file of files) if (!existsSync(join(rawDir, file))) await download(file);

const work = mkdtempSync(join(tmpdir(), 'my-letter-sounds-'));
try {
  for (const letter of letters) {
    build(letter, CLIPS[letter]!, work);
    const { mean, max } = levels(join(outDir, `${letter}.mp3`));
    console.log(`${letter}.mp3  mean ${mean} dB  peak ${max} dB`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
