import { startGame } from '@shared/shell';
import { choiceRow, grownUpCorner } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { WAYS, type BoxKind, type Way } from './rounds';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('find-it', { unlock: unlockVoice });
const progress = loadProgress(storage);
let cleanup: (() => void) | void;
/** The level select while it's up, so the Grown-up Corner can redraw it. */
let select: LevelSelectView | undefined;

function show(screen: () => (() => void) | void): void {
  cleanup?.();
  select = undefined;
  root.replaceChildren();
  cleanup = screen();
}

/** Each Box's Ways as the Corner names them: what's shown, then what's picked. */
const WAY_NAMES: Record<BoxKind, Record<Way, string>> = {
  number: { 'find-symbol': '🫘 → 3', 'find-picture': '3 → 🫘', mix: 'Mix' },
  letter: { 'find-symbol': '🍎 → A', 'find-picture': 'A → 🍎', mix: 'Mix' },
};

const wayRow = (label: string, kind: BoxKind) =>
  choiceRow(label, WAYS.map((id) => ({ id, label: WAY_NAMES[kind][id] })), () => progress.game.ways[kind], (way) => {
    progress.game.ways[kind] = way;
    progress.save();
  });

const corner = grownUpCorner(root, progress, {
  voice: true,
  rows: () => [wayRow('Numbers', 'number'), wayRow('Letters', 'letter')],
  note:
    'Numbers has two rounds: 0 to 10, then 11 to 20. Letters has five: A to E, F to J, K to O, P to T and U to Z. ' +
    'Each round asks six times. Pick which way round for each: 🫘 → 3 shows beans and the child finds the number; ' +
    '3 → 🫘 shows a number and the child finds the tray of beans. 🍎 → A shows a picture and the child finds its first letter; ' +
    'A → 🍎 shows a letter and the child finds a picture that starts with it. Mix takes turns. ' +
    'A wrong pick is named, and the beans are counted aloud. Rounds open in order, and Next goes on to the next one.',
  closed: () => select?.redraw(),
});

const app: App = {
  root,
  progress,
  boxes: (box) =>
    show(() => {
      select = showSelect(app, box);
      return select.leave;
    }),
  play: (box, round) => show(() => playScreen(app, box, round)),
  corner,
};

app.boxes();
