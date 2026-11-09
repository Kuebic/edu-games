// Practice's Boards: a grid of Cards in the middle, a row of empty Frames above, on the site's play stage
// (@shared/sort: Back, the gear, the end of a Round). The child taps Cards; the first lifted leads, a tap
// outside its group is a Miss at once, and a whole group gathers into the next Frame and says its Word
// (docs/spec.md, ADR 0001). When every Frame is full: the site's cheer, a card for the grown-up, and Next.

import { IDLE_MS, MAX_NUDGES, playStage, replay, wait, type Card as GrownUpCard, type PlayStage } from '@shared/sort';
import type { App } from '../app';
import { BOARD_COLUMNS, deals, done, FRAME_COLOURS, fresh, leadOf, restOf, tap, wordOf, type Deal, type Picking } from '../boards';
import { h } from '../dom';
import { bump, chime, hushWords, pop, shine, unpop, word } from '../sounds';

export { IDLE_MS } from '@shared/sort';

/** The lifted Cards slide together before they hop into their Frame. */
const GATHER_MS = 450;
/** The Frames shine before the cheer. */
const SHINE_MS = 1300;
/** A Miss's shake. */
const SHAKE_MS = 360;

const LOOK_FOR = 'Which things at home go together? Find three.';

const emoji = (glyph: string) => h('span', { class: 'emoji', text: glyph });

/** One deal on the stage: the Frames, the grid, and the picking, until the Board is done. */
function board(s: PlayStage, deal: Deal, over: () => void): () => void {
  let state: Picking = fresh;
  /** While a group gathers, taps wait. */
  let busy = false;
  let gone = false;
  let nudges = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const frames = deal.groups.map((_, i) => {
    const frame = h('div', { class: 'frame', label: 'an empty frame' });
    frame.style.setProperty('--frame', FRAME_COLOURS[i % FRAME_COLOURS.length]!);
    return frame;
  });
  const framesRow = h('div', { class: 'frames' }, ...frames);
  const cards = deal.cards.map((card, i) => {
    const el = h('button', { class: 'card', label: card.name }, emoji(card.emoji));
    el.dataset.index = String(i);
    el.dataset.group = card.group;
    el.setAttribute('aria-pressed', 'false');
    el.addEventListener('click', () => tapped(i));
    return el;
  });
  const grid = h('div', { class: 'grid' }, ...cards);
  grid.style.setProperty('--cols', String(BOARD_COLUMNS[deal.board]));
  grid.style.setProperty('--rows', String(deal.cards.length / BOARD_COLUMNS[deal.board]));
  s.stage.append(framesRow, grid);

  const lift = (i: number, up: boolean) => {
    cards[i]!.classList.toggle('lifted', up);
    cards[i]!.setAttribute('aria-pressed', String(up));
  };
  /** The rest of the group lights up, again even if it still was. */
  const glowRest = (group: string) => {
    for (const i of restOf(deal, state, group)) replay(cards[i]!, 'glow');
  };
  const clearGlow = () => {
    for (const c of cards) c.classList.remove('glow');
  };

  function rest(): void {
    clearTimeout(timer);
    if (gone || done(deal, state)) return;
    timer = setTimeout(nudge, IDLE_MS);
  }

  /** Quiet for a while: with nothing up, one Card wiggles; with a lead up, its group glows, and from the second its Word plays. */
  function nudge(): void {
    if (gone || busy) return;
    nudges++;
    const lead = leadOf(deal, state);
    if (lead === undefined) {
      const left = deal.cards.flatMap((c, i) => (state.found.includes(c.group) ? [] : [i]));
      const i = left[Math.floor(Math.random() * left.length)];
      if (i !== undefined) replay(cards[i]!, 'site-sort-nudge');
    } else {
      glowRest(lead);
      if (nudges > 1) void word(wordOf(deal, lead))?.();
    }
    if (nudges < MAX_NUDGES) timer = setTimeout(nudge, IDLE_MS);
  }

  /** The group's Cards slide together, chime, hop into the next empty Frame, and its Word is said once. */
  async function gather(group: string): Promise<void> {
    busy = true;
    clearGlow();
    const members = deal.cards.flatMap((c, i) => (c.group === group ? [i] : []));
    for (const i of members) {
      lift(i, true);
      cards[i]!.classList.add('gathering');
    }
    await wait(GATHER_MS);
    if (gone) return;
    chime();
    const frame = frames[state.found.length - 1]!;
    frame.replaceChildren(...members.map((i) => emoji(deal.cards[i]!.emoji)));
    frame.classList.add('full');
    frame.dataset.group = group;
    frame.setAttribute('aria-label', wordOf(deal, group));
    for (const i of members) {
      lift(i, false);
      cards[i]!.classList.remove('gathering');
      cards[i]!.classList.add('gone');
    }
    void word(wordOf(deal, group))?.();
    busy = false;
    if (done(deal, state)) {
      clearTimeout(timer);
      await wait(SHINE_MS / 2);
      if (gone) return;
      for (const f of frames) f.classList.add('shine');
      shine();
      await wait(SHINE_MS);
      if (gone) return;
      over();
    } else rest();
  }

  function tapped(i: number): void {
    if (busy || gone) return;
    nudges = 0;
    rest();
    const was = state;
    const { state: next, outcome } = tap(deal, state, i);
    state = next;
    switch (outcome.kind) {
      case 'nothing':
        return;
      case 'lift':
        hushWords();
        pop();
        lift(i, true);
        // A lifted Card is of the group; the glow was for finding it.
        cards[i]!.classList.remove('glow');
        return;
      case 'drop':
        unpop();
        lift(i, false);
        if (state.lifted.length === 0) clearGlow();
        else if (was.misses > 0) glowRest(leadOf(deal, state)!);
        return;
      case 'miss':
        bump();
        replay(cards[i]!, 'shake');
        if (outcome.help === 'glow') glowRest(outcome.group);
        else {
          // The group is already found in `state`; taps wait until it has gathered on screen too.
          busy = true;
          void wait(SHAKE_MS).then(() => (gone ? undefined : gather(outcome.group)));
        }
        return;
      case 'gather':
        void gather(outcome.group);
    }
  }

  rest();
  return () => {
    gone = true;
    clearTimeout(timer);
  };
}

/** Boards of the saved Topic, Scope and Board, until Back. */
export function playScreen(app: App): () => void {
  const g = app.progress.game;
  const scope = g.topic === 'same' ? g.same : g.topic === 'colors' ? g.colors : g.kinds;
  const nextDeal = deals(g.topic, scope, g.board);

  const s = playStage(app.root, {
    className: `topic-${g.topic} board-${g.board}`,
    back: () => app.start(),
    tools: [app.corner.gear()],
    confetti: { colours: [...FRAME_COLOURS] },
  });

  let leaveBoard: (() => void) | undefined;

  function card(deal: Deal): GrownUpCard {
    const group = deal.groups[Math.floor(Math.random() * deal.groups.length)]!;
    const members = deal.cards.filter((c) => c.group === group.key).slice(0, 3);
    return { art: h('span', { class: 'card-art' }, ...members.map((m) => emoji(m.emoji))), text: LOOK_FOR };
  }

  function next(): void {
    leaveBoard?.();
    s.stage.replaceChildren();
    const deal = nextDeal();
    leaveBoard = board(s, deal, () => s.end(card(deal), next));
  }

  next();
  return () => {
    leaveBoard?.();
    hushWords();
    s.leave();
  };
}
