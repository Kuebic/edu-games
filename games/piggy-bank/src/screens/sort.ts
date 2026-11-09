// Sort, on the site's sorting screen (@shared/sort): a Purse of money at the top, Banks along the bottom,
// each wearing its money's photo. The child drags each piece, or taps a Bank, and its Word says its name as
// the first goes in, and every time a Bank is tapped. A tap on a piece turns it over. When the Purse is empty the pigs jingle, the site's cheer, a
// card for the grown-up, and Next. Until Back. This file draws the money and the pigs and plays the sounds.

import { sortRounds as sortScreenRounds } from '@shared/sort';
import type { App } from '../app';
import { sortRounds, type Money } from '../money';
import { bump, clink, flip, hushWords, jingle, pickUp, word } from '../sounds';
import { card, fillBelly, fullPigs, makeStage, moneyPiece, pig, slotOf, turnOver } from './stage';

export function sortScreen(app: App): () => void {
  const s = makeStage(app, 'sort');
  const bellies = new Map<HTMLElement, HTMLElement>();
  const nextRound = sortRounds(app.progress.game.money);
  let alive = true;

  const leave = sortScreenRounds<Money, Money>(s, {
    next() {
      const { banks, purse } = nextRound();
      return { bins: banks, pile: purse };
    },
    binOf: (money) => money,
    bin(money) {
      const { el, belly } = pig(money);
      bellies.set(el, belly);
      return { el, mouth: () => slotOf(s, el) };
    },
    thing: (money) => moneyPiece(money),
    piled: (money) => moneyPiece(money),
    land: (bin, money) => fillBelly(bellies.get(bin.el)!, money),
    lifted: () => pickUp(),
    async landed(money, first, pressed) {
      clink(money === 'dollar');
      if (first || pressed) await word(money)?.();
    },
    missed: () => bump(),
    helped: (money) => void word(money)?.(),
    async tapped(money, el) {
      flip();
      await turnOver(el);
      if (alive) void word(money)?.();
    },
    nudged: (money, n) => {
      if (n > 1) void word(money)?.();
    },
    hush: hushWords,
    async finish() {
      jingle();
      await fullPigs(s);
    },
    card: (round) => card(round.bins[Math.floor(Math.random() * round.bins.length)]!),
  });

  return () => {
    alive = false;
    leave();
  };
}
