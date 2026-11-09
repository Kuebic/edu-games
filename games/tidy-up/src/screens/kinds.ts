// Kinds on the site's sorting screen (@shared/sort): a Pile of everyday Things, and a wooden crate for each
// group of the Step, three small members on its card. As a Round starts each crate says its group's Word;
// a Thing lands with only a sound, or its group's Word when the crate was pressed, and says its own name
// when tapped. After a Miss it says its name, then its group's Word, and its own crate glows (docs/kinds.md,
// ADR 0004).

import { playStage, replay, sortRounds, wait, type BinView } from '@shared/sort';
import type { App } from '../app';
import { h } from '../dom';
import { GROUP_WORDS, kindsLookFor, kindsRounds, type Group, type KindsPiece, type KindsRound } from '../kinds';
import { bump, drop, hushWords, pickUp, tidy, word } from '../sounds';
import { crateSvg } from './icons';

/** The crates' own motion at the end, before the cheer. */
const TIDY_MS = 1300;
/** Least time a crate takes to say its name as a Round opens, heard or not. */
const NAME_MS = 700;

const emoji = (glyph: string) => h('span', { class: 'emoji', text: glyph });

/** Plays a Word and waits for it, then for the rest of `least` ms, so a silent phone still keeps time. */
async function sayFor(said: string, least = 0): Promise<void> {
  const started = Date.now();
  await word(said)?.();
  const left = least - (Date.now() - started);
  if (left > 0) await wait(left);
}

export function kindsScreen(app: App): () => void {
  const g = app.progress.game;
  const nextRound = kindsRounds(g.kinds, g.kindsWay);
  let round: KindsRound;
  let alive = true;

  const s = playStage(app.root, {
    className: 'look-crates',
    back: () => app.start(),
    tools: [app.corner.gear()],
    confetti: { colours: ['#dba466', '#6fd3a8', '#7cc3f5', '#ffce4f', '#ff8a3d'] },
  });

  const loads = new Map<HTMLElement, HTMLElement>();
  const groupWord = (group: Group) => GROUP_WORDS[group];

  const leave = sortRounds<KindsPiece, Group>(s, {
    next: () => (round = nextRound()),
    binOf: (piece) => piece.group,
    bin(group): BinView {
      const load = h('span', { class: 'load' });
      const card = h('span', { class: 'crate-card' }, ...(round.cards[group] ?? []).map((m) => emoji(m.emoji)));
      const el = h(
        'button',
        { class: 'bin crate', label: groupWord(group) },
        h('span', { class: 'bin-body' }, load, h('span', { class: 'bin-art', html: crateSvg }), card),
      );
      loads.set(el, load);
      return { el };
    },
    thing: (piece) => h('div', { class: 'thing', label: piece.name }, emoji(piece.emoji)),
    piled: (piece) => h('span', { class: 'pile-thing' }, emoji(piece.emoji)),
    land(bin, piece) {
      const load = loads.get(bin.el)!;
      const landed = h('span', { class: 'landed' }, emoji(piece.emoji));
      landed.style.setProperty('--n', String(load.childElementCount));
      load.append(landed);
    },
    async opening(bins, groups) {
      for (const [i, bin] of bins.entries()) {
        if (!alive) return;
        replay(bin.el, 'site-sort-got');
        await sayFor(groupWord(groups[i]!), NAME_MS);
      }
    },
    lifted: () => pickUp(),
    // The crates said their names as the Round opened, so a right drop is only its sound (ADR 0004).
    async landed(piece, _first, pressed) {
      drop();
      if (pressed) await word(groupWord(piece.group))?.();
    },
    missed: () => bump(),
    helped(piece) {
      void (async () => {
        await word(piece.name)?.();
        if (alive) await word(groupWord(piece.group))?.();
      })();
    },
    tapped(piece, el) {
      replay(el, 'site-sort-wiggle');
      void word(piece.name)?.();
    },
    nudged: (piece, n) => {
      if (n > 1) void word(groupWord(piece.group))?.();
    },
    hush: hushWords,
    async finish(bins) {
      for (const b of bins) b.el.classList.add('tidy');
      tidy('buckets');
      await wait(TIDY_MS);
    },
    card() {
      const group = round.bins[Math.floor(Math.random() * round.bins.length)]!;
      const member = round.cards[group]?.[0];
      return { art: h('span', { class: 'card-art' }, emoji(member?.emoji ?? '📦')), text: kindsLookFor(group) };
    },
  });

  return () => {
    alive = false;
    leave();
  };
}
