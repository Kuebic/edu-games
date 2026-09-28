// Sort: a Purse of money at the top, Banks along the bottom, each wearing its money's photo. The child drags
// each piece, or taps a Bank, and its Word says its name as it goes in. A tap on a piece turns it over.
// When the Purse is empty the pigs jingle, the site's cheer, a card for the grown-up, and Next. Until Back.

import { buzz } from '@shared/sound';
import type { App } from '../app';
import { h, replay, wait } from '../dom';
import { bankAt, MISSES_BEFORE_HELP, sortRounds, type Money, type SortRound } from '../money';
import { bump, clink, flip, hushWords, jingle, pickUp, word } from '../sounds';
import { fillBelly, fingers, IDLE_MS, makeStage, MAX_NUDGES, moneyPiece, pig, turnOver } from './stage';

export function sortScreen(app: App): () => void {
  let alive = true;
  const s = makeStage(app, 'sort');
  const nextRound = sortRounds(app.progress.game.money);

  const purseEl = h('div', { class: 'purse' });
  const spot = h('div', { class: 'spot' });
  const banksEl = h('div', { class: 'banks' });
  s.stage.append(purseEl, spot, banksEl);

  let round: SortRound;
  let served = 0;
  let banks: { el: HTMLElement; belly: HTMLElement }[] = [];
  /** The piece on the Spot, or held, or left lying, waiting to go into a Bank. */
  let current: { money: Money; el: HTMLElement; misses: number } | null = null;
  /** While a piece glides, goes in, or the Round ends, fingers do nothing. */
  let busy = true;

  const spotPoint = () => s.centreOf(spot);
  const ownBank = (money: Money) => banks[round.banks.indexOf(money)]!.el;
  const glow = (bank: HTMLElement | null) => {
    for (const b of banks) b.el.classList.toggle('glow', b.el === bank);
  };

  async function startRound(): Promise<void> {
    round = nextRound();
    served = 0;
    banks = round.banks.map((money) => {
      const bank = pig(money);
      // A press from a keyboard or switch; fingers come through the stage's pointer events.
      bank.el.addEventListener('click', (e) => {
        if (e.detail === 0) void place(banks.indexOf(bank));
      });
      return bank;
    });
    banksEl.style.setProperty('--banks', String(banks.length));
    banksEl.replaceChildren(...banks.map((b) => b.el));
    purseEl.replaceChildren(...round.purse.map((money) => moneyPiece(money)));
    await wait(450);
    if (alive) serve();
  }

  /** The next piece hops out of the Purse onto the Spot, or the Round is over. */
  function serve(): void {
    if (served === round.purse.length) {
      void finish();
      return;
    }
    const money = round.purse[served]!;
    served++;
    purseEl.firstElementChild?.remove();
    const el = moneyPiece(money);
    el.classList.add('pop');
    s.moveTo(el, spotPoint());
    s.stage.append(el);
    current = { money, el, misses: 0 };
    busy = false;
    armIdle();
  }

  /** The piece into Bank `i`: right, or a Miss, and after two Misses into its own by itself. */
  async function place(i: number): Promise<void> {
    if (!current || busy) return;
    const cur = current;
    busy = true;
    clearIdle();
    hushWords();
    const bank = banks[i]!.el;
    if (round.banks[i] === cur.money) return into(i);

    cur.misses++;
    bump();
    replay(bank, 'nope');
    if (cur.misses >= MISSES_BEFORE_HELP) {
      await s.glide(cur.el, s.slotOf(ownBank(cur.money)));
      if (!alive) return;
      return into(round.banks.indexOf(cur.money));
    }
    await s.glide(cur.el, spotPoint());
    if (!alive) return;
    glow(ownBank(cur.money));
    void word(cur.money)?.();
    busy = false;
    armIdle();
  }

  async function into(i: number): Promise<void> {
    const cur = current!;
    const { el: bank, belly } = banks[i]!;
    cur.el.classList.add('going-in');
    await s.glide(cur.el, s.slotOf(bank));
    if (!alive) return;
    cur.el.remove();
    current = null;
    glow(null);
    fillBelly(belly, cur.money);
    replay(bank, 'got');
    clink(cur.money === 'dollar');
    buzz(30);
    s.sparkleAt(bank);
    await word(cur.money)?.();
    if (!alive) return;
    await wait(150);
    if (alive) serve();
  }

  async function finish(): Promise<void> {
    busy = true;
    clearIdle();
    jingle();
    await s.end(round.banks[Math.floor(Math.random() * round.banks.length)]!, () => void startRound());
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
        glow(ownBank(current.money));
        if (nudges > 1) void word(current.money)?.();
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
      hushWords();
      pickUp();
    },
    async tapped(el) {
      hushWords();
      flip();
      await turnOver(el);
      if (alive) void word(el.dataset.money as Money)?.();
    },
    dropped(_el, at) {
      if (!Number.isFinite(at.x)) return;
      const i = bankAt(at, s.stage.getBoundingClientRect(), banks.length);
      if (i !== undefined) void place(i);
    },
    pressed(target) {
      const i = banks.findIndex((b) => b.el === target);
      if (i >= 0) void place(i);
    },
  });

  // A phone turned on its side moves the Spot; a waiting piece goes with it.
  const onResize = () => {
    if (current && !busy && !current.el.classList.contains('held')) s.moveTo(current.el, spotPoint());
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
