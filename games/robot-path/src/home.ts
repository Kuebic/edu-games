// Home: the Skin picker, then the world map, one row of level cards per World.

import { houseButton } from '@shared/house-button';
import { holdButton, ICONS, WORLD_ICONS } from './icons';
import { WORLDS } from './levels';
import { isLevelUnlocked, isWorldUnlocked, SKINS, type Progress, type SkinId } from './progress';
import { SKIN_ART, spriteSvg } from './skins';
import * as sfx from './sound';

export interface HomeHooks {
  progress(): Progress;
  skin(skin: SkinId): void;
  open(world: number, index: number): void;
  parent(): void;
}

export function showHome(root: HTMLElement, hooks: HomeHooks): () => void {
  const progress = hooks.progress();
  const screen = document.createElement('main');
  screen.className = 'rp-home';
  screen.style.setProperty('--sky', SKIN_ART[progress.skin].sky);
  screen.style.setProperty('--frame', SKIN_ART[progress.skin].frame);
  screen.style.setProperty('--title', SKIN_ART[progress.skin].title);

  const bar = document.createElement('header');
  bar.className = 'rp-bar';
  const title = document.createElement('h1');
  title.textContent = 'Robot Path';
  bar.append(houseButton('rp-tool'), title, holdButton('rp-tool', ICONS.gear, 'Grown-ups: hold', 3000, hooks.parent));

  const skins = document.createElement('div');
  skins.className = 'rp-skins';
  skins.setAttribute('role', 'radiogroup');
  skins.setAttribute('aria-label', 'Pick a look');
  for (const id of SKINS) {
    const art = SKIN_ART[id];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rp-skin';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', String(id === progress.skin));
    button.setAttribute('aria-label', art.name);
    button.style.background = art.floor[0];
    button.innerHTML = spriteSvg(art.gem, 'rp-skin-gem') + spriteSvg(`<g transform="rotate(90) scale(0.95)">${art.robot}</g>`, 'rp-skin-robot');
    button.addEventListener('click', () => {
      sfx.tap();
      hooks.skin(id);
    });
    skins.append(button);
  }

  const worlds = document.createElement('div');
  worlds.className = 'rp-worlds';
  let current: HTMLElement | undefined;
  WORLDS.forEach((world, w) => {
    const row = document.createElement('section');
    row.className = 'rp-world';
    row.style.setProperty('--world', world.color);
    row.setAttribute('aria-label', world.name);
    const open = isWorldUnlocked(progress, w);
    row.classList.toggle('rp-world-locked', !open);
    const badge = document.createElement('div');
    badge.className = 'rp-world-badge';
    badge.innerHTML = open ? WORLD_ICONS[w]! : ICONS.lock;
    const levels = document.createElement('div');
    levels.className = 'rp-levels';
    world.levels.forEach((level, i) => {
      const saved = progress.levels[level.id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'rp-level';
      const unlocked = isLevelUnlocked(progress, w, i);
      card.setAttribute('aria-label', `Level ${i + 1}${saved?.done ? ', done' : ''}${saved?.sparkle ? ', sparkle' : ''}${unlocked ? '' : ', locked'}`);
      if (!unlocked) {
        card.disabled = true;
        card.innerHTML = ICONS.lock;
      } else {
        card.textContent = String(i + 1);
        if (saved?.done) {
          card.classList.add('rp-cleared');
          card.insertAdjacentHTML('beforeend', `<span class="rp-tick">${ICONS.check}</span>`);
        } else current ??= card;
        // An unearned Sparkle shows nothing at all.
        if (saved?.sparkle) card.insertAdjacentHTML('beforeend', `<span class="rp-card-sparkle">${ICONS.sparkle}</span>`);
        card.addEventListener('click', () => hooks.open(w, i));
      }
      levels.append(card);
    });
    row.append(badge, levels);
    worlds.append(row);
  });

  screen.append(bar, skins, worlds);
  root.replaceChildren(screen);
  current?.scrollIntoView({ block: 'center' });
  return () => {};
}
