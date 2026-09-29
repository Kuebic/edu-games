// Practice's Rounds on the site's sorting screen (@shared/sort): a Pile of Things at the top, Bins along
// the bottom. The child drags each Thing, or taps a Bin, and its Word says its color or shape as it lands.
// When the Pile is empty the Round is tidy: the Bins go, the site's cheer, a card for the grown-up, and
// Next. Until Back. This file draws Tidy Up's Things and Bins and plays its sounds.

import { playStage, replay, sortRounds, wait, type BinView } from '@shared/sort';
import type { App } from '../app';
import { h } from '../dom';
import { bump, drop, hushWords, pickUp, tidy, word } from '../sounds';
import { PAINT, isColour, lookFor, rounds, type Colour, type Shape, type Sort, type Thing } from '../sorting';
import { blockSvg, boxSvg, bucketSvg, patterned, shapeSvg, truckSvg } from './icons';

export { IDLE_MS } from '@shared/sort';

/** The Bins' own motion at the end, before the cheer. */
const TIDY_MS = 1300;

/** A Thing's picture: its block, its shape, or its emoji with a patterned tag when Patterns are on. */
function thingPicture(thing: Thing, patterns: boolean): HTMLElement {
  if (thing.look === 'block') return h('span', { class: 'art', html: blockSvg(thing.sort, patterns) });
  if (thing.look === 'shape') return h('span', { class: 'art', html: shapeSvg(thing.sort, thing.paint) });
  const emoji = h('span', { class: 'emoji', text: thing.emoji });
  if (!patterns) return emoji;
  const disc = `<circle cx="10" cy="10" r="8" fill="${PAINT[thing.sort]}"/>`;
  const tag = h('span', {
    class: 'tag',
    html: `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9.5" fill="#fff"/>${disc}${patterned(thing.sort, disc)}</svg>`,
  });
  return h('span', { class: 'art' }, emoji, tag);
}

/** What a screen reader hears for a Thing: its color or shape. */
const thingLabel = (thing: Thing) => (thing.look === 'emoji' ? `${thing.emoji} ${thing.sort}` : thing.sort);

export function playScreen(app: App): () => void {
  const g = app.progress.game;
  const topic = g.topic;
  const scope = topic === 'colors' ? g.colors : g.shapes;
  const look = topic === 'colors' ? g.skin : 'box';
  const patterns = topic === 'colors' && g.patterns;
  const nextRound = rounds(topic, scope, topic === 'colors' ? g.colorsWay : g.shapesWay);

  const s = playStage(app.root, {
    className: `look-${look}`,
    back: () => app.start(),
    tools: [app.corner.gear()],
    confetti: { colours: Object.values(PAINT) },
  });

  /** The load in each Bin, where landed Things show. */
  const loads = new Map<HTMLElement, HTMLElement>();
  const say = (sort: Sort) => void word(sort)?.();

  return sortRounds<Thing, Sort>(s, {
    next: nextRound,
    binOf: (thing) => thing.sort,
    bin(sort): BinView {
      const art =
        look === 'box' ? boxSvg(sort as Shape) : look === 'trucks' ? truckSvg(sort as Colour, patterns) : bucketSvg(sort as Colour, patterns);
      // The load sits behind the Bin's front, so landed Things peek out over the rim.
      const load = h('span', { class: 'load' });
      const el = h('button', { class: 'bin', label: sort }, h('span', { class: 'bin-body' }, load, h('span', { class: 'bin-art', html: art })));
      loads.set(el, load);
      return { el };
    },
    thing: (thing) => h('div', { class: 'thing', label: thingLabel(thing) }, thingPicture(thing, patterns)),
    piled: (thing) => h('span', { class: 'pile-thing' }, thingPicture(thing, patterns)),
    land(bin, thing) {
      const load = loads.get(bin.el)!;
      const landed = h('span', { class: 'landed' }, thingPicture(thing, patterns));
      landed.style.setProperty('--n', String(load.childElementCount));
      load.append(landed);
    },
    lifted: () => pickUp(),
    async landed(thing) {
      drop();
      await word(thing.sort)?.();
    },
    missed: () => bump(),
    helped: (thing) => say(thing.sort),
    tapped(thing, el) {
      replay(el, 'site-sort-wiggle');
      say(thing.sort);
    },
    nudged: (thing, n) => {
      if (n > 1) say(thing.sort);
    },
    hush: hushWords,
    async finish(bins) {
      for (const b of bins) b.el.classList.add('tidy');
      tidy(look);
      await wait(TIDY_MS);
    },
    card(round) {
      const sort = round.bins[Math.floor(Math.random() * round.bins.length)]!;
      const art = h('span', { class: 'card-art', html: isColour(sort) ? blockSvg(sort, patterns) : shapeSvg(sort, '#9aa3b2') });
      return { art, text: lookFor(sort) };
    },
  });
}
