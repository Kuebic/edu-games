import { buzz, cheer } from '@shared/sound';
import { hush, say } from '@shared/voice';
import type { App } from '../app';
import { ask, fadeLine, foundLine, saysLine } from '../asks';
import { FINDS, makeFinds, type Find } from '../choices';
import { h, replay, sparkle, wait } from '../dom';
import { MY_NAME, levelLetters, metLetters, nameCapitals } from '../letters';
import { letterSound, play } from '../sounds';
import { backIcon, nextIcon, speakerIcon } from './icons';

/** How long a find lasts at least, so a letter with no Letter sound still leaves a breath before the next Find. */
const FOUND_MS = 800;

/**
 * The Name line: the Name's capitals, with a blank wherever `letter` goes (SAM asking S is _AM).
 * `fill()` puts the letter in the blanks; `clear()` empties them again for the next Find.
 */
function drawNameLine(name: string, letter: string): { el: HTMLElement; fill(): void; clear(): void } {
  const capitals = [...nameCapitals(name)];
  const blanks: HTMLElement[] = [];
  const el = h('span', { class: 'name-line', label: name });
  el.style.setProperty('--n', String(capitals.length));
  for (const c of capitals) {
    const cell = h('span', { class: c === letter ? 'nl-cell nl-blank' : 'nl-cell', text: c });
    if (c === letter) blanks.push(cell);
    el.append(cell);
  }
  return {
    el,
    fill: () => blanks.forEach((b) => b.classList.add('nl-filled')),
    clear: () => blanks.forEach((b) => b.classList.remove('nl-filled')),
  };
}

/** One Level of a Group, both counting from 0: four Finds of its letter, then the cheer and Next. */
export function playScreen(app: App, group: number, level: number): () => void {
  let alive = true;
  const name = app.progress.game.name;
  const letter = levelLetters(name, group)[level];
  if (letter === undefined) throw new Error(`My Letter: no Level ${level} in Group ${group}`);
  const finds = makeFinds(letter, metLetters(name, group, level));
  const line = group === MY_NAME ? ask(letter, name) : ask(letter);

  // ---- Layout ------------------------------------------------------------
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  const dots = Array.from({ length: FINDS }, () => h('span', { class: 'dot' }));
  const nameLine = group === MY_NAME ? drawNameLine(name, letter) : undefined;
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
    if (busy) return;
    busy = true;
    replay(promptBtn, 'wiggle');
    await say(line);
    busy = false;
  });

  // ---- One Find -----------------------------------------------------------
  async function runFind(find: Find, index: number): Promise<void> {
    nameLine?.clear();
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
    await say(line);
    for (;;) {
      if (!alive) return;
      busy = false;
      const i = await new Promise<number>((r) => (pick = r));
      if (!alive) return;
      busy = true;
      const chosen = find.choices[i]!;
      if (chosen === letter) break;
      // A Fade: it wobbles, is named, fades away, and the ask comes again.
      const b = buttons[i]!;
      replay(b, 'wobble');
      play('boop');
      await say(fadeLine(chosen));
      b.classList.add('gone');
      if (!alive) return;
      await say(line);
    }

    // Found: the letter dances, fills the Name line, and says its sound.
    const right = buttons[find.choices.indexOf(letter)]!;
    right.classList.add('right');
    nameLine?.fill();
    play('pop');
    buzz(40);
    sparkle(right, fx);
    dots[index]!.classList.add('filled');
    // Only a clip that will be heard gets "S says"; else the letter's name alone (ADR 0001).
    const letterClip = letterSound(letter);
    if (letterClip?.ready()) {
      await say(saysLine(letter));
      if (!alive) return;
      await Promise.all([letterClip(), wait(FOUND_MS / 2)]);
      await wait(FOUND_MS / 2);
    } else {
      await Promise.all([say(foundLine(letter)), wait(FOUND_MS)]);
    }
  }

  // ---- The Level ----------------------------------------------------------
  async function runLevel(): Promise<void> {
    await wait(250);
    for (let i = 0; i < finds.length; i++) {
      if (!alive) return;
      await runFind(finds[i]!, i);
    }
    if (!alive) return;
    app.progress.finish(group, level);
    showReward();
  }

  /** Confetti and the Level's letter, then Next: the next Level, on into New letters, or after the very last back to its Group. */
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
    const badge = h('div', { class: 'reward-letter', text: letter });
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
