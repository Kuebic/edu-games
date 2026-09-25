// Draws a board and moves its Vehicles: drag along their line, tap to lift and nudge one
// cell, slide back on Undo, and drive the red one out of the Exit. It reports finished Moves
// and never changes the rules; play.ts owns the board.

import { EXIT_ROW, exitIsClear, HERO, parse, reach, SIZE, walls, type Board, type Move, type Piece } from './game/board';
import { ICONS } from './icons';
import { bump, pop, tick } from './sound';
import { vehicleSvg, type Skin } from './skins';

/** Frame thickness and the space for the Exit marker, in cells. */
const FRAME = 0.14;
const EXIT_SPACE = 0.62;
/** How far a finger must move before a touch counts as a drag, not a tap. */
const DRAG_PX = 8;

export interface BoardViewOptions {
  skin: Skin;
  board: Board;
  /** A Move the child just finished. The view already shows it. */
  onMove(move: Move): void;
  /** Any touch on a Vehicle, before it moves. */
  onTouch(): void;
}

export interface BoardView {
  element: HTMLElement;
  /** Shows a new board: sliding there (Undo, Reset) or jumping. */
  setBoard(board: Board, slide: boolean): void;
  /** Pulses the Vehicle to move and shows a ghost where it goes. Null clears it. */
  showHint(move: Move | null): void;
  /** The tutorial hand, dragging a Vehicle the way it should go. Null clears it. */
  showHand(move: Move | null): void;
  /** The red Vehicle drives through the Exit and off the screen. */
  driveOut(seconds: number): Promise<void>;
  setLocked(locked: boolean): void;
  fit(width: number, height: number): void;
  destroy(): void;
}

function tween(ms: number, frame: (t: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      frame(t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;

interface Drag {
  pointer: number;
  piece: Piece;
  element: HTMLElement;
  x: number;
  y: number;
  min: number;
  max: number;
  pos: number;
  dragging: boolean;
  /** Which end is pressed against something: -1, 1, or 0 for neither. */
  against: number;
  cell: number;
}

export function createBoardView(options: BoardViewOptions): BoardView {
  const { skin } = options;
  let board = options.board;
  let cell = 50;
  let locked = false;
  let busy = 0;
  let drag: Drag | null = null;
  let selected: string | null = null;
  let hint: Move | null = null;
  let hand: Move | null = null;
  let frameRequest = 0;

  const wrap = document.createElement('div');
  wrap.className = 'wo-board-wrap';
  const lot = document.createElement('div');
  lot.className = 'wo-board';
  const wallCells = walls(board);
  lot.innerHTML = `<svg class="wo-ground" viewBox="0 0 600 600" preserveAspectRatio="none" aria-hidden="true">${skin.ground}${wallCells
    .map((c) => `<g transform="translate(${(c % SIZE) * 100} ${Math.floor(c / SIZE) * 100})">${skin.wall}</g>`)
    .join('')}</svg>`;

  const path = document.createElement('div');
  path.className = 'wo-path';
  const ghost = document.createElement('div');
  ghost.className = 'wo-ghost';
  const handNode = document.createElement('div');
  handNode.className = 'wo-hand';
  handNode.innerHTML = ICONS.hand;
  const arrows = document.createElement('div');
  arrows.className = 'wo-nudges';

  const pieces = new Map<string, HTMLElement>();
  for (const piece of parse(board)) {
    const node = document.createElement('div');
    node.className = `wo-piece${piece.id === HERO ? ' wo-hero' : ''}`;
    node.dataset.id = piece.id;
    node.innerHTML = vehicleSvg(skin, piece);
    pieces.set(piece.id, node);
  }
  lot.append(path, ghost, ...pieces.values(), arrows, handNode);

  const frame = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  frame.setAttribute('class', 'wo-frame');
  frame.setAttribute('viewBox', '0 0 6 6');
  frame.setAttribute('aria-hidden', 'true');
  const edge = SIZE + FRAME / 2;
  const out = -FRAME / 2;
  // The frame all the way round, with a gap on the right of the red car's row.
  frame.innerHTML = `<path d="M${edge} ${EXIT_ROW}V${out}H${out}V${edge}H${edge}V${EXIT_ROW + 1}" fill="none" stroke="${skin.frame}" stroke-width="${FRAME}" stroke-linejoin="round"/>`;
  const exit = document.createElement('div');
  exit.className = 'wo-exit';
  exit.innerHTML = `<svg viewBox="0 0 62 200" aria-hidden="true">${skin.exit}</svg>`;
  wrap.append(lot, frame, exit);

  const pieceById = (id: string) => parse(board).find((p) => p.id === id)!;

  function place(node: HTMLElement, piece: Piece, at: number): void {
    const [col, row] = piece.horizontal ? [at, piece.line] : [piece.line, at];
    node.style.transform = `translate3d(${col * cell}px, ${row * cell}px, 0)`;
  }

  function size(node: HTMLElement, piece: Piece): void {
    node.style.width = `${(piece.horizontal ? piece.length : 1) * cell}px`;
    node.style.height = `${(piece.horizontal ? 1 : piece.length) * cell}px`;
  }

  /** The dotted line from the red car to the Exit, when nothing is in the way. */
  function drawPath(heroAt?: number): void {
    const hero = pieceById(HERO);
    const from = (heroAt ?? hero.at) + hero.length;
    const show = exitIsClear(board) && from < SIZE;
    path.hidden = !show;
    if (!show) return;
    path.style.transform = `translate3d(${from * cell}px, ${(EXIT_ROW + 0.5) * cell}px, 0)`;
    path.style.width = `${(SIZE - from + FRAME) * cell}px`;
  }

  function drawHint(): void {
    for (const node of pieces.values()) node.classList.remove('wo-hinted');
    ghost.hidden = !hint;
    if (!hint) return;
    const piece = pieceById(hint.piece);
    pieces.get(piece.id)!.classList.add('wo-hinted');
    ghost.innerHTML = vehicleSvg(skin, piece);
    size(ghost, piece);
    place(ghost, piece, piece.at + hint.delta);
  }

  function drawHand(): void {
    handNode.hidden = !hand;
    if (!hand) return;
    const piece = pieceById(hand.piece);
    const [col, row] = piece.horizontal ? [piece.at + piece.length / 2, piece.line + 0.5] : [piece.line + 0.5, piece.at + piece.length / 2];
    handNode.style.left = `${col * cell}px`;
    handNode.style.top = `${row * cell}px`;
    handNode.style.setProperty('--dx', `${piece.horizontal ? hand.delta * cell : 0}px`);
    handNode.style.setProperty('--dy', `${piece.horizontal ? 0 : hand.delta * cell}px`);
  }

  /** Arrow buttons in the free cells at either end of the lifted Vehicle. */
  function drawNudges(): void {
    arrows.replaceChildren();
    for (const node of pieces.values()) node.classList.toggle('wo-lifted', node.dataset.id === selected);
    if (!selected || locked) return;
    const piece = pieceById(selected);
    const { back, forward } = reach(board, piece);
    const ends: [number, number, string][] = [];
    if (back < 0) ends.push([-1, piece.at - 1, piece.horizontal ? 'left' : 'up']);
    if (forward > 0) ends.push([1, piece.at + piece.length, piece.horizontal ? 'right' : 'down']);
    for (const [delta, at, way] of ends) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `wo-nudge wo-${way}`;
      button.setAttribute('aria-label', `Slide ${way}`);
      button.innerHTML = ICONS.arrow;
      const [col, row] = piece.horizontal ? [at, piece.line] : [piece.line, at];
      button.style.transform = `translate3d(${col * cell}px, ${row * cell}px, 0)`;
      button.style.width = button.style.height = `${cell}px`;
      button.addEventListener('click', () => void nudge(piece, delta));
      arrows.append(button);
    }
  }

  async function nudge(piece: Piece, delta: number): Promise<void> {
    if (busy || locked || drag) return;
    const node = pieces.get(piece.id)!;
    busy++;
    arrows.replaceChildren();
    tick();
    await tween(150, (t) => place(node, piece, piece.at + delta * easeOut(t)));
    busy--;
    options.onMove({ piece: piece.id, delta });
  }

  function select(id: string | null): void {
    if (id && id !== selected) {
      const { back, forward } = reach(board, pieceById(id));
      // Boxed in both ways: a bump says so, rather than lifting it with no arrows.
      if (back === 0 && forward === 0) {
        bump();
        wobble(pieces.get(id)!);
        id = null;
      } else pop();
    }
    selected = id;
    drawNudges();
  }

  function wobble(node: HTMLElement): void {
    node.classList.remove('wo-wobble');
    // Restart the animation even if it's already running.
    void node.getBoundingClientRect();
    node.classList.add('wo-wobble');
  }

  function layout(): void {
    wrap.style.setProperty('--cell', `${cell}px`);
    wrap.style.width = `${(SIZE + FRAME * 2 + EXIT_SPACE) * cell}px`;
    wrap.style.height = `${(SIZE + FRAME * 2) * cell}px`;
    lot.style.left = lot.style.top = `${FRAME * cell}px`;
    lot.style.width = lot.style.height = `${SIZE * cell}px`;
    // The Exit marker sits just past the gap: one row above it for the flag, and its own row for the arrow.
    exit.style.left = `${(SIZE + FRAME * 2) * cell}px`;
    exit.style.top = `${(FRAME + EXIT_ROW - 1) * cell}px`;
    exit.style.width = `${EXIT_SPACE * cell}px`;
    exit.style.height = `${2 * cell}px`;
    for (const piece of parse(board)) {
      const node = pieces.get(piece.id)!;
      size(node, piece);
      place(node, piece, piece.at);
    }
    drawPath();
    drawHint();
    drawHand();
    drawNudges();
  }

  // --- Dragging -------------------------------------------------------------

  const render = () => {
    frameRequest = 0;
    if (!drag) return;
    place(drag.element, drag.piece, drag.pos);
    if (drag.piece.id === HERO) drawPath(drag.pos);
  };

  function onDown(event: PointerEvent): void {
    const node = (event.target as Element).closest<HTMLElement>('.wo-piece');
    if (!node || drag || busy || locked) return;
    event.preventDefault();
    options.onTouch();
    const piece = pieceById(node.dataset.id!);
    const { back, forward } = reach(board, piece);
    drag = {
      pointer: event.pointerId,
      piece,
      element: node,
      x: event.clientX,
      y: event.clientY,
      min: piece.at + back,
      max: piece.at + forward,
      pos: piece.at,
      dragging: false,
      against: 0,
      cell: piece.at,
    };
    node.setPointerCapture?.(event.pointerId);
  }

  function onMovePointer(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointer) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.dragging) {
      if (Math.hypot(dx, dy) < DRAG_PX) return;
      drag.dragging = true;
      drag.element.classList.add('wo-dragging');
      select(null);
    }
    // Only movement along its own line counts.
    const wanted = drag.piece.at + (drag.piece.horizontal ? dx : dy) / cell;
    drag.pos = Math.min(drag.max, Math.max(drag.min, wanted));
    // A soft bump the moment it meets something; not again until it pulls away.
    const against = wanted < drag.min - 0.1 ? -1 : wanted > drag.max + 0.1 ? 1 : 0;
    if (against !== 0 && against !== drag.against) {
      bump();
      navigator.vibrate?.(12);
    }
    if (against !== 0) drag.against = against;
    else if (wanted > drag.min + 0.25 && wanted < drag.max - 0.25) drag.against = 0;
    const nearest = Math.round(drag.pos);
    if (nearest !== drag.cell) {
      drag.cell = nearest;
      tick();
    }
    frameRequest ||= requestAnimationFrame(render);
  }

  async function onUp(event: PointerEvent): Promise<void> {
    if (!drag || event.pointerId !== drag.pointer) return;
    const { piece, element, pos, dragging } = drag;
    drag = null;
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    element.classList.remove('wo-dragging');
    if (!dragging) {
      select(selected === piece.id ? null : piece.id);
      return;
    }
    const cancelled = event.type === 'pointercancel' || event.type === 'lostpointercapture';
    let target = cancelled ? piece.at : Math.round(pos);
    // Most of the way to a clear Exit is close enough: finish it for him.
    const exitAt = SIZE - piece.length;
    if (!cancelled && piece.id === HERO && exitIsClear(board) && pos - piece.at >= (exitAt - piece.at) / 2) target = exitAt;
    busy++;
    await tween(110, (t) => place(element, piece, pos + (target - pos) * easeOut(t)));
    busy--;
    if (target !== piece.at) options.onMove({ piece: piece.id, delta: target - piece.at });
    else drawPath();
  }

  /** A tap anywhere but a Vehicle or its arrows puts the lifted Vehicle down. */
  function onAnyDown(event: PointerEvent): void {
    if (selected && !(event.target as Element).closest('.wo-piece, .wo-nudge')) select(null);
  }

  lot.addEventListener('pointerdown', onDown);
  lot.addEventListener('pointermove', onMovePointer);
  lot.addEventListener('pointerup', onUp);
  lot.addEventListener('pointercancel', onUp);
  lot.addEventListener('lostpointercapture', onUp);
  window.addEventListener('pointerdown', onAnyDown, true);

  return {
    element: wrap,
    setBoard(next, slide) {
      board = next;
      hint = null;
      for (const piece of parse(board)) {
        const node = pieces.get(piece.id)!;
        node.classList.toggle('wo-glide', slide);
        place(node, piece, piece.at);
      }
      if (slide) window.setTimeout(() => pieces.forEach((n) => n.classList.remove('wo-glide')), 260);
      drawPath();
      drawHint();
      drawHand();
      drawNudges();
    },
    showHint(move) {
      hint = move;
      drawHint();
    },
    showHand(move) {
      hand = move;
      drawHand();
    },
    async driveOut(seconds) {
      locked = true;
      select(null);
      path.hidden = true;
      const hero = pieceById(HERO);
      const node = pieces.get(HERO)!;
      // Well past the Exit marker, so it leaves the screen.
      const far = SIZE + 6;
      node.classList.add('wo-leaving');
      await tween(seconds * 1000, (t) => place(node, hero, hero.at + (far - hero.at) * easeIn(t)));
    },
    setLocked(value) {
      locked = value;
      if (locked) select(null);
    },
    fit(width, height) {
      const next = Math.floor(Math.min(width / (SIZE + FRAME * 2 + EXIT_SPACE), height / (SIZE + FRAME * 2)));
      if (next > 0 && next !== cell) {
        cell = next;
        layout();
      }
    },
    destroy() {
      window.removeEventListener('pointerdown', onAnyDown, true);
      cancelAnimationFrame(frameRequest);
    },
  };
}
