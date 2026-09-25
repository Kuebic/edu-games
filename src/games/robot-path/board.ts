// The Renderer: draws a Level as SVG in cell units, and plays a Trace back as animation.
// It never decides anything; the engine already has. Speed only changes playback.

import type { Missing, RunState, Step } from './game/engine';
import { flagOf, height, targetsOf, terrain, width, type Facing, type Level } from './game/level';
import { SKIN_ART, tileMarkup, type Skin } from './skins';
import * as sfx from './sound';
import type { SkinId } from './progress';

const SVG = 'http://www.w3.org/2000/svg';

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, markup = ''): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
  if (markup) node.innerHTML = markup;
  return node;
}

/** Runs `frame` with 0→1 over `ms`, resolving when done. */
export function animate(ms: number, frame: (t: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / Math.max(1, ms));
      frame(t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const ANGLE: Record<Facing, number> = { N: 0, E: 90, S: 180, W: 270 };

/** Restart a CSS animation class even if it's already running. */
export function replay(node: Element, className: string): void {
  node.classList.remove(className);
  void node.getBoundingClientRect();
  node.classList.add(className);
}

/** One mark of the hint's ghost path. */
export interface GhostMark {
  x: number;
  y: number;
  facing: Facing;
  turn: boolean;
}

export function missingMarkup(missing: Missing, skin: Skin): string {
  switch (missing.kind) {
    case 'flag':
      return skin.flag;
    case 'gem':
      return skin.gem;
    case 'crate':
      return skin.target;
    case 'sum':
      return tileMarkup(`=${missing.value}`).replace('font-size="0.48"', 'font-size="0.36"');
    default:
      return tileMarkup(missing.value);
  }
}

export class Board {
  readonly svg: SVGSVGElement;
  private readonly skin: Skin;
  private readonly robot = el('g');
  private readonly hop = el('g');
  private readonly body = el('g', { class: 'rp-robot' });
  private readonly itemNodes: SVGGElement[];
  private readonly ghosts = el('g', { class: 'rp-ghosts' });
  private readonly overlay = el('g');
  private angle = 0;

  constructor(
    private readonly level: Level,
    skin: SkinId,
  ) {
    this.skin = SKIN_ART[skin];
    const w = width(level);
    const h = height(level);
    this.svg = el('svg', { viewBox: `0 0 ${w} ${h}`, class: 'rp-board-svg', role: 'img', 'aria-label': 'The robot’s grid' });

    const floor = el('g');
    const walls = el('g');
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        floor.append(el('rect', { x, y, width: 1.02, height: 1.02, fill: this.skin.floor[(x + y) % 2]! }));
        if (terrain(level, { x, y }) === 'wall') walls.append(this.sprite(this.skin.wall, x, y));
      }
    const marks = el('g');
    for (const target of targetsOf(level)) marks.append(this.sprite(this.skin.target, target.x, target.y));
    const flag = flagOf(level);
    if (flag) marks.append(this.sprite(this.skin.flag, flag.x, flag.y, 'rp-flag'));

    const items = el('g');
    const crates = el('g');
    this.itemNodes = level.items.map((item) => {
      const markup = item.type === 'gem' ? this.skin.gem : item.type === 'crate' ? this.skin.crate : tileMarkup(item.value!);
      const node = this.sprite(markup, item.x, item.y, `rp-item rp-item-${item.type}`);
      (item.type === 'crate' ? crates : items).append(node);
      return node;
    });

    this.body.innerHTML = this.skin.robot;
    this.hop.append(this.body);
    this.robot.append(this.hop);
    this.svg.append(floor, walls, marks, items, crates, this.ghosts, this.robot, this.overlay);
  }

  /** A sprite centred in its cell. The inner group takes CSS animations. */
  private sprite(markup: string, x: number, y: number, className = ''): SVGGElement {
    const outer = el('g', { transform: `translate(${x + 0.5} ${y + 0.5})` });
    outer.append(el('g', { class: className }, markup));
    return outer;
  }

  private placeRobot(x: number, y: number, angle: number, lift = 0): void {
    this.robot.setAttribute('transform', `translate(${x + 0.5} ${y + 0.5}) rotate(${angle})`);
    this.hop.setAttribute('transform', lift ? `scale(${1 + lift * 0.12})` : '');
  }

  private placeItem(i: number, x: number, y: number): void {
    this.itemNodes[i]!.setAttribute('transform', `translate(${x + 0.5} ${y + 0.5})`);
  }

  /** Jump straight to a state: the start of a Run, or a rewind. */
  show(state: RunState): void {
    this.angle = ANGLE[state.facing];
    this.placeRobot(state.x, state.y, this.angle);
    this.body.setAttribute('class', 'rp-robot');
    state.items.forEach((item, i) => {
      this.placeItem(i, item.x, item.y);
      const inner = this.itemNodes[i]!.firstElementChild!;
      inner.classList.remove('rp-pop', 'rp-wiggle', 'rp-gone');
      if (item.taken) inner.classList.add('rp-gone');
    });
    this.overlay.replaceChildren();
  }

  /** The nearest way round to a facing, so the robot never spins the long way. */
  private angleFor(facing: Facing): number {
    const delta = ((ANGLE[facing] - this.angle + 540) % 360) - 180;
    return this.angle + delta;
  }

  /** Plays one Step, starting from `before`. */
  async play(step: Step, before: RunState, ms: number): Promise<void> {
    this.overlay.replaceChildren();
    const from = this.angle;
    const to = this.angleFor(step.state.facing);
    this.angle = to;
    const turnPart = (t: number) => from + (to - from) * easeInOut(Math.min(1, t * 2.5));

    for (const event of step.events) {
      if (event.type === 'turn') {
        sfx.whirr();
        await animate(ms, (t) => this.placeRobot(before.x, before.y, from + (to - from) * easeInOut(t)));
      } else if (event.type === 'move') {
        const push = step.events.find((e) => e.type === 'push');
        sfx.step();
        if (push) sfx.push();
        await animate(ms, (t) => {
          const k = easeInOut(t);
          this.placeRobot(event.from.x + (event.to.x - event.from.x) * k, event.from.y + (event.to.y - event.from.y) * k, turnPart(t), Math.sin(Math.PI * t));
          if (push) {
            this.placeItem(push.item, push.from.x + (push.to.x - push.from.x) * k, push.from.y + (push.to.y - push.from.y) * k);
          }
        });
      } else if (event.type === 'bonk') {
        const dx = event.toward.x - before.x;
        const dy = event.toward.y - before.y;
        if (from !== to) await animate(ms * 0.4, (t) => this.placeRobot(before.x, before.y, from + (to - from) * easeInOut(t)));
        sfx.boing();
        try {
          navigator.vibrate?.(80);
        } catch {
          // Not allowed here: fine.
        }
        replay(this.body, 'rp-wobble');
        if (event.item !== undefined) replay(this.itemNodes[event.item]!.firstElementChild!, 'rp-wiggle');
        await animate(Math.max(ms, 320), (t) => {
          const nudge = 0.28 * Math.sin(Math.PI * Math.min(1, t * 1.6));
          this.placeRobot(before.x + dx * nudge, before.y + dy * nudge, to);
        });
      } else if (event.type === 'pickup') {
        sfx.pickup();
        replay(this.itemNodes[event.item]!.firstElementChild!, 'rp-pop');
      } else if (event.type === 'reject') {
        sfx.bloop();
        replay(this.itemNodes[event.item]!.firstElementChild!, 'rp-wiggle');
      }
    }
    // An arrow step that ran no animation of its own still settles the robot.
    this.placeRobot(step.state.x, step.state.y, this.angle);
  }

  celebrate(): void {
    replay(this.body, 'rp-jump');
  }

  /** The Program ran out: a shrug and a thought bubble with what's still missing. */
  wonder(state: RunState, missing: Missing): void {
    replay(this.body, 'rp-shrug');
    const below = state.y === 0 && height(this.level) > 1;
    const cx = Math.min(Math.max(state.x + 0.5, 0.7), width(this.level) - 0.7);
    const cy = below ? state.y + 1.35 : state.y - 0.35;
    const tail = below ? [cx - 0.12, cy - 0.5, cx - 0.05, cy - 0.64] : [cx - 0.12, cy + 0.5, cx - 0.05, cy + 0.64];
    const bubble = el('g', { class: 'rp-bubble' });
    bubble.append(
      el('circle', { cx: tail[2]!, cy: tail[3]!, r: 0.06, fill: '#fff', stroke: '#2b3445', 'stroke-width': 0.03 }),
      el('circle', { cx: tail[0]!, cy: tail[1]!, r: 0.1, fill: '#fff', stroke: '#2b3445', 'stroke-width': 0.03 }),
      el('ellipse', { cx, cy, rx: 0.56, ry: 0.44, fill: '#fff', stroke: '#2b3445', 'stroke-width': 0.04 }),
      el('g', { transform: `translate(${cx} ${cy}) scale(0.72)` }, missingMarkup(missing, this.skin)),
    );
    this.overlay.replaceChildren(bubble);
  }

  /** The hint: a faint path over the first marks of the solution. */
  ghost(marks: GhostMark[]): void {
    this.ghosts.replaceChildren(
      ...marks.map((mark) =>
        el(
          'g',
          { transform: `translate(${mark.x + 0.5} ${mark.y + 0.5}) rotate(${ANGLE[mark.facing]})` },
          mark.turn
            ? '<circle r="0.3" fill="none" stroke="#fff" stroke-width="0.07" stroke-dasharray="0.12 0.08"/><path d="M-0.14 -0.02 0 -0.2 0.14 -0.02" fill="none" stroke="#fff" stroke-width="0.09" stroke-linecap="round" stroke-linejoin="round"/>'
            : '<circle r="0.22" fill="#fff" opacity="0.55"/><path d="M-0.12 0.05 0 -0.09 0.12 0.05" fill="none" stroke="#2b3445" stroke-width="0.07" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>',
        ),
      ),
    );
  }
}
