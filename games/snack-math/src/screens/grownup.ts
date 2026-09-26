import { setSoundEnabled } from '@shared/sound';
import { canSpeak, setVoiceEnabled } from '@shared/voice';
import type { App } from '../app';
import { h } from '../dom';
import { defaultSave } from '../progress';

/** The Grown-up Corner, opened from the Stage list or from `stage`'s Rounds, where Done goes back to. */
export function grownupScreen(app: App, stage?: number): void {
  const { save } = app;

  const toggle = (label: string, get: () => boolean, set: (on: boolean) => void) => {
    const b = h('button', { class: 'toggle' });
    const render = () => {
      b.textContent = `${label}: ${get() ? 'On' : 'Off'}`;
      b.classList.toggle('on', get());
      b.setAttribute('aria-pressed', String(get()));
    };
    b.addEventListener('click', () => {
      set(!get());
      app.persist();
      render();
    });
    render();
    return b;
  };

  const voice = toggle('Voice', () => save.voice, (on) => {
    save.voice = on;
    setVoiceEnabled(on);
  });
  const sound = toggle('Sounds', () => save.sound, (on) => {
    save.sound = on;
    setSoundEnabled(on);
  });

  const stickerCount = h('p', { class: 'muted' });
  const reset = h('button', { class: 'danger' });
  let armed = false;
  const renderReset = () => {
    reset.textContent = armed ? 'Tap again to erase rounds and stickers' : 'Reset progress';
    reset.classList.toggle('armed', armed);
  };
  reset.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      renderReset();
      return;
    }
    const fresh = defaultSave();
    save.stage = fresh.stage;
    save.rounds = fresh.rounds;
    save.stickers = fresh.stickers;
    app.persist();
    armed = false;
    renderReset();
    sync();
  });
  renderReset();

  const done = h('button', { class: 'done', text: 'Done' });
  done.addEventListener('click', () => app.stages(stage));

  function sync() {
    stickerCount.textContent = `Stickers earned: ${save.stickers.length}`;
  }
  sync();

  app.root.append(
    h(
      'div',
      { class: 'site-screen screen grownup site-grownup' },
      h(
        'div',
        { class: 'scroll' },
        h('h1', { text: 'Grown-Up Corner' }),
        h(
          'p',
          { class: 'muted' },
          'Every stage is open on the stage list: + is adding, − is taking away and ± is both, up to 5 (one row of dots) or 10 (two rows). A stage’s four rounds open in order, and Next goes on to the next stage.',
        ),
        h('h2', { text: 'Sound' }),
        h('div', { class: 'toggle-row' }, canSpeak && voice, sound),
        h('h2', { text: 'Progress' }),
        stickerCount,
        reset,
        done,
      ),
    ),
  );
}
