// Practice's Trips: the Treat shows, and by the Way the Mover goes by itself, waits for Go, or goes where
// the picked Arrow points. A Cheer every five, until Back.

import { buzz, cheer } from '@shared/sound';
import { hush, say } from '@shared/voice';
import type { App } from '../app';
import { h, replay, sparkle, wait } from '../dom';
import { SKIN_LOOKS, type Skin } from '../skins';
import { setOff, shrug, treat as treatSound } from '../sounds';
import { ANGLE, ARROWS, CHEER_EVERY, SHOW_ARROW_AFTER, STEP, WORDS, fieldOf, trips, type Arrow } from '../trips';
import { arrowSvg, backIcon, carSvg } from './icons';

/** How long the Mover takes to go one way, and to turn. */
export const MOVE_MS = 750;
const TURN_MS = 280;
/** In Watch, how long the Arrow shows before the Mover goes. */
const WATCH_MS = 1100;
const CHEER_MS = 2400;
const IDLE_MS = 8000;
const MAX_NUDGES = 3;

/** The Mover's picture: its emoji, or the car. */
function moverPicture(skin: Skin): HTMLElement {
  const { emoji } = SKIN_LOOKS[skin];
  return emoji ? h('span', { class: 'emoji', text: emoji }) : h('span', { class: 'car', html: carSvg });
}

/** Puts a piece on a cell of the field, counting from the top left. */
function at(el: HTMLElement, x: number, y: number): HTMLElement {
  el.style.setProperty('--x', String(x));
  el.style.setProperty('--y', String(y));
  return el;
}

export function playScreen(app: App): () => void {
  let alive = true;
  const { way, scope, skin } = app.progress.game;
  const look = SKIN_LOOKS[skin];
  const nextArrow = trips(scope);
  const { cols, rows } = fieldOf(scope);
  const mid = { x: (cols - 1) / 2, y: (rows - 1) / 2 };
  const spotOf = (a: Arrow) => ({ x: mid.x + 2 * STEP[a].x, y: mid.y + 2 * STEP[a].y });

  // ---- Layout ------------------------------------------------------------
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  const dots = Array.from({ length: CHEER_EVERY }, () => h('span', { class: 'dot' }));

  const field = h('div', { class: `field field-${skin}` });
  field.style.setProperty('--cols', String(cols));
  field.style.setProperty('--rows', String(rows));
  field.style.setProperty('--field', look.colour);
  const spots = ARROWS.filter((a) => scope.includes(a)).map((a) => at(h('div', { class: 'cell spot' }), spotOf(a).x, spotOf(a).y));
  const treatEl = h('span', { class: 'cell treat', label: look.treatWord }, h('span', { class: 'emoji', text: look.treat }));
  const pointer = h('div', { class: 'cell pointer' });
  pointer.hidden = true;
  /** The picture wiggles, shrugs and hops; the body around it turns, so a turned car wiggles turned. */
  const picture = moverPicture(skin);
  const body = h('span', { class: 'mover-body' }, picture);
  const mover = at(h('button', { class: 'cell mover', label: look.name }, body), mid.x, mid.y);
  field.append(...spots, treatEl, pointer, mover);

  const controls = h('div', { class: 'controls' });
  const fx = h('div', { class: 'fx-layer' });
  const screen = h(
    'div',
    { class: 'site-screen screen play' },
    h('header', { class: 'play-top' }, backBtn, h('div', { class: 'dots' }, ...dots), app.corner.gear()),
    h('main', { class: 'stage' }, field),
    controls,
    fx,
  );
  app.root.append(screen);
  backBtn.addEventListener('click', () => app.start());

  // ---- The Mover ------------------------------------------------------------
  let moving = false;
  /** Where the car faces, in degrees; kept unwrapped so a turn goes the short way. */
  let facing = 0;
  /** How far the ball has rolled round. */
  let rolled = 0;

  mover.addEventListener('click', () => {
    if (moving) return;
    replay(picture, 'wiggle');
    setOff(skin);
  });

  async function face(a: Arrow | 'back'): Promise<void> {
    if (skin !== 'car') return;
    const target = a === 'back' ? facing + 180 : ANGLE[a];
    const turn = ((((target - facing) % 360) + 540) % 360) - 180;
    if (turn === 0) return;
    facing += turn;
    body.style.rotate = `${facing}deg`;
    await wait(TURN_MS);
  }

  /** Slides the Mover to a Spot, or back to the middle. */
  async function slide(a: Arrow, there: boolean): Promise<void> {
    const { x, y } = STEP[a];
    if (skin === 'ball') {
      rolled += (x + y >= 0 ? 1 : -1) * (there ? 1 : -1) * 360;
      body.style.rotate = `${rolled}deg`;
    }
    mover.classList.add('moving');
    mover.style.translate = there ? `${x * 200}% ${y * 200}%` : '';
    await wait(MOVE_MS);
    mover.classList.remove('moving');
  }

  async function goTo(a: Arrow): Promise<void> {
    moving = true;
    await face(a);
    setOff(skin);
    void say(WORDS[a]);
    await slide(a, true);
  }

  async function comeBack(a: Arrow): Promise<void> {
    await face('back');
    await slide(a, false);
    moving = false;
  }

  // ---- Taps, with a nudge when she's been still ----------------------------
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let nudges = 0;
  let nudge: (() => void) | null = null;
  const armIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!alive) return;
      if (nudge && nudges < MAX_NUDGES) {
        nudges++;
        nudge();
      }
      armIdle();
    }, IDLE_MS);
  };
  screen.addEventListener(
    'pointerdown',
    () => {
      nudges = 0;
      armIdle();
    },
    { capture: true },
  );

  /** Who's waiting for a tap on the Go button or a Pick button. */
  let waiting: ((i: number) => void) | null = null;

  /** Waits for a tap on one of the buttons (see `button`), nudging them, and asking again, while she's still. */
  function tapOne(buttons: HTMLButtonElement[], ask?: string): Promise<number> {
    return new Promise((resolve) => {
      nudges = 0;
      nudge = () => {
        if (ask) void say(ask);
        for (const b of buttons) replay(b, 'nudge');
      };
      armIdle();
      waiting = resolve;
    });
  }

  /** A Go or Pick button: the `i`th that tapOne waits on. It takes a tap as soon as it shows, but not while the Mover moves. */
  function button(i: number, className: string, label: string, content: { text?: string; html?: string }): HTMLButtonElement {
    const b = h('button', { class: className, label, ...content });
    b.addEventListener('click', () => {
      if (moving || !waiting) return;
      const resolve = waiting;
      waiting = null;
      nudge = null;
      clearTimeout(idleTimer);
      resolve(i);
    });
    return b;
  }

  // ---- One Trip -------------------------------------------------------------
  function showPointer(a: Arrow): void {
    const { x, y } = STEP[a];
    at(pointer, mid.x + x, mid.y + y).innerHTML = arrowSvg(a);
    pointer.hidden = false;
    replay(pointer, 'pop');
  }

  async function runTrip(a: Arrow, index: number, first: boolean): Promise<void> {
    at(treatEl, spotOf(a).x, spotOf(a).y).classList.remove('eaten');
    replay(treatEl, 'pop');
    pointer.hidden = true;
    controls.replaceChildren();

    if (way === 'watch') {
      showPointer(a);
      await wait(WATCH_MS);
    } else if (way === 'go') {
      showPointer(a);
      const go = button(0, 'go-button', 'Go', { text: 'GO' });
      controls.append(go);
      await tapOne([go]);
      go.disabled = true;
    } else {
      const ask = `Which way to ${look.treatWord}?`;
      const choices = ARROWS.filter((b) => scope.includes(b));
      const buttons = choices.map((b, i) => button(i, 'pick', WORDS[b].slice(0, -1), { html: arrowSvg(b) }));
      controls.append(...buttons);
      if (first) void say(ask);
      for (let wrong = 0; ; ) {
        const picked = choices[await tapOne(buttons, ask)]!;
        if (!alive) return;
        if (picked === a) {
          buttons[choices.indexOf(a)]!.classList.add('right');
          break;
        }
        await goTo(picked);
        if (!alive) return;
        shrug();
        replay(picture, 'shrug');
        await wait(500);
        await comeBack(picked);
        if (!alive) return;
        wrong++;
        buttons[choices.indexOf(a)]!.classList.add('glow');
        if (wrong >= SHOW_ARROW_AFTER) showPointer(a);
      }
    }
    if (!alive) return;

    await goTo(a);
    if (!alive) return;
    treatSound(skin);
    buzz(40);
    sparkle(treatEl, fx);
    treatEl.classList.add('eaten');
    replay(picture, 'happy');
    dots[index]!.classList.add('filled');
    pointer.hidden = true;
    await wait(700);
    await comeBack(a);
    await wait(300);
  }

  /** A Cheer: confetti and the Mover big in a ring, then the dots empty and Practice goes on. */
  async function showCheer(): Promise<void> {
    clearTimeout(idleTimer);
    const confetti = h('div', { class: 'confetti' });
    const colours = ['#ff8a3d', '#ffce4f', '#6fd3a8', '#7cc3f5', '#7a6cf0'];
    for (let i = 0; i < 40; i++) {
      const c = h('i');
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colours[i % colours.length]!;
      c.style.animationDelay = `${Math.random() * 0.5}s`;
      c.style.animationDuration = `${1.6 + Math.random()}s`;
      c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      confetti.append(c);
    }
    const layer = h('div', { class: 'cheer' }, confetti, h('div', { class: 'reward' }, moverPicture(skin)));
    screen.append(layer);
    cheer();
    buzz(80);
    void say('Well done!');
    await wait(CHEER_MS);
    layer.remove();
    for (const d of dots) d.classList.remove('filled');
  }

  async function run(): Promise<void> {
    await wait(250);
    for (let n = 0; alive; n++) {
      const i = n % CHEER_EVERY;
      await runTrip(nextArrow(), i, n === 0);
      if (alive && i === CHEER_EVERY - 1) await showCheer();
    }
  }

  void run();

  return () => {
    alive = false;
    clearTimeout(idleTimer);
    hush();
  };
}
