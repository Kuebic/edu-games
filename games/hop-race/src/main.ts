import { startGame } from '@shared/shell';
import { grownUpCorner } from '@shared/grownup';
import type { LevelSelectView } from '@shared/level-select';
import { unlockVoice } from '@shared/voice';
import './style.css';
import type { App } from './app';
import { loadProgress } from './progress';
import { playScreen } from './screens/play';
import { showSelect } from './screens/select';

// Browsers only start the Voice after a touch.
const { root, storage } = startGame('hop-race', { unlock: unlockVoice });
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

const corner = grownUpCorner(root, progress, {
  voice: true,
  note:
    'Say the numbers out loud with your child as the animals hop: "four, five!". Naming the square you land on is what teaches. ' +
    'Hop Race is the race game from Siegler and Ramani\'s studies: preschoolers who played it on a straight track from 1 to 10 ' +
    'got better at counting and at telling which number is bigger. ' +
    'To 5 is a short track to learn spinning and hopping. To 10 is the whole track. Who\'s ahead asks which animal is further along between turns. ' +
    'Nobody loses: the race ends when your child\'s animal is home. Races open in order, and Next goes on to the next one. ' +
    'Your child picks their animal on the first screen.',
  closed: () => select?.redraw(),
});

const app: App = {
  root,
  progress,
  groups: (track) =>
    show(() => {
      select = showSelect(app, track);
      return select.leave;
    }),
  play: (track, race) => show(() => playScreen(app, track, race)),
  corner,
};

app.groups();
