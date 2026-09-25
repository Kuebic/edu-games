const RING =
  '<svg class="site-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" pathLength="100"/></svg>';

/**
 * Press and hold to act: a ring fills around the button, and letting go early does nothing.
 * For what a small child mustn't do by accident, like opening the Grown-up Corner or clearing a board.
 * The ring takes its colour from --site-ring.
 */
export function holdToActivate(button: HTMLElement, ms: number, action: () => void): void {
  button.classList.add('site-hold');
  button.style.setProperty('--site-hold-ms', `${ms}ms`);
  button.insertAdjacentHTML('beforeend', RING);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    clearTimeout(timer);
    timer = undefined;
    button.classList.remove('site-holding');
  };
  const start = (event: Event) => {
    event.preventDefault();
    stop();
    if ((button as HTMLButtonElement).disabled) return;
    button.classList.add('site-holding');
    timer = setTimeout(() => {
      stop();
      action();
    }, ms);
  };
  button.addEventListener('pointerdown', (event) => {
    start(event);
    // Keep the hold while the finger wanders off the button.
    if (timer) button.setPointerCapture?.((event as PointerEvent).pointerId);
  });
  for (const type of ['pointerup', 'pointerleave', 'pointercancel', 'lostpointercapture', 'blur']) {
    button.addEventListener(type, stop);
  }
  button.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) start(event);
  });
  button.addEventListener('keyup', stop);
}
