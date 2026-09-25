import type { Screen } from '../app';
import { h } from '../dom';
import { play } from '../sfx';
import { backIcon } from './icons';

const ROW = 4;

export const stickersScreen: Screen = (app) => {
  const owned = app.save.stickers;
  const empties = Math.max(ROW * 2, Math.ceil((owned.length + 1) / ROW) * ROW) - owned.length;
  const grid = h(
    'div',
    { class: 'sticker-grid' },
    ...owned.map((s, i) => {
      const el = h('button', { class: 'sticker', text: s, label: 'Sticker' });
      el.style.animationDelay = `${Math.min(i, 20) * 40}ms`;
      return el;
    }),
    ...Array.from({ length: empties }, () => h('div', { class: 'sticker empty' })),
  );
  const back = h('button', { class: 'site-tool', label: 'Back', html: backIcon });

  app.root.append(
    h(
      'div',
      { class: 'site-screen screen stickers' },
      h('header', { class: 'book-top' }, back, h('h1', { class: 'book-title', text: '📒' })),
      h('div', { class: 'scroll' }, grid),
    ),
  );

  back.addEventListener('click', () => app.stages());
  grid.addEventListener('click', (e) => {
    const s = (e.target as Element).closest('.sticker:not(.empty)') as HTMLElement | null;
    if (!s) return;
    s.classList.remove('boing');
    void s.offsetWidth;
    s.classList.add('boing');
    play('pop');
  });
};
