// Sort, on the site's sorting screen (@shared/sort): a Bag of lowercase letters at the top, two or three
// Mailboxes along the bottom, each wearing a capital. The child drags each letter, or taps a Mailbox, and
// the first letter into each Mailbox a Round says its name. A Miss says the name of the letter in her hand,
// never "capital" or "lowercase" (ADR 0003). When the Bag is empty every flag is up, the site's cheer, a card
// for the grown-up, and Next. Until Back. This file draws the letters and Mailboxes and plays the sounds.

import { replay, sortRounds as sortScreenRounds, type BinView } from '@shared/sort';
import type { App } from '../app';
import { afterRound, hintOf, sortRounds, type Letter } from '../letters';
import { bump, delivered as deliveredTune, hushNames, pickUp, post, say } from '../sounds';
import { card, delivered, letterCard, mailbox, makeStage, type Mailbox } from './stage';

export function sortScreen(app: App): () => void {
  const { progress } = app;
  const s = makeStage(app, 'sort');
  const nextRound = sortRounds(progress.game.letters);
  const boxes = new Map<HTMLElement, Mailbox>();
  /** Letters missed this Round: their Hints stay, or come back. */
  let missed = new Set<Letter>();

  return sortScreenRounds<Letter, Letter>(s, {
    next() {
      missed = new Set();
      boxes.clear();
      const { boxes: letters, bag } = nextRound();
      return { bins: letters, pile: bag };
    },
    binOf: (letter) => letter,
    bin(letter): BinView {
      const box = mailbox(letter, hintOf(progress.game.learnt, letter));
      boxes.set(box.el, box);
      return { el: box.el };
    },
    thing: (letter) => letterCard(letter),
    piled: (letter) => {
      const el = letterCard(letter);
      el.classList.add('piled');
      return el;
    },
    land: (bin) => boxes.get(bin.el)?.gotMail(),
    lifted: () => pickUp(),
    async landed(letter, first) {
      post();
      if (first) await say(letter);
    },
    missed(letter) {
      missed.add(letter);
      bump();
    },
    helped: (letter) => void say(letter),
    tapped(letter, el) {
      replay(el, 'site-sort-wiggle');
      void say(letter);
    },
    nudged: (letter, n) => {
      if (n > 1) void say(letter);
    },
    hush: hushNames,
    async finish(bins) {
      progress.game.learnt = afterRound(progress.game.learnt, bins.map((b) => b.el.dataset.letter!), missed);
      progress.save();
      deliveredTune();
      await delivered(s);
    },
    card: (round) => card(round.bins[Math.floor(Math.random() * round.bins.length)]!),
  });
}
