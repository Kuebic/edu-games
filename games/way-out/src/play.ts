// One puzzle: a Level or a Pool puzzle. Slide Vehicles until the red one can drive out.
// No timer, no move limit, no way to lose; Undo goes all the way back and Reset can be undone.

import { holdToActivate } from '@shared/hold';
import { packColor, packIcon, type App } from './app';
import { createBoardView } from './board-view';
import { apply, isSolved, parse, solve, type Board, type Move } from './game/board';
import { nextMove } from './hint';
import { ICONS, iconButton } from './icons';
import { LEVELS } from './levels';
import type { Level, PoolPuzzle } from './packs';
import { levelProgress, nextLevel, recordPoolSolve, recordSolve, type Snapshot } from './progress';
import { cheer, engine, twinkle } from './sound';
import { canSpeak, say } from './speech';
import { colorOf, COLORS, kindName, RED } from './skins';

export type Puzzle = { kind: 'level'; level: Level } | { kind: 'pool'; pack: number; puzzle: PoolPuzzle };

const EXIT_SECONDS = 1.1;

export function showPlay(app: App, puzzle: Puzzle): () => void {
  const skin = app.skin();
  const pack = puzzle.kind === 'level' ? puzzle.level.pack : puzzle.pack;
  const start: Board = puzzle.kind === 'level' ? puzzle.level.board : puzzle.puzzle[0];
  const par = puzzle.kind === 'level' ? puzzle.level.par : puzzle.puzzle[1];
  const saved = puzzle.kind === 'level' ? levelProgress(app.progress, puzzle.level.id) : undefined;

  let board = saved?.inProgress?.board ?? start;
  let moves = saved?.inProgress?.moves ?? 0;
  const history: Snapshot[] = [...(saved?.inProgress?.history ?? [])];
  let won = false;
  let gone = false;

  const screen = document.createElement('main');
  screen.className = 'site-screen wo-play';
  screen.style.setProperty('--pack', packColor(pack));

  // Header: back, which puzzle this is, speaker, gear.
  const bar = document.createElement('header');
  bar.className = 'site-bar';
  const badge = document.createElement('div');
  badge.className = 'wo-badge';
  if (puzzle.kind === 'level') {
    badge.setAttribute('aria-label', `Level ${puzzle.level.index}`);
    badge.innerHTML = `<span class="wo-badge-icon">${packIcon(pack)}</span><span>${puzzle.level.index}</span>`;
  } else {
    badge.setAttribute('aria-label', 'More like this');
    badge.innerHTML = `<span class="wo-badge-icon">${packIcon(pack)}</span><span class="wo-badge-more">${ICONS.more}</span>`;
  }
  const speaker = iconButton('site-tool', ICONS.speaker, 'Say it', () => say(`Help the red ${skin.hero} get out.`));
  speaker.hidden = !canSpeak;
  const gear = iconButton('site-tool wo-gear', ICONS.gear, 'Grown-ups: press and hold');
  holdToActivate(gear, 3000, () => app.parent());
  bar.append(iconButton('site-tool', ICONS.back, 'Back', () => app.pack(pack)), badge, speaker, gear);

  // Status: the Move counter, and the Sparkle if it's already earned.
  const status = document.createElement('div');
  status.className = 'wo-status';
  const counter = document.createElement('div');
  counter.className = 'wo-counter';
  counter.setAttribute('role', 'status');
  const earned = document.createElement('div');
  earned.className = 'wo-earned';
  earned.innerHTML = ICONS.sparkle;
  earned.setAttribute('aria-label', 'Sparkle earned');
  earned.hidden = !saved?.sparkle;
  status.append(counter, earned);

  const stage = document.createElement('div');
  stage.className = 'wo-stage';
  const view = createBoardView({
    skin,
    board,
    onMove: commit,
    onTouch() {
      view.showHand(null);
      view.showHint(null);
    },
  });
  stage.append(view.element);

  // Controls, in thumb reach.
  const controls = document.createElement('nav');
  controls.className = 'wo-controls';
  const undoButton = iconButton('wo-control', ICONS.undo, 'Undo', undo);
  const resetButton = iconButton('wo-control', ICONS.reset, 'Start over: press and hold');
  holdToActivate(resetButton, 1000, reset);
  const hintButton = iconButton('wo-control wo-hint', ICONS.hint, 'Hint', hint);
  controls.append(undoButton, resetButton, hintButton);

  screen.append(bar, status, stage, controls);
  app.root.replaceChildren(screen);

  const resize = new ResizeObserver(() => {
    const { width, height } = stage.getBoundingClientRect();
    view.fit(width, height);
  });
  resize.observe(stage);

  function update(): void {
    counter.innerHTML = `${ICONS.slide}<span>${moves}</span>`;
    counter.setAttribute('aria-label', `${moves} ${moves === 1 ? 'move' : 'moves'}`);
    undoButton.disabled = won || history.length === 0;
    resetButton.disabled = won || (board === start && moves === 0);
    hintButton.disabled = won;
    // A gentle nudge toward the lightbulb once he's well past par.
    hintButton.classList.toggle('wo-glow', !won && moves > par * 2);
  }

  function persist(): void {
    if (!saved || won) return;
    if (moves === 0 && history.length === 0) delete saved.inProgress;
    else saved.inProgress = { board, moves, history };
    app.save();
  }

  function commit(move: Move): void {
    history.push({ board, moves });
    board = apply(board, move);
    moves++;
    view.setBoard(board, false);
    update();
    persist();
    if (isSolved(board)) void win();
  }

  function undo(): void {
    const last = history.pop();
    if (!last || won) return;
    ({ board, moves } = last);
    view.setBoard(board, true);
    update();
    persist();
  }

  function reset(): void {
    if (won || (board === start && moves === 0)) return;
    // Reset can be undone, in case it was an accident.
    history.push({ board, moves });
    board = start;
    moves = 0;
    view.setBoard(board, true);
    update();
    persist();
  }

  function hint(): void {
    const asked = board;
    void nextMove(asked).then((move) => {
      if (gone || won || board !== asked || !move) return;
      view.showHint(move);
      say(hintLine(move));
    });
  }

  function hintLine(move: Move): string {
    const piece = parse(board).find((p) => p.id === move.piece)!;
    const way = piece.horizontal ? (move.delta < 0 ? 'left' : 'right') : move.delta < 0 ? 'up' : 'down';
    return `Slide the ${colorOf(piece.id).name} ${kindName(skin, piece)} ${way}.`;
  }

  async function win(): Promise<void> {
    won = true;
    view.setLocked(true);
    update();
    const sparkle = moves <= par;
    if (puzzle.kind === 'level') recordSolve(app.progress, puzzle.level, moves);
    else recordPoolSolve(app.progress, pack, puzzle.puzzle, moves);
    app.save();

    engine(skin.engine, EXIT_SECONDS);
    await view.driveOut(EXIT_SECONDS);
    if (gone) return;
    cheer();
    screen.append(confetti());
    if (sparkle) {
      twinkle();
      screen.append(sparkleBurst());
      earned.hidden = false;
    }
    say(`You did it in ${moves} ${moves === 1 ? 'move' : 'moves'}!`);

    const done = document.createElement('div');
    done.className = 'wo-done';
    const after = puzzle.kind === 'level' ? nextLevel(LEVELS, puzzle.level) : undefined;
    const next =
      puzzle.kind === 'pool'
        ? () => app.pool(pack)
        : after
          ? () => app.level(after)
          : () => app.home();
    done.append(
      iconButton('site-next', ICONS.next, 'Next', next),
      iconButton('wo-more', ICONS.more, 'More like this', () => app.pool(pack)),
      iconButton('site-tool', ICONS.levels, 'All levels', () => app.pack(pack)),
    );
    screen.append(done);
  }

  update();
  // First Level: say the goal, and show the drag with a hand.
  if (puzzle.kind === 'level' && puzzle.level.pack === 1 && puzzle.level.index === 1 && moves === 0) {
    say(`Help the red ${skin.hero} get out.`);
    const first = solve(board)?.[0];
    if (first) view.showHand(first);
  }

  return () => {
    gone = true;
    resize.disconnect();
    view.destroy();
  };
}

function confetti(): HTMLElement {
  const layer = document.createElement('div');
  layer.className = 'wo-confetti';
  const colors = [RED.fill, ...COLORS.slice(0, 6).map((c) => c.fill), '#ffffff'];
  for (let i = 0; i < 70; i++) {
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

/** Sparkles bursting out from the middle: the par bonus. */
function sparkleBurst(): HTMLElement {
  const layer = document.createElement('div');
  layer.className = 'wo-burst';
  for (let i = 0; i < 12; i++) {
    const star = document.createElement('i');
    const angle = (i / 12) * Math.PI * 2;
    star.innerHTML = ICONS.sparkle;
    star.style.setProperty('--x', `${Math.cos(angle) * 140}px`);
    star.style.setProperty('--y', `${Math.sin(angle) * 140}px`);
    star.style.animationDelay = `${0.3 + (i % 3) * 0.08}s`;
    layer.append(star);
  }
  return layer;
}
