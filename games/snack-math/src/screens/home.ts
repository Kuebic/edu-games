import { holdToActivate } from '@shared/hold';
import { houseButton } from '@shared/house-button';
import type { Screen } from '../app';
import { h } from '../dom';
import { FRIENDS } from '../friends';
import { unlockAudio } from '../sfx';
import { unlockSpeech } from '../speech';
import { gearIcon, playIcon } from './icons';

export const homeScreen: Screen = (app) => {
  const friends = h(
    'div',
    { class: 'home-friends', label: 'Animal friends' },
    ...FRIENDS.map((f, i) => {
      const s = h('span', { text: f.emoji });
      s.style.animationDelay = `${i * -0.35}s`;
      return s;
    }),
  );
  const playBtn = h('button', { class: 'big-play', label: 'Play', html: playIcon });
  const bookBtn = h(
    'button',
    { class: 'book-btn', label: 'Sticker Book' },
    h('span', { class: 'book-icon', text: '📒' }),
    app.save.stickers.length > 0 && h('span', { class: 'book-count', text: String(app.save.stickers.length) }),
  );
  const gear = h('button', { class: 'icon-btn gear', label: 'Grown-Up Corner (press and hold)', html: gearIcon });

  app.root.append(
    h(
      'div',
      { class: 'screen home' },
      houseButton(),
      friends,
      h('h1', { class: 'title' }, h('span', { text: 'Snack' }), h('span', { text: 'Math' })),
      playBtn,
      bookBtn,
      gear,
    ),
  );

  const start = () => {
    unlockAudio();
    unlockSpeech();
  };
  playBtn.addEventListener('click', () => {
    start();
    app.go('play');
  });
  bookBtn.addEventListener('click', () => {
    start();
    app.go('stickers');
  });
  holdToActivate(gear, 3000, () => app.go('grownup'));
};
