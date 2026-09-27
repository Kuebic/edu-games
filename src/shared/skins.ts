// Skin chips: the pictures a child taps to pick a Skin, the same on the level select's Group list (ADR 0008)
// and on a Topic of Practice (ADR 0015). A Game gives the chips and keeps the Skin in its slot.

import './skins.css';

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
  /** Save the choice, and repaint the page (paintPage) if the Skin colours it. The screen redraws itself afterwards. */
  choose(id: string): void;
}

/** The chips as a radio group, a ring round the one in use. `chose` runs after a chip saves its Skin, to redraw. */
export function skinChips(skins: SkinPicker, chose: (id: string) => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'site-skins';
  row.setAttribute('role', 'radiogroup');
  row.setAttribute('aria-label', 'Pictures');
  for (const chip of skins.chips) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'site-skin';
    b.dataset.key = `skin:${chip.id}`;
    b.setAttribute('aria-label', chip.label);
    b.innerHTML = chip.picture;
    b.addEventListener('click', () => {
      skins.choose(chip.id);
      chose(chip.id);
    });
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(skins.current() === chip.id));
    b.style.setProperty('--site-skin', chip.colour);
    row.append(b);
  }
  return row;
}
