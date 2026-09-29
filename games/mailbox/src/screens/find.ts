// Find, on the site's asking screen (@shared/sort, ADR 0017): one Mailbox at the bottom wears a capital and
// says its name, and two or three lowercase letters lie on the table above. The child drags the one that
// goes with it into the Mailbox, or taps it. The only name she hears is the one asked for, once an Ask and
// again after a Miss (Piggy Bank's ADR 0004). Six Asks; then every flag up, the site's cheer, a card for the
// grown-up, and Next. With no sound the capital is the Ask on its own, and the Game still plays.

import { askRounds, replay } from '@shared/sort';
import type { App } from '../app';
import { afterRound, findRounds, hintOf, type Letter } from '../letters';
import { bump, delivered as deliveredTune, hushNames, pickUp, post, say } from '../sounds';
import { card, delivered, letterCard, mailbox, makeStage } from './stage';

export function findScreen(app: App): () => void {
  const { progress } = app;
  const s = makeStage(app, 'find');
  const nextRound = findRounds(progress.game.letters);
  const box = mailbox();
  box.el.classList.add('big');
  let kinds: readonly Letter[] = [];
  /** What's asked for now, and the letters asked for and missed this Round. */
  let wanted: Letter | undefined;
  let missed = new Set<Letter>();

  return askRounds<Letter>(s, {
    next() {
      missed = new Set();
      box.el.classList.remove('has-mail');
      const round = nextRound();
      kinds = round.kinds;
      return round;
    },
    asker: { el: box.el },
    thing: (letter) => letterCard(letter, 'button'),
    ask(letter) {
      if (letter !== wanted) {
        wanted = letter;
        box.show(letter, hintOf(progress.game.learnt, letter));
        replay(box.el, 'turn');
      } else {
        replay(box.el, 'waggle');
      }
      void say(letter);
    },
    answered: () => (wanted = undefined),
    lifted: () => pickUp(),
    landed() {
      box.gotMail();
      post();
    },
    missed() {
      if (wanted) missed.add(wanted);
      bump();
    },
    nudged: (_letter, n) => {
      if (n === 1) replay(box.el, 'waggle');
    },
    hush: hushNames,
    async finish() {
      progress.game.learnt = afterRound(progress.game.learnt, kinds, missed);
      progress.save();
      deliveredTune();
      await delivered(s);
    },
    card: (round) => card(round.kinds[Math.floor(Math.random() * round.kinds.length)]!),
  });
}
