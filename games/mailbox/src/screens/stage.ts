// What both Ways draw the same: a letter on its card, a Mailbox wearing a capital, and the end of a Round,
// on the site's sorting stage (@shared/sort). Every letter is drawn in the Letter font on a baseline, the
// capital and the lowercase at one size, so p and q hang below the line and b and d rise above it (ADR 0002).

import { playStage, wait, type Card, type PlayStage } from '@shared/sort';
import type { App } from '../app';
import { h } from '../dom';
import { capital, lookFor, type Letter } from '../letters';

const END_MS = 1300;

/** A letter on a card: a 100-unit square with its baseline at 66, the letter 60 units high in the em. */
export function letterArt(text: string): string {
  return (
    '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<line class="baseline" x1="12" x2="88" y1="66" y2="66"/>' +
    `<text class="letter" x="50" y="66" text-anchor="middle">${text}</text>` +
    '</svg>'
  );
}

/** A lowercase letter on its card: the Thing both Ways move. */
export function letterCard(letter: Letter, tag: 'div' | 'button' = 'div'): HTMLElement {
  const el = h(tag, { class: 'card', label: letter, html: letterArt(letter) });
  el.dataset.letter = letter;
  return el;
}

/** A capital and, faint beside it, the lowercase it goes with: the Hint (ADR 0004). */
function plate(letter: Letter | undefined, hint: number): string {
  if (!letter) return '';
  const hinted = hint > 0;
  return (
    `<text class="letter cap" x="${hinted ? 44 : 60}" y="58" text-anchor="middle">${capital(letter)}</text>` +
    (hinted ? `<text class="letter hint" x="78" y="58" text-anchor="middle" opacity="${hint}">${letter}</text>` : '')
  );
}

/**
 * A Mailbox, side on, on its post: its plate wears a capital, and a Hint if it has one. The red flag lies
 * down until a letter goes in, then stands up: there's mail.
 */
function mailboxArt(letter: Letter | undefined, hint: number): string {
  return (
    '<svg viewBox="0 0 120 120" aria-hidden="true">' +
    '<ellipse cx="60" cy="116" rx="30" ry="3.5" fill="#0000001a"/>' +
    '<rect x="53" y="76" width="14" height="41" rx="2" fill="#9a6a3f"/>' +
    '<path d="M10 80V40q0-24 24-24h52q24 0 24 24v40Z" fill="#3b7be0" stroke="#1f4f9e" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M16 30q4-8 14-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>' +
    '<rect x="6" y="28" width="10" height="54" rx="4" fill="#2a63c4" stroke="#1f4f9e" stroke-width="2.5"/>' +
    '<rect x="22" y="23" width="76" height="47" rx="8" fill="#fff"/>' +
    '<line class="baseline" x1="28" x2="92" y1="58" y2="58"/>' +
    `<g class="plate">${plate(letter, hint)}</g>` +
    '<g class="flag"><rect x="102" y="58" width="4" height="30" rx="2" fill="#c9ced6" stroke="#8d95a3" stroke-width="1"/>' +
    '<rect x="105" y="58" width="13" height="10" rx="2" fill="#e5372f" stroke="#a8231d" stroke-width="1"/></g>' +
    '<circle cx="104" cy="86" r="2.4" fill="#8d95a3"/>' +
    '</svg>'
  );
}

export interface Mailbox {
  el: HTMLElement;
  /** Wears another capital, as the Find Mailbox does at each Ask. */
  show(letter: Letter, hint: number): void;
  /** The flag up: a letter has gone in. */
  gotMail(): void;
}

/** A Mailbox as a button. With a letter it's a Sort Mailbox for that letter; Find's changes as it asks. */
export function mailbox(letter?: Letter, hint = 0): Mailbox {
  const body = h('span', { class: 'mailbox-body', html: mailboxArt(letter, hint) });
  const el = h('button', { class: 'mailbox', label: letter ? capital(letter) : 'mailbox' }, body);
  if (letter) el.dataset.letter = letter;
  return {
    el,
    show(l, hint) {
      body.querySelector('.plate')!.innerHTML = plate(l, hint);
      el.dataset.letter = l;
      el.setAttribute('aria-label', `mailbox wants ${l}`);
    },
    gotMail: () => el.classList.add('has-mail'),
  };
}

/** The play screen for a Way, with letters for confetti and sparkles. */
export function makeStage(app: App, way: string): PlayStage {
  return playStage(app.root, {
    className: `way-${way}`,
    back: () => app.start(),
    tools: [app.corner.gear()],
    confetti: { glyphs: ['✉️', '✨', '💌'] },
    sparkles: ['✨', '💛', '✉️'],
  });
}

/** The grown-up's card about `letter`: its capital and lowercase, to look for in a book. */
export function card(letter: Letter): Card {
  const art = h('span', {
    class: 'card-art',
    html:
      '<svg viewBox="0 0 100 100" aria-hidden="true"><line class="baseline" x1="4" x2="96" y1="66" y2="66"/>' +
      `<text class="letter" x="30" y="66" text-anchor="middle">${capital(letter)}</text>` +
      `<text class="letter" x="72" y="66" text-anchor="middle">${letter}</text></svg>`,
  });
  return { art, text: lookFor(letter) };
}

/** Every Mailbox wiggles with its flag up, before the card. */
export async function delivered(s: PlayStage): Promise<void> {
  for (const m of s.stage.querySelectorAll('.mailbox')) m.classList.add('has-mail', 'delivered');
  await wait(END_MS);
}
