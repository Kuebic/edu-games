// Button pictures. Everything a child taps is a picture, never a word.

const icon = (body: string) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  back: icon('<path d="M28 10 14 24l14 14"/>'),
  levels: icon(
    '<rect x="8" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="8" y="27" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="27" width="13" height="13" rx="3" fill="currentColor"/>',
  ),
  speaker: icon(
    '<path d="M8 19h8l10-8v26l-10-8H8Z" fill="currentColor" stroke-width="3"/><path d="M33 17c3 4 3 10 0 14M38 12c6 7 6 17 0 24"/>',
  ),
  gear: icon(
    '<circle cx="24" cy="24" r="6"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/><circle cx="24" cy="24" r="13"/>',
  ),
  undo: icon('<path d="M17 12 8 21l9 9"/><path d="M9 21h19a11 11 0 0 1 0 22h-6"/>'),
  reset: icon('<path d="M38 20a15 15 0 1 0 1 9"/><path d="M40 8v12H28"/>'),
  hint: icon(
    '<path d="M18 33c0-5-6-8-6-15a12 12 0 0 1 24 0c0 7-6 10-6 15Z" fill="currentColor" stroke-width="3"/><path d="M19 39h10M21 44h6" stroke-width="4"/>',
  ),
  next: icon('<path d="M16 9 38 24 16 39Z" fill="currentColor"/>'),
  more: icon(
    '<rect x="7" y="7" width="34" height="34" rx="8"/><circle cx="16" cy="16" r="3" fill="currentColor" stroke="none"/><circle cx="32" cy="16" r="3" fill="currentColor" stroke="none"/><circle cx="24" cy="24" r="3" fill="currentColor" stroke="none"/><circle cx="16" cy="32" r="3" fill="currentColor" stroke="none"/><circle cx="32" cy="32" r="3" fill="currentColor" stroke="none"/>',
  ),
  sparkle: icon(
    '<path d="M22 4c1 10 4 14 16 16-12 2-15 6-16 18-1-12-4-16-16-18 12-2 15-6 16-16Z" fill="currentColor" stroke-width="2"/><path d="M39 32c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6Z" fill="currentColor" stroke-width="1.5"/>',
  ),
  lock: icon('<rect x="11" y="22" width="26" height="19" rx="4" fill="currentColor"/><path d="M16 22v-6a8 8 0 0 1 16 0v6"/>'),
  check: icon('<path d="m11 25 9 9 17-19" stroke-width="7"/>'),
  slide: icon('<path d="M6 24h36M14 16l-8 8 8 8M34 16l8 8-8 8"/>'),
  arrow: icon('<path d="M24 38V12M13 22l11-11 11 11" stroke-width="6"/>'),
  hand: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 26V9a3.5 3.5 0 0 1 7 0v12l2-1a3.5 3.5 0 0 1 4.8 1.6l.2.4 2.3-.8a3.4 3.4 0 0 1 4.3 2.2L40 30c1 5-1 11-6 14H22c-3-2-6-6-9-11l-2.8-4.4a3.3 3.3 0 0 1 5.4-3.8Z" fill="#fff" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
};

export function iconButton(className: string, svg: string, label: string, onClick?: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.innerHTML = svg;
  button.setAttribute('aria-label', label);
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

/**
 * Press and hold to act: a ring fills around the button, and letting go early does nothing.
 * Keeps a stray tap from resetting a board or opening the grown-up menu.
 */
export function holdToActivate(button: HTMLElement, ms: number, action: () => void): void {
  button.classList.add('wo-hold');
  button.style.setProperty('--hold', `${ms}ms`);
  button.insertAdjacentHTML(
    'beforeend',
    '<svg class="wo-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" pathLength="100"/></svg>',
  );
  let timer: number | undefined;
  const stop = () => {
    window.clearTimeout(timer);
    timer = undefined;
    button.classList.remove('wo-holding');
  };
  const start = (event: Event) => {
    event.preventDefault();
    stop();
    button.classList.add('wo-holding');
    timer = window.setTimeout(() => {
      stop();
      action();
    }, ms);
  };
  button.addEventListener('pointerdown', start);
  for (const type of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) button.addEventListener(type, stop);
  button.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) start(event);
  });
  button.addEventListener('keyup', stop);
}
