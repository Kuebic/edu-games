import { buzz, cheer } from '@shared/sound';
import { hush, say } from '@shared/voice';
import type { App } from '../app';
import { h, replay, sparkle, wait } from '../dom';
import { roundAfter } from '../progress';
import { BOXES, ROUND_LENGTH, makeRound, type Find, type Picture } from '../rounds';
import { play } from '../sfx';
import { backIcon, nextIcon } from './icons';

const IDLE_MS = 10000;
const MAX_NUDGES = 3;

/** One Find as the screen draws and speaks it. */
interface Shown {
  /** What to look at. */
  prompt: HTMLElement;
  /** What's asked, said at the start, on a tap of the prompt, and after a wrong pick. */
  ask: string;
  /** The three to choose from, in order. */
  choices: HTMLElement[];
  /** Which of them is right. */
  right: number;
  /** What to say about a wrong pick, before asking again. */
  wrong(i: number): string;
  /** What to say when it's right. */
  yes: string;
  /** Count the Tray aloud after a wrong pick, before asking again. */
  countAlong?: boolean;
}

const beans = (n: number) => (n === 1 ? '1 bean' : `${n} beans`);
const letterName = (l: string) => `the letter ${l}`;
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
const list = (words: string[]) => `${words.slice(0, -1).join(', ')}, or ${words[words.length - 1]}`;

/** A Tray of beans, in rows of ten, five and five. Empty when n is 0. */
function tray(n: number): HTMLElement {
  const t = h('div', { class: `tray${n === 0 ? ' tray-empty' : ''}`, label: beans(n) });
  for (let i = 0; i < n; i++) t.append(h('i', { class: 'bean' }));
  return t;
}

const glyph = (text: string) => h('span', { class: 'glyph', text, label: text });
const picture = (p: Picture) => h('span', { class: 'picture', text: p.emoji, label: p.word });

function shown(find: Find): Shown {
  if (find.kind === 'number') {
    const n = find.target;
    if (find.direction === 'find-symbol') {
      return {
        prompt: tray(n),
        ask: 'How many beans? Find the number!',
        choices: find.choices.map((c) => glyph(String(c))),
        right: find.choices.indexOf(n),
        wrong: (i) => `That's ${find.choices[i]}.`,
        yes: `Yes! ${beans(n)}!`,
        countAlong: true,
      };
    }
    return {
      prompt: glyph(String(n)),
      ask: n === 0 ? 'Find zero beans. Which tray is empty?' : `Find ${beans(n)}!`,
      choices: find.choices.map((c) => tray(c)),
      right: find.choices.indexOf(n),
      wrong: (i) => `That's ${beans(find.choices[i]!)}.`,
      yes: `Yes! ${beans(n)}!`,
    };
  }
  const L = find.letter;
  if (find.direction === 'find-symbol') {
    const word = cap(find.picture.word);
    return {
      prompt: picture(find.picture),
      ask: `${word}! ${word} starts with ${L}. Find ${letterName(L)}!`,
      choices: find.choices.map((c) => glyph(c)),
      right: find.choices.indexOf(L),
      wrong: (i) => `That's ${letterName(find.choices[i]!)}.`,
      yes: `Yes! ${L}! ${word} starts with ${L}!`,
    };
  }
  const words = find.choices.map((p) => p.word);
  return {
    prompt: glyph(L),
    ask: `${letterName(L)}! Which one starts with ${L}? ${list(words)}?`,
    choices: find.choices.map((p) => picture(p)),
    right: find.choices.indexOf(find.picture),
    wrong: (i) => `${cap(words[i]!)} starts with ${find.choices[i]!.letter}.`,
    yes: `Yes! ${cap(find.picture.word)} starts with ${L}!`,
  };
}

/** One Round of a Box, both counting from 0: six Finds, then Next. */
export function playScreen(app: App, box: number, round: number): () => void {
  let alive = true;
  const finds = makeRound(box, round, app.progress.game.ways[BOXES[box]!.kind]);

  // ---- Layout ------------------------------------------------------------
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  const dots = Array.from({ length: ROUND_LENGTH }, () => h('span', { class: 'dot' }));
  const promptBtn = h('button', { class: 'prompt', label: 'Hear it again' });
  const choicesEl = h('div', { class: 'choices' });
  const fx = h('div', { class: 'fx-layer' });
  const screen = h(
    'div',
    { class: 'site-screen screen play' },
    h('header', { class: 'play-top' }, backBtn, h('div', { class: 'dots' }, ...dots), app.corner.gear()),
    h('main', { class: 'stage' }, promptBtn),
    choicesEl,
    fx,
  );
  app.root.append(screen);

  let ask = '';
  let hint: (() => void) | null = null;

  // ---- Idle help: ask again and pulse the choices ------------------------
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let nudges = 0;
  const armIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!alive) return;
      if (hint && nudges < MAX_NUDGES) {
        nudges++;
        hint();
      }
      armIdle();
    }, IDLE_MS);
  };
  const touched = () => {
    nudges = 0;
    armIdle();
  };
  screen.addEventListener('pointerdown', touched, { capture: true });

  backBtn.addEventListener('click', () => app.boxes(box));
  promptBtn.addEventListener('click', () => {
    if (ask) void say(ask);
    replay(promptBtn, 'wiggle');
  });

  // ---- Choosing -----------------------------------------------------------
  function offer(nodes: HTMLElement[]): { buttons: HTMLButtonElement[]; pick: () => Promise<number> } {
    let resolvePick: ((i: number) => void) | null = null;
    const buttons = nodes.map((node, i) => {
      const b = h('button', { class: `choice c${i}` }, node);
      const label = node.getAttribute('aria-label');
      if (label) b.setAttribute('aria-label', label);
      b.style.animationDelay = `${i * 80}ms`;
      b.addEventListener('click', () => {
        if (!resolvePick || b.classList.contains('gone')) return;
        const r = resolvePick;
        resolvePick = null;
        r(i);
      });
      return b;
    });
    choicesEl.replaceChildren(...buttons);
    choicesEl.classList.toggle('choices-rows', nodes.every((node) => node.classList.contains('tray')));
    return { buttons, pick: () => new Promise((r) => (resolvePick = r)) };
  }

  /** Counts the Tray aloud: full rows by tens, then the rest one by one. */
  async function countAlong(): Promise<void> {
    const all = [...promptBtn.querySelectorAll<HTMLElement>('.bean')];
    if (all.length === 0) return;
    await say("Let's count!");
    const tens = all.length > 10 ? Math.floor(all.length / 10) : 0;
    const steps: { lit: HTMLElement[]; word: string }[] = [];
    for (let row = 0; row < tens; row++) steps.push({ lit: all.slice(row * 10, row * 10 + 10), word: String((row + 1) * 10) });
    for (let i = tens * 10; i < all.length; i++) steps.push({ lit: [all[i]!], word: String(i + 1) });
    for (const step of steps) {
      if (!alive) return;
      for (const b of step.lit) b.classList.add('lit');
      play('tick');
      await Promise.all([say(step.word), wait(450)]);
    }
    await wait(300);
    for (const b of all) b.classList.remove('lit');
  }

  // ---- One Find -----------------------------------------------------------
  async function runFind(find: Find, index: number): Promise<void> {
    const it = shown(find);
    hint = null;
    promptBtn.replaceChildren(it.prompt);
    const { buttons, pick } = offer(it.choices);
    ask = it.ask;
    void say(ask);
    hint = () => {
      void say(ask);
      for (const b of buttons) if (!b.classList.contains('gone')) replay(b, 'nudge');
    };
    touched();

    for (;;) {
      const i = await pick();
      if (!alive) return;
      if (i === it.right) {
        buttons[i]!.classList.add('right');
        break;
      }
      buttons[i]!.classList.add('gone');
      play('boop');
      hint = null;
      await say(it.wrong(i));
      if (!alive) return;
      if (it.countAlong) await countAlong();
      if (!alive) return;
      void say(ask);
      hint = () => {
        void say(ask);
        for (const b of buttons) if (!b.classList.contains('gone')) replay(b, 'nudge');
      };
      touched();
    }

    hint = null;
    ask = '';
    play('chime');
    buzz(40);
    sparkle(buttons[it.right]!, fx);
    dots[index]!.classList.add('filled');
    await Promise.all([say(it.yes), wait(1100)]);
    await wait(400);
  }

  // ---- The Round ----------------------------------------------------------
  async function runRound(): Promise<void> {
    await wait(250);
    for (let i = 0; i < finds.length; i++) {
      if (!alive) return;
      await runFind(finds[i]!, i);
    }
    if (!alive) return;
    app.progress.finish(box, round);
    showReward();
  }

  /** Confetti, then Next: the next Round, on into the next Box, or after the very last back to its Box. */
  function showReward(): void {
    clearTimeout(idleTimer);
    hint = null;
    const next = h('button', { class: 'site-next', label: 'Next', html: nextIcon });
    const back = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
    const confetti = h('div', { class: 'confetti' });
    const colors = ['#ff8a3d', '#ffce4f', '#6fd3a8', '#7cc3f5', '#7a6cf0'];
    for (let i = 0; i < 40; i++) {
      const c = h('i');
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colors[i % colors.length]!;
      c.style.animationDelay = `${Math.random() * 0.8}s`;
      c.style.animationDuration = `${2 + Math.random() * 1.5}s`;
      c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      confetti.append(c);
    }
    const star = h('div', { class: 'reward-star', text: '🌟' });
    screen.replaceChildren(h('div', { class: 'reward' }, confetti, star, h('div', { class: 'reward-actions' }, back, next)));
    next.addEventListener('click', () => {
      const to = roundAfter(app.progress, box, round);
      if (to) app.play(to.box, to.round);
      else app.boxes(box);
    });
    back.addEventListener('click', () => app.boxes(box));
    cheer();
    buzz(80);
    void say('You found them all! Well done!');
  }

  void runRound();

  return () => {
    alive = false;
    clearTimeout(idleTimer);
    hush();
  };
}
