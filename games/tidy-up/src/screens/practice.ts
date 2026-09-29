// Tidy Up's first screen, Practice (the site's ADR 0014): Colors, Shapes and Kinds as Topics, each with
// its Ways, its Ranges and its Scope, and Buckets or Trucks as the Skins of Colors (ADR 0015), saved in the
// Game's slot, and the gear. Colors and Shapes sort into two Bins at least, so Play waits for two items.

import { showPractice, type PracticeGame, type PracticeTopic, type PracticeView } from '@shared/practice';
import type { SkinPicker } from '@shared/skins';
import type { App } from '../app';
import { EASY, KINDS_WAYS, STEP_CHIPS, STEPS, type KindsWay, type Step } from '../kinds';
import { SKINS, SKIN_COLOURS, SKIN_NAMES, type Skin } from '../skins';
import { GLYPHS, RANGES, SORTS, TOPICS, WAYS, type Colour, type ColourWay, type Shape, type ShapeWay, type Sort, type SortTopic, type Topic } from '../sorting';
import { skinPictures, topicBadge } from './icons';

/** Colors in the Math Shelf's orange, Shapes in a sky blue, Kinds in a wood brown. */
export const TOPIC_COLOURS: Readonly<Record<Topic, string>> = { colors: '#ff8a3d', shapes: '#3a9ad9', kinds: '#a86d36' };

const NAMES: Readonly<Record<Topic, string>> = { colors: 'Colors', shapes: 'Shapes', kinds: 'Kinds' };

const WAY_CHIPS: Readonly<Record<ColourWay | ShapeWay | KindsWay, { text: string; label: string }>> = {
  blocks: { text: '🧱 Blocks', label: 'Blocks: the same block in each color' },
  things: { text: '🧸 Things', label: 'Things: a duck, a banana, a fire truck' },
  plain: { text: '⬜ Plain', label: 'Plain: every shape grey' },
  colorful: { text: '🌈 Colorful', label: 'Colorful: shapes in all colors' },
  clear: { text: '✅ Clear', label: 'Clear: only the easy members of each group' },
  tricky: { text: '🤔 Tricky', label: 'Tricky: one odd member a Round, like a penguin' },
};

const glyphs = (sorts: readonly Sort[]) => sorts.map((s) => GLYPHS[s]);
const sortOf = (topic: SortTopic, glyph: string) => SORTS[topic].find((s) => GLYPHS[s] === glyph)!;
const chips = (steps: readonly Step[]) => steps.map((s) => STEP_CHIPS[s]);
const stepOf = (chip: string) => STEPS.find((s) => STEP_CHIPS[s] === chip)!;

function skinPicker(app: App): SkinPicker {
  const { game } = app.progress;
  return {
    chips: SKINS.map((id) => ({ id, label: SKIN_NAMES[id], picture: skinPictures[id](), colour: SKIN_COLOURS[id] })),
    current: () => game.skin,
    choose: (id) => {
      game.skin = id as Skin;
      app.progress.save();
    },
  };
}

function topicOf(app: App, topic: Topic): PracticeTopic {
  const base = { name: NAMES[topic], colour: TOPIC_COLOURS[topic], badge: () => topicBadge(topic) };
  if (topic === 'kinds') {
    return {
      ...base,
      items: chips(STEPS),
      ranges: [
        { label: 'Easy', items: chips(EASY) },
        { label: 'All', items: chips(STEPS) },
      ],
      ways: KINDS_WAYS.map((id) => ({ id, ...WAY_CHIPS[id] })),
      columns: 3,
    };
  }
  return {
    ...base,
    items: glyphs(SORTS[topic]),
    ranges: [
      { label: glyphs(RANGES[topic]).join(''), items: glyphs(RANGES[topic]) },
      { label: 'All', items: glyphs(SORTS[topic]) },
    ],
    ways: WAYS[topic].map((id) => ({ id, ...WAY_CHIPS[id] })),
    skins: topic === 'colors' ? skinPicker(app) : undefined,
    fewest: 2,
  };
}

/** Tidy Up as Practice sees it: Topics count from 0 there, in TOPICS order. */
export function tidyUpPractice(app: App): PracticeGame {
  const { game } = app.progress;
  return {
    title: 'Tidy Up',
    topics: TOPICS.map((topic) => topicOf(app, topic)),
    topic: () => TOPICS.indexOf(game.topic),
    chooseTopic: (t) => {
      game.topic = TOPICS[t]!;
      app.progress.save();
    },
    scope(t) {
      const topic = TOPICS[t]!;
      if (topic === 'kinds') return chips(game.kinds);
      return glyphs(topic === 'colors' ? game.colors : game.shapes);
    },
    setScope: (t, items) => {
      const topic = TOPICS[t]!;
      if (topic === 'kinds') game.kinds = STEPS.filter((step) => items.map(stepOf).includes(step));
      else if (topic === 'colors') game.colors = items.map((g) => sortOf(topic, g)) as Colour[];
      else game.shapes = items.map((g) => sortOf(topic, g)) as Shape[];
      app.progress.save();
    },
    way: (t) => {
      const topic = TOPICS[t]!;
      return topic === 'kinds' ? game.kindsWay : topic === 'colors' ? game.colorsWay : game.shapesWay;
    },
    chooseWay: (t, way) => {
      const topic = TOPICS[t]!;
      if (topic === 'kinds') game.kindsWay = way as KindsWay;
      else if (topic === 'colors') game.colorsWay = way as ColourWay;
      else game.shapesWay = way as ShapeWay;
      app.progress.save();
    },
    tools: () => [app.corner.gear()],
    play: () => app.play(),
  };
}

export function showStart(app: App): PracticeView {
  return showPractice(app.root, tidyUpPractice(app));
}
