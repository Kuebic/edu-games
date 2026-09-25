import type { Screen } from '../app';
import { h } from '../dom';
import { PROMOTE_AT, defaultSave } from '../progress';
import { ROUND_LENGTH, STAGES } from '../problems';
import { setSoundEnabled } from '../sfx';
import { setVoiceEnabled } from '../speech';

export const grownupScreen: Screen = (app) => {
  const { save } = app;

  const stageButtons = STAGES.map((stage, i) => {
    const b = h('button', { class: 'stage-btn' }, h('b', { text: String(i + 1) }), h('span', { text: stage.label }));
    b.addEventListener('click', () => {
      save.stage = i;
      app.persist();
      sync();
    });
    return b;
  });

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
    reset.textContent = armed ? 'Tap again to erase stage and stickers' : 'Reset progress';
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
    save.stickers = fresh.stickers;
    app.persist();
    armed = false;
    renderReset();
    sync();
  });
  renderReset();

  const done = h('button', { class: 'done', text: 'Done' });
  done.addEventListener('click', () => app.go('home'));

  function sync() {
    stageButtons.forEach((b, i) => {
      b.classList.toggle('current', i === save.stage);
      b.setAttribute('aria-pressed', String(i === save.stage));
    });
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
        h('h2', { text: 'Stage' }),
        h(
          'p',
          { class: 'muted' },
          `Moves up by itself after ${PROMOTE_AT} of ${ROUND_LENGTH} answers are right on the first tap. It never moves down on its own.`,
        ),
        h('div', { class: 'stage-list' }, ...stageButtons),
        h('h2', { text: 'Sound' }),
        h('div', { class: 'toggle-row' }, voice, sound),
        h('h2', { text: 'Progress' }),
        stickerCount,
        reset,
        done,
      ),
    ),
  );
};
