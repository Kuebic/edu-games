// The program bar: the main row of Slots, and a body row under it for each Repeat Block.
// Empty Slots are dashed so he can see how much room is left.

import type { Address } from './game/engine';
import type { Editor } from './game/editor';
import { MAX_BODY, programLength, type RepeatCommand } from './game/level';
import { ICONS, OP_ICONS, OP_LABELS } from './icons';

export interface RunMarks {
  /** The Command running now. */
  now?: Address | null;
  /** The Command that bonked: it glows, and everything after it dims. */
  bonk?: Address | null;
  /** Repeat Block passes while running, by Slot. */
  loops?: Map<number, { pass: number; of: number }>;
  /** The Program ran out: the first empty Slot pulses. */
  want?: boolean;
}

export interface BarHooks {
  select(at: Address): void;
  remove(): void;
  cursor(body: number | null): void;
  count(slot: number): void;
}

const LOOP_COLORS = ['#9b5cf6', '#0fa3a3', '#e0457b', '#d98e04'];

const same = (a: Address | null | undefined, b: Address) => !!a && a.slot === b.slot && a.inner === b.inner;

/** Runs after `bonk` in the Program's order. */
function after(bonk: Address, at: Address): boolean {
  if (at.slot !== bonk.slot) return at.slot > bonk.slot;
  return bonk.inner !== undefined && at.inner !== undefined && at.inner > bonk.inner;
}

export class ProgramBar {
  readonly element = document.createElement('div');
  private readonly main = document.createElement('div');
  private readonly bodies = document.createElement('div');
  private countButtons: HTMLElement[] = [];

  constructor(
    private readonly maxSlots: number,
    private readonly hooks: BarHooks,
  ) {
    this.element.className = 'rp-program';
    this.main.className = 'rp-main';
    this.bodies.className = 'rp-bodies';
    this.element.append(this.main, this.bodies);
  }

  /** The first Repeat Block's number, for the tutorial hand. */
  firstCount(): HTMLElement | undefined {
    return this.countButtons[0];
  }

  wiggle(): void {
    this.element.classList.remove('rp-wiggle-bar');
    void this.element.offsetWidth;
    this.element.classList.add('rp-wiggle-bar');
  }

  render(editor: Editor, marks: RunMarks, locked: boolean): void {
    const { program, body, selected } = editor;
    const free = this.maxSlots - programLength(program);
    this.element.classList.toggle('rp-locked', locked);
    this.countButtons = [];

    const decorate = (slot: HTMLElement, at: Address) => {
      slot.classList.toggle('rp-now', same(marks.now, at));
      slot.classList.toggle('rp-bonk', same(marks.bonk, at));
      slot.classList.toggle('rp-dim', !!marks.bonk && after(marks.bonk, at));
      if (same(selected, at)) {
        slot.classList.add('rp-selected');
        const x = document.createElement('button');
        x.type = 'button';
        x.className = 'rp-x';
        x.innerHTML = ICONS.close;
        x.setAttribute('aria-label', 'Delete');
        x.addEventListener('click', (event) => {
          event.stopPropagation();
          this.hooks.remove();
        });
        slot.append(x);
      }
    };

    const plain = (op: keyof typeof OP_ICONS, at: Address) => {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'rp-slot';
      slot.innerHTML = OP_ICONS[op];
      slot.setAttribute('aria-label', OP_LABELS[op]);
      slot.addEventListener('click', () => this.hooks.select(at));
      decorate(slot, at);
      return slot;
    };

    const empty = (cursor: boolean, want: boolean, onTap: () => void) => {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'rp-slot rp-empty';
      slot.setAttribute('aria-label', 'Empty');
      slot.classList.toggle('rp-cursor', cursor);
      slot.classList.toggle('rp-want', want);
      slot.addEventListener('click', onTap);
      return slot;
    };

    const block = (command: RepeatCommand, slot: number, color: string) => {
      const at = { slot };
      const node = document.createElement('div');
      node.className = 'rp-slot rp-block';
      node.style.setProperty('--loop', color);
      node.setAttribute('role', 'group');
      node.setAttribute('aria-label', `Repeat ${command.times} times`);
      const icon = document.createElement('button');
      icon.type = 'button';
      icon.className = 'rp-block-icon';
      icon.innerHTML = OP_ICONS.repeat;
      icon.setAttribute('aria-label', 'Repeat');
      icon.addEventListener('click', () => this.hooks.select(at));
      const count = document.createElement('button');
      count.type = 'button';
      count.className = 'rp-count';
      count.setAttribute('aria-label', `${command.times} times`);
      const pass = marks.loops?.get(slot);
      const dots = Array.from({ length: command.times }, (_, i) => `<i class="${pass && i < pass.pass ? 'rp-on' : ''}"></i>`).join('');
      count.innerHTML = pass
        ? `<b>${pass.pass}<small>/${pass.of}</small></b><span class="rp-dots">${dots}</span>`
        : `<b>${command.times}</b><span class="rp-dots">${dots}</span>`;
      count.addEventListener('click', () => this.hooks.count(slot));
      this.countButtons.push(count);
      node.append(icon, count);
      node.classList.toggle('rp-active', marks.now?.slot === slot);
      decorate(node, at);
      return node;
    };

    const mainSlots: HTMLElement[] = [];
    const bodyRows: HTMLElement[] = [];
    let loops = 0;
    program.forEach((command, slot) => {
      if (command.op !== 'repeat') return mainSlots.push(plain(command.op, { slot }));
      const color = LOOP_COLORS[loops++ % LOOP_COLORS.length]!;
      mainSlots.push(block(command, slot, color));
      const row = document.createElement('div');
      row.className = 'rp-body-row';
      row.style.setProperty('--loop', color);
      row.classList.toggle('rp-open', body === slot);
      const badge = document.createElement('span');
      badge.className = 'rp-body-badge';
      badge.innerHTML = OP_ICONS.repeat;
      row.append(badge, ...command.body.map((inner, i) => plain(inner.op, { slot, inner: i })));
      const room = Math.min(MAX_BODY - command.body.length, free);
      for (let i = 0; i < room; i++) row.append(empty(i === 0 && body === slot && !selected, false, () => this.hooks.cursor(slot)));
      bodyRows.push(row);
    });
    for (let i = 0; i < free; i++) mainSlots.push(empty(i === 0 && body === null && !selected, i === 0 && !!marks.want, () => this.hooks.cursor(null)));

    this.main.replaceChildren(...mainSlots);
    this.bodies.replaceChildren(...bodyRows);
  }
}
