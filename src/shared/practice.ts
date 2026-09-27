// Practice (ADR 0014): the first screen of a Game with no Levels, where the same Finds go round for as long
// as a child likes. A grown-up picks, in one tap each, the Topic, the Way and the Scope (which numbers or
// letters come up), then Play. The Game saves the picks; this draws them the same way in every Game.

import { houseButton } from './house-button';
import './practice.css';

/** One Way a Topic's Finds can go ("🍎 → A"). */
export interface PracticeWay {
  id: string;
  /** For screen readers. */
  label: string;
  /** What the chip shows: a few characters, emoji welcome. */
  text: string;
}

/** A run of items a grown-up can turn on or off in one tap ("A–E"). */
export interface PracticeRange {
  label: string;
  items: readonly string[];
}

/** One Topic (Find It's Numbers or Letters): its own items, Ranges, Ways, Scope and Way. */
export interface PracticeTopic {
  /** For screen readers ("Letters"). */
  name: string;
  /** Its colour: the tab, the items and Ranges that are on. */
  colour: string;
  /** Its badge picture, drawn white on the colour: SVG markup or a fresh node. */
  badge(): string | Node;
  /** Every item the Scope can hold, in order, as its button shows it. */
  items: readonly string[];
  ranges: readonly PracticeRange[];
  ways: readonly PracticeWay[];
}

/** Everything Practice needs from a Game. Read again on every draw, never cached. */
export interface PracticeGame {
  /** The Game's name: the heading. */
  title: string;
  /** At least one. With one there are no tabs. */
  topics: readonly PracticeTopic[];
  /** Which Topic is up, counting from 0. */
  topic(): number;
  chooseTopic(topic: number): void;
  /** A Topic's Scope: the items that come up, in the Topic's order. */
  scope(topic: number): readonly string[];
  /** Save a Topic's Scope, always given in the Topic's order. It may be empty; then Play waits. */
  setScope(topic: number, items: readonly string[]): void;
  /** A Topic's Way, by id. */
  way(topic: number): string;
  chooseWay(topic: number, way: string): void;
  /** Header buttons right of the heading (the gear). Fresh nodes each call. */
  tools?(): HTMLElement[];
  /** Play the Topic that's up with its Scope and Way. Practice has already left. Runs inside the tap. */
  play(topic: number): void;
}

export interface PracticeView {
  /** Call it before drawing another screen. Safe to call twice. */
  leave(): void;
  /** Draws it again, e.g. after the Grown-up Corner closes. */
  redraw(): void;
}

const PLAY =
  '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10.5v27a2 2 0 0 0 3 1.7l21.5-13.5a2 2 0 0 0 0-3.4L19 8.8a2 2 0 0 0-3 1.7Z" fill="currentColor"/></svg>';

function button(className: string, label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.setAttribute('aria-label', label);
  b.addEventListener('click', onClick);
  return b;
}

function row(className: string, label: string, role = 'group'): HTMLElement {
  const div = document.createElement('div');
  div.className = className;
  div.setAttribute('role', role);
  div.setAttribute('aria-label', label);
  return div;
}

/** A Range's next Scope: its items all off if they're all on, else all on, the rest as they were. */
export function toggleRange(items: readonly string[], scope: readonly string[], range: readonly string[]): string[] {
  const on = new Set(scope);
  const all = range.every((i) => on.has(i));
  for (const i of range) {
    if (all) on.delete(i);
    else on.add(i);
  }
  return items.filter((i) => on.has(i));
}

/** Shows Practice. Throws if the Game has no Topics. */
export function showPractice(root: HTMLElement, game: PracticeGame): PracticeView {
  if (game.topics.length === 0) throw new Error(`Game Shelf: ${game.title} has no Topics for Practice`);
  let left = false;

  /** `focus` is the key of the button tapped, so focus stays on it through the redraw. */
  function render(focus?: string): void {
    if (left) return;
    const t = Math.min(Math.max(game.topic(), 0), game.topics.length - 1);
    const topic = game.topics[t]!;
    const scope = new Set(game.scope(t));

    const screen = document.createElement('main');
    screen.className = 'site-screen site-practice';
    screen.style.setProperty('--site-group', topic.colour);

    const header = document.createElement('header');
    header.className = 'site-bar';
    const title = document.createElement('h1');
    title.textContent = game.title;
    const tools = game.tools?.() ?? [];
    if (tools.length === 0) {
      const space = document.createElement('div');
      space.className = 'site-tool-space';
      tools.push(space);
    }
    header.append(houseButton(), title, ...tools);

    const picks = document.createElement('div');
    picks.className = 'site-practice-picks';

    if (game.topics.length > 1) {
      const tabs = row('site-topics', 'Topic', 'radiogroup');
      game.topics.forEach((other, i) => {
        const tab = button('site-topic', other.name, () => {
          if (i === t) return;
          game.chooseTopic(i);
          render(`topic:${i}`);
        });
        tab.dataset.key = `topic:${i}`;
        tab.setAttribute('role', 'radio');
        tab.setAttribute('aria-checked', String(i === t));
        tab.style.setProperty('--site-topic', other.colour);
        const picture = other.badge();
        if (typeof picture === 'string') tab.innerHTML = picture;
        else tab.append(picture);
        tabs.append(tab);
      });
      picks.append(tabs);
    }

    const ways = row('site-ways', 'Way', 'radiogroup');
    for (const way of topic.ways) {
      const chip = button('site-way', way.label, () => {
        game.chooseWay(t, way.id);
        render(`way:${way.id}`);
      });
      chip.dataset.key = `way:${way.id}`;
      chip.textContent = way.text;
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', String(game.way(t) === way.id));
      ways.append(chip);
    }
    picks.append(ways);

    const ranges = row('site-ranges', 'Ranges');
    for (const range of topic.ranges) {
      const chip = button('site-range', range.label, () => {
        game.setScope(t, toggleRange(topic.items, [...scope], range.items));
        render(`range:${range.label}`);
      });
      chip.dataset.key = `range:${range.label}`;
      chip.textContent = range.label;
      chip.setAttribute('aria-pressed', String(range.items.every((i) => scope.has(i))));
      ranges.append(chip);
    }
    picks.append(ranges);

    const items = row('site-scope', 'Scope');
    for (const item of topic.items) {
      const chip = button('site-item', item, () => {
        const next = scope.has(item) ? [...scope].filter((i) => i !== item) : [...scope, item];
        game.setScope(t, topic.items.filter((i) => next.includes(i)));
        render(`item:${item}`);
      });
      chip.dataset.key = `item:${item}`;
      chip.textContent = item;
      chip.setAttribute('aria-pressed', String(scope.has(item)));
      items.append(chip);
    }

    const play = button('site-next site-practice-play', 'Play', () => {
      left = true;
      game.play(t);
    });
    play.innerHTML = PLAY;
    play.disabled = scope.size === 0;

    const go = document.createElement('div');
    go.className = 'site-practice-go';
    go.append(items, play);

    const body = document.createElement('div');
    body.className = 'site-practice-body';
    body.append(picks, go);
    screen.append(header, body);
    root.replaceChildren(screen);
    if (focus) screen.querySelector<HTMLElement>(`[data-key="${focus}"]`)?.focus();
  }

  render();
  return {
    leave: () => (left = true),
    redraw: () => render(),
  };
}
