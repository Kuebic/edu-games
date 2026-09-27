// Builds the ABC song: src/assets/abc-song.mp3 from Kara - ABCs, a girl singing the Alphabet Song, by
// FourthWoods on Freesound, CC BY 4.0 (credits: docs/sound-credits.md). The long pause after Z is cut
// short, the end's silence trimmed, the loudness levelled, and it starts with LEAD_MS of silence like the
// Letter sounds.
// Usage: npm run game my-letter song
// Needs ffmpeg. The raw file goes in scripts/raw/ (gitignored, not shipped); a missing one is downloaded.
//
// When each letter is sung is in src/song.ts, measured on the file this makes: change PAUSE or LEAD_MS
// here and those times move. MP3 for Safari, as for the Letter sounds.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Freesound's high-quality preview; the original needs a login. The licence covers both.
const SOURCE = 'https://cdn.freesound.org/previews/439/439088_7268008-hq.mp3';
const RAW = 'kara-abcs.mp3';

// Seconds of the raw file cut out: Z is held to 14.1 s and "Now I know" starts at 15.84 s, a pause a
// child could take for the end. This leaves about 0.7 s of it.
const PAUSE = { from: 14.5, to: 15.5 };
const LOUDNESS = -18; // LUFS, about the Letter sounds' level
const PEAK = -1.5; // dBTP
const FADE = 0.3; // seconds, out at the end
const LEAD_MS = 150; // iOS drops the first moments of Web Audio when it switches over from the Voice

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const rawDir = here('./raw/');
const out = here('../src/assets/abc-song.mp3');

function ffmpeg(args: string[]): string {
  const run = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-y', ...args], { encoding: 'utf8' });
  if (run.error) throw new Error(`ffmpeg didn't run (is it installed?): ${run.error.message}`);
  if (run.status !== 0) throw new Error(`ffmpeg failed:\n${run.stderr}`);
  return run.stderr;
}

function duration(file: string): number {
  const run = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return Number(run.stdout.trim());
}

mkdirSync(rawDir, { recursive: true });
const raw = join(rawDir, RAW);
if (!existsSync(raw)) {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`${response.status} for ${SOURCE}`);
  writeFileSync(raw, Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded ${RAW}`);
}

// Trim the silence at the end and fade out what's left, back to front.
const trimEnd = `areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,afade=t=in:d=${FADE},areverse`;
ffmpeg([
  '-i', raw,
  '-filter_complex', [
    '[0:a]aformat=channel_layouts=mono,aresample=44100,highpass=f=70,asplit[a][b]',
    `[a]atrim=0:${PAUSE.from},asetpts=PTS-STARTPTS[head]`,
    `[b]atrim=${PAUSE.to},asetpts=PTS-STARTPTS[tail]`,
    `[head][tail]concat=n=2:v=0:a=1,${trimEnd},loudnorm=I=${LOUDNESS}:TP=${PEAK}:LRA=11,aresample=44100,adelay=${LEAD_MS}[out]`,
  ].join(';'),
  '-map', '[out]', '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-id3v2_version', '0', out,
]);
console.log(`abc-song.mp3  ${duration(out).toFixed(2)} s`);
