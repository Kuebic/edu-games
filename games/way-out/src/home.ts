// Home: pick a Skin, then a Pack. Pictures first, so he can find his way alone.

import { holdToActivate } from '@shared/hold';
import { houseButton } from '@shared/house-button';
import { packColor, packIcon, type App } from './app';
import { ICONS, iconButton } from './icons';
import { LEVELS } from './levels';
import { GROWN_UP_PACK, LEVELS_PER_PACK, PACKS } from './packs';
import { isPackOpen, packStats } from './progress';
import { heroPicture, SKINS } from './skins';
import { canSpeak, say } from './speech';

export function showHome(app: App): () => void {
  const screen = document.createElement('main');
  screen.className = 'site-screen wo-home';

  const bar = document.createElement('header');
  bar.className = 'site-bar';
  const title = document.createElement('h1');
  title.textContent = 'Way Out';
  const speaker = iconButton('site-tool', ICONS.speaker, 'Say it', () => say(`Help the red ${app.skin().hero} get out.`));
  speaker.hidden = !canSpeak;
  const gear = iconButton('site-tool wo-gear', ICONS.gear, 'Grown-ups: press and hold');
  holdToActivate(gear, 3000, () => app.parent());
  bar.append(houseButton('site-tool'), title, speaker, gear);

  const skins = document.createElement('div');
  skins.className = 'wo-skins';
  skins.setAttribute('role', 'group');
  skins.setAttribute('aria-label', 'Pictures');
  for (const skin of SKINS) {
    const button = iconButton('wo-skin', heroPicture(skin), skin.label, () => {
      app.progress.skin = skin.id;
      app.save();
      app.home();
    });
    button.style.setProperty('--skin', skin.sky);
    button.setAttribute('aria-pressed', String(app.progress.skin === skin.id));
    skins.append(button);
  }

  const packs = document.createElement('div');
  packs.className = 'wo-packs';
  PACKS.forEach((spec, i) => {
    const pack = i + 1;
    if (pack === GROWN_UP_PACK && !isPackOpen(app.progress, LEVELS, pack)) return;
    const open = isPackOpen(app.progress, LEVELS, pack);
    const { done, sparkles } = packStats(app.progress, LEVELS, pack);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'wo-pack';
    card.style.setProperty('--pack', packColor(pack));
    card.setAttribute('aria-label', `${spec.name}: ${done} of ${LEVELS_PER_PACK} done${open ? '' : ', locked'}`);
    card.disabled = !open;
    const dots = Array.from({ length: LEVELS_PER_PACK }, (_, n) => `<i class="${n < done ? 'wo-on' : ''}"></i>`).join('');
    card.innerHTML = `<span class="wo-pack-icon">${open ? packIcon(pack) : ICONS.lock}</span>
      <span class="wo-pack-dots" aria-hidden="true">${dots}</span>
      <span class="wo-pack-sparkles" aria-hidden="true">${sparkles ? `${ICONS.sparkle}<b>${sparkles}</b>` : ''}</span>`;
    card.addEventListener('click', () => app.pack(pack));
    packs.append(card);
  });

  screen.append(bar, skins, packs);
  app.root.replaceChildren(screen);
  return () => {};
}
