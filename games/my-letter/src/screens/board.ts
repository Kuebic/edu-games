import { hush, say } from '@shared/voice';
import type { App } from '../app';
import { foundLine, saysLine } from '../asks';
import { h, replay } from '../dom';
import { boardLetters } from '../letters';
import { letterSound } from '../sounds';
import { backIcon } from './icons';

/**
 * The Letter board: every capital A to Z, the Name letters in their own colour. A tap makes the letter dance
 * and say its Letter sound, the same as a find. Free play: nothing to finish, save or wait for.
 */
export function boardScreen(app: App): () => void {
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  backBtn.addEventListener('click', () => app.groups());

  // Each tap takes over from the last: its line cuts the last one off, and the last one's clip stays unplayed.
  let taps = 0;
  const letters = boardLetters(app.progress.game.name).map(({ letter, mine }, i) => {
    const b = h('button', { class: mine ? 'board-letter board-mine' : 'board-letter', label: letter, text: letter });
    b.style.animationDelay = `${i * 15}ms`;
    b.addEventListener('click', async () => {
      const tap = ++taps;
      replay(b, 'dance');
      hush();
      // Only a clip that will be heard gets "B says"; else the letter's name alone (ADR 0001).
      const letterClip = letterSound(letter);
      if (!letterClip?.ready()) return void say(foundLine(letter));
      await say(saysLine(letter));
      if (tap === taps) void letterClip();
    });
    return b;
  });

  app.root.append(
    h(
      'div',
      { class: 'site-screen screen board' },
      h('header', { class: 'play-top' }, backBtn, h('span'), app.corner.gear()),
      h('main', { class: 'board-letters' }, ...letters),
    ),
  );

  return () => {
    taps++;
    hush();
  };
}
