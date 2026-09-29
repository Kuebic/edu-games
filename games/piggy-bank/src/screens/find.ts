// Find, on the site's asking screen (@shared/sort, ADR 0017): one pig at the bottom asks for a piece of
// money by name, its Word, and two or three lie on the table above, one of each kind, at true size. The
// child drags the one it asked for into the pig, or taps it. The only name she hears is the one asked for,
// once an Ask and again after a Miss, never the one she picked (ADR 0004). Six Asks fill the pig; then the
// site's cheer, a card for the grown-up, and Next. This file draws the pig and its bubble and plays the sounds.

import { askRounds, replay } from '@shared/sort';
import type { App } from '../app';
import { h } from '../dom';
import { findRounds, type Money } from '../money';
import { picture } from '../pictures';
import { ask as askNote, bump, clink, hushWords, jingle, pickUp, word } from '../sounds';
import { speakerIcon } from './icons';
import { card, fillBelly, fullPigs, makeStage, moneyPiece, pig, slotOf } from './stage';

export function findScreen(app: App): () => void {
  const s = makeStage(app, 'find');
  const nextRound = findRounds(app.progress.game.money);

  const bubbleArt = h('span', { class: 'bubble-art' });
  const bubble = h('span', { class: 'bubble' }, bubbleArt);
  const { el: pigEl, belly } = pig();
  pigEl.classList.add('big');
  pigEl.querySelector('.pig-body')!.append(bubble);

  return askRounds<Money>(s, {
    next() {
      belly.replaceChildren();
      return nextRound();
    },
    asker: { el: pigEl, mouth: () => slotOf(s, pigEl) },
    thing: (money) => moneyPiece(money, 'button'),
    /** The pig says what it wants: its Word, or with no sound, its picture in the bubble. */
    ask(money) {
      pigEl.setAttribute('aria-label', `piggy bank wants a ${money}`);
      bubble.classList.add('up');
      const clip = word(money);
      if (clip?.ready()) {
        bubbleArt.innerHTML = speakerIcon;
        askNote();
        void clip();
      } else {
        const img = h('img');
        img.src = picture(money);
        img.alt = '';
        bubbleArt.replaceChildren(img);
      }
      replay(bubble, 'asking');
    },
    answered: () => bubble.classList.remove('up'),
    lifted: () => pickUp(),
    landed(money) {
      fillBelly(belly, money);
      clink(money === 'dollar');
    },
    missed: () => bump(),
    nudged: (_money, n) => {
      if (n === 1) replay(bubble, 'asking');
    },
    hush: hushWords,
    async finish() {
      jingle();
      await fullPigs(s);
    },
    card: (round) => card(round.kinds[Math.floor(Math.random() * round.kinds.length)]!),
  });
}
