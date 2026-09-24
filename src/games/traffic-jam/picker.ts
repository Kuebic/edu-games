// The level list: one row per Chapter, its picture on the left and its Levels beside it.

import { homeButton } from '../../shared/home-button';
import { CHAPTERS, LEVELS_PER_CHAPTER } from './chapters';
import { ICONS, iconButton } from './icons';
import { chapterColor } from './play';
import { isUnlocked, type Progress } from './progress';
import { chapterIcon } from './view';

export interface PickerHooks {
  open(index: number): void;
  toggleMute(): void;
}

export function showPicker(root: HTMLElement, progress: Progress, hooks: PickerHooks): () => void {
  const screen = document.createElement('main');
  screen.className = 'tj-picker';

  const bar = document.createElement('header');
  bar.className = 'tj-bar';
  const title = document.createElement('h1');
  title.textContent = 'Traffic Jam';
  const mute = iconButton('tj-tool', progress.muted ? ICONS.soundOff : ICONS.soundOn, 'Sound', () => {
    hooks.toggleMute();
    progress = { ...progress, muted: !progress.muted };
    mute.innerHTML = progress.muted ? ICONS.soundOff : ICONS.soundOn;
  });
  bar.append(homeButton('tj-tool'), title, mute);

  const list = document.createElement('div');
  list.className = 'tj-chapters';
  let current: HTMLElement | undefined;

  CHAPTERS.forEach((spec, c) => {
    const row = document.createElement('section');
    row.className = 'tj-chapter';
    row.style.setProperty('--chapter', chapterColor(c));
    row.setAttribute('aria-label', spec.name);
    const badge = document.createElement('div');
    badge.className = 'tj-chapter-badge';
    badge.append(chapterIcon(c));
    const levels = document.createElement('div');
    levels.className = 'tj-levels';
    for (let i = 0; i < LEVELS_PER_CHAPTER; i++) {
      const index = c * LEVELS_PER_CHAPTER + i;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tj-level';
      const open = isUnlocked(progress, index);
      const cleared = progress.cleared.includes(index);
      button.setAttribute('aria-label', `Level ${i + 1}${cleared ? ', done' : ''}${open ? '' : ', locked'}`);
      if (open) {
        button.textContent = String(i + 1);
        if (cleared) {
          button.classList.add('tj-cleared');
          button.insertAdjacentHTML('beforeend', `<span class="tj-tick">${ICONS.check}</span>`);
        } else current ??= button;
        button.addEventListener('click', () => hooks.open(index));
      } else {
        button.disabled = true;
        button.innerHTML = ICONS.lock;
      }
      levels.append(button);
    }
    row.append(badge, levels);
    list.append(row);
  });

  screen.append(bar, list);
  root.replaceChildren(screen);
  current?.scrollIntoView({ block: 'center' });
  return () => {};
}
