import { hush, say } from '@shared/voice';
import type { App } from '../app';
import { foundLine, saysLine } from '../asks';
import { h, replay } from '../dom';
import { boardLetters } from '../letters';
import { NOW_I_KNOW, SONG_LENGTH, sungBy } from '../song';
import { abcSong, letterSound } from '../sounds';
import { backIcon, songIcon, stopIcon } from './icons';

/**
 * The Letter board: every capital A to Z, the Name letters in their own colour. A tap makes the letter dance
 * and say its Letter sound, the same as a find. The song button under them sings the ABC song, and each
 * letter lights up and shakes as it's sung. Free play: nothing to finish, save or wait for.
 */
export function boardScreen(app: App): () => void {
  const backBtn = h('button', { class: 'site-tool', label: 'Back', html: backIcon });
  backBtn.addEventListener('click', () => app.groups());

  // Each tap takes over from the last: its line cuts the last one off, and the last one's clip stays unplayed.
  let taps = 0;
  const letters = boardLetters(app.progress.game.name).map(({ letter, mine }, i) => {
    const b = h('button', { class: mine ? 'board-letter board-mine' : 'board-letter', label: letter, text: letter });
    // Only the pop-in waits its turn; a dance or a shake starts at once.
    b.style.setProperty('--pop-delay', `${i * 15}ms`);
    b.addEventListener('click', async () => {
      stopSong();
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

  const songBtn = h('button', { class: 'board-song' });
  /** Ends the song playing now, if there is one. */
  let stopSong = (): void => {};
  const showSong = (singing: boolean) => {
    songBtn.classList.toggle('singing', singing);
    songBtn.setAttribute('aria-label', singing ? 'Stop the song' : 'Sing the ABC song');
    songBtn.innerHTML = `${singing ? stopIcon : songIcon}<span>ABC</span>`;
  };
  showSong(false);
  songBtn.addEventListener('click', () => (songBtn.classList.contains('singing') ? stopSong() : sing()));

  /**
   * Sings the ABC song, lighting and shaking each letter as it's sung, then every letter dances at "Now I
   * know my ABCs". Where the song won't be heard (sound off), the letters still go along on the clock.
   */
  function sing(): void {
    taps++;
    hush();
    const heard = abcSong.ready();
    const started = performance.now();
    const clock = (): number | undefined => (heard ? abcSong.time() : (performance.now() - started) / 1000);
    let sung = 0;
    let allDanced = false;
    let frame = 0;

    const unlight = () => letters[sung - 1]?.classList.remove('lit');
    let over = false;
    // Safe to call late, or twice: it only ever ends this song.
    const end = () => {
      if (over) return;
      over = true;
      if (stopSong === end) stopSong = () => {};
      cancelAnimationFrame(frame);
      abcSong.stop();
      unlight();
      showSong(false);
    };
    stopSong = end;
    const tick = () => {
      const time = clock();
      if (time === undefined || time > SONG_LENGTH) return end();
      for (const upTo = sungBy(time); sung < upTo; sung++) {
        unlight();
        letters[sung]!.classList.add('lit');
        replay(letters[sung]!, 'sung');
      }
      if (!allDanced && time >= NOW_I_KNOW) {
        allDanced = true;
        unlight();
        for (const b of letters) replay(b, 'dance');
      }
      frame = requestAnimationFrame(tick);
    };

    showSong(true);
    if (heard) void abcSong().then(end);
    tick();
  }

  app.root.append(
    h(
      'div',
      { class: 'site-screen screen board' },
      h('header', { class: 'play-top' }, backBtn, h('span'), app.corner.gear()),
      h('main', { class: 'board-letters' }, ...letters),
      h('footer', { class: 'board-foot' }, songBtn),
    ),
  );

  return () => {
    taps++;
    hush();
    stopSong();
  };
}
