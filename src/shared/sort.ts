// Sorting (site ADR 0016): a Pile of Things at the top, Bins along the bottom, and a child who drags each
// Thing, or taps a Bin, to put it where it belongs. The screen, the fingers, the Miss rule, the nudges and
// the end of a Round are the same in every Game that sorts; a Game gives its Rounds, its drawings and its
// sounds. Asking (ADR 0017) is the same stage turned round: one Asker at the bottom wants one of two or
// three Things on the table. Tidy Up, Piggy Bank and Mailbox sort; Piggy Bank's and Mailbox's Find ask.

import './sort.css';
import { buzz, cheer } from './sound';

export type Point = { x: number; y: number };
export type Rng = () => number;

/** How long a Thing takes to glide back to the Spot or into a Bin. */
export const GLIDE_MS = 380;
/** Before the first nudge, and between nudges. */
export const IDLE_MS = 7000;
export const MAX_NUDGES = 3;
/** Misses on one Thing before it goes into its own Bin by itself. */
export const MISSES_BEFORE_HELP = 2;
/** The most Bins a Round has, side by side on a phone. */
export const MOST_BINS = 3;
/** How many Things each Bin gets: 8 in all with 2 Bins, 9 with 3. */
export const PER_BIN: Readonly<Record<number, number>> = { 2: 4, 3: 3 };

/** How far a finger may move and still tap, and how long a press may last. */
const TAP_SLOP = 12;
const TAP_MS = 5000;
/** A grab reaches this far past a Thing's edge, about 10 mm. */
const REACH = 60;
/** How far above the fingertip a held Thing rides, so the finger doesn't hide it. */
const LIFT = 36;

// ---- Rounds, as data ---------------------------------------------------------------------------------

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * The Bins of each Round from a Scope, one set per call: as many as the Scope has, up to `most`, taken
 * from a bag so each item comes up once before any comes again, never twice in one Round. Items `apart`
 * says look alike (b and d) share a Round only when the Scope leaves no other way.
 */
export function binsFrom<K>(
  scope: readonly K[],
  rng: Rng = Math.random,
  most = MOST_BINS,
  apart: (a: K, b: K) => boolean = () => false,
): () => K[] {
  if (scope.length === 0) throw new Error('Game Shelf: sorting needs a Scope');
  const size = Math.min(scope.length, most);
  let bag: K[] = [];
  const draw = (taken: readonly K[]): K => {
    const free = (s: K) => !taken.includes(s);
    const fits = (s: K) => free(s) && !taken.some((t) => apart(s, t));
    if (!bag.some(free)) bag = [...bag, ...shuffle(scope, rng)];
    const i = bag.findIndex(fits);
    if (i >= 0) return bag.splice(i, 1)[0]!;
    // Only look-alikes left in the bag: something from the Scope that fits, out of turn, if there is one.
    return shuffle(scope, rng).find(fits) ?? bag.splice(bag.findIndex(free), 1)[0]!;
  };
  return () => {
    const bins: K[] = [];
    while (bins.length < size) bins.push(draw(bins));
    return bins;
  };
}

/** Shuffles a Pile until no Bin gets three in a row, which with 3 or 4 each takes a few tries at most. */
export function pileOf<T>(things: readonly T[], binOf: (thing: T) => unknown, rng: Rng = Math.random): T[] {
  const ok = (pile: readonly T[]) => pile.every((t, i) => i < 2 || binOf(t) !== binOf(pile[i - 1]!) || binOf(t) !== binOf(pile[i - 2]!));
  let out = shuffle(things, rng);
  for (let tries = 0; tries < 200 && !ok(out); tries++) out = shuffle(things, rng);
  return out;
}

/**
 * Which Bin a finger let go over, counting from the left, or undefined over the top half, where a Thing
 * just stays. The Bins share the width of the play area evenly.
 */
export function binAt(point: Point, area: { left: number; top: number; width: number; height: number }, bins: number): number | undefined {
  if (point.y < area.top + area.height / 2) return undefined;
  const i = Math.floor(((point.x - area.left) / area.width) * bins);
  return Math.min(Math.max(i, 0), bins - 1);
}

// ---- The stage ---------------------------------------------------------------------------------------

const BACK =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5 7 12l7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.5 19 12 8 19.5Z" fill="currentColor"/></svg>';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, label?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = className;
  if (label) e.setAttribute('aria-label', label);
  if (tag === 'button') e.setAttribute('type', 'button');
  return e;
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Runs a one-shot animation class again, even if it's still on. */
export function replay(target: Element, className: string): void {
  target.classList.remove(className);
  void (target as HTMLElement).offsetWidth;
  target.classList.add(className);
}

/** What the Round's end shows the grown-up: a picture and a line to read aloud. */
export interface Card {
  art: Node;
  text: string;
}

export interface StageSpec {
  /** Classes of the Game's own on the stage, for its CSS ("look-box", "way-find"). */
  className?: string;
  back(): void;
  /** Header buttons at the right: the gear. */
  tools: HTMLElement[];
  /** What falls at the end: colours for paper, or glyphs. */
  confetti: { colours?: readonly string[]; glyphs?: readonly string[] };
  /** What bursts where a Thing lands. */
  sparkles?: readonly string[];
}

export interface PlayStage {
  screen: HTMLElement;
  stage: HTMLElement;
  /** A point on the page, as the stage measures it. */
  local(x: number, y: number): Point;
  centreOf(target: Element): Point;
  moveTo(target: HTMLElement, at: Point): void;
  /** Glides a Thing somewhere, taking GLIDE_MS. */
  glide(target: HTMLElement, to: Point): Promise<void>;
  sparkleAt(target: Element): void;
  /** The cheer, confetti, the grown-up's card, and Next. */
  end(card: Card, next: () => void): void;
  /** The screen is going: nothing still waiting shows. */
  leave(): void;
  left(): boolean;
}

/** The play screen: Back, the Game's tools, and a stage to sort on. Appended to `root`. */
export function playStage(root: HTMLElement, spec: StageSpec): PlayStage {
  const back = el('button', 'site-tool', 'Back');
  back.innerHTML = BACK;
  back.addEventListener('click', () => spec.back());
  const header = el('header', 'site-sort-top');
  header.append(back, el('div', ''), ...spec.tools);
  const stage = el('main', `site-sort-stage ${spec.className ?? ''}`.trim());
  const fx = el('div', 'site-sort-fx');
  const screen = el('div', 'site-screen site-sort-screen');
  screen.append(header, stage, fx);
  root.append(screen);
  let gone = false;

  const local = (x: number, y: number): Point => {
    const r = stage.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  };
  const centreOf = (target: Element): Point => {
    const r = target.getBoundingClientRect();
    return local(r.left + r.width / 2, r.top + r.height / 2);
  };
  const moveTo = (target: HTMLElement, at: Point) => {
    target.style.left = `${at.x}px`;
    target.style.top = `${at.y}px`;
  };

  return {
    screen,
    stage,
    local,
    centreOf,
    moveTo,
    async glide(target, to) {
      target.classList.add('site-sort-gliding');
      moveTo(target, to);
      await wait(GLIDE_MS);
      target.classList.remove('site-sort-gliding');
    },
    sparkleAt(target) {
      const at = centreOf(target);
      const s = stage.getBoundingClientRect(), f = fx.getBoundingClientRect();
      const glyphs = spec.sparkles ?? ['✨', '💛', '⭐'];
      for (let i = 0; i < 8; i++) {
        const spark = el('span', 'site-sort-sparkle');
        spark.textContent = glyphs[i % glyphs.length]!;
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
        const dist = 50 + Math.random() * 40;
        spark.style.left = `${at.x + s.left - f.left}px`;
        spark.style.top = `${at.y + s.top - f.top}px`;
        spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        fx.append(spark);
        setTimeout(() => spark.remove(), 1000);
      }
    },
    end(card, next) {
      if (gone) return;
      const confetti = el('div', 'site-sort-confetti');
      const { colours, glyphs } = spec.confetti;
      for (let i = 0; i < 36; i++) {
        const c = el('i', '');
        if (glyphs) c.textContent = glyphs[i % glyphs.length]!;
        else if (colours) c.style.background = colours[i % colours.length]!;
        c.style.left = `${Math.random() * 100}%`;
        c.style.animationDelay = `${Math.random() * 0.5}s`;
        c.style.animationDuration = `${1.6 + Math.random()}s`;
        c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
        confetti.append(c);
      }
      const art = el('span', 'site-sort-card-art');
      art.append(card.art);
      const text = el('p', 'site-grownup site-sort-look-for');
      text.textContent = `🔍 ${card.text}`;
      const box = el('div', 'site-sort-card');
      box.append(art, text);
      const nextBtn = el('button', 'site-next', 'Next');
      nextBtn.innerHTML = NEXT;
      const layer = el('div', 'site-sort-cheer');
      layer.append(confetti, box, nextBtn);
      screen.append(layer);
      cheer();
      buzz(80);
      nextBtn.addEventListener('click', () => {
        layer.remove();
        next();
      });
    },
    leave: () => (gone = true),
    left: () => gone,
  };
}

// ---- Fingers -----------------------------------------------------------------------------------------

export interface Fingers {
  /** The Things a finger may take now; none while something moves. */
  grabbable(): HTMLElement[];
  /** Any finger down: the child is here, so the nudges start over. */
  touched(): void;
  lifted(thing: HTMLElement): void;
  tapped(thing: HTMLElement): void;
  /** Let go after a drag, at a point on the page; NaN when the browser took the finger away. */
  dropped(thing: HTMLElement, at: Point): void;
  /** A press on something matching `pressable`, away from the Things: a Bin. */
  pressed(target: HTMLElement): void;
  /** What a press can land on. The Bins, if left out. */
  pressable?: string;
}

/**
 * Fingers on the stage: the first on a Thing drags it, riding above the fingertip; a still press is a
 * tap; a press on a Bin away from the Things presses it. Other fingers and a palm are ignored until the
 * first lifts.
 */
export function fingers(s: PlayStage, spec: Fingers): void {
  const { stage } = s;
  const pressable = spec.pressable ?? '.site-sort-bin';
  let drag: { id: number; thing: HTMLElement; from: Point; at: number; moved: boolean } | null = null;
  let press: { id: number; target: HTMLElement } | null = null;

  const near = (p: Point, target: HTMLElement, reach: number) => {
    const r = target.getBoundingClientRect();
    const c = s.centreOf(target);
    return Math.abs(p.x - c.x) <= r.width / 2 + reach && Math.abs(p.y - c.y) <= r.height / 2 + reach;
  };

  stage.addEventListener('pointerdown', (e) => {
    spec.touched();
    if (drag || press) return;
    const p = s.local(e.clientX, e.clientY);
    const things = spec.grabbable();
    if (things.length === 0) return;
    const target = (e.target as Element).closest<HTMLElement>(pressable);
    if (target && !things.some((thing) => near(p, thing, 0))) {
      press = { id: e.pointerId, target };
      return;
    }
    // The nearest Thing in reach, so a finger between two takes the closer.
    const dist = (t: HTMLElement) => Math.hypot(p.x - s.centreOf(t).x, p.y - s.centreOf(t).y);
    const thing = things.filter((t) => near(p, t, REACH)).sort((a, b) => dist(a) - dist(b))[0];
    if (!thing) return;
    e.preventDefault();
    drag = { id: e.pointerId, thing, from: p, at: e.timeStamp, moved: false };
    stage.setPointerCapture?.(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = s.local(e.clientX, e.clientY);
    if (!drag.moved && Math.hypot(p.x - drag.from.x, p.y - drag.from.y) < TAP_SLOP) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.thing.classList.add('site-sort-held');
      spec.lifted(drag.thing);
    }
    s.moveTo(drag.thing, { x: p.x, y: p.y - LIFT });
  });

  const letGo = (e: PointerEvent) => {
    if (press && e.pointerId === press.id) {
      const { target } = press;
      press = null;
      if (e.type === 'pointerup' && near(s.local(e.clientX, e.clientY), target, 0)) spec.pressed(target);
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    const { thing, moved, at } = drag;
    drag = null;
    thing.classList.remove('site-sort-held');
    if (e.type !== 'pointerup') {
      if (moved) spec.dropped(thing, { x: NaN, y: NaN });
      return;
    }
    if (!moved) {
      if (e.timeStamp - at <= TAP_MS) spec.tapped(thing);
      return;
    }
    spec.dropped(thing, { x: e.clientX, y: e.clientY });
  };
  stage.addEventListener('pointerup', letGo);
  stage.addEventListener('pointercancel', letGo);
}

// ---- A sorting Round, turn by turn ---------------------------------------------------------------------

export interface SortRound<T, K> {
  bins: readonly K[];
  /** In the order they come off the Pile. */
  pile: readonly T[];
}

/** A Bin as the Game draws it: the button, and where in it a Thing lands. */
export interface BinView {
  el: HTMLElement;
  /** Just above the opening a Thing goes in by, on the stage. The top quarter of the Bin, if left out. */
  mouth?(): Point;
}

/** What a Game gives the sorting screen. The screen owns the turns; the Game owns how they look and sound. */
export interface SortGame<T, K> {
  next(): SortRound<T, K>;
  binOf(thing: T): K;
  /** A Bin's button, drawn fresh for each Round. The screen adds its class and keyboard press. */
  bin(key: K): BinView;
  /** A Thing on the Spot. */
  thing(thing: T): HTMLElement;
  /** A Thing small on the Pile. */
  piled(thing: T): HTMLElement;
  /** Shows a Thing gone into its Bin. */
  land(bin: BinView, thing: T): void;
  /** Before the first Thing of a Round hops out, e.g. each Bin saying its name. */
  opening?(bins: readonly BinView[], keys: readonly K[]): Promise<void>;
  /** A Thing lifted. */
  lifted?(thing: T): void;
  /**
   * A Thing in its own Bin: its sound, and its Word only if `first`, the first into that Bin this Round, or
   * `pressed`, when the child tapped the Bin rather than dragging to it. A right drop never says again what
   * the child has just heard, but a tap on a Bin always says what it is (site ADR 0016). The next Thing
   * waits for it.
   */
  landed(thing: T, first: boolean, pressed: boolean): Promise<void>;
  /** A wrong Bin, as it bumps. */
  missed(thing: T): void;
  /** Back on the Spot after a first Miss, its own Bin glowing: its Word. */
  helped(thing: T): void;
  /** A tap on the Thing: its own motion (replay 'site-sort-wiggle', or a flip) and its Word. */
  tapped(thing: T, el: HTMLElement): void | Promise<void>;
  /** The nudge after 7 seconds still; `n` counts them, from 1. */
  nudged(thing: T, n: number): void;
  /** Stops any Word playing, for a new grab or a Bin. */
  hush(): void;
  /** The Pile is empty: the Bins' own motion and sound, before the card. */
  finish(bins: readonly BinView[]): Promise<void>;
  /** The grown-up's card for this Round. */
  card(round: SortRound<T, K>): Card;
}

/** Plays Rounds on the stage, one after another, until the screen goes. Returns the leave function. */
export function sortRounds<T, K>(s: PlayStage, game: SortGame<T, K>): () => void {
  let alive = true;
  const pileEl = el('div', 'site-sort-pile');
  const spot = el('div', 'site-sort-spot');
  const binsEl = el('div', 'site-sort-bins');
  s.stage.append(pileEl, spot, binsEl);

  let round: SortRound<T, K>;
  let served = 0;
  let bins: BinView[] = [];
  /** The Thing on the Spot, or held, or left lying, waiting to go into a Bin. */
  let current: { thing: T; el: HTMLElement; misses: number } | null = null;
  /** While a Thing glides, goes in, or the Round opens or ends, fingers do nothing. */
  let busy = true;
  /** The Bins something has gone into this Round. */
  const filled = new Set<BinView>();

  const spotPoint = () => s.centreOf(spot);
  const ownBin = (thing: T) => bins[round.bins.indexOf(game.binOf(thing))]!;
  const mouthOf = (bin: BinView): Point => {
    if (bin.mouth) return bin.mouth();
    const c = s.centreOf(bin.el);
    return { x: c.x, y: c.y - bin.el.getBoundingClientRect().height * 0.25 };
  };
  const glow = (bin: BinView | null) => {
    for (const b of bins) b.el.classList.toggle('site-sort-glow', b === bin);
  };

  async function startRound(): Promise<void> {
    round = game.next();
    served = 0;
    filled.clear();
    bins = round.bins.map((key) => {
      const bin = game.bin(key);
      bin.el.classList.add('site-sort-bin');
      // A press from a keyboard or switch; fingers come through the stage's pointer events.
      bin.el.addEventListener('click', (e) => {
        if (e.detail === 0) void place(bins.indexOf(bin), true);
      });
      return bin;
    });
    binsEl.style.setProperty('--site-sort-bins', String(bins.length));
    binsEl.replaceChildren(...bins.map((b) => b.el));
    pileEl.replaceChildren(...round.pile.map((t) => game.piled(t)));
    busy = true;
    await wait(450);
    if (!alive) return;
    if (game.opening) await game.opening(bins, round.bins);
    if (alive) serve();
  }

  /** The next Thing hops off the Pile onto the Spot, or the Round is over. */
  function serve(): void {
    if (served === round.pile.length) {
      void finish();
      return;
    }
    const thing = round.pile[served]!;
    served++;
    pileEl.firstElementChild?.remove();
    const view = game.thing(thing);
    view.classList.add('site-sort-thing', 'site-sort-pop');
    s.moveTo(view, spotPoint());
    s.stage.append(view);
    current = { thing, el: view, misses: 0 };
    busy = false;
    armIdle();
  }

  /**
   * The Thing into Bin `i`, by a drag or a tap on the Bin: right, or a Miss, and after MISSES_BEFORE_HELP
   * into its own by itself.
   */
  async function place(i: number, pressed: boolean): Promise<void> {
    if (!current || busy || i < 0) return;
    const cur = current;
    busy = true;
    clearIdle();
    game.hush();
    const bin = bins[i]!;
    if (round.bins[i] === game.binOf(cur.thing)) return into(bin, pressed);

    cur.misses++;
    game.missed(cur.thing);
    replay(bin.el, 'site-sort-nope');
    if (cur.misses >= MISSES_BEFORE_HELP) {
      await s.glide(cur.el, mouthOf(ownBin(cur.thing)));
      if (!alive) return;
      return into(ownBin(cur.thing), false);
    }
    await s.glide(cur.el, spotPoint());
    if (!alive) return;
    glow(ownBin(cur.thing));
    game.helped(cur.thing);
    busy = false;
    armIdle();
  }

  async function into(bin: BinView, pressed: boolean): Promise<void> {
    const cur = current!;
    const first = !filled.has(bin);
    filled.add(bin);
    cur.el.classList.add('site-sort-going-in');
    await s.glide(cur.el, mouthOf(bin));
    if (!alive) return;
    cur.el.remove();
    current = null;
    glow(null);
    game.land(bin, cur.thing);
    replay(bin.el, 'site-sort-got');
    buzz(30);
    s.sparkleAt(bin.el);
    await game.landed(cur.thing, first, pressed);
    if (!alive) return;
    await wait(150);
    if (alive) serve();
  }

  async function finish(): Promise<void> {
    busy = true;
    clearIdle();
    await game.finish(bins);
    if (alive) s.end(game.card(round), () => void startRound());
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
        replay(current.el, 'site-sort-nudge');
        glow(ownBin(current.thing));
        game.nudged(current.thing, nudges);
      }
      armIdle();
    }, IDLE_MS);
  }

  fingers(s, {
    grabbable: () => (current && !busy ? [current.el] : []),
    touched() {
      nudges = 0;
      if (current && !busy) armIdle();
    },
    lifted() {
      game.hush();
      if (current) game.lifted?.(current.thing);
    },
    tapped(view) {
      if (!current || current.el !== view) return;
      game.hush();
      void game.tapped(current.thing, view);
    },
    dropped(_view, at) {
      if (!Number.isFinite(at.x)) return;
      const i = binAt(at, s.stage.getBoundingClientRect(), bins.length);
      if (i !== undefined) void place(i, false);
    },
    pressed(target) {
      void place(bins.findIndex((b) => b.el === target), true);
    },
  });

  // A phone turned on its side moves the Spot; a waiting Thing goes with it.
  const onResize = () => {
    if (current && !busy && !current.el.classList.contains('site-sort-held')) s.moveTo(current.el, spotPoint());
  };
  window.addEventListener('resize', onResize);

  void startRound();

  return () => {
    alive = false;
    s.leave();
    clearIdle();
    game.hush();
    window.removeEventListener('resize', onResize);
  };
}

// ---- An asking Round, Ask by Ask -----------------------------------------------------------------------

/** One of each kind on the table, and what's asked for, in order. */
export interface AskRound<K> {
  kinds: readonly K[];
  asks: readonly K[];
}

/** Where the Things lie on the table, as fractions of the stage, for two kinds and for three. */
const SEATS: Readonly<Record<number, readonly Point[]>> = {
  2: [
    { x: 0.27, y: 0.28 },
    { x: 0.73, y: 0.28 },
  ],
  3: [
    { x: 0.26, y: 0.19 },
    { x: 0.74, y: 0.19 },
    { x: 0.5, y: 0.45 },
  ],
};
/** A Thing let go below this, as a fraction of the stage's height, is given to the Asker. */
const ASKER_LINE = 0.55;

/** What a Game gives the asking screen. The screen owns the Asks; the Game owns how they look and sound. */
export interface AskGame<K> {
  next(): AskRound<K>;
  /** The one who asks, at the bottom of the stage, drawn once: a press on it asks again. */
  asker: BinView;
  /** A Thing on the table, one per kind, drawn fresh each Round. The screen adds its class and keyboard press. */
  thing(kind: K): HTMLElement;
  /**
   * Shows and says what's wanted: as each Ask starts, after a Miss, when the Asker is pressed, and from the
   * second nudge. The only Word an asking screen says is the one asked for (Piggy Bank's ADR 0004).
   */
  ask(kind: K): void;
  /** The Ask answered: e.g. a bubble goes down. */
  answered?(): void;
  lifted?(kind: K): void;
  /** The Thing asked for has gone into the Asker: its sound and how the Asker shows it. No Word. */
  landed(kind: K): void;
  /** Another Thing given, as the Asker bumps. */
  missed(kind: K): void;
  /** The nudge after 7 seconds still, `n` from 1. The screen asks again from the second and lights the Thing from the third. */
  nudged?(kind: K, n: number): void;
  /** Stops any Word playing, for a new grab. */
  hush(): void;
  /** Every Ask answered: the Asker's own motion and sound, before the card. */
  finish(): Promise<void>;
  card(round: AskRound<K>): Card;
}

/**
 * Plays asking Rounds on the stage until the screen goes: the Asker wants one of the two or three Things on
 * the table, and the child drags it in or taps it. Another is a Miss: it glides back and the Asker asks
 * again, and after MISSES_BEFORE_HELP the right one lights up and goes in by itself. The Things change
 * places between Asks. Returns the leave function.
 */
export function askRounds<K>(s: PlayStage, game: AskGame<K>): () => void {
  let alive = true;
  const { asker } = game;
  asker.el.classList.add('site-sort-asker');
  s.stage.append(asker.el);

  let round: AskRound<K>;
  let asked = 0;
  let things = new Map<K, HTMLElement>();
  /** Each Thing's place on the table. */
  let seats = new Map<HTMLElement, Point>();
  let misses = 0;
  /** While Things move, or the Round ends, fingers do nothing. */
  let busy = true;

  const wanted = (): K => round.asks[asked]!;
  const kindOf = (el: HTMLElement): K => [...things].find(([, t]) => t === el)![0];
  const seatOf = (el: HTMLElement): Point => {
    const f = seats.get(el)!;
    const r = s.stage.getBoundingClientRect();
    return { x: f.x * r.width, y: f.y * r.height };
  };
  const glow = (el: HTMLElement | null) => {
    for (const t of things.values()) t.classList.toggle('site-sort-glow', t === el);
  };

  /** New places on the table for every Thing, so the answer is never where it was. */
  function reseat(): void {
    const order = shuffle(SEATS[round.kinds.length]!);
    seats = new Map([...things.values()].map((t, i) => [t, order[i]!]));
  }

  async function startRound(): Promise<void> {
    round = game.next();
    asked = 0;
    for (const t of things.values()) t.remove();
    things = new Map(
      round.kinds.map((kind) => {
        const el = game.thing(kind);
        el.classList.add('site-sort-thing');
        // A press from a keyboard or switch; fingers come through the stage's pointer events.
        el.addEventListener('click', (e) => {
          if (e.detail === 0) void choose(el);
        });
        return [kind, el];
      }),
    );
    reseat();
    for (const t of things.values()) {
      s.moveTo(t, seatOf(t));
      t.classList.add('site-sort-pop');
      s.stage.append(t);
    }
    await wait(450);
    if (alive) void nextAsk();
  }

  async function nextAsk(): Promise<void> {
    if (asked === round.asks.length) return finish();
    misses = 0;
    if (asked > 0) {
      reseat();
      for (const t of things.values()) void s.glide(t, seatOf(t));
      await wait(GLIDE_MS);
      if (!alive) return;
    }
    game.hush();
    game.ask(wanted());
    busy = false;
    armIdle();
  }

  async function choose(el: HTMLElement): Promise<void> {
    if (busy) return;
    busy = true;
    clearIdle();
    game.hush();
    const kind = kindOf(el);
    if (kind === wanted()) return into(el);

    misses++;
    game.missed(kind);
    replay(asker.el, 'site-sort-nope');
    await s.glide(el, seatOf(el));
    if (!alive) return;
    if (misses >= MISSES_BEFORE_HELP) {
      const right = things.get(wanted())!;
      glow(right);
      await wait(700);
      if (alive) return into(right);
      return;
    }
    game.ask(wanted());
    busy = false;
    armIdle();
  }

  async function into(el: HTMLElement): Promise<void> {
    const kind = kindOf(el);
    glow(null);
    el.classList.add('site-sort-going-in');
    await s.glide(el, asker.mouth ? asker.mouth() : s.centreOf(asker.el));
    if (!alive) return;
    el.classList.add('site-sort-gone');
    el.classList.remove('site-sort-going-in');
    game.landed(kind);
    replay(asker.el, 'site-sort-got');
    buzz(30);
    s.sparkleAt(asker.el);
    game.answered?.();
    await wait(500);
    if (!alive) return;
    // Another of the same kind lies on the table again.
    s.moveTo(el, seatOf(el));
    el.classList.remove('site-sort-gone');
    replay(el, 'site-sort-pop');
    await wait(200);
    if (!alive) return;
    asked++;
    void nextAsk();
  }

  async function finish(): Promise<void> {
    busy = true;
    clearIdle();
    game.answered?.();
    await game.finish();
    if (alive) s.end(game.card(round), () => void startRound());
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
      if (!alive || busy) return;
      if (nudges < MAX_NUDGES) {
        nudges++;
        game.nudged?.(wanted(), nudges);
        if (nudges > 1) game.ask(wanted());
        if (nudges > 2) glow(things.get(wanted())!);
      }
      armIdle();
    }, IDLE_MS);
  }

  fingers(s, {
    grabbable: () => (busy ? [] : [...things.values()]),
    touched() {
      nudges = 0;
      if (!busy) armIdle();
    },
    lifted(el) {
      game.hush();
      game.lifted?.(kindOf(el));
    },
    tapped: (el) => void choose(el),
    dropped(el, at) {
      const r = s.stage.getBoundingClientRect();
      if (Number.isFinite(at.y) && at.y > r.top + r.height * ASKER_LINE) void choose(el);
      else void s.glide(el, seatOf(el));
    },
    pressed() {
      if (!busy) {
        game.hush();
        game.ask(wanted());
      }
    },
    pressable: '.site-sort-asker',
  });

  // A phone turned on its side moves the table; the Things go with it.
  const onResize = () => {
    if (busy) return;
    for (const t of things.values()) if (!t.classList.contains('site-sort-held')) s.moveTo(t, seatOf(t));
  };
  window.addEventListener('resize', onResize);

  void startRound();

  return () => {
    alive = false;
    s.leave();
    clearIdle();
    game.hush();
    window.removeEventListener('resize', onResize);
  };
}
