// One Level: tap a Vehicle, it drives off or bumps and backs up. Clear the board to finish.

import type { GrownUpCorner } from '@shared/grownup';
import { CHAPTERS, LEVELS_PER_CHAPTER } from './chapters';
import { LENGTH, type Vehicle } from './game/level';
import { tap } from './game/rules';
import { Track } from './game/track';
import { ICONS, iconButton } from './icons';
import { LEVELS } from './levels';
import { celebrate, honk, vroom } from './sound';
import { chapterIcon, drawBoard, drawVehicle, place, VEHICLE_COLORS } from './view';

export interface PlayHooks {
  corner: GrownUpCorner;
  cleared(): void;
  next(): void;
  levels(): void;
}

const CHAPTER_COLORS = ['#ff8a3d', '#2f9be0', '#2fa36b', '#9b5cf6', '#e0457b', '#0fa3a3', '#d9a400', '#ef4444'];

export function chapterColor(chapter: number): string {
  return CHAPTER_COLORS[chapter % CHAPTER_COLORS.length]!;
}

/** Runs `frame` with 0→1 over `seconds`, resolving when done. */
function animate(seconds: number, frame: (t: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (seconds * 1000));
      frame(t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
/** Pulls away gently, then speeds up. */
const pullAway = (t: number) => t * t * (0.6 + 0.4 * t);

function wobble(node: Element): void {
  node.classList.remove('tj-wobble');
  // Restart the animation even if it's already running.
  void node.getBoundingClientRect();
  node.classList.add('tj-wobble');
}

export function showPlay(root: HTMLElement, index: number, hooks: PlayHooks): () => void {
  const chapter = Math.floor(index / LEVELS_PER_CHAPTER);
  const level = LEVELS[chapter]![index % LEVELS_PER_CHAPTER]!;
  const vehicles: (Vehicle | null)[] = [...level.vehicles];
  let busy = false;
  let gone = false;

  const screen = document.createElement('main');
  screen.className = 'site-screen tj-play';
  screen.style.setProperty('--chapter', chapterColor(chapter));

  const bar = document.createElement('header');
  bar.className = 'site-bar';
  const badge = document.createElement('div');
  badge.className = 'tj-badge';
  badge.setAttribute('aria-label', `${CHAPTERS[chapter]!.name}, level ${(index % LEVELS_PER_CHAPTER) + 1}`);
  const number = document.createElement('span');
  number.textContent = String((index % LEVELS_PER_CHAPTER) + 1);
  badge.append(chapterIcon(chapter), number);
  bar.append(iconButton('site-tool', ICONS.levels, 'All levels', hooks.levels), badge, hooks.corner.gear());

  const stage = document.createElement('div');
  stage.className = 'tj-stage';
  const frame = document.createElement('div');
  frame.className = 'tj-board';
  const { board, vehicles: layer } = drawBoard(level, index);
  frame.append(board);
  stage.append(frame);
  screen.append(bar, stage);
  root.replaceChildren(screen);

  // Fit the board to the space left under the bar, keeping its shape.
  const fit = () => {
    const { width, height } = stage.getBoundingClientRect();
    const scale = Math.min(width / level.w, height / level.h);
    frame.style.width = `${Math.floor(level.w * scale)}px`;
    frame.style.height = `${Math.floor(level.h * scale)}px`;
  };
  const resize = new ResizeObserver(fit);
  resize.observe(stage);
  fit();

  const nodes = level.vehicles.map((vehicle, i) => {
    const node = drawVehicle(vehicle, VEHICLE_COLORS[i % VEHICLE_COLORS.length]!, i);
    const pose = new Track(vehicle, []).pose(0, LENGTH[vehicle.kind]);
    place(node, pose.x, pose.y, pose.angle);
    layer.append(node);
    return node;
  });

  async function drive(i: number): Promise<void> {
    const vehicle = vehicles[i]!;
    const node = nodes[i]!;
    const size = LENGTH[vehicle.kind];
    const result = tap(level, vehicles, i);
    const track = new Track(vehicle, result.route);
    const move = (distance: number) => {
      const pose = track.pose(distance, size);
      place(node, pose.x, pose.y, pose.angle);
    };
    // Drive over the top of parked Vehicles' paint while moving.
    layer.append(node);

    if (result.kind === 'leave') {
      vehicles[i] = null;
      const seconds = 0.35 + track.length * 0.075;
      vroom(seconds);
      await animate(seconds, (t) => move(track.length * pullAway(t)));
      node.remove();
      return;
    }

    const reach = track.distanceTo(result.reached) + 0.1;
    const seconds = 0.15 + reach * 0.07;
    await animate(seconds, (t) => move(reach * easeInOut(t)));
    honk();
    wobble(node.firstElementChild!);
    wobble(nodes[result.blocker]!.firstElementChild!);
    await animate(seconds + 0.1, (t) => move(reach * (1 - easeInOut(t))));
  }

  function finish(): void {
    hooks.cleared();
    celebrate();
    screen.append(confetti());
    const done = document.createElement('div');
    done.className = 'tj-done';
    done.append(
      iconButton('site-next', ICONS.next, 'Next level', hooks.next),
      iconButton('site-tool', ICONS.levels, 'All levels', hooks.levels),
    );
    screen.append(done);
  }

  board.addEventListener('pointerdown', (event) => {
    const target = (event.target as Element).closest('[data-vehicle]');
    if (!target || busy) return;
    const i = Number(target.getAttribute('data-vehicle'));
    if (!vehicles[i]) return;
    busy = true;
    void drive(i).then(() => {
      busy = false;
      if (!gone && vehicles.every((vehicle) => vehicle === null)) finish();
    });
  });

  return () => {
    gone = true;
    resize.disconnect();
  };
}

function confetti(): HTMLElement {
  const layer = document.createElement('div');
  layer.className = 'tj-confetti';
  const colors = [...VEHICLE_COLORS, '#ffffff'];
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
