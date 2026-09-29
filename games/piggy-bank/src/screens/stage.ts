// What both Ways draw the same: a piece of money, a pig, where a piece goes into a pig, and the end of a
// Round, on the site's sorting stage (@shared/sort).

import { playStage, wait, type Card, type PlayStage, type Point } from '@shared/sort';
import type { App } from '../app';
import { h } from '../dom';
import { isBill, lookFor, SIZE_MM, type Money, type Side } from '../money';
import { picture } from '../pictures';
import { pigBack, pigFront } from './icons';

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

/** The play screen for a Way, with Piggy Bank's coins for confetti and sparkles. */
export function makeStage(app: App, way: string): PlayStage {
  return playStage(app.root, {
    className: `way-${way}`,
    back: () => app.start(),
    tools: [app.corner.gear()],
    confetti: { glyphs: ['✨', '🪙', '🪙'] },
    sparkles: ['✨', '💛', '🪙'],
  });
}

/** Just above a pig's slot, where a piece goes in. */
export function slotOf(s: PlayStage, pigEl: HTMLElement): Point {
  const r = pigEl.querySelector('.pig-body')!.getBoundingClientRect();
  // The slot is at 58 of the drawing's 120 across and 27 of its 100 down; a piece goes in just above.
  return s.local(r.left + r.width * 0.48, r.top + r.height * 0.2);
}

/** The grown-up's card about `money`. */
export function card(money: Money): Card {
  const art = moneyPiece(money);
  art.classList.add('card-art');
  return { art, text: lookFor(money) };
}

/** The pigs jingle full, before the card. */
export async function fullPigs(s: PlayStage): Promise<void> {
  for (const p of s.stage.querySelectorAll('.pig')) p.classList.add('full');
  await wait(END_MS);
}
