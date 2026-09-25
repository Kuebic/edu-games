// Button pictures. Everything a child taps is a picture first.

import type { Op } from './game/level';

const icon = (body: string) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const arrow = (rotate: number) =>
  icon(`<g transform="rotate(${rotate} 24 24)"><path d="M24 40V12"/><path d="M11 23 24 9l13 14" fill="currentColor"/></g>`);

/** Palette and Slot pictures. Turns are drawn from the robot's view: a path that bends. */
export const OP_ICONS: Record<Op, string> = {
  up: arrow(0),
  right: arrow(90),
  down: arrow(180),
  left: arrow(270),
  forward: icon('<path d="M24 40V13"/><path d="M13 22 24 9l11 13" fill="currentColor"/><circle cx="24" cy="42" r="3" fill="currentColor" stroke="none"/>'),
  turnLeft: icon('<path d="M30 42V26q0-9-9-9h-4"/><path d="M19 7 8 17l11 10" fill="currentColor"/>'),
  turnRight: icon('<path d="M18 42V26q0-9 9-9h4"/><path d="M29 7l11 10-11 10" fill="currentColor"/>'),
  repeat: icon('<path d="M38 22a14 14 0 1 0-4 12"/><path d="M40 10v12H28" fill="none"/>'),
};

export const OP_LABELS: Record<Op, string> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  forward: 'Forward',
  turnLeft: 'Turn left',
  turnRight: 'Turn right',
  repeat: 'Repeat',
};

export const ICONS = {
  go: icon('<path d="M15 9 39 24 15 39Z" fill="currentColor"/>'),
  step: icon('<path d="M10 11 29 24 10 37Z" fill="currentColor"/><path d="M37 11v26"/>'),
  stop: icon('<rect x="12" y="12" width="24" height="24" rx="4" fill="currentColor"/>'),
  trash: icon('<path d="M9 13h30M19 13V8h10v5M13 13l2 27h18l2-27"/><path d="M21 20v14M27 20v14" stroke-width="4"/>'),
  speaker: icon('<path d="M8 19h8l10-8v26l-10-8H8Z" fill="currentColor" stroke-width="3"/><path d="M33 17c3 4 3 10 0 14M38 12c6 7 6 17 0 24"/>'),
  soundOff: icon('<path d="M8 19h8l10-8v26l-10-8H8Z" fill="currentColor" stroke-width="3"/><path d="m33 19 10 10m0-10L33 29"/>'),
  gear: icon(
    '<circle cx="24" cy="24" r="6"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/><circle cx="24" cy="24" r="13"/>',
  ),
  back: icon('<path d="M30 9 15 24l15 15"/>'),
  next: icon('<path d="M16 9 38 24 16 39Z" fill="currentColor"/>'),
  levels: icon(
    '<rect x="8" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="8" y="27" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="27" width="13" height="13" rx="3" fill="currentColor"/>',
  ),
  lock: icon('<rect x="11" y="22" width="26" height="19" rx="4" fill="currentColor"/><path d="M16 22v-6a8 8 0 0 1 16 0v6"/>'),
  check: icon('<path d="m11 25 9 9 17-19" stroke-width="7"/>'),
  close: icon('<path d="M14 14l20 20M34 14 14 34" stroke-width="7"/>'),
  sparkle: icon('<path d="M24 4c2 12 8 18 20 20-12 2-18 8-20 20-2-12-8-18-20-20 12-2 18-8 20-20Z" fill="currentColor" stroke-width="2"/>'),
  bulb: icon('<path d="M17 31c-4-3-6-7-6-11a13 13 0 0 1 26 0c0 4-2 8-6 11v4H17Z" fill="currentColor" stroke-width="3"/><path d="M18 41h12"/>'),
  slow: icon(
    '<path d="M8 32c0-10 7-16 16-16s16 6 16 16Z" fill="currentColor" stroke-width="3"/><path d="M40 30c3 0 5-2 5-5" stroke-width="4"/><path d="M13 32v5M35 32v5" stroke-width="5"/>',
  ),
  /** Footprints: walking pace. */
  normal: icon(
    '<g fill="currentColor" stroke="none"><ellipse cx="16" cy="32" rx="6" ry="8.5"/><circle cx="12" cy="20" r="2.4"/><circle cx="17" cy="19" r="2.4"/><circle cx="21.5" cy="21" r="2.2"/><ellipse cx="32" cy="23" rx="6" ry="8.5"/><circle cx="27" cy="11" r="2.2"/><circle cx="31.5" cy="9.5" r="2.4"/><circle cx="36.5" cy="11" r="2.4"/></g>',
  ),
  fast: icon(
    '<ellipse cx="22" cy="30" rx="13" ry="9" fill="currentColor" stroke-width="3"/><circle cx="36" cy="22" r="6" fill="currentColor" stroke-width="3"/><path d="M34 16 31 5M39 16l2-11" stroke-width="4"/><path d="M14 38v3M28 38v3" stroke-width="4"/>',
  ),
  hand: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 44c-4-5-9-10-10-14-1-3 2-5 5-3l4 4V9a3 3 0 0 1 6 0v13l1-4a3 3 0 0 1 6 1v4l1-3a3 3 0 0 1 6 1v4l1-2a3 3 0 0 1 5 2v8c0 6-3 10-6 14Z" fill="#fff" stroke="#2b3445" stroke-width="3" stroke-linejoin="round"/></svg>`,
};

/** One picture per World, for the map and the level badge. */
export const WORLD_ICONS = [
  icon('<path d="M24 6v36M6 24h36"/><path d="M17 13l7-7 7 7M17 35l7 7 7-7M13 17l-7 7 7 7M35 17l7 7-7 7"/>'),
  icon('<path d="M24 6 38 18 24 42 10 18Z" fill="currentColor" stroke-width="3"/><path d="M10 18h28" stroke="#ffffff99" stroke-width="3"/>'),
  icon('<path d="M8 12h26a6 6 0 0 1 0 12H14a6 6 0 0 0 0 12h26"/>'),
  icon('<path d="M8 8h32v32H8Z"/><path d="M8 19h22M18 29h22M18 19v10"/>'),
  icon('<path d="M6 6h36v36H6Z"/><path d="M6 15h14M24 6v9h9M15 24h27M15 24v9M24 33v9M33 24v9"/>'),
  OP_ICONS.repeat,
  icon('<path d="M30 8a9 9 0 0 0-8 12L8 34a4 4 0 0 0 6 6l14-14a9 9 0 0 0 12-8l-6 2-4-4 2-6Z" fill="currentColor" stroke-width="3"/>'),
  OP_ICONS.turnRight,
];

export function iconButton(className: string, svg: string, label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.innerHTML = svg;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);
  return button;
}

/**
 * A button that only works when held down for `ms`, with a ring that fills while held.
 * For things a small child mustn't do by accident: clearing a Program, opening the parent menu.
 */
export function holdButton(className: string, svg: string, label: string, ms: number, onDone: () => void): HTMLButtonElement {
  const button = iconButton(`${className} rp-hold`, svg, label, () => {});
  button.style.setProperty('--hold', `${ms}ms`);
  button.insertAdjacentHTML(
    'beforeend',
    '<svg class="rp-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" pathLength="100"/></svg>',
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => {
    clearTimeout(timer);
    button.classList.remove('rp-holding');
  };
  button.addEventListener('pointerdown', (event) => {
    if (button.disabled) return;
    button.setPointerCapture?.(event.pointerId);
    button.classList.add('rp-holding');
    timer = setTimeout(() => {
      cancel();
      onDone();
    }, ms);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, cancel);
  return button;
}
