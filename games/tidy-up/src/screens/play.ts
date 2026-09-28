// Practice's Rounds: a Pile of Things at the top, Bins along the bottom. The child drags each Thing, or
// taps a Bin, and its Word says its color or shape as it lands. When the Pile is empty the Round is tidy:
// the Bins go, the site's cheer, a card for the grown-up, and Next. Until Back.

import { buzz, cheer } from '@shared/sound';
import type { App } from '../app';
import { h, replay, sparkle, wait } from '../dom';
import { bump, drop, hushWords, pickUp, tidy, word } from '../sounds';
import { MISSES_BEFORE_HELP, PAINT, binAt, isColour, lookFor, rounds, type Colour, type Round, type Shape, type Sort, type Thing } from '../sorting';
import { backIcon, blockSvg, boxSvg, bucketSvg, nextIcon, patterned, shapeSvg, truckSvg } from './icons';

/** Before the first nudge, and between nudges. */
export const IDLE_MS = 7000;
const MAX_NUDGES = 3;
/** How far a finger may move and still tap, and how long a press may last. */
const TAP_SLOP = 12;
const TAP_MS = 5000;
/** A grab reaches this far past the Thing's edge, about 10 mm. */
const REACH = 60;
/** How far above the fingertip a held Thing rides, so the finger doesn't hide it. */
const LIFT = 36;
const GLIDE_MS = 380;
const TIDY_MS = 1300;

type Point = { x: number; y: number };

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
  let alive = true;
  const g = app.progress.game;
  const topic = g.topic;
  const scope = topic === 'colors' ? g.colors : g.shapes;
  const look = topic === 'colors' ? g.skin : 'box';
  const patterns = topic === 'colors' && g.patterns;
  const nextRound = rounds(topic, scope, topic === 'colors' ? g.colorsWay : g.shapesWay);

  // ---- Layout ------------------------------------------------------------
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  const pileEl = h('div', { class: 'pile' });
  const spot = h('div', { class: 'spot' });
  const binsEl = h('div', { class: 'bins' });
  const stage = h('main', { class: `stage look-${look}` }, pileEl, spot, binsEl);
  const fx = h('div', { class: 'fx-layer' });
  const screen = h(
    'div',
    { class: 'site-screen screen play' },
    h('header', { class: 'play-top' }, backBtn, h('div'), app.corner.gear()),
    stage,
    fx,
  );
  app.root.append(screen);
  backBtn.addEventListener('click', () => app.start());

  /** A point on the page, as the stage measures it. */
  const local = (x: number, y: number): Point => {
    const r = stage.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  };
  const centreOf = (el: Element): Point => {
    const r = el.getBoundingClientRect();
    return local(r.left + r.width / 2, r.top + r.height / 2);
  };

  // ---- The Round's state -------------------------------------------------
  let round: Round;
  let served = 0;
  let bins: HTMLElement[] = [];
  /** The Thing on the Spot, or held, or left lying, waiting to go into a Bin. */
  let current: { thing: Thing; el: HTMLElement; misses: number } | null = null;
  /** While a Thing glides, lands, or the Round tidies, fingers do nothing. */
  let busy = true;

  function makeBin(sort: Sort): HTMLElement {
    const art =
      look === 'box' ? boxSvg(sort as Shape) : look === 'trucks' ? truckSvg(sort as Colour, patterns) : bucketSvg(sort as Colour, patterns);
    // The load sits behind the Bin's front, so landed Things peek out over the rim.
    const body = h('span', { class: 'bin-body' }, h('span', { class: 'load' }), h('span', { class: 'bin-art', html: art }));
    const bin = h('button', { class: 'bin', label: sort }, body);
    // A press from a keyboard or switch; fingers come through the stage's pointer events below.
    bin.addEventListener('click', (e) => {
      if (e.detail === 0) void place(bins.indexOf(bin));
    });
    return bin;
  }

  const ownBin = (thing: Thing) => bins[round.bins.indexOf(thing.sort)]!;

  function moveTo(el: HTMLElement, at: Point): void {
    el.style.left = `${at.x}px`;
    el.style.top = `${at.y}px`;
  }

  /** Where a Thing waits: above the middle. */
  const spotPoint = () => centreOf(spot);

  function glow(bin: HTMLElement | null): void {
    for (const b of bins) b.classList.toggle('glow', b === bin);
  }

  async function startRound(): Promise<void> {
    round = nextRound();
    served = 0;
    bins = round.bins.map(makeBin);
    binsEl.style.setProperty('--bins', String(bins.length));
    binsEl.replaceChildren(...bins);
    pileEl.replaceChildren(...round.pile.map((t) => h('span', { class: 'pile-thing' }, thingPicture(t, patterns))));
    await wait(450);
    if (alive) serve();
  }

  /** The next Thing hops off the Pile onto the Spot, or the Round is tidy. */
  function serve(): void {
    if (served === round.pile.length) {
      void tidyUp();
      return;
    }
    const thing = round.pile[served]!;
    served++;
    pileEl.firstElementChild?.remove();
    const el = h('div', { class: 'thing pop', label: thingLabel(thing) }, thingPicture(thing, patterns));
    moveTo(el, spotPoint());
    stage.append(el);
    current = { thing, el, misses: 0 };
    busy = false;
    armIdle();
  }

  /** Glides the Thing somewhere, taking GLIDE_MS. */
  async function glide(el: HTMLElement, to: Point): Promise<void> {
    el.classList.add('gliding');
    moveTo(el, to);
    await wait(GLIDE_MS);
    el.classList.remove('gliding');
  }

  /** The Thing into Bin `i`: right, or a miss, and after two misses into its own by itself. */
  async function place(i: number): Promise<void> {
    if (!current || busy) return;
    const cur = current;
    busy = true;
    clearIdle();
    hushWords();
    const bin = bins[i]!;
    if (round.bins[i] === cur.thing.sort) return into(bin);

    cur.misses++;
    bump();
    replay(bin, 'nope');
    if (cur.misses >= MISSES_BEFORE_HELP) {
      await glide(cur.el, mouthOf(bin));
      if (!alive) return;
      return into(ownBin(cur.thing));
    }
    await glide(cur.el, spotPoint());
    if (!alive) return;
    glow(ownBin(cur.thing));
    void word(cur.thing.sort)?.();
    busy = false;
    armIdle();
  }

  /** Just above a Bin's opening, where a Thing goes in. */
  function mouthOf(bin: HTMLElement): Point {
    const c = centreOf(bin);
    return { x: c.x, y: c.y - bin.getBoundingClientRect().height * 0.25 };
  }

  async function into(bin: HTMLElement): Promise<void> {
    const cur = current!;
    cur.el.classList.add('going-in');
    await glide(cur.el, mouthOf(bin));
    if (!alive) return;
    cur.el.remove();
    current = null;
    glow(null);
    const load = bin.querySelector('.load')!;
    const landed = h('span', { class: 'landed' }, thingPicture(cur.thing, patterns));
    landed.style.setProperty('--n', String(load.childElementCount));
    load.append(landed);
    replay(bin, 'got');
    drop();
    buzz(30);
    const at = centreOf(bin);
    const s = stage.getBoundingClientRect(), f = fx.getBoundingClientRect();
    sparkle({ x: at.x + s.left - f.left, y: at.y + s.top - f.top }, fx);
    await word(cur.thing.sort)?.();
    if (!alive) return;
    await wait(150);
    if (alive) serve();
  }

  /** The Pile is empty: the Bins go, the cheer, the grown-up's card, and Next. */
  async function tidyUp(): Promise<void> {
    busy = true;
    clearIdle();
    for (const b of bins) b.classList.add('tidy');
    tidy(look);
    await wait(TIDY_MS);
    if (!alive) return;

    const confetti = h('div', { class: 'confetti' });
    const colours = Object.values(PAINT);
    for (let i = 0; i < 40; i++) {
      const c = h('i');
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colours[i % colours.length]!;
      c.style.animationDelay = `${Math.random() * 0.5}s`;
      c.style.animationDuration = `${1.6 + Math.random()}s`;
      c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      confetti.append(c);
    }
    const sort = round.bins[Math.floor(Math.random() * round.bins.length)]!;
    const picture = isColour(sort) ? blockSvg(sort, patterns) : shapeSvg(sort, '#9aa3b2');
    const next = h('button', { class: 'site-next', label: 'Next', html: nextIcon });
    const layer = h(
      'div',
      { class: 'cheer' },
      confetti,
      h('div', { class: 'card' }, h('span', { class: 'card-art', html: picture }), h('p', { class: 'site-grownup look-for', text: `🔍 ${lookFor(sort)}` })),
      next,
    );
    screen.append(layer);
    cheer();
    buzz(80);
    next.addEventListener('click', () => {
      layer.remove();
      void startRound();
    });
  }

  // ---- Nudges when she's been still ---------------------------------------
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let nudges = 0;
  function clearIdle(): void {
    clearTimeout(idleTimer);
  }
  function armIdle(): void {
    clearIdle();
    idleTimer = setTimeout(() => {
      if (!alive || !current || busy) return;
      if (nudges < MAX_NUDGES) {
        nudges++;
        replay(current.el, 'nudge');
        const own = ownBin(current.thing);
        glow(own);
        if (nudges > 1) void word(current.thing.sort)?.();
      }
      armIdle();
    }, IDLE_MS);
  }

  // ---- Fingers: the first on the Thing drags it; a tap on a Bin sends it there --------------------
  let drag: { id: number; from: Point; at: number; moved: boolean } | null = null;
  let binTap: { id: number; bin: HTMLElement } | null = null;

  const near = (p: Point, el: HTMLElement, reach: number) => {
    const r = el.getBoundingClientRect();
    const c = centreOf(el);
    return Math.abs(p.x - c.x) <= r.width / 2 + reach && Math.abs(p.y - c.y) <= r.height / 2 + reach;
  };

  stage.addEventListener('pointerdown', (e) => {
    nudges = 0;
    if (current && !busy) armIdle();
    if (drag || binTap || !current || busy) return;
    const p = local(e.clientX, e.clientY);
    const bin = (e.target as Element).closest<HTMLElement>('.bin');
    if (bin && !near(p, current.el, 0)) {
      binTap = { id: e.pointerId, bin };
      return;
    }
    if (!near(p, current.el, REACH)) return;
    e.preventDefault();
    drag = { id: e.pointerId, from: p, at: e.timeStamp, moved: false };
    stage.setPointerCapture?.(e.pointerId);
    hushWords();
  });

  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id || !current) return;
    const p = local(e.clientX, e.clientY);
    if (!drag.moved && Math.hypot(p.x - drag.from.x, p.y - drag.from.y) < TAP_SLOP) return;
    if (!drag.moved) {
      drag.moved = true;
      current.el.classList.add('held');
      pickUp();
    }
    moveTo(current.el, { x: p.x, y: p.y - LIFT });
  });

  const letGo = (e: PointerEvent) => {
    if (binTap && e.pointerId === binTap.id) {
      const { bin } = binTap;
      binTap = null;
      const p = local(e.clientX, e.clientY);
      if (e.type === 'pointerup' && near(p, bin, 0)) void place(bins.indexOf(bin));
      return;
    }
    if (!drag || e.pointerId !== drag.id || !current) return;
    const { moved, at } = drag;
    drag = null;
    current.el.classList.remove('held');
    if (e.type !== 'pointerup') return;
    if (!moved) {
      if (e.timeStamp - at > TAP_MS) return;
      replay(current.el, 'wiggle');
      void word(current.thing.sort)?.();
      return;
    }
    const r = stage.getBoundingClientRect();
    const i = binAt({ x: e.clientX, y: e.clientY }, r, bins.length);
    if (i !== undefined) void place(i);
  };
  stage.addEventListener('pointerup', letGo);
  stage.addEventListener('pointercancel', letGo);

  // A phone turned on its side moves the Spot; a waiting Thing goes with it.
  const onResize = () => {
    if (current && !busy && !drag) moveTo(current.el, spotPoint());
  };
  window.addEventListener('resize', onResize);

  void startRound();

  return () => {
    alive = false;
    clearIdle();
    hushWords();
    window.removeEventListener('resize', onResize);
  };
}
