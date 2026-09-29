// Builds the Letter font: src/assets/font/mailbox-letters.woff2, the 52 letters A to Z and a to z of SIL's
// Andika Bold, a font made for beginning readers: single-story a and g, and a capital I, l and 1 that don't
// look alike (ADR 0002). The l is Andika's tailed one (its cv39), put in the plain l's place, so no browser
// has to turn a feature on. Cut down to the letters it's a Modified Version under the Open Font License, so
// it can't be called Andika: it's renamed "Mailbox Letters", and the licence ships beside it in docs/.
// Usage: npm run game mailbox font
// Needs Python 3 with fontTools and brotli (`pip install fonttools brotli`). The download goes in
// scripts/raw/ (gitignored, not shipped).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'https://github.com/google/fonts/raw/main/ofl/andika/Andika-Bold.ttf';
const LICENCE = 'https://github.com/google/fonts/raw/main/ofl/andika/OFL.txt';
const FAMILY = 'Mailbox Letters';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const raw = here('./raw/Andika-Bold.ttf');
const out = here('../src/assets/font/mailbox-letters.woff2');
const licence = here('../docs/andika-ofl.txt');

async function fetchTo(url: string, file: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  console.log(`downloaded ${url}`);
}

const PYTHON = `
import sys
from fontTools.ttLib import TTFont
from fontTools import subset

src, dst, family = sys.argv[1:4]
font = TTFont(src)
# The tailed l in the plain l's place.
for table in font['cmap'].tables:
    if ord('l') in table.cmap:
        table.cmap[ord('l')] = 'l.TailL'
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = []
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
sub = subset.Subsetter(options)
sub.populate(text='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
sub.subset(font)
# A Modified Version may not use the Reserved Font Names Andika and SIL.
names = {1: family, 3: family + ' Bold', 4: family + ' Bold', 6: family.replace(' ', '') + '-Bold'}
for record in font['name'].names:
    if record.nameID in names:
        record.string = names[record.nameID]
font['name'].names = [r for r in font['name'].names if r.nameID not in (16, 17)]
font.flavor = 'woff2'
font.save(dst)
`;

mkdirSync(here('./raw/'), { recursive: true });
mkdirSync(here('../src/assets/font/'), { recursive: true });
if (!existsSync(raw)) await fetchTo(SOURCE, raw);
await fetchTo(LICENCE, licence);

const run = spawnSync('python3', ['-c', PYTHON, raw, out, FAMILY], { encoding: 'utf8' });
if (run.error) throw new Error(`python3 didn't run: ${run.error.message}`);
if (run.status !== 0) throw new Error(`the font didn't build (are fonttools and brotli installed?):\n${run.stderr}`);
console.log(`${join('src/assets/font', 'mailbox-letters.woff2')}  ${statSync(out).size} bytes`);
