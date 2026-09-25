import type { Screen } from '../app';
import { dragOrTap, flipMove, flyInto, h, inside, sparkle, wait } from '../dom';
import { FRIENDS, snackWord } from '../friends';
import { PLATE_SIZE, ROUND_LENGTH, answerChoices, makeRound, type Problem } from '../problems';
import { nextStage, pickSticker } from '../progress';
import { buzz, play } from '../sfx';
import { hush, say } from '../speech';
import { backIcon, playIcon } from './icons';

const IDLE_MS = 8000;
const MAX_NUDGES = 3;

/** What a tap on a Snack on the Plate does right now. */
type PlateMode = 'none' | 'eat' | 'count';

export const playScreen: Screen = (app) => {
  let alive = true;
  const friend = FRIENDS[app.save.nextFriend % FRIENDS.length];
  app.save.nextFriend++;
  app.persist();
  const stageAtStart = app.save.stage;
  const problems = makeRound(stageAtStart);
  const word = (n: number) => snackWord(friend, n);

  // ---- Layout ------------------------------------------------------------
  const homeBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  const sumEl = h('div', { class: 'sum', label: 'Problem' });
  const dots = Array.from({ length: ROUND_LENGTH }, () => h('span', { class: 'dot' }));
  const friendEl = h('button', { class: 'friend', text: friend.emoji, label: `${friend.name}, tap to hear again` });
  const slots = Array.from({ length: PLATE_SIZE }, () => h('div', { class: 'slot' }));
  const plate = h('div', { class: 'plate' }, ...slots);
  const pile = h('div', { class: 'pile' });
  const choicesEl = h('div', { class: 'choices' });
  const fx = h('div', { class: 'fx-layer' });

  const screen = h(
    'div',
    { class: 'screen play' },
    h('header', { class: 'play-top' }, homeBtn, h('div', { class: 'sum-wrap' }, sumEl, h('div', { class: 'dots' }, ...dots))),
    h('main', { class: 'table' }, friendEl, plate, pile),
    choicesEl,
    fx,
  );
  app.root.append(screen);

  // ---- Shared state for the current Problem --------------------------------
  let prompt = '';
  let plateMode: PlateMode = 'none';
  let onEat: ((snack: HTMLElement) => void) | null = null;
  let counted: HTMLElement[] = [];
  let hint: (() => void) | null = null;

  const plateSnacks = () =>
    slots
      .map((s) => s.firstElementChild as HTMLElement | null)
      .filter((s): s is HTMLElement => !!s && !s.classList.contains('eaten'));

  const makeSnack = (delay = 0) => {
    const s = h('div', { class: 'snack' }, friend.snack.emoji, h('span', { class: 'badge' }));
    s.style.animationDelay = `${delay}ms`;
    return s;
  };

  const setBadge = (snack: HTMLElement, n: number | null) => {
    const badge = snack.querySelector('.badge')!;
    badge.textContent = n === null ? '' : String(n);
    snack.classList.toggle('counted', n !== null);
  };

  const clearCounts = () => {
    counted = [];
    for (const s of plateSnacks()) {
      setBadge(s, null);
      s.classList.remove('lit');
    }
  };

  const nudge = (els: Iterable<Element>) => {
    for (const el of els) {
      el.classList.remove('nudge');
      void (el as HTMLElement).offsetWidth;
      el.classList.add('nudge');
    }
  };

  // ---- Idle help: repeat the prompt and pulse what to touch ----------------
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

  // ---- Input wiring ----------------------------------------------------------
  homeBtn.addEventListener('click', () => app.go('home'));

  friendEl.addEventListener('click', () => {
    if (prompt) void say(prompt);
    friendEl.classList.remove('wiggle');
    void friendEl.offsetWidth;
    friendEl.classList.add('wiggle');
  });

  plate.addEventListener('click', (e) => {
    const snack = (e.target as Element).closest('.snack') as HTMLElement | null;
    if (!snack || snack.classList.contains('eaten')) return;
    if (plateMode === 'eat') onEat?.(snack);
    else if (plateMode === 'count') countTap(snack);
  });

  function countTap(snack: HTMLElement) {
    if (counted.includes(snack)) {
      snack.classList.remove('wiggle');
      void snack.offsetWidth;
      snack.classList.add('wiggle');
      if (counted.length < plateSnacks().length) return;
    }
    if (counted.length >= plateSnacks().length) clearCounts();
    counted.push(snack);
    setBadge(snack, counted.length);
    play('tick');
    void say(String(counted.length));
  }

  // ---- Act-Out ---------------------------------------------------------------
  function addActOut(count: number): Promise<void> {
    return new Promise((resolve) => {
      let placed = 0;
      const drops = (x: number, y: number) => inside(x, y, plate, 30) || inside(x, y, friendEl, 20);
      for (let i = 0; i < count; i++) {
        const s = makeSnack(150 + i * 90);
        s.classList.add('in-pile');
        pile.append(s);
        dragOrTap(s, drops, () => {
          const slot = slots.find((sl) => !sl.firstElementChild);
          if (!slot) return;
          s.classList.remove('in-pile');
          flipMove(s, slot);
          play('pop');
          placed++;
          if (placed === count) resolve();
        });
      }
      hint = () => {
        void say(prompt);
        nudge(pile.querySelectorAll('.snack'));
      };
    });
  }

  function takeActOut(count: number): Promise<void> {
    return new Promise((resolve) => {
      let eaten = 0;
      plateMode = 'eat';
      onEat = (snack) => {
        if (eaten >= count) return;
        eaten++;
        snack.classList.add('eaten');
        play('crunch');
        void say(String(eaten));
        friendEl.classList.remove('chomp');
        void friendEl.offsetWidth;
        friendEl.classList.add('chomp');
        void flyInto(snack, friendEl).then(() => snack.remove());
        if (eaten === count) {
          plateMode = 'none';
          onEat = null;
          void wait(450).then(resolve);
        }
      };
      hint = () => {
        void say(prompt);
        nudge(plateSnacks());
      };
    });
  }

  /** Slide remaining Snacks into the first slots so the Plate reads as a tidy group. */
  function packPlate() {
    plateSnacks().forEach((s, i) => {
      if (s.parentElement !== slots[i]) flipMove(s, slots[i]);
    });
  }

  // ---- Answer ------------------------------------------------------------------
  function showChoices(result: number): { buttons: HTMLButtonElement[]; pick: () => Promise<HTMLButtonElement> } {
    let resolvePick: ((b: HTMLButtonElement) => void) | null = null;
    const buttons = answerChoices(result).map((n, i) => {
      const b = h('button', { class: `choice c${i}`, text: String(n), label: String(n) });
      b.dataset.value = String(n);
      b.style.animationDelay = `${i * 80}ms`;
      b.addEventListener('click', () => {
        if (!resolvePick || b.classList.contains('gone')) return;
        const r = resolvePick;
        resolvePick = null;
        r(b);
      });
      return b;
    });
    choicesEl.replaceChildren(...buttons);
    return {
      buttons,
      pick: () => new Promise((r) => (resolvePick = r)),
    };
  }

  async function countAlong(question: string) {
    plateMode = 'none';
    hint = null;
    clearCounts();
    await say("Let's count together!");
    const snacks = plateSnacks();
    for (let i = 0; i < snacks.length; i++) {
      if (!alive) return;
      snacks[i].classList.add('lit');
      setBadge(snacks[i], i + 1);
      play('tick');
      await Promise.all([say(String(i + 1)), wait(600)]);
      snacks[i].classList.remove('lit');
    }
    counted = [...snacks];
    if (!alive) return;
    void say(question);
    plateMode = 'count';
  }

  // ---- One Problem -------------------------------------------------------------
  function renderSum(p: Problem, answer: number | null) {
    const sign = p.op === 'add' ? '+' : '−';
    const ans = h('span', { class: answer === null ? 'ans unknown' : 'ans known', text: answer === null ? '?' : String(answer) });
    sumEl.replaceChildren(
      h('span', { text: String(p.start) }),
      h('span', { class: 'op', text: sign }),
      h('span', { text: String(p.change) }),
      h('span', { class: 'op', text: '=' }),
      ans,
    );
    sumEl.setAttribute('aria-label', `${p.start} ${p.op === 'add' ? 'plus' : 'minus'} ${p.change} equals ${answer ?? 'what'}`);
  }

  async function runProblem(p: Problem, index: number): Promise<boolean> {
    plateMode = 'none';
    counted = [];
    hint = null;
    friendEl.classList.remove('happy');
    for (const sl of slots) sl.replaceChildren();
    pile.replaceChildren();
    choicesEl.replaceChildren();
    pile.classList.toggle('hidden', p.op !== 'add');
    renderSum(p, null);
    for (let i = 0; i < p.start; i++) slots[i].append(makeSnack(i * 70));

    const F = friend.name;
    prompt =
      p.op === 'add'
        ? `${F} has ${p.start} ${word(p.start)}. Give ${F} ${p.change} more!`
        : `${F} has ${p.start} ${word(p.start)}. ${F} is hungry! Tap ${p.change} ${word(p.change)} for ${F} to eat.`;
    void say(prompt);
    touched();

    if (p.op === 'add') await addActOut(p.change);
    else await takeActOut(p.change);
    if (!alive) return false;

    if (p.op === 'take') {
      packPlate();
      await wait(350);
    }
    await wait(300);
    if (!alive) return false;

    const question = p.op === 'add' ? `How many ${friend.snack.many} now?` : `How many ${friend.snack.many} are left?`;
    prompt = question;
    void say(question);
    plateMode = 'count';
    const { buttons, pick } = showChoices(p.result);
    hint = () => {
      void say(question);
      nudge(buttons.filter((b) => !b.classList.contains('gone')));
    };
    touched();

    let firstTry = true;
    for (;;) {
      const b = await pick();
      if (!alive) return false;
      if (Number(b.dataset.value) === p.result) {
        b.classList.add('right');
        break;
      }
      firstTry = false;
      b.classList.add('gone');
      play('boop');
      await countAlong(question);
      if (!alive) return false;
      hint = () => {
        void say(question);
        nudge(buttons.filter((x) => !x.classList.contains('gone')));
      };
      touched();
    }

    // Correct
    hint = null;
    plateMode = 'none';
    prompt = '';
    renderSum(p, p.result);
    play('chime');
    buzz(40);
    friendEl.classList.add('happy');
    sparkle(friendEl, fx);
    dots[index].classList.add('filled');
    const sentence =
      p.op === 'add'
        ? `Yes! ${p.start} plus ${p.change} makes ${p.result}!`
        : `Yes! ${p.start} take away ${p.change} leaves ${p.result}!`;
    await Promise.all([say(sentence), wait(1200)]);
    await wait(500);
    return firstTry;
  }

  // ---- The Round -----------------------------------------------------------------
  async function runRound() {
    await wait(250);
    let firstTries = 0;
    for (let i = 0; i < problems.length; i++) {
      if (!alive) return;
      if (await runProblem(problems[i], i)) firstTries++;
    }
    if (!alive) return;

    const sticker = pickSticker(app.save.stickers);
    const stage = nextStage(stageAtStart, firstTries);
    const movedUp = stage > app.save.stage;
    app.save.stickers.push(sticker);
    app.save.stage = Math.max(app.save.stage, stage);
    app.persist();
    showReward(sticker, movedUp);
  }

  function showReward(sticker: string, movedUp: boolean) {
    clearTimeout(idleTimer);
    hint = null;
    const again = h('button', { class: 'site-next', label: 'Play again', html: playIcon });
    const home = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
    const book = h('button', { class: 'round-btn', label: 'Sticker Book', text: '📒' });
    const confetti = h('div', { class: 'confetti' });
    const colors = ['#FF7B6B', '#FFCE4F', '#6FD3A8', '#7CC3F5', '#B79CF2'];
    for (let i = 0; i < 40; i++) {
      const c = h('i');
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = `${Math.random() * 0.8}s`;
      c.style.animationDuration = `${2 + Math.random() * 1.5}s`;
      c.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      confetti.append(c);
    }
    const reward = h(
      'div',
      { class: 'reward' },
      confetti,
      h('div', { class: 'reward-friend', text: friend.emoji }),
      h('div', { class: 'sticker-reveal', text: sticker }),
      h('div', { class: 'reward-actions' }, home, again, book),
    );
    screen.replaceChildren(reward);
    again.addEventListener('click', () => app.go('play'));
    home.addEventListener('click', () => app.go('home'));
    book.addEventListener('click', () => app.go('stickers'));
    play('fanfare');
    buzz(80);
    void say(`You did it! Here's a sticker for you!${movedUp ? " You're getting so good at this!" : ''}`);
  }

  void runRound();

  return () => {
    alive = false;
    clearTimeout(idleTimer);
    hush();
  };
};
