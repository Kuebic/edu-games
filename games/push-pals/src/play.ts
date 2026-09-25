import type { Direction, Level, Position } from './game/level';
import { hasCorneredBox, isSolved, step } from './game/rules';
import { ICONS } from './icons';
import { LEVELS } from './levels';
import { play, unlockAudio } from './sound';

const STEP_MS = 130;
const MAX_QUEUED = 2;
const SWIPE_PX = 24;

const KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

export interface PlayHooks {
  muted(): boolean;
  toggleMute(): void;
  /** Called once, the moment the level is solved. */
  solved(): void;
  next(): void;
  home(): void;
}

function button(className: string, icon: string, onPress: () => void): HTMLButtonElement {
  const el = document.createElement('button');
  el.className = className;
  el.innerHTML = icon;
  // Keep focus off the buttons so Enter or Space never re-presses one by surprise.
  el.tabIndex = -1;
  el.addEventListener('mousedown', (event) => event.preventDefault());
  el.addEventListener('click', () => {
    unlockAudio();
    onPress();
  });
  return el;
}

function place(el: HTMLElement, level: Level, square: number): void {
  el.style.setProperty('--x', String(square % level.width));
  el.style.setProperty('--y', String(Math.floor(square / level.width)));
}

export function showPlay(root: HTMLElement, index: number, hooks: PlayHooks): () => void {
  const level = LEVELS[index]!;
  let position: Position = level.start;
  const history: Position[] = [];
  let facing: Direction = 'down';
  let queue: Direction[] = [];
  let busy = false;
  let solved = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // --- layout ---------------------------------------------------------------
  const screen = document.createElement('main');
  screen.className = 'site-screen play';

  const toolbar = document.createElement('nav');
  toolbar.className = 'site-bar';
  const backButton = button('site-tool', ICONS.back, () => hooks.home());
  const undoButton = button('site-tool', ICONS.undo, undo);
  const resetButton = button('site-tool', ICONS.reset, reset);
  const muteButton = button('site-tool', '', () => {
    hooks.toggleMute();
    renderMute();
  });
  const spacer = document.createElement('div');
  spacer.className = 'spacer';
  toolbar.append(backButton, spacer, undoButton, resetButton, muteButton);

  const stage = document.createElement('div');
  stage.className = 'stage';
  const board = document.createElement('div');
  board.className = 'board';
  board.style.gridTemplateColumns = `repeat(${level.width}, var(--tile))`;
  board.style.gridTemplateRows = `repeat(${level.height}, var(--tile))`;
  level.cells.forEach((cell, square) => {
    const tile = document.createElement('div');
    tile.className = `tile ${cell}`;
    if (level.goals.has(square)) tile.classList.add('goal');
    board.append(tile);
  });
  const boxes = position.boxes.map(() => {
    const el = document.createElement('div');
    el.className = 'sprite box';
    board.append(el);
    return el;
  });
  const player = document.createElement('div');
  player.className = 'sprite player';
  board.append(player);
  stage.append(board);

  const win = document.createElement('div');
  win.className = 'win';
  win.hidden = true;
  const last = index === LEVELS.length - 1;
  win.innerHTML = `<div class="win-stars"><i>${ICONS.star}</i><i>${ICONS.star}</i><i>${ICONS.star}</i></div>`;
  // After the last level, Next goes back to the level list.
  const nextButton = button(last ? 'site-next all-levels' : 'site-next', last ? ICONS.levels : ICONS.next, () => hooks.next());
  win.append(nextButton);

  screen.append(toolbar, stage, win);
  root.replaceChildren(screen);

  // --- rendering ------------------------------------------------------------
  function render(): void {
    position.boxes.forEach((square, i) => {
      const el = boxes[i]!;
      place(el, level, square);
      el.classList.toggle('on-goal', level.goals.has(square));
    });
    place(player, level, position.player);
    player.dataset.facing = facing;
    undoButton.classList.toggle('nudge', !solved && hasCorneredBox(level, position));
  }

  function renderMute(): void {
    muteButton.innerHTML = hooks.muted() ? ICONS.soundOff : ICONS.soundOn;
  }

  function fit(): void {
    const size = Math.floor(
      Math.min(stage.clientWidth / level.width, stage.clientHeight / level.height, 128),
    );
    board.style.setProperty('--tile', `${Math.max(size, 16)}px`);
  }

  // --- actions --------------------------------------------------------------
  function move(dir: Direction): void {
    if (solved) return;
    if (queue.length < MAX_QUEUED) queue.push(dir);
    pump();
  }

  function pump(): void {
    if (busy || solved) return;
    const dir = queue.shift();
    if (!dir) return;
    facing = dir;
    const result = step(level, position, dir);
    if (result.kind === 'blocked') {
      render();
      pump();
      return;
    }
    history.push(position);
    position = result.position;
    if (result.kind === 'push') {
      const landed = position.boxes[result.box]!;
      play(level.goals.has(landed) ? 'goal' : 'push');
    }
    render();
    if (isSolved(level, position)) {
      solved = true;
      queue = [];
      hooks.solved();
      render();
      later(celebrate, STEP_MS + 200);
      return;
    }
    busy = true;
    later(() => {
      busy = false;
      pump();
    }, STEP_MS);
  }

  function undo(): void {
    if (solved) return;
    queue = [];
    const previous = history.pop();
    if (!previous) return;
    position = previous;
    play('undo');
    render();
  }

  function reset(): void {
    if (solved || position === level.start) return;
    queue = [];
    // Reset is itself undoable, in case it was pressed by accident.
    history.push(position);
    position = level.start;
    facing = 'down';
    play('undo');
    render();
  }

  function celebrate(): void {
    play('win');
    win.hidden = false;
  }

  // --- input ----------------------------------------------------------------
  const onKey = (event: KeyboardEvent) => {
    unlockAudio();
    if (solved) {
      if (['Enter', ' ', 'ArrowRight'].includes(event.key) && !win.hidden) {
        event.preventDefault();
        hooks.next();
      } else if (event.key === 'Escape') {
        hooks.home();
      }
      return;
    }
    const dir = KEYS[event.key] ?? KEYS[event.key.toLowerCase()];
    if (dir) {
      event.preventDefault();
      move(dir);
    } else if (event.key === 'z' || event.key === 'Z' || event.key === 'Backspace') {
      event.preventDefault();
      undo();
    } else if (event.key === 'r' || event.key === 'R') {
      reset();
    } else if (event.key === 'Escape') {
      hooks.home();
    }
  };

  // One swipe is one step: the step fires as soon as the finger has moved far
  // enough, and the rest of that swipe is ignored.
  let swipe: { id: number; x: number; y: number; done: boolean } | undefined;
  const onPointerDown = (event: PointerEvent) => {
    if ((event.target as Element).closest('button')) return;
    unlockAudio();
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, done: false };
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!swipe || swipe.done || event.pointerId !== swipe.id) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
    swipe.done = true;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  };
  const onPointerEnd = (event: PointerEvent) => {
    if (swipe?.id === event.pointerId) swipe = undefined;
  };

  window.addEventListener('keydown', onKey);
  screen.addEventListener('pointerdown', onPointerDown);
  screen.addEventListener('pointermove', onPointerMove);
  screen.addEventListener('pointerup', onPointerEnd);
  screen.addEventListener('pointercancel', onPointerEnd);
  const resize = new ResizeObserver(fit);
  resize.observe(stage);

  fit();
  render();
  renderMute();
  // Let the first frame paint without sliding sprites in from the corner.
  requestAnimationFrame(() => board.classList.add('animated'));

  return () => {
    window.removeEventListener('keydown', onKey);
    resize.disconnect();
    timers.forEach((id) => window.clearTimeout(id));
  };
}
