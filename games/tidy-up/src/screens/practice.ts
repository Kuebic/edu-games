// Tidy Up's first screen, Practice (the site's ADR 0014): Colors and Shapes as Topics, each with its Ways,
// its Ranges and its Scope, and Buckets or Trucks as the Skins of Colors (ADR 0015), saved in the Game's
// slot, and the gear. Sorting needs two Bins, so Play waits for two items.

import { showPractice, type PracticeGame, type PracticeTopic, type PracticeView } from '@shared/practice';
import type { SkinPicker } from '@shared/skins';
import type { App } from '../app';
import { SKINS, SKIN_COLOURS, SKIN_NAMES, type Skin } from '../skins';
import { GLYPHS, RANGES, SORTS, TOPICS, WAYS, type Colour, type ColourWay, type Shape, type ShapeWay, type Sort, type Topic, type Way } from '../sorting';
import { skinPictures, topicBadge } from './icons';

/** Colors in the Math Shelf's orange, Shapes in a sky blue. */
export const TOPIC_COLOURS: Readonly<Record<Topic, string>> = { colors: '#ff8a3d', shapes: '#3a9ad9' };

const NAMES: Readonly<Record<Topic, string>> = { colors: 'Colors', shapes: 'Shapes' };

const WAY_CHIPS: Readonly<Record<Way, { text: string; label: string }>> = {
  blocks: { text: '🧱 Blocks', label: 'Blocks: the same block in each color' },
  things: { text: '🧸 Things', label: 'Things: a duck, a banana, a fire truck' },
  plain: { text: '⬜ Plain', label: 'Plain: every shape grey' },
  colorful: { text: '🌈 Colorful', label: 'Colorful: shapes in all colors' },
};

const glyphs = (sorts: readonly Sort[]) => sorts.map((s) => GLYPHS[s]);
const sortOf = (topic: Topic, glyph: string) => SORTS[topic].find((s) => GLYPHS[s] === glyph)!;

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

/** Tidy Up as Practice sees it: Topics count from 0 there, in TOPICS order. */
export function tidyUpPractice(app: App): PracticeGame {
  const { game } = app.progress;
  const topics: PracticeTopic[] = TOPICS.map((topic) => ({
    name: NAMES[topic],
    colour: TOPIC_COLOURS[topic],
    badge: () => topicBadge(topic),
    items: glyphs(SORTS[topic]),
    ranges: [{ label: glyphs(RANGES[topic]).join(''), items: glyphs(RANGES[topic]) }, { label: 'All', items: glyphs(SORTS[topic]) }],
    ways: WAYS[topic].map((id) => ({ id, ...WAY_CHIPS[id] })),
    skins: topic === 'colors' ? skinPicker(app) : undefined,
    fewest: 2,
  }));
  return {
    title: 'Tidy Up',
    topics,
    topic: () => TOPICS.indexOf(game.topic),
    chooseTopic: (t) => {
      game.topic = TOPICS[t]!;
      app.progress.save();
    },
    scope: (t) => glyphs(TOPICS[t] === 'colors' ? game.colors : game.shapes),
    setScope: (t, items) => {
      const topic = TOPICS[t]!;
      const sorts = items.map((glyph) => sortOf(topic, glyph));
      if (topic === 'colors') game.colors = sorts as Colour[];
      else game.shapes = sorts as Shape[];
      app.progress.save();
    },
    way: (t) => (TOPICS[t] === 'colors' ? game.colorsWay : game.shapesWay),
    chooseWay: (t, way) => {
      if (TOPICS[t] === 'colors') game.colorsWay = way as ColourWay;
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
