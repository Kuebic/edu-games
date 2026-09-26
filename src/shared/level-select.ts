// The level select every Game opens on (ADR 0008): the Group list, then one Group's Levels.
// A Game says what its Groups are and which Levels are done; this draws both screens the same way
// everywhere, with the one unlock rule (unlock.ts, ADR 0009).

import { houseButton } from './house-button';
import './level-select.css';
import type { LevelMark } from './progress';
import { currentLevel, isLevelOpen } from './unlock';

/** One Level as the level select draws it: Saved progress gives them (progress.ts). */
export type { LevelMark };

/** One Group (a Pack, Chapter, World or Stage) as the level select draws it. */
export interface GroupView {
  /** The Game's own name for it ("First drive"). Read by screen readers, never shown. */
  name: string;
  /** Its colour: the badge, the Level borders, done Levels and the dots. */
  colour: string;
  /** Its badge picture, drawn white on the colour: SVG markup or a fresh node. Called once per badge drawn. */
  badge(): string | Node;
  /** Its Levels in play order; card i shows the number i + 1. A Group with none is left out (My Letter's My name before there's a Name). */
  levels: readonly LevelMark[];
  /** What each Level's card shows in place of its number, and screen readers say (My Letter's letters). */
  labels?: readonly string[];
  /** Sparkles earned outside its Levels (Way Out's Pool), added to its count. */
  bonusSparkles?: number;
}

export interface SkinChip {
  id: string;
  /** For screen readers; the child sees the picture. */
  label: string;
  /** SVG markup on the chip. */
  picture: string;
  /** The colour behind the picture. */
  colour: string;
}

export interface SkinPicker {
  chips: readonly SkinChip[];
  current(): string;
  /** Save the choice and repaint the page (paintPage). The Group list redraws itself afterwards. */
  choose(id: string): void;
}

/** Everything the level select needs from a Game. Read again on every draw, never cached. */
export interface LevelSelectGame {
  /** The Game's name: the Group list's heading. */
  title: string;
  /**
   * Every Group, easiest first. A hidden bonus Group is left off the end, and a Group with no Levels is
   * left out of the list but keeps its place, so indices never shift. At least one must have Levels.
   */
  groups(): readonly GroupView[];
  /** The Game's word for a Level, which screen readers say on each card ("Round 3"). "Level" if left out. */
  levelWord?: string;
  /** The Grown-up Corner's "Every level open", in a Game that has it. */
  everyLevelOpen?(): boolean;
  /** Header buttons right of the heading, on both screens (speaker, mute, gear). Fresh nodes each call. `group` is the Group whose screen is up, undefined on the list. */
  tools?(group?: number): HTMLElement[];
  /** Skin chips under the Group list's header. Leave out in a Game without Skins. */
  skins?: SkinPicker;
  /** Under the Group cards (Snack Math's Sticker Book). */
  underList?(): HTMLElement | undefined;
  /** Under one Group's Levels (Way Out's "More like this"). */
  underGroup?(group: number): HTMLElement | undefined;
  /**
   * A child tapped an open Level. The level select has already left. Groups and Levels count from 0.
   * It runs inside the tap, so a Game can unlock its audio here.
   */
  play(group: number, level: number): void;
}

export interface LevelSelectView {
  /** Drops the key handling. Call it before drawing another screen. Safe to call twice. */
  leave(): void;
  /** Draws whichever of the two screens is up again, e.g. after the Grown-up Corner closes. */
  redraw(): void;
}

const icon = (body: string) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const BACK = icon('<path d="M28 10 14 24l14 14"/>');
const LOCK = icon('<rect x="11" y="22" width="26" height="19" rx="4" fill="currentColor"/><path d="M16 22v-6a8 8 0 0 1 16 0v6"/>');
const TICK = icon('<path d="m11 25 9 9 17-19" stroke-width="7"/>');
const SPARKLE = icon(
  '<path d="M22 4c1 10 4 14 16 16-12 2-15 6-16 18-1-12-4-16-16-18 12-2 15-6 16-16Z" fill="currentColor" stroke-width="2"/><path d="M39 32c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6Z" fill="currentColor" stroke-width="1.5"/>',
);

/** The Group the child last opened, so coming back to the list lands on its card. Gone on reload. */
let lastOpened: number | undefined;

/**
 * Shows the Group list, or with `group` that Group's Levels (where "all levels" and back from play go).
 * A `group` that isn't shown any more (the bonus Group was switched off, or it has no Levels) lands on the list.
 * Throws if the Game has no Group with Levels.
 */
export function showLevelSelect(root: HTMLElement, game: LevelSelectGame, group?: number): LevelSelectView {
  let at = group;
  let stop = () => {};
  /** `chose` after a Skin chip: focus stays on it, and the list stays where it was scrolled. */
  const render = (chose = false) => {
    stop();
    const groups = game.groups();
    if (!groups.some((g) => g.levels.length > 0)) throw new Error(`Game Shelf: ${game.title} has no Groups with Levels for its level select`);
    if (at !== undefined && !groups[at]?.levels.length) at = undefined;
    if (at === undefined) {
      const scrolled = root.querySelector('.site-groups')?.scrollTop ?? 0;
      const screen = groupList(game, groups, open, () => render(true));
      const card = lastOpened === undefined ? undefined : (screen.querySelector<HTMLButtonElement>(`.site-group[data-group="${lastOpened}"]`) ?? undefined);
      const chip = chose ? screen.querySelector<HTMLElement>('.site-skin[aria-checked="true"]') : null;
      stop = put(root, screen, chip ?? card, card);
      if (chip) screen.querySelector('.site-groups')!.scrollTop = scrolled;
    } else {
      lastOpened = at;
      const g = at;
      const screen = groupScreen(game, groups[g]!, g, back, (level) => {
        stop();
        game.play(g, level);
      });
      const current = screen.querySelector<HTMLButtonElement>('.site-current') ?? undefined;
      stop = put(root, screen, current, current, back);
    }
  };
  const open = (g: number) => {
    at = g;
    render();
  };
  const back = () => {
    at = undefined;
    render();
  };
  render();
  return { leave: () => stop(), redraw: () => render() };
}

/** Sets a Skin's page colours on :root, so notches and overscroll match, and the browser bar's colour. */
export function paintPage(colours: Readonly<Record<`--${string}`, string>>, themeColour: string): void {
  const page = document.documentElement.style;
  for (const [name, value] of Object.entries(colours)) page.setProperty(name, value);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColour);
}

function button(className: string, label: string, html: string, onClick?: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.setAttribute('aria-label', label);
  b.innerHTML = html;
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

/** The header: the House button or back, the heading or the Group's pill, then the Game's tools. */
function bar(game: LevelSelectGame, group: number | undefined, first: HTMLElement, middle: HTMLElement): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-bar';
  const tools = game.tools?.(group) ?? [];
  if (tools.length === 0) {
    // Keeps the heading in the middle.
    const space = document.createElement('div');
    space.className = 'site-tool-space';
    tools.push(space);
  }
  header.append(first, middle, ...tools);
  return header;
}

function badge(group: GroupView, className: string): HTMLElement {
  const span = document.createElement('span');
  span.className = className;
  const picture = group.badge();
  if (typeof picture === 'string') span.innerHTML = picture;
  else span.append(picture);
  return span;
}

function under(screen: HTMLElement, node: HTMLElement | undefined): void {
  if (!node) return;
  node.classList.add('site-under');
  screen.classList.add('site-has-under');
  screen.append(node);
}

function groupList(game: LevelSelectGame, groups: readonly GroupView[], open: (g: number) => void, redraw: () => void): HTMLElement {
  const screen = document.createElement('main');
  screen.className = 'site-screen site-select';
  const title = document.createElement('h1');
  title.textContent = game.title;
  screen.append(bar(game, undefined, houseButton(), title));

  const { skins } = game;
  if (skins) {
    const row = document.createElement('div');
    row.className = 'site-skins';
    row.setAttribute('role', 'radiogroup');
    row.setAttribute('aria-label', 'Pictures');
    for (const chip of skins.chips) {
      const b = button('site-skin', chip.label, chip.picture, () => {
        skins.choose(chip.id);
        redraw();
      });
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(skins.current() === chip.id));
      b.style.setProperty('--site-skin', chip.colour);
      row.append(b);
    }
    screen.append(row);
  }

  const cards = document.createElement('div');
  cards.className = 'site-groups';
  groups.forEach((group, g) => {
    const total = group.levels.length;
    if (total === 0) return;
    const done = group.levels.filter((l) => l.done).length;
    const sparkles = group.levels.filter((l) => l.sparkle).length + (group.bonusSparkles ?? 0);
    const card = button('site-group', `${group.name}: ${done} of ${total} done`, '', () => open(g));
    card.dataset.group = String(g);
    card.style.setProperty('--site-group', group.colour);
    const dots = document.createElement('span');
    dots.className = 'site-dots';
    dots.setAttribute('aria-hidden', 'true');
    // Two rows for 12 or 8 Levels, one for 4 or fewer.
    dots.style.setProperty('--site-dot-cols', String(total > 4 ? Math.ceil(total / 2) : total));
    dots.innerHTML = group.levels.map((l) => `<i${l.done ? ' class="site-on"' : ''}></i>`).join('');
    const count = document.createElement('span');
    count.className = 'site-sparkles';
    count.setAttribute('aria-hidden', 'true');
    if (sparkles > 0) count.innerHTML = `${SPARKLE}<b>${sparkles}</b>`;
    card.append(badge(group, 'site-group-badge'), dots, count);
    cards.append(card);
  });
  screen.append(cards);
  under(screen, game.underList?.());
  return screen;
}

function groupScreen(
  game: LevelSelectGame,
  group: GroupView,
  g: number,
  back: () => void,
  play: (level: number) => void,
): HTMLElement {
  const screen = document.createElement('main');
  screen.className = 'site-screen site-select';
  screen.style.setProperty('--site-group', group.colour);
  const pill = document.createElement('div');
  pill.className = 'site-pill';
  pill.setAttribute('role', 'img');
  pill.setAttribute('aria-label', group.name);
  pill.append(badge(group, 'site-pill-badge'));
  screen.append(bar(game, g, button('site-tool', 'Back', BACK, back), pill));

  const grid = document.createElement('div');
  grid.className = 'site-levels';
  const n = group.levels.length;
  // Portrait: up to 4 across. Landscape: one row of up to 8, else two rows.
  const portrait = Math.min(n, 4);
  const landscape = n <= 8 ? n : Math.ceil(n / 2);
  grid.style.setProperty('--site-cols-p', String(portrait));
  grid.style.setProperty('--site-rows-p', String(Math.ceil(n / portrait)));
  grid.style.setProperty('--site-cols-l', String(landscape));
  grid.style.setProperty('--site-rows-l', String(Math.ceil(n / landscape)));
  const done = group.levels.map((l) => l.done);
  const everyOpen = game.everyLevelOpen?.() ?? false;
  const current = currentLevel(done, everyOpen);
  group.levels.forEach((mark, i) => {
    const open = isLevelOpen(done, i, everyOpen);
    const sparkle = open && mark.sparkle === true;
    const label = group.labels?.[i] ?? String(i + 1);
    const card = button(
      'site-level',
      `${game.levelWord ?? 'Level'} ${label}${mark.done ? ', done' : ''}${sparkle ? ', sparkle' : ''}${open ? '' : ', locked'}`,
      open ? '' : LOCK,
    );
    if (open) {
      card.textContent = label;
      if (mark.done) {
        card.classList.add('site-done');
        card.insertAdjacentHTML('beforeend', `<span class="site-tick">${TICK}</span>`);
      }
      if (sparkle) card.insertAdjacentHTML('beforeend', `<span class="site-level-sparkle">${SPARKLE}</span>`);
      if (i === current) card.classList.add('site-current');
      card.addEventListener('click', () => play(i));
    } else card.disabled = true;
    grid.append(card);
  });
  screen.append(grid);
  under(screen, game.underGroup?.(g));
  return screen;
}

/**
 * Puts a screen up, focuses `focus` and brings it into view, and walks the cards with the arrow keys:
 * from `start` (the Group last opened, the current Level) when no card has focus, else the first open card.
 * While a dialog such as the Grown-up Corner is over the screen, the screen's keys and buttons do nothing.
 * Returns what takes the key handling away again.
 */
function put(root: HTMLElement, screen: HTMLElement, focus: HTMLElement | undefined, start: HTMLButtonElement | undefined, back?: () => void): () => void {
  root.replaceChildren(screen);
  const cards = [...screen.querySelectorAll<HTMLButtonElement>('.site-group, .site-level')];
  const first = start ?? cards.find((c) => !c.disabled);
  focus?.scrollIntoView?.({ block: 'center' });
  focus?.focus({ preventScroll: true });

  const dialog = () => root.querySelector('[role="dialog"]');
  // Enter and Space on a card behind the Corner are the button's own click, so the keys alone can't stop them.
  screen.addEventListener(
    'click',
    (event) => {
      const over = dialog();
      if (over && !over.contains(event.target as Node)) event.stopPropagation();
    },
    true,
  );

  const onKey = (event: KeyboardEvent) => {
    if (!screen.isConnected) return stop();
    if (dialog()) return;
    const focused = document.activeElement;
    // Not while something else has focus, or on the Skin chips, a radio group of their own.
    if (focused && focused !== document.body && !screen.contains(focused)) return;
    if (focused?.closest('.site-skins')) return;
    if (event.key === 'Escape' && back) {
      event.preventDefault();
      return back();
    }
    const from = cards.indexOf(focused as HTMLButtonElement);
    const columns = getComputedStyle(cards[0]!.parentElement!).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns } as Record<string, number>)[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const to = from === -1 ? first : cards[from + step];
    if (to && !to.disabled) to.focus();
  };
  window.addEventListener('keydown', onKey);
  const stop = () => window.removeEventListener('keydown', onKey);
  return stop;
}
