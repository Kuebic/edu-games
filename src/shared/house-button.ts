/**
 * The big house button that takes a child from any game back to the hub.
 * Each game places it where it fits its own layout.
 * A button rather than a link, so a long press doesn't open the browser's link menu.
 */
export function houseButton(className = 'hub-home'): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', 'All games');
  button.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M8 23 24 9l16 14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 21v17h8V29h6v9h8V21" fill="currentColor"/>
  </svg>`;
  button.addEventListener('click', () => location.assign('/'));
  return button;
}
