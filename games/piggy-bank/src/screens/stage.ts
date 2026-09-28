// What both Ways draw the same: the play header, the stage, a piece of money and a pig, how things move,
// how a finger grabs, and the end of a Round.

import { buzz, cheer } from '@shared/sound';
import type { App } from '../app';
import { h, sparkle, wait } from '../dom';
import { isBill, lookFor, SIZE_MM, type Money, type Side } from '../money';
import { picture } from '../pictures';
import { backIcon, nextIcon, pigBack, pigFront } from './icons';

export type Point = { x: number; y: number };

export const GLIDE_MS = 380;
/** Before the first nudge, and between nudges. */
export const IDLE_MS = 7000;
export const MAX_NUDGES = 3;
const END_MS = 1300;

/** A piece of money: its photo, heads up, at its true size (--d, in mm; the stylesheet scales it). */
export function moneyPiece(money: Money, tag: 'div' | 'button' = 'div'): HTMLElement {
  const img = h('img', { class: 'face' });
  img.src = picture(money);
  img.alt = '';
  img.draggable = false;
  const el = h(tag, { class: `piece ${isBill(money) ? 'bill' : 'coin'}`, label: money }, img);
  el.dataset.money = money;
  el.dataset.side = 'heads';
  el.style.setProperty('--d', String(SIZE_MM[money]));
  return el;
}

/** Turns a piece over, heads to tails and back: it narrows to an edge, changes face, and widens again. */
export async function turnOver(el: HTMLElement): Promise<void> {
  const side: Side = el.dataset.side === 'heads' ? 'tails' : 'heads';
  el.classList.add('flipping');
  await wait(120);
  el.dataset.side = side;
  el.querySelector('img')!.src = picture(el.dataset.money as Money, side);
  el.classList.remove('flipping');
}

/** A see-through piggy bank. With a Money it's a Bank, wearing that money's photo on a tag. */
export function pig(money?: Money): { el: HTMLElement; belly: HTMLElement } {
  const belly = h('span', { class: 'belly' });
  const body = h('span', { class: 'pig-body' }, h('span', { class: 'pig-art', html: pigBack }), belly, h('span', { class: 'pig-art', html: pigFront }));
  if (money) {
    const tag = h('img', { class: `tag ${isBill(money) ? 'bill' : 'coin'}` });
    tag.src = picture(money);
    tag.alt = '';
    tag.draggable = false;
    tag.style.setProperty('--d', String(SIZE_MM[money]));
    body.append(tag);
  }
  const el = h('button', { class: 'pig', label: money ?? 'piggy bank' }, body);
  return { el, belly };
}

/** A piece gone into a pig: lying in its see-through belly, one more each time. */
export function fillBelly(belly: HTMLElement, money: Money): void {
  const n = belly.childElementCount;
  const img = h('img', { class: `in-belly ${isBill(money) ? 'bill' : 'coin'}` });
  img.src = picture(money, n % 3 === 2 ? 'tails' : 'heads');
  img.alt = '';
  img.style.setProperty('--d', String(SIZE_MM[money]));
  img.style.setProperty('--n', String(n));
  belly.append(img);
}

export interface Stage {
  screen: HTMLElement;
  stage: HTMLElement;
  /** A point on the page, as the stage measures it. */
  local(x: number, y: number): Point;
  centreOf(el: Element): Point;
  moveTo(el: HTMLElement, at: Point): void;
  /** Glides a piece somewhere, taking GLIDE_MS. */
  glide(el: HTMLElement, to: Point): Promise<void>;
  /** Just above a pig's slot, where a piece goes in. */
  slotOf(pig: HTMLElement): Point;
  sparkleAt(el: Element): void;
  /** The Round's end: the cheer, a card for the grown-up about `money`, and Next. */
  end(money: Money, next: () => void): Promise<void>;
  /** The screen is going: an end still waiting never shows. */
  leave(): void;
}

export function makeStage(app: App, way: string): Stage {
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  const stage = h('main', { class: `stage way-${way}` });
  const fx = h('div', { class: 'fx-layer' });
  const screen = h('div', { class: 'site-screen screen play' }, h('header', { class: 'play-top' }, backBtn, h('div'), app.corner.gear()), stage, fx);
  app.root.append(screen);
  backBtn.addEventListener('click', () => app.start());
  let left = false;

  const local = (x: number, y: number): Point => {
    const r = stage.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  };
  const centreOf = (el: Element): Point => {
    const r = el.getBoundingClientRect();
    return local(r.left + r.width / 2, r.top + r.height / 2);
  };
  const moveTo = (el: HTMLElement, at: Point) => {
    el.style.left = `${at.x}px`;
    el.style.top = `${at.y}px`;
  };

  return {
    screen,
    stage,
    local,
    centreOf,
    moveTo,
    async glide(el, to) {
      el.classList.add('gliding');
      moveTo(el, to);
      await wait(GLIDE_MS);
      el.classList.remove('gliding');
    },
    slotOf(pigEl) {
      const r = pigEl.querySelector('.pig-body')!.getBoundingClientRect();
      // The slot is at 58 of the drawing's 120 across and 27 of its 100 down; a piece goes in just above.
      return local(r.left + r.width * 0.48, r.top + r.height * 0.2);
    },
    sparkleAt(el) {
      const at = centreOf(el);
      const s = stage.getBoundingClientRect(), f = fx.getBoundingClientRect();
      sparkle({ x: at.x + s.left - f.left, y: at.y + s.top - f.top }, fx, ['✨', '💛', '🪙']);
    },
    async end(money, next) {
      for (const p of stage.querySelectorAll('.pig')) p.classList.add('full');
      await wait(END_MS);
      if (left) return;
      const confetti = h('div', { class: 'confetti' });
      for (let i = 0; i < 30; i++) {
        const c = h('i', { text: i % 3 ? '🪙' : '✨' });
        c.style.left = `${Math.random() * 100}%`;
        c.style.animationDelay = `${Math.random() * 0.5}s`;
        c.style.animationDuration = `${1.6 + Math.random()}s`;
        c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
        confetti.append(c);
      }
      const art = moneyPiece(money);
      art.classList.add('card-art');
      const nextBtn = h('button', { class: 'site-next', label: 'Next', html: nextIcon });
      const layer = h(
        'div',
        { class: 'cheer' },
        confetti,
        h('div', { class: 'card' }, art, h('p', { class: 'site-grownup look-for', text: `🔍 ${lookFor(money)}` })),
        nextBtn,
      );
      screen.append(layer);
      cheer();
      buzz(80);
      nextBtn.addEventListener('click', () => {
        layer.remove();
        next();
      });
    },
    leave: () => (left = true),
  };
}

/** How far a finger may move and still tap, and how long a press may last. */
const TAP_SLOP = 12;
const TAP_MS = 5000;
/** A grab reaches this far past a piece's edge, about 10 mm. */
const REACH = 60;
/** How far above the fingertip a held piece rides, so the finger doesn't hide it. */
const LIFT = 36;

export interface Fingers {
  /** The pieces a finger may take now; none while something moves. */
  grabbable(): HTMLElement[];
  /** Any finger down: the child is here, so the nudges start over. */
  touched(): void;
  lifted(piece: HTMLElement): void;
  tapped(piece: HTMLElement): void;
  /** Let go after a drag, at a point on the page; NaN when the browser took the finger away. */
  dropped(piece: HTMLElement, at: Point): void;
  /** A tap on a pig, or anything else that takes a press, away from the pieces. */
  pressed(target: HTMLElement): void;
}

/**
 * Fingers on the stage: the first on a piece drags it, riding above the fingertip; a still press is a
 * tap; a press on a pig away from the pieces presses it. Other fingers and a palm are ignored until the
 * first lifts.
 */
export function fingers(s: Stage, spec: Fingers): void {
  const { stage } = s;
  let drag: { id: number; piece: HTMLElement; from: Point; at: number; moved: boolean } | null = null;
  let press: { id: number; target: HTMLElement } | null = null;

  const near = (p: Point, el: HTMLElement, reach: number) => {
    const r = el.getBoundingClientRect();
    const c = s.centreOf(el);
    return Math.abs(p.x - c.x) <= r.width / 2 + reach && Math.abs(p.y - c.y) <= r.height / 2 + reach;
  };

  stage.addEventListener('pointerdown', (e) => {
    spec.touched();
    if (drag || press) return;
    const p = s.local(e.clientX, e.clientY);
    const pieces = spec.grabbable();
    if (pieces.length === 0) return;
    const target = (e.target as Element).closest<HTMLElement>('.pig');
    if (target && !pieces.some((piece) => near(p, piece, 0))) {
      press = { id: e.pointerId, target };
      return;
    }
    // The nearest piece in reach, so a finger between two coins takes the closer.
    const dist = (el: HTMLElement) => Math.hypot(p.x - s.centreOf(el).x, p.y - s.centreOf(el).y);
    const piece = pieces.filter((el) => near(p, el, REACH)).sort((a, b) => dist(a) - dist(b))[0];
    if (!piece) return;
    e.preventDefault();
    drag = { id: e.pointerId, piece, from: p, at: e.timeStamp, moved: false };
    stage.setPointerCapture?.(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = s.local(e.clientX, e.clientY);
    if (!drag.moved && Math.hypot(p.x - drag.from.x, p.y - drag.from.y) < TAP_SLOP) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.piece.classList.add('held');
      spec.lifted(drag.piece);
    }
    s.moveTo(drag.piece, { x: p.x, y: p.y - LIFT });
  });

  const letGo = (e: PointerEvent) => {
    if (press && e.pointerId === press.id) {
      const { target } = press;
      press = null;
      if (e.type === 'pointerup' && near(s.local(e.clientX, e.clientY), target, 0)) spec.pressed(target);
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    const { piece, moved, at } = drag;
    drag = null;
    piece.classList.remove('held');
    if (e.type !== 'pointerup') {
      if (moved) spec.dropped(piece, { x: NaN, y: NaN });
      return;
    }
    if (!moved) {
      if (e.timeStamp - at <= TAP_MS) spec.tapped(piece);
      return;
    }
    spec.dropped(piece, { x: e.clientX, y: e.clientY });
  };
  stage.addEventListener('pointerup', letGo);
  stage.addEventListener('pointercancel', letGo);
}
