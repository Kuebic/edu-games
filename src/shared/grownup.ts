// The Grown-up Corner (ADR 0013): the settings behind a 3-second hold on the gear, the same dialog in every
// Game. It draws the site's rows from Saved progress; a Game adds its own rows. Words are fine here.

import './grownup.css';
import { holdToActivate } from './hold';
import type { Progress } from './progress';
import { canSpeak } from './voice';

export interface CornerSpec {
  /** The Game speaks, so the Voice switch shows (where the browser can speak). */
  voice?: boolean;
  /** The Game's own rows, under the site's: switchRow(), choiceRow(), textRow() or any element. Made fresh each time it opens. */
  rows?(): HTMLElement[];
  /** A note for grown-ups, in words, under the rows. */
  note?: string;
  /** After it closes, e.g. to redraw the level select so a reset or "Every level open" shows. */
  closed?(): void;
}

export interface GrownUpCorner {
  /** The gear: a site-tool that opens the Corner after a 3-second hold. A fresh button each call. */
  gear(): HTMLButtonElement;
  open(): void;
}

/** What the Corner asks the browser. Tests pass their own. */
export interface CornerEnv {
  canSpeak: boolean;
}

const icon = (body: string) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const GEAR = icon(
  '<circle cx="24" cy="24" r="6"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/><circle cx="24" cy="24" r="13"/>',
);
const CLOSE = icon('<path d="M14 14l20 20M34 14 14 34" stroke-width="7"/>');

function button(className: string, text: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.textContent = text;
  return b;
}

/** A row with a switch: its name, and a knob. Flips on tap, and shows what `get` says. */
export function switchRow(label: string, get: () => boolean, set: (on: boolean) => void): HTMLButtonElement {
  const row = button('site-switch', '');
  row.setAttribute('role', 'switch');
  row.innerHTML = `<span>${label}</span><i></i>`;
  const render = () => row.setAttribute('aria-checked', String(get()));
  row.addEventListener('click', () => {
    set(!get());
    render();
  });
  render();
  return row;
}

/** A row with a choice: its name, then a button per option, the chosen one pressed. */
export function choiceRow<T extends string>(
  label: string,
  choices: readonly { id: T; label: string }[],
  get: () => T,
  set: (choice: T) => void,
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'site-choice';
  const name = document.createElement('span');
  name.textContent = label;
  row.append(name);
  const buttons = choices.map((choice) => {
    const b = button('', choice.label);
    b.addEventListener('click', () => {
      set(choice.id);
      render();
    });
    row.append(b);
    return [choice.id, b] as const;
  });
  const render = () => {
    for (const [id, b] of buttons) b.setAttribute('aria-pressed', String(get() === id));
  };
  render();
  return row;
}

let texts = 0;

/**
 * A row with a text box: its name, and the box showing what `get` says. Saves with `set` when the box
 * changes or loses focus, and only if the text changed, not on every key.
 */
export function textRow(label: string, get: () => string, set: (text: string) => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'site-text';
  const name = document.createElement('label');
  name.textContent = label;
  const box = document.createElement('input');
  box.type = 'text';
  box.id = name.htmlFor = `site-text-${++texts}`;
  box.autocomplete = 'off';
  box.spellcheck = false;
  box.value = get();
  let saved = box.value;
  const commit = () => {
    if (box.value === saved) return;
    saved = box.value;
    set(box.value);
  };
  box.addEventListener('change', commit);
  box.addEventListener('blur', commit);
  // Enter is done typing: the keyboard goes away, and blur saves.
  box.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') box.blur();
  });
  row.append(name, box);
  return row;
}

/**
 * A Game's Grown-up Corner over `root` (the page's #app). Sound, Voice (if the Game speaks and the browser
 * can), Every level open, the Game's rows, its note, and reset. One at a time: opening while open does nothing.
 */
export function grownUpCorner(root: HTMLElement, progress: Progress<unknown>, spec: CornerSpec = {}, env: CornerEnv = { canSpeak }): GrownUpCorner {
  let veil: HTMLElement | undefined;

  function open(): void {
    if (veil) return;
    const opener = document.activeElement;
    veil = document.createElement('div');
    veil.className = 'site-veil';
    const panel = document.createElement('section');
    panel.className = 'site-corner site-grownup';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Grown-ups');

    const close = () => {
      // A text box still focused saves on its blur, before the Game's `closed` reads it.
      if (document.activeElement instanceof HTMLElement && panel.contains(document.activeElement)) document.activeElement.blur();
      veil?.remove();
      veil = undefined;
      spec.closed?.();
      // Focus goes back to the gear, unless the screen was redrawn and focused something of its own.
      if (opener instanceof HTMLElement && opener !== document.body && opener.isConnected) opener.focus();
    };

    const heading = document.createElement('header');
    heading.innerHTML = '<h2>Grown-ups</h2>';
    const x = button('site-tool', '');
    x.innerHTML = CLOSE;
    x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', close);
    heading.append(x);

    const setting = (label: string, name: 'sound' | 'voice' | 'everyLevelOpen') =>
      switchRow(label, () => progress.settings[name], (on) => progress.set(name, on));

    const rows = document.createElement('div');
    rows.className = 'site-corner-rows';
    const drawRows = () => rows.replaceChildren(...(spec.rows?.() ?? []));
    drawRows();

    const note = document.createElement('p');
    note.className = 'site-corner-note';
    note.textContent = spec.note ?? '';
    note.hidden = !spec.note;

    const erase = button('site-erase', 'Reset progress');
    erase.addEventListener('click', () => {
      if (!erase.classList.contains('site-armed')) {
        erase.classList.add('site-armed');
        erase.textContent = 'Tap again to erase everything';
        return;
      }
      progress.reset();
      drawRows();
      erase.classList.remove('site-armed');
      erase.textContent = 'Progress erased';
      erase.disabled = true;
    });

    const done = button('site-corner-done', 'Done');
    done.addEventListener('click', close);

    panel.append(
      heading,
      setting('Sound', 'sound'),
      ...(spec.voice && env.canSpeak ? [setting('Voice', 'voice')] : []),
      setting('Every level open', 'everyLevelOpen'),
      rows,
      note,
      erase,
      done,
    );
    veil.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });
    veil.append(panel);
    root.append(veil);
    panel.querySelector<HTMLElement>('.site-switch')!.focus();
  }

  return {
    gear() {
      const gear = button('site-tool', '');
      gear.innerHTML = GEAR;
      gear.setAttribute('aria-label', 'Grown-ups: press and hold');
      holdToActivate(gear, 3000, open);
      return gear;
    },
    open,
  };
}
