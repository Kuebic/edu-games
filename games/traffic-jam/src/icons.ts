// Button pictures. Everything a child taps is a picture, never a word.

const icon = (body: string) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  levels: icon(
    '<rect x="8" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="8" y="27" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="27" width="13" height="13" rx="3" fill="currentColor"/>',
  ),
  next: icon('<path d="M16 9 38 24 16 39Z" fill="currentColor"/>'),
};

export function iconButton(className: string, svg: string, label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.innerHTML = svg;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);
  return button;
}
