// Find: one pig at the bottom asks for a piece of money by name, its Word, and two or three lie on the table
// above, one of each kind, at true size. The child drags the one it asked for into the pig, or taps it. The
// only name she hears is the one asked for, once an Ask and again after a Miss, never the one she picked
// (ADR 0004). Six Asks fill the pig; then the site's cheer, a card for the grown-up, and Next.

import { fingers, GLIDE_MS, IDLE_MS, MAX_NUDGES, MISSES_BEFORE_HELP, replay, shuffle, wait, type Point } from '@shared/sort';
import { buzz } from '@shared/sound';
import type { App } from '../app';
import { h } from '../dom';
import { findRounds, type FindRound, type Money } from '../money';
import { picture } from '../pictures';
import { ask as askNote, bump, clink, hushWords, jingle, pickUp, word } from '../sounds';
import { speakerIcon } from './icons';
import { card, fillBelly, fullPigs, makeStage, moneyPiece, pig, slotOf } from './stage';

/** Where the coins lie, as fractions of the stage, for two kinds and for three. */
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
/** A piece let go below this, as a fraction of the stage's height, is let go over the pig. */
const PIG_LINE = 0.55;

export function findScreen(app: App): () => void {
  let alive = true;
  const s = makeStage(app, 'find');
  const nextRound = findRounds(app.progress.game.money);

  const bubbleArt = h('span', { class: 'bubble-art' });
  const bubble = h('span', { class: 'bubble' }, bubbleArt);
  const { el: pigEl, belly } = pig();
  pigEl.classList.add('big');
  pigEl.querySelector('.pig-body')!.append(bubble);
  s.stage.append(pigEl);

  let round: FindRound;
  let asked = 0;
  let pieces: HTMLElement[] = [];
  /** Each piece's place on the table, by its Money. */
  let seats = new Map<string, Point>();
  let misses = 0;
  /** While pieces move, or the Round ends, fingers do nothing. */
  let busy = true;

  const wanted = (): Money => round.asks[asked]!;
  const pieceOf = (money: Money) => pieces.find((p) => p.dataset.money === money)!;
  const seatOf = (el: HTMLElement): Point => {
    const f = seats.get(el.dataset.money!)!;
    const r = s.stage.getBoundingClientRect();
    return { x: f.x * r.width, y: f.y * r.height };
  };
  const glow = (el: HTMLElement | null) => {
    for (const p of pieces) p.classList.toggle('glow', p === el);
  };

  /** New places on the table for every piece, so the answer is never where it was. */
  function reseat(): void {
    const order = shuffle(SEATS[round.kinds.length]!);
    seats = new Map(round.kinds.map((m, i) => [m, order[i]!]));
  }

  async function startRound(): Promise<void> {
    round = nextRound();
    asked = 0;
    belly.replaceChildren();
    for (const p of pieces) p.remove();
    pieces = round.kinds.map((money) => {
      const el = moneyPiece(money, 'button');
      el.classList.add('site-sort-thing');
      // A press from a keyboard or switch; fingers come through the stage's pointer events.
      el.addEventListener('click', (e) => {
        if (e.detail === 0) void choose(el);
      });
      return el;
    });
    reseat();
    for (const p of pieces) {
      s.moveTo(p, seatOf(p));
      p.classList.add('site-sort-pop');
      s.stage.append(p);
    }
    await wait(450);
    if (alive) void nextAsk();
  }

  /** The pig says what it wants: its Word, or with no sound, its picture in the bubble. */
  function sayAsk(): void {
    hushWords();
    const clip = word(wanted());
    if (clip?.ready()) {
      bubbleArt.innerHTML = speakerIcon;
      askNote();
      void clip();
    } else {
      const img = h('img');
      img.src = picture(wanted());
      img.alt = '';
      bubbleArt.replaceChildren(img);
    }
    replay(bubble, 'asking');
  }

  async function nextAsk(): Promise<void> {
    if (asked === round.asks.length) return finish();
    misses = 0;
    if (asked > 0) {
      reseat();
      for (const p of pieces) void s.glide(p, seatOf(p));
      await wait(GLIDE_MS);
      if (!alive) return;
    }
    bubble.classList.add('up');
    pigEl.setAttribute('aria-label', `piggy bank wants a ${wanted()}`);
    sayAsk();
    busy = false;
    armIdle();
  }

  /**
   * A piece picked: the one asked for goes in. Another is a Miss: it slides back and the pig asks again, and
   * after two the right one lights up and goes in by itself. The wrong piece's name is never said.
   */
  async function choose(el: HTMLElement): Promise<void> {
    if (busy) return;
    busy = true;
    clearIdle();
    hushWords();
    const money = el.dataset.money as Money;
    if (money === wanted()) return into(el);

    misses++;
    bump();
    replay(pigEl, 'site-sort-nope');
    await s.glide(el, seatOf(el));
    if (!alive) return;
    if (misses >= MISSES_BEFORE_HELP) {
      const right = pieceOf(wanted());
      glow(right);
      await wait(700);
      if (alive) return into(right);
      return;
    }
    sayAsk();
    busy = false;
    armIdle();
  }

  async function into(el: HTMLElement): Promise<void> {
    const money = el.dataset.money as Money;
    glow(null);
    el.classList.add('site-sort-going-in');
    await s.glide(el, slotOf(s, pigEl));
    if (!alive) return;
    el.classList.add('gone');
    el.classList.remove('site-sort-going-in');
    fillBelly(belly, money);
    replay(pigEl, 'site-sort-got');
    clink(money === 'dollar');
    buzz(30);
    s.sparkleAt(pigEl);
    bubble.classList.remove('up');
    await wait(500);
    if (!alive) return;
    // A new one of the same kind lies on the table again.
    s.moveTo(el, seatOf(el));
    el.classList.remove('gone');
    replay(el, 'site-sort-pop');
    await wait(200);
    if (!alive) return;
    asked++;
    void nextAsk();
  }

  async function finish(): Promise<void> {
    busy = true;
    clearIdle();
    bubble.classList.remove('up');
    jingle();
    await fullPigs(s);
    if (alive) s.end(card(round.kinds[Math.floor(Math.random() * round.kinds.length)]!), () => void startRound());
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
        if (nudges > 1) sayAsk();
        else replay(bubble, 'asking');
        if (nudges > 2) glow(pieceOf(wanted()));
      }
      armIdle();
    }, IDLE_MS);
  }

  fingers(s, {
    grabbable: () => (busy ? [] : pieces),
    touched() {
      nudges = 0;
      if (!busy) armIdle();
    },
    lifted() {
      hushWords();
      pickUp();
    },
    tapped: (el) => void choose(el),
    dropped(el, at) {
      const r = s.stage.getBoundingClientRect();
      if (Number.isFinite(at.y) && at.y > r.top + r.height * PIG_LINE) void choose(el);
      else void s.glide(el, seatOf(el));
    },
    pressed() {
      if (!busy) sayAsk();
    },
    pressable: '.pig',
  });

  // A phone turned on its side moves the table; the pieces go with it.
  const onResize = () => {
    if (busy) return;
    for (const p of pieces) if (!p.classList.contains('site-sort-held')) s.moveTo(p, seatOf(p));
  };
  window.addEventListener('resize', onResize);

  void startRound();

  return () => {
    alive = false;
    s.leave();
    clearIdle();
    hushWords();
    window.removeEventListener('resize', onResize);
  };
}
