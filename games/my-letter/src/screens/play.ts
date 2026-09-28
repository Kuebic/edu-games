import { buzz, cheer } from '@shared/sound';
import { hush, say } from '@shared/voice';
import type { App } from '../app';
import { ask, fadeLine, foundLine, saysLine, spellAsk } from '../asks';
import { newLetterFinds, spellTiles, type Find } from '../choices';
import { h, replay, sparkle, wait } from '../dom';
import { MY_WORDS, levelLabels, metLetters, nameCapitals } from '../letters';
import { myWords } from '../progress';
import { letterSound, play } from '../sounds';
import { backIcon, nextIcon, speakerIcon } from './icons';

/** How long a find lasts at least, so a letter with no Letter sound still leaves a breath before the next Find. */
const FOUND_MS = 800;

/**
 * The Name line: the word's capitals, every one a blank to start with, the letter faint in it so a child can
 * match it without the Voice (unless Faint letters is off: the page's `no-faint`). `now(i)` marks the blank being asked for; `fill(i)` puts its letter in.
 */
function drawNameLine(name: string): { el: HTMLElement; now(i: number): void; fill(i: number): void } {
  const capitals = [...nameCapitals(name)];
  const el = h('span', { class: 'name-line', label: name });
  el.style.setProperty('--n', String(capitals.length));
  const cells = capitals.map((c) => h('span', { class: 'nl-cell nl-blank', text: c }));
  el.append(...cells);
  return {
    el,
    now: (i) => cells.forEach((cell, j) => cell.classList.toggle('nl-now', j === i)),
    fill: (i) => cells[i]!.classList.replace('nl-blank', 'nl-filled'),
  };
}

/** One Level of a Group, both counting from 0: its Finds, then the cheer and Next. */
export function playScreen(app: App, group: number, level: number): () => void {
  let alive = true;
  const mine = myWords(app.progress);
  const label = levelLabels(mine, group)[level];
  if (label === undefined) throw new Error(`My Letter: no Level ${level} in Group ${group}`);
  const spelling = group === MY_WORDS;
  /** The word a My words Level spells, as typed, for the Voice. */
  const name = spelling ? mine[level]! : '';
  /** A New letters Level's Finds. A Spell has Tiles instead. */
  const finds = spelling ? [] : newLetterFinds(label, metLetters(mine, level));
  /** The letters asked for in turn: the word's capitals in a Spell, each Find's letter in New letters. */
  const asked = spelling ? [...nameCapitals(name)] : finds.map((f) => f.letter);
  /** The Find being played, for the ask a tap on the prompt says again. */
  let current = 0;
  const line = (i: number) => (spelling ? spellAsk(name, i) : ask(asked[i]!));

  /**
   * The ask for the Find being played. A Find starts with the Voice's line alone; a tap on the prompt adds
   * the letter's Letter sound, so it's heard when a child asks for it and not on every Find. `still` says
   * whether to go on to the clip after the line.
   */
  async function sayAsk(sound: boolean, still = () => alive): Promise<void> {
    const clip = letterSound(asked[current]!);
    await say(line(current));
    if (sound && still() && clip?.ready()) await clip();
  }

  /** A find's line: "S says" and its Letter sound, or its name alone where no clip will be heard (ADR 0001). */
  async function sayFound(letter: string, still = () => alive): Promise<void> {
    const letterClip = letterSound(letter);
    if (letterClip?.ready()) {
      await say(saysLine(letter));
      if (!still()) return;
      await Promise.all([letterClip(), wait(FOUND_MS / 2)]);
      await wait(FOUND_MS / 2);
    } else {
      await Promise.all([say(foundLine(letter)), wait(FOUND_MS)]);
    }
  }

  // ---- Layout ------------------------------------------------------------
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  const dots = asked.map(() => h('span', { class: 'dot' }));
  const nameLine = spelling ? drawNameLine(name) : undefined;
  const promptBtn = h(
    'button',
    { class: 'prompt', label: 'Hear it again' },
    nameLine?.el ?? h('span', { class: 'speaker', html: speakerIcon }),
  );
  const choicesEl = h('div', { class: 'choices' });
  const fx = h('div', { class: 'fx-layer' });
  const screen = h(
    'div',
    { class: 'site-screen screen play' },
    h('header', { class: 'play-top' }, backBtn, h('div', { class: 'dots' }, ...dots), app.corner.gear()),
    h('main', { class: 'play-area' }, promptBtn),
    choicesEl,
    fx,
  );
  app.root.append(screen);

  // Taps do nothing while a line or a clip is playing, so a child can't tap through.
  let busy = true;
  let pick: ((i: number) => void) | null = null;

  backBtn.addEventListener('click', () => app.groups(group));
  promptBtn.addEventListener('click', async () => {
    if (spelling) {
      // A Spell's prompt, like its Tiles, cuts off whatever is being said.
      if (current >= asked.length) return;
      const now = cut();
      replay(promptBtn, 'wiggle');
      await sayAsk(true, () => alive && now === taps);
      return;
    }
    if (busy) return;
    busy = true;
    replay(promptBtn, 'wiggle');
    await sayAsk(true);
    busy = false;
  });

  // ---- One Find -----------------------------------------------------------
  async function runFind(find: Find, index: number): Promise<void> {
    const { letter } = find;
    current = index;
    nameLine?.now(index);
    const buttons = find.choices.map((c, i) => {
      const b = h('button', { class: `choice c${i}`, label: c }, h('span', { class: 'glyph', text: c }));
      b.style.animationDelay = `${i * 80}ms`;
      b.addEventListener('click', () => {
        if (busy || !pick || b.classList.contains('gone')) return;
        const chosen = pick;
        pick = null;
        chosen(i);
      });
      return b;
    });
    choicesEl.replaceChildren(...buttons);

    busy = true;
    await sayAsk(false);
    for (;;) {
      if (!alive) return;
      busy = false;
      const i = await new Promise<number>((r) => (pick = r));
      if (!alive) return;
      busy = true;
      const chosen = find.choices[i]!;
      if (chosen === letter) break;
      // A Fade: it wobbles, is named and fades away. The ask isn't said again; a tap on the prompt says it.
      const b = buttons[i]!;
      replay(b, 'wobble');
      play('boop');
      await say(fadeLine(chosen));
      b.classList.add('gone');
    }

    // Found: the letter dances, fills its blank in the Name line, and says its sound.
    const right = buttons[find.choices.indexOf(letter)]!;
    right.classList.add('right');
    nameLine?.fill(index);
    play('pop');
    buzz(40);
    sparkle(right, fx);
    dots[index]!.classList.add('filled');
    await sayFound(letter);
  }

  // ---- A Spell --------------------------------------------------------------
  /** Taps in a Spell so far, so a line cut off by a tap doesn't go on to its clip or the next ask. */
  let taps = 0;

  /** A tap in a Spell: the Voice and any Letter sound stop at once. Returns the tap's count. */
  function cut(): number {
    hush();
    for (const letter of new Set(asked)) letterSound(letter)?.stop();
    return ++taps;
  }

  /**
   * A My words Level: every capital of the word as a Tile in a jumble, found in turn from left to right. A
   * found Tile goes into its box; one tapped out of turn wobbles, is named and stays, as it's needed later.
   * The Tiles take a tap as soon as they show, even while the Voice is talking, and the tap cuts it off, so a
   * child who knows the next letter goes straight on (ADR 0006).
   */
  function runSpell(): void {
    const used = new Set<HTMLElement>();
    const tiles = spellTiles(name).map((c, i) => {
      const b = h('button', { class: `choice tile c${i % 3}`, label: c }, h('span', { class: 'glyph', text: c }));
      b.style.animationDelay = `${i * 60}ms`;
      b.addEventListener('click', () => void tapTile(b, c));
      return b;
    });
    // Five to a row at most, two rows for a longer word.
    choicesEl.classList.add('tiles');
    choicesEl.style.setProperty('--row', String(tiles.length > 5 ? Math.ceil(tiles.length / 2) : tiles.length));
    choicesEl.replaceChildren(...tiles);
    nameLine?.now(0);
    void say(line(0));

    async function tapTile(b: HTMLElement, c: string): Promise<void> {
      if (!alive || current >= asked.length || used.has(b)) return;
      const now = cut();
      const still = () => alive && now === taps;
      const index = current;
      if (c !== asked[index]) {
        replay(b, 'wobble');
        play('boop');
        await say(fadeLine(c));
        return;
      }
      // Found: the Tile dances and leaves its place, the letter fills its box, and it says its sound.
      used.add(b);
      b.classList.add('right');
      setTimeout(() => b.classList.add('used'), 700);
      nameLine?.fill(index);
      play('pop');
      buzz(40);
      sparkle(b, fx);
      dots[index]!.classList.add('filled');
      current = index + 1;
      nameLine?.now(current);
      await sayFound(c, still);
      if (!still()) return;
      if (current < asked.length) await sayAsk(false, still);
      else finish();
    }
  }

  // ---- The Level ----------------------------------------------------------
  async function runLevel(): Promise<void> {
    await wait(250);
    if (!alive) return;
    if (spelling) return runSpell();
    for (let i = 0; i < finds.length; i++) {
      if (!alive) return;
      await runFind(finds[i]!, i);
    }
    if (alive) finish();
  }

  function finish(): void {
    app.progress.finish(group, level);
    showReward();
  }

  /** Confetti and the Level's card, the word or the letter, then Next: the next Level, on into New letters, or after the very last back to its Group. */
  function showReward(): void {
    const next = h('button', { class: 'site-next', label: 'Next', html: nextIcon });
    const back = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
    const confetti = h('div', { class: 'confetti' });
    const colors = ['#f0604d', '#ffc94a', '#159a9c', '#8fd0ff', '#b89cf5'];
    for (let i = 0; i < 40; i++) {
      const c = h('i');
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colors[i % colors.length]!;
      c.style.animationDelay = `${Math.random() * 0.8}s`;
      c.style.animationDuration = `${2 + Math.random() * 1.5}s`;
      c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      confetti.append(c);
    }
    const badge = h('div', { class: spelling ? 'reward-letter reward-name' : 'reward-letter', text: label });
    badge.style.setProperty('--n', String(label.length));
    screen.replaceChildren(h('div', { class: 'reward' }, confetti, badge, h('div', { class: 'reward-actions' }, back, next)));
    next.addEventListener('click', () => {
      const to = app.progress.after(group, level);
      if (to) app.play(to.group, to.level);
      else app.groups(group);
    });
    back.addEventListener('click', () => app.groups(group));
    cheer();
    buzz(80);
    void say('You found them all! Well done!');
  }

  void runLevel();

  return () => {
    alive = false;
    hush();
  };
}
