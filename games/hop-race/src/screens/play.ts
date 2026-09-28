import { buzz, cheer } from '@shared/sound';
import { hush, say } from '@shared/voice';
import { FRIENDS, HOPPERS, type Animal } from '../animals';
import type { App } from '../app';
import { h, replay, sparkle, wait } from '../dom';
import {
  AHEAD,
  BOTH_HOME,
  HOME,
  HOP,
  SPIN,
  aheadFadeLine,
  aheadRightLine,
  homeLine,
  spunLine,
  squareLine,
  startLine,
  turnLine,
} from '../lines';
import { TRACKS, aheadOf, createRace, friendFor, type Mover, type Spin } from '../race';
import { hopNote, play, whirr } from '../sounds';
import { backIcon, flagIcon, nextIcon, spinnerArrow, spinnerFace } from './icons';

/** How long the Spinner whirls. */
const SPIN_MS = 1300;
/** How long a Hop takes to land. */
const HOP_MS = 380;
/** How long a child's turn waits for a tap before the control wiggles and the Voice asks again. */
const NUDGE_MS = 6000;
/** A Square's colours in turn, so each looks different, as on the study's board. */
const SQUARE_COLOURS = ['#ff9d8a', '#ffc94a', '#9be07a', '#7fd1e8', '#b8a2f5', '#ffa8d0', '#ffb36b', '#6fd3a8', '#8fb8ff', '#e8a0f0'];

/** A face on a Track or a button. */
const face = (animal: Animal) => h('span', { class: 'face', text: animal.face });

/**
 * One Race of a Track, both counting from 0: turns until the Hopper is Home, then the cheer and Next. With Two
 * players the Friend's turns are tapped too, and the Race goes on until both are Home.
 */
export function playScreen(app: App, trackIndex: number, raceIndex: number): () => void {
  let alive = true;
  const track = TRACKS[trackIndex];
  if (!track) throw new Error(`Hop Race: no Track ${trackIndex}`);
  const { home } = track;
  const hopper = HOPPERS[app.progress.game.hopper];
  const friend = FRIENDS[friendFor(trackIndex, raceIndex, FRIENDS.length)]!;
  const { players } = app.progress.game;
  const race = createRace(home, Math.random, players);
  const animals: Record<Mover, Animal> = { hopper, friend };
  /** Whose turns are tapped: the Hopper's, and with Two players the Friend's too. */
  const tapped = (mover: Mover) => mover === 'hopper' || players === 2;

  // ---- Layout ------------------------------------------------------------
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });

  /** The Track: Start, then Squares 1 to Home, with a lane for each animal. */
  const squares = Array.from({ length: home + 1 }, (_, i) => {
    if (i === 0) return h('span', { class: 'square start', label: 'Start' });
    const cell = h('span', { class: 'square' }, h('b', { text: String(i) }));
    cell.style.background = SQUARE_COLOURS[(i - 1) % SQUARE_COLOURS.length]!;
    if (i === home) cell.append(h('i', { class: 'flag', html: flagIcon }));
    return cell;
  });
  const tokens: Record<Mover, HTMLElement> = {
    hopper: h('span', { class: 'token', label: hopper.name }, face(hopper)),
    friend: h('span', { class: 'token', label: friend.name }, face(friend)),
  };
  const trackEl = h(
    'div',
    { class: 'track', label: `Track from 1 to ${home}` },
    h('div', { class: 'lane lane-hopper' }, tokens.hopper),
    h('div', { class: 'squares' }, ...squares),
    h('div', { class: 'lane lane-friend' }, tokens.friend),
  );
  trackEl.style.setProperty('--cells', String(home + 1));
  const place = (mover: Mover, square: number) => tokens[mover].style.setProperty('--at', String(square));
  place('hopper', 0);
  place('friend', 0);

  // The controls: the Spinner and the big animal button, one glowing at a time. The button is the Hopper's,
  // and with Two players it turns into the Friend's on the Friend's turn.
  const arrow = h('span', { class: 'arrow', html: spinnerArrow });
  const spinnerBtn = h('button', { class: 'spinner', label: 'Spinner' }, h('span', { class: 'spinner-face', html: spinnerFace }), arrow);
  const hopDots = h('span', { class: 'hop-dots' });
  const hopperFace = face(hopper);
  const hopperBtn = h('button', { class: 'big-animal' }, hopperFace, hopDots);
  /** Puts `mover` on the big button. */
  function onButton(mover: Mover): void {
    const animal = animals[mover];
    hopperFace.textContent = animal.face;
    hopperBtn.setAttribute('aria-label', `Hop ${animal.name}`);
    hopperBtn.style.setProperty('--animal', animal.colour);
  }
  onButton('hopper');
  const controls = h('div', { class: 'controls' }, spinnerBtn, hopperBtn);
  /** Who's ahead? takes the controls' place while it's asked. */
  const aheadEl = h('div', { class: 'controls ahead' });
  aheadEl.hidden = true;
  const fx = h('div', { class: 'fx-layer' });
  const screen = h(
    'div',
    { class: 'site-screen screen play' },
    h('header', { class: 'play-top' }, backBtn, h('span'), app.corner.gear()),
    h('main', { class: 'play-area' }, trackEl),
    controls,
    aheadEl,
    fx,
  );
  app.root.append(screen);
  backBtn.addEventListener('click', () => app.groups(trackIndex));

  // ---- Taps -----------------------------------------------------------------
  // Only the buttons being waited for take a tap, so a child can't tap through a move or a number being said.
  let waiting: { buttons: HTMLElement[]; pick(b: HTMLElement): void } | null = null;
  let nudge: ReturnType<typeof setInterval> | undefined;

  function took(b: HTMLElement): void {
    if (!waiting?.buttons.includes(b) || b.classList.contains('gone')) return;
    const { pick } = waiting;
    waiting = null;
    clearInterval(nudge);
    // The ask or a nudge may still be talking: the tap cuts it off.
    hush();
    pick(b);
  }
  spinnerBtn.addEventListener('click', () => took(spinnerBtn));
  hopperBtn.addEventListener('click', () => took(hopperBtn));

  /** Waits for a tap on one of `buttons`. With `nudgeLine`, a long wait wiggles the first and says the line again. */
  function tapOn(buttons: HTMLElement[], nudgeLine?: string): Promise<HTMLElement> {
    return new Promise((resolve) => {
      waiting = { buttons, pick: resolve };
      if (nudgeLine) {
        nudge = setInterval(() => {
          replay(buttons[0]!, 'wiggle');
          void say(nudgeLine);
        }, NUDGE_MS);
      }
    });
  }

  /**
   * Says an ask with `buttons` already listening, so they take a tap the moment they show or glow, even
   * where the Voice is slow to finish or never speaks. The tap cuts the ask off.
   */
  function askFor(line: string, buttons: HTMLElement[], nudgeLine?: string): Promise<HTMLElement> {
    const tap = tapOn(buttons, nudgeLine);
    void say(line);
    return tap;
  }

  /** Makes one control glow, the one a tap is wanted on, or none. */
  function glow(control: HTMLElement | null): void {
    for (const b of [spinnerBtn, hopperBtn]) b.classList.toggle('glow', b === control);
  }

  // ---- Moves ---------------------------------------------------------------
  let turned = 0;

  /** Whirls the Spinner's arrow onto the half that says `spin`: 2 on the right, 1 on the left. */
  async function spinTo(spin: Spin): Promise<void> {
    const half = spin === 2 ? 25 : 205;
    turned += 720 + ((half + Math.random() * 130 - (turned % 360) + 360) % 360);
    arrow.style.transitionDuration = `${SPIN_MS}ms`;
    arrow.style.rotate = `${turned}deg`;
    whirr(SPIN_MS / 1000);
    await wait(SPIN_MS + 150);
    play('pop');
  }

  /** One Hop onto `square`: the animal jumps, the Square lights up and sings, and the Voice says its number. */
  async function hopTo(mover: Mover, square: number): Promise<void> {
    place(mover, square);
    replay(tokens[mover], 'hop');
    await wait(HOP_MS);
    if (!alive) return;
    replay(squares[square]!, 'lit');
    hopNote(square);
    if (tapped(mover)) buzz(20);
    await Promise.all([say(squareLine(square)), wait(350)]);
  }

  /** The turn's Hops as dots on the Hopper button, `left` of them still to take. */
  function showHops(hops: number, left: number): void {
    hopDots.replaceChildren(...Array.from({ length: hops }, (_, i) => h('i', { class: i < hops - left ? 'used' : '' })));
  }

  /** A tapped turn: the Hopper's, or with Two players either's. With Two players the Voice says whose turn it is. */
  async function tappedTurn(mover: Mover): Promise<void> {
    onButton(mover);
    glow(spinnerBtn);
    await askFor(players === 2 ? `${turnLine(animals[mover].name)} ${SPIN}` : SPIN, [spinnerBtn], SPIN);
    glow(null);
    const turn = race.turn();
    await spinTo(turn.spin);
    if (!alive) return;
    showHops(turn.squares.length, turn.squares.length);
    for (const [i, square] of turn.squares.entries()) {
      if (!alive) return;
      glow(hopperBtn);
      // The first Hop listens while the spin is said.
      await (i === 0 ? askFor(spunLine(turn.spin), [hopperBtn], HOP) : tapOn([hopperBtn], HOP));
      glow(null);
      replay(hopperBtn, 'bounce');
      showHops(turn.squares.length, turn.squares.length - i - 1);
      await hopTo(mover, square);
    }
    hopDots.replaceChildren();
    // With Two players, the first one Home waits while the other hops on.
    if (alive && players === 2 && race.at(mover) === home && race.next()) await say(homeLine(animals[mover].name));
  }

  /** The Friend's turn by itself, with One player. */
  async function friendTurn(): Promise<void> {
    screen.classList.add('friend-turn');
    await say(turnLine(friend.name));
    if (!alive) return;
    const turn = race.turn();
    await spinTo(turn.spin);
    if (!alive) return;
    await say(spunLine(turn.spin));
    for (const square of turn.squares) {
      if (!alive) return;
      await hopTo('friend', square);
    }
    screen.classList.remove('friend-turn');
    if (alive && race.at('friend') === home) await say(homeLine(friend.name));
  }

  /** Who's ahead? The two animals as big buttons, in either order; a wrong pick fades, as in My Letter. */
  async function askAhead(): Promise<void> {
    const at = { hopper: race.at('hopper'), friend: race.at('friend') };
    const right = aheadOf(at.hopper, at.friend)!;
    const other: Mover = right === 'hopper' ? 'friend' : 'hopper';
    const order: Mover[] = Math.random() < 0.5 ? ['hopper', 'friend'] : ['friend', 'hopper'];
    const buttons = order.map((mover) => {
      const b = h('button', { class: 'big-animal', label: animals[mover].name }, face(animals[mover]));
      b.style.setProperty('--animal', animals[mover].colour);
      b.addEventListener('click', () => took(b));
      return b;
    });
    aheadEl.replaceChildren(...buttons);
    controls.hidden = true;
    aheadEl.hidden = false;
    let ask = askFor(AHEAD, buttons);
    for (;;) {
      const b = await ask;
      if (!alive) return;
      const mover = order[buttons.findIndex((x) => x === b)]!;
      if (mover === right) {
        b.classList.add('right');
        play('pop');
        buzz(40);
        sparkle(b, fx);
        replay(tokens[right], 'hop');
        await say(aheadRightLine(animals[right].name, at[right], at[other]));
        break;
      }
      // A Fade: it wobbles, says where it is, fades away, and the question comes again.
      replay(b, 'wobble');
      play('boop');
      await say(aheadFadeLine(animals[mover].name, at[mover]));
      b.classList.add('gone');
      if (!alive) return;
      ask = askFor(AHEAD, buttons);
    }
    await wait(300);
    aheadEl.hidden = true;
    controls.hidden = false;
  }

  // ---- The Race ------------------------------------------------------------
  async function runRace(): Promise<void> {
    await wait(300);
    await say(startLine(hopper.name, friend.name, home));
    for (let who = race.next(); who && alive; who = race.next()) {
      if (tapped(who)) await tappedTurn(who);
      else await friendTurn();
      if (!alive || race.next() === undefined) break;
      // A round ends after the Friend's turn, or after the Hopper's once the Friend is Home.
      const roundEnd = who === 'friend' || race.at('friend') === home;
      if (track!.ahead && roundEnd && race.askAhead()) await askAhead();
    }
    if (!alive) return;
    app.progress.finish(trackIndex, raceIndex);
    await wait(400);
    if (alive) showReward();
  }

  /** Confetti and the Home number in a ring, with that many beans in fives, then Next. */
  function showReward(): void {
    const next = h('button', { class: 'site-next', label: 'Next', html: nextIcon });
    const back = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
    const confetti = h('div', { class: 'confetti' });
    for (let i = 0; i < 40; i++) {
      const c = h('i');
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = SQUARE_COLOURS[i % SQUARE_COLOURS.length]!;
      c.style.animationDelay = `${Math.random() * 0.8}s`;
      c.style.animationDuration = `${2 + Math.random() * 1.5}s`;
      c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      confetti.append(c);
    }
    const beans = h('div', { class: 'beans', label: `${home} beans` });
    for (let five = 0; five < home / 5; five++) beans.append(h('span', { class: 'five' }, ...Array.from({ length: 5 }, () => h('i'))));
    const faces = h('span', { class: 'faces' }, face(hopper), players === 2 && face(friend));
    const badge = h('div', { class: 'reward-number' }, faces, h('b', { text: String(home) }));
    screen.replaceChildren(h('div', { class: 'reward' }, confetti, badge, beans, h('div', { class: 'reward-actions' }, back, next)));
    next.addEventListener('click', () => {
      const to = app.progress.after(trackIndex, raceIndex);
      if (to) app.play(to.group, to.level);
      else app.groups(trackIndex);
    });
    back.addEventListener('click', () => app.groups(trackIndex));
    cheer();
    buzz(80);
    void say(players === 2 ? BOTH_HOME : HOME);
  }

  void runRace();

  return () => {
    alive = false;
    waiting = null;
    clearInterval(nudge);
    hush();
  };
}
