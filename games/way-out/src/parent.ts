// The grown-up menu, behind a 3-second hold on the gear. Words are fine here.

import type { App } from './app';
import { freshProgress } from './progress';
import { setSoundEnabled } from './sound';
import { canSpeak, setVoiceEnabled } from './speech';

export function showParent(app: App, close: () => void): void {
  const layer = document.createElement('div');
  layer.className = 'wo-parent';
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-label', 'Grown-ups');
  const panel = document.createElement('div');
  panel.className = 'wo-parent-panel site-grownup';
  const title = document.createElement('h2');
  title.textContent = 'Grown-ups';

  const toggle = (label: string, get: () => boolean, set: (on: boolean) => void) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wo-toggle';
    const render = () => {
      button.textContent = `${label}: ${get() ? 'on' : 'off'}`;
      button.setAttribute('aria-pressed', String(get()));
    };
    button.addEventListener('click', () => {
      set(!get());
      app.save();
      render();
    });
    render();
    return button;
  };

  const { progress } = app;
  const toggles = [
    toggle('Sound', () => progress.settings.sound, (on) => {
      progress.settings.sound = on;
      setSoundEnabled(on);
    }),
    ...(canSpeak
      ? [
          toggle('Voice', () => progress.settings.voice, (on) => {
            progress.settings.voice = on;
            setVoiceEnabled(on);
          }),
        ]
      : []),
    toggle('Every level open', () => progress.unlockAll, (on) => (progress.unlockAll = on)),
    toggle('Grown-up pack (26 to 60 moves)', () => progress.grownUp, (on) => (progress.grownUp = on)),
  ];

  const erase = document.createElement('button');
  erase.type = 'button';
  erase.className = 'wo-erase';
  let armed = false;
  erase.textContent = 'Reset progress';
  erase.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      erase.textContent = 'Tap again to erase every level and sparkle';
      erase.classList.add('wo-armed');
      return;
    }
    // Keep the settings and picture; clear the play.
    const fresh = freshProgress();
    progress.levels = fresh.levels;
    progress.poolSeen = fresh.poolSeen;
    progress.poolSparkles = fresh.poolSparkles;
    app.save();
    erase.textContent = 'Progress erased';
    erase.disabled = true;
  });

  const note = document.createElement('p');
  note.textContent =
    'Solving a level opens the next; 9 of 12 opens the next pack. A sparkle means solved in the fewest moves possible.';

  const done = document.createElement('button');
  done.type = 'button';
  done.className = 'wo-parent-done';
  done.textContent = 'Done';
  done.addEventListener('click', () => {
    layer.remove();
    close();
  });

  panel.append(title, ...toggles, note, erase, done);
  layer.append(panel);
  app.root.append(layer);
  done.focus();
}
