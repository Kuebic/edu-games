// One Level: build a Program with taps, press Go, watch the robot run it.
// Nothing is ever cleared for him: after a bonk or an unfinished Run his Program is still there to fix.

import type { GrownUpCorner } from '@shared/grownup';
import { canSpeak, hush, say } from '@shared/voice';
import { Board, type GhostMark } from './board';
import { add, canAdd, clear, cycleTimes, editorFor, moveCursor, remove, select, type Editor } from './game/editor';
import { initialState, run, type Address, type RunState, type Trace } from './game/engine';
import { isFixIt, programLength } from './game/level';
import { GoalStrip } from './goals';
import { holdButton, ICONS, iconButton, OP_ICONS, OP_LABELS, WORLD_ICONS } from './icons';
import { levelAt, WORLDS } from './levels';
import { ProgramBar, type RunMarks } from './program-bar';
import { levelAfter, saveDraft, SPEEDS, type Progress, type Speed } from './progress';
import * as sfx from './sound';
import { spellOut } from './spell';

export interface PlayHooks {
  progress: Progress;
  /** Back to this World's Levels. */
  levels(): void;
  open(world: number, index: number): void;
  corner: GrownUpCorner;
}

/** How long each Command animates. */
const SPEED_MS: Record<Speed, number> = { slow: 700, normal: 400, fast: 200 };
const SPEED_ICONS: Record<Speed, string> = { slow: ICONS.slow, normal: ICONS.normal, fast: ICONS.fast };
/** Runs without a win before the lightbulb shows. */
const HINT_AFTER_RUNS = 3;
/** Ghost marks each lightbulb tap adds. */
const HINT_STEPS = 2;

/** Bip, the helper who wrote the buggy Program in Fix-it Levels. The same in every Skin. */
const BIP = `<svg viewBox="-0.5 -0.6 1 1.1" aria-hidden="true">
  <path d="M0 -0.36V-0.5" stroke="#7c2d12" stroke-width="0.05"/><circle cx="0" cy="-0.52" r="0.06" fill="#ef4444"/>
  <rect x="-0.34" y="-0.36" width="0.68" height="0.6" rx="0.2" fill="#fb923c" stroke="#7c2d12" stroke-width="0.05"/>
  <circle cx="-0.13" cy="-0.1" r="0.08" fill="#fff"/><circle cx="0.13" cy="-0.1" r="0.08" fill="#fff"/>
  <circle cx="-0.12" cy="-0.09" r="0.035" fill="#1f2937"/><circle cx="0.14" cy="-0.09" r="0.035" fill="#1f2937"/>
  <path d="M-0.1 0.08q0.1 0.07 0.2 0" fill="none" stroke="#7c2d12" stroke-width="0.04" stroke-linecap="round"/>
  <rect x="-0.26" y="0.24" width="0.14" height="0.14" rx="0.04" fill="#7c2d12"/><rect x="0.12" y="0.24" width="0.14" height="0.14" rx="0.04" fill="#7c2d12"/>
</svg>`;

interface Session {
  trace: Trace;
  /** The next Step to play. */
  next: number;
  /** State before that Step. */
  before: RunState;
}

export function showPlay(root: HTMLElement, world: number, index: number, hooks: PlayHooks): () => void {
  const level = levelAt(world, index);
  const { progress } = hooks;
  const skin = progress.game.skin;
  const saved = progress.mark(world, index);
  let editor: Editor = editorFor(progress.game.drafts[level.id] ?? level.starterProgram);
  let marks: RunMarks = {};
  let session: Session | null = null;
  let playing = false;
  let stopping = false;
  let won = false;
  let gone = false;
  let runs = 0;
  let hinted = 0;
  const tutorial = !saved.done && editor.program.length === 0 ? (level.tutorial ?? []) : [];
  let tutorialAt = 0;
  /** Numbers picked up in this Run, in order, for "2 plus 3 is 5!". */
  let numbers: number[] = [];

  const screen = document.createElement('main');
  screen.className = 'site-screen rp-play';
  screen.style.setProperty('--world', WORLDS[world]!.color);

  // Header: back, level, speaker, gear.
  const bar = document.createElement('header');
  bar.className = 'site-bar';
  const badge = document.createElement('div');
  badge.className = 'rp-badge';
  badge.setAttribute('aria-label', `${WORLDS[world]!.name}, level ${index + 1}`);
  badge.innerHTML = `<span class="rp-badge-icon">${WORLD_ICONS[world]}</span><span>${index + 1}</span>`;
  const tools = document.createElement('div');
  tools.className = 'rp-tools';
  if (canSpeak) tools.append(iconButton('site-tool', ICONS.speaker, 'Say it again', () => say(level.voice)));
  tools.append(hooks.corner.gear());
  bar.append(iconButton('site-tool', ICONS.back, 'All levels', hooks.levels), badge, tools);

  const goals = new GoalStrip(level, skin);

  const stage = document.createElement('div');
  stage.className = 'rp-stage';
  const frame = document.createElement('div');
  frame.className = 'rp-board';
  const board = new Board(level, skin);
  frame.append(board.svg);
  stage.append(frame);

  // Dock: helper, program bar, palette, run controls.
  const dock = document.createElement('section');
  dock.className = 'rp-dock';
  if (isFixIt(level)) {
    const helper = document.createElement('div');
    helper.className = 'rp-helper';
    helper.innerHTML = `${BIP}<span>Fix Bip’s program!</span>`;
    dock.append(helper);
  }

  const programBar = new ProgramBar(level.maxSlots, {
    select(at: Address) {
      if (locked()) return;
      sfx.tap();
      editor = select(editor, at);
      render();
    },
    remove() {
      if (locked()) return;
      sfx.tap();
      commit(remove(editor));
    },
    cursor(body: number | null) {
      if (locked()) return;
      editor = moveCursor(editor, body);
      render();
    },
    count(slot: number) {
      if (locked()) return;
      sfx.tap();
      commit(cycleTimes(editor, slot));
      advanceTutorial('count');
    },
  });

  const palette = document.createElement('div');
  palette.className = 'rp-palette';
  const opButtons = new Map(
    level.palette.map((op) => {
      const button = iconButton(`rp-op${op === 'repeat' ? ' rp-op-repeat' : ''}`, OP_ICONS[op], OP_LABELS[op], () => {
        if (locked()) return;
        const next = add(editor, op, level.maxSlots);
        if (!next) {
          programBar.wiggle();
          sfx.bloop();
          return;
        }
        sfx.tap();
        commit(next);
        advanceTutorial(op);
      });
      palette.append(button);
      return [op as string, button] as const;
    }),
  );

  const controls = document.createElement('div');
  controls.className = 'rp-controls';
  const trash = holdButton('rp-ctl', ICONS.trash, 'Clear all: hold', 1000, () => {
    if (locked()) return;
    commit(clear());
  });
  const stepButton = iconButton('rp-ctl', ICONS.step, 'Step', () => void onStep());
  const goButton = iconButton('rp-go', ICONS.go, 'Go', () => void onGo());
  const speedButton = iconButton('rp-ctl', '', 'Speed', () => {
    const speeds = [...SPEEDS];
    progress.game.speed = speeds[(speeds.indexOf(speedNow()) + 1) % speeds.length]!;
    progress.save();
    sfx.tap();
    renderControls();
  });
  const bulb = iconButton('rp-ctl rp-bulb', ICONS.bulb, 'Hint', () => {
    hinted = Math.min(hinted + HINT_STEPS, ghostPath.length);
    board.ghost(ghostPath.slice(0, hinted));
    sfx.pickup();
  });
  bulb.hidden = true;
  controls.append(trash, stepButton, goButton, speedButton, bulb);
  dock.append(programBar.element, palette, controls);

  const hand = document.createElement('div');
  hand.className = 'rp-hand';
  hand.innerHTML = ICONS.hand;
  hand.hidden = true;

  screen.append(bar, goals.element, stage, dock, hand);
  root.replaceChildren(screen);

  const start = initialState(level);
  board.show(start);
  goals.update(start);

  // The hint's ghost path: where the robot goes when it runs the Level's solution.
  const ghostPath: GhostMark[] = run(level, level.solution).steps.flatMap((step) =>
    step.at ? [{ x: step.state.x, y: step.state.y, facing: step.state.facing, turn: step.events.some((e) => e.type === 'turn') }] : [],
  );

  // Fit the board to the space left, keeping its shape.
  const fit = () => {
    const { width, height } = stage.getBoundingClientRect();
    const [w, h] = [level.grid[0]!.length, level.grid.length];
    const scale = Math.min(width / w, height / h);
    frame.style.width = `${Math.floor(w * scale)}px`;
    frame.style.height = `${Math.floor(h * scale)}px`;
    placeHand();
  };
  const resize = new ResizeObserver(fit);
  resize.observe(stage);
  resize.observe(dock);

  function speedNow(): Speed {
    return progress.game.speed;
  }

  function locked(): boolean {
    return playing || won;
  }

  /** A change to the Program: it's saved as his Draft, and the next Go starts again from the start. */
  function commit(next: Editor): void {
    editor = next;
    session = null;
    marks = {};
    saveDraft(progress, level.id, editor.program);
    render();
  }

  function advanceTutorial(target: string): void {
    if (tutorial[tutorialAt] === target) tutorialAt++;
    placeHand();
  }

  function placeHand(): void {
    const target = tutorial[tutorialAt];
    const element =
      !target || won ? undefined : target === 'go' ? goButton : target === 'count' ? programBar.firstCount() : opButtons.get(target);
    if (!element) {
      hand.hidden = true;
      return;
    }
    const box = element.getBoundingClientRect();
    const base = screen.getBoundingClientRect();
    hand.hidden = false;
    hand.style.left = `${box.left - base.left + box.width / 2}px`;
    hand.style.top = `${box.top - base.top + box.height / 2}px`;
  }

  function renderControls(): void {
    goButton.innerHTML = playing ? ICONS.stop : ICONS.go;
    goButton.setAttribute('aria-label', playing ? 'Stop' : 'Go');
    goButton.classList.toggle('rp-stop', playing);
    stepButton.disabled = playing || won;
    trash.disabled = playing || won || editor.program.length === 0;
    speedButton.innerHTML = SPEED_ICONS[speedNow()];
    for (const [op, button] of opButtons) button.classList.toggle('rp-dim', locked() || !canAdd(editor, op as never, level.maxSlots));
    bulb.hidden = won || runs < HINT_AFTER_RUNS || hinted >= ghostPath.length;
  }

  function render(): void {
    programBar.render(editor, marks, locked());
    renderControls();
    requestAnimationFrame(placeHand);
  }

  /** Rewind to the start and work out the whole Run. */
  function begin(): Session {
    board.show(start);
    goals.update(start);
    marks = { loops: new Map() };
    numbers = [];
    editor = { ...editor, selected: null };
    runs++;
    session = { trace: run(level, editor.program), next: 0, before: start };
    return session;
  }

  async function playNext(current: Session): Promise<void> {
    const step = current.trace.steps[current.next++]!;
    if (step.at) {
      marks.now = step.at;
      for (const event of step.events) if (event.type === 'loopTick') marks.loops?.set(event.slot, { pass: event.pass, of: event.of });
      render();
    }
    await board.play(step, current.before, SPEED_MS[speedNow()]);
    if (gone) return;
    current.before = step.state;
    goals.update(step.state);

    for (const event of step.events) {
      if (event.type === 'pickup') {
        const item = level.items[event.item]!;
        if (item.type === 'letter') say(String(item.value));
        else if (item.type === 'number' && level.goals.sum !== undefined) {
          numbers.push(item.value as number);
          say(String(step.state.sum));
        } else if (item.type === 'number') say(String(item.value));
      } else if (event.type === 'bonk') {
        marks.bonk = step.at;
      } else if (event.type === 'unfinished') {
        marks.want = true;
        board.wonder(step.state, event.missing);
        sfx.hmm();
      } else if (event.type === 'win') {
        win();
      }
    }
    if (current.next >= current.trace.steps.length) {
      marks.now = null;
      if (current.trace.result !== 'bonk') marks.loops = new Map();
    }
    render();
  }

  async function onGo(): Promise<void> {
    if (won) return;
    if (playing) {
      stopping = true;
      return;
    }
    advanceTutorial('go');
    const current = session && session.next < session.trace.steps.length ? session : begin();
    playing = true;
    render();
    while (!stopping && !gone && current.next < current.trace.steps.length) await playNext(current);
    playing = false;
    if (stopping) {
      // Stop leaves the robot where it is; the next Go or Step starts again.
      stopping = false;
      session = null;
      marks = {};
    }
    render();
  }

  async function onStep(): Promise<void> {
    if (playing || won) return;
    const current = session && session.next < session.trace.steps.length ? session : begin();
    playing = true;
    render();
    await playNext(current);
    playing = false;
    render();
  }

  function win(): void {
    won = true;
    const sparkle = programLength(editor.program) <= level.par;
    progress.finish(world, index, sparkle);
    board.celebrate();
    sfx.fanfare();
    if (sparkle) sfx.sparkle();
    const { spell, numberOrder, sum } = level.goals;
    if (spell) say(spellOut(spell));
    else if (numberOrder) say(`${numberOrder.join(', ')}!`);
    else if (sum !== undefined) say(`${numbers.join(' plus ')} is ${sum}!`);
    setTimeout(() => !gone && showDone(sparkle), 900);
  }

  function showDone(sparkle: boolean): void {
    const done = document.createElement('div');
    done.className = 'rp-done';
    done.append(confetti());
    if (sparkle) {
      const burst = document.createElement('div');
      burst.className = 'rp-sparkle-burst';
      burst.innerHTML = ICONS.sparkle;
      burst.setAttribute('aria-label', 'Sparkle!');
      done.append(burst);
    }
    // After the very last Level, Next goes to its World.
    const next = levelAfter(progress, world, index);
    const buttons = document.createElement('div');
    buttons.className = 'rp-done-buttons';
    buttons.append(
      iconButton('site-tool', ICONS.levels, 'All levels', hooks.levels),
      iconButton('site-next', ICONS.next, 'Next level', () => (next ? hooks.open(next.world, next.index) : hooks.levels())),
      iconButton('site-tool', OP_ICONS.repeat, 'Play again', () => {
        done.remove();
        won = false;
        session = null;
        marks = {};
        board.show(start);
        goals.update(start);
        render();
      }),
    );
    done.append(buttons);
    screen.append(done);
  }

  render();
  fit();
  say(level.voice);

  return () => {
    gone = true;
    resize.disconnect();
    hush();
  };
}

function confetti(): HTMLElement {
  const layer = document.createElement('div');
  layer.className = 'rp-confetti';
  const colors = ['#ef4444', '#2f9be0', '#f5b400', '#16a34a', '#9b5cf6', '#ec4899', '#ffffff'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('i');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length]!;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
    piece.style.setProperty('--spin', `${(Math.random() - 0.5) * 1440}deg`);
    layer.append(piece);
  }
  return layer;
}
