// The goal strip: pictures of what this Level wants, filling in as the robot gets them.

import type { RunState } from './game/engine';
import { flagOf, targetsOf, type Level } from './game/level';
import { ICONS } from './icons';
import { SKIN_ART, spriteSvg, tileMarkup } from './skins';
import type { SkinId } from './progress';

export class GoalStrip {
  readonly element = document.createElement('div');
  private readonly parts: ((state: RunState) => void)[] = [];

  constructor(level: Level, skin: SkinId) {
    const art = SKIN_ART[skin];
    const { goals, items } = level;
    this.element.className = 'rp-goals';
    this.element.setAttribute('aria-label', 'Goals');

    const sequence = goals.spell ? [...goals.spell] : goals.numberOrder?.map(String);
    if (sequence) {
      const word = this.part('rp-goal-word');
      const tiles = sequence.map((value) => {
        const tile = document.createElement('span');
        tile.className = 'rp-goal-tile';
        tile.innerHTML = spriteSvg(tileMarkup(value));
        word.append(tile);
        return tile;
      });
      this.parts.push((state) => {
        const got = goals.spell ? state.spelled : state.counted;
        tiles.forEach((tile, i) => tile.classList.toggle('rp-got', i < got));
      });
    }

    if (goals.sum !== undefined) {
      const target = goals.sum;
      const meter = this.part('rp-goal-sum');
      meter.innerHTML = `<span class="rp-meter"><span class="rp-meter-fill"></span><span class="rp-meter-line"></span></span><b></b>`;
      const fill = meter.querySelector<HTMLElement>('.rp-meter-fill')!;
      const label = meter.querySelector('b')!;
      // The bar runs to 1.5 × the target, so going over shows past the line.
      meter.style.setProperty('--line', `${100 / 1.5}%`);
      this.parts.push((state) => {
        fill.style.width = `${Math.min(100, (state.sum / (target * 1.5)) * 100)}%`;
        label.textContent = `${state.sum} / ${target}`;
        meter.classList.toggle('rp-got', state.sum === target);
        meter.classList.toggle('rp-over', state.sum > target);
      });
    }

    const counter = (markup: string, total: number, count: (state: RunState) => number) => {
      const part = this.part('rp-goal-count');
      part.innerHTML = `${spriteSvg(markup)}<b></b>`;
      const label = part.querySelector('b')!;
      this.parts.push((state) => {
        const got = count(state);
        label.textContent = `${got}/${total}`;
        part.classList.toggle('rp-got', got === total);
      });
    };
    const gems = items.flatMap((item, i) => (item.type === 'gem' ? [i] : []));
    if (goals.collectAll) counter(art.gem, gems.length, (state) => gems.filter((i) => state.items[i]!.taken).length);
    if (goals.cratesOnTargets) {
      const targets = targetsOf(level);
      const crates = items.flatMap((item, i) => (item.type === 'crate' ? [i] : []));
      counter(art.crate, crates.length, (state) =>
        crates.filter((i) => targets.some((t) => t.x === state.items[i]!.x && t.y === state.items[i]!.y)).length,
      );
    }

    if (goals.flag) {
      const flag = flagOf(level)!;
      const part = this.part('rp-goal-flag');
      part.innerHTML = `${spriteSvg(art.flag)}<span class="rp-goal-check">${ICONS.check}</span>`;
      this.parts.push((state) => part.classList.toggle('rp-got', state.x === flag.x && state.y === flag.y));
    }
  }

  private part(className: string): HTMLElement {
    const part = document.createElement('span');
    part.className = `rp-goal ${className}`;
    this.element.append(part);
    return part;
  }

  update(state: RunState): void {
    for (const part of this.parts) part(state);
  }
}
