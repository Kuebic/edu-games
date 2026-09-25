// One Pack: its twelve Levels, and "more like this" for endless puzzles at the same level.

import { packColor, packIcon, type App } from './app';
import { holdToActivate, ICONS, iconButton } from './icons';
import { LEVELS } from './levels';
import { PACKS } from './packs';
import { isLevelOpen, packLevels, packStats } from './progress';
import { canSpeak, say } from './speech';

export function showPack(app: App, pack: number): () => void {
  const screen = document.createElement('main');
  screen.className = 'wo-pack-screen';
  screen.style.setProperty('--pack', packColor(pack));

  const bar = document.createElement('header');
  bar.className = 'wo-bar';
  const badge = document.createElement('div');
  badge.className = 'wo-badge';
  badge.setAttribute('aria-label', PACKS[pack - 1]!.name);
  badge.innerHTML = `<span class="wo-badge-icon">${packIcon(pack)}</span>`;
  const speaker = iconButton('wo-tool', ICONS.speaker, 'Say it', () => say(`Help the red ${app.skin().hero} get out.`));
  speaker.hidden = !canSpeak;
  const gear = iconButton('wo-tool wo-gear', ICONS.gear, 'Grown-ups: press and hold');
  holdToActivate(gear, 3000, () => app.parent());
  bar.append(iconButton('wo-tool', ICONS.back, 'Back', () => app.home()), badge, speaker, gear);

  const grid = document.createElement('div');
  grid.className = 'wo-levels';
  let current: HTMLElement | undefined;
  for (const level of packLevels(LEVELS, pack)) {
    const saved = app.progress.levels[level.id];
    const open = isLevelOpen(app.progress, LEVELS, level);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wo-level';
    button.setAttribute(
      'aria-label',
      `Level ${level.index}${saved?.done ? ', done' : ''}${saved?.sparkle ? ', sparkle' : ''}${open ? '' : ', locked'}`,
    );
    if (open) {
      button.textContent = String(level.index);
      if (saved?.done) {
        button.classList.add('wo-done-level');
        button.insertAdjacentHTML('beforeend', `<span class="wo-tick">${ICONS.check}</span>`);
      } else current ??= button;
      if (saved?.sparkle) button.insertAdjacentHTML('beforeend', `<span class="wo-level-sparkle">${ICONS.sparkle}</span>`);
      button.addEventListener('click', () => app.level(level));
    } else {
      button.disabled = true;
      button.innerHTML = ICONS.lock;
    }
    grid.append(button);
  }

  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'wo-more-like';
  more.setAttribute('aria-label', 'More like this');
  const { sparkles } = packStats(app.progress, LEVELS, pack);
  more.innerHTML = `${ICONS.more}${sparkles ? `<span class="wo-pack-sparkles">${ICONS.sparkle}<b>${sparkles}</b></span>` : ''}`;
  more.addEventListener('click', () => app.pool(pack));

  screen.append(bar, grid, more);
  app.root.replaceChildren(screen);
  current?.scrollIntoView({ block: 'center' });
  return () => {};
}
