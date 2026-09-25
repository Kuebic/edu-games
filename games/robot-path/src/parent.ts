// The parent menu, behind a 3-second hold on the gear. Words are fine here: it's for grown-ups.

import { ICONS, iconButton } from './icons';
import { freshProgress, SPEEDS, type Progress, type Speed } from './progress';
import { canSpeak } from './speech';

export interface ParentHooks {
  progress(): Progress;
  update(progress: Progress): void;
  close(): void;
}

const SPEED_NAMES: Record<Speed, string> = { slow: 'Slow', normal: 'Normal', fast: 'Fast' };

export function showParent(host: HTMLElement, hooks: ParentHooks): void {
  const veil = document.createElement('div');
  veil.className = 'rp-veil';
  const panel = document.createElement('section');
  panel.className = 'rp-parent site-grownup';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Grown-ups');
  veil.append(panel);
  host.append(veil);

  const close = () => {
    veil.remove();
    hooks.close();
  };

  const draw = () => {
    const progress = hooks.progress();
    const { settings } = progress;
    const set = (next: Partial<Progress>) => {
      hooks.update({ ...hooks.progress(), ...next });
      draw();
    };
    const toggle = (label: string, on: boolean, flip: () => void) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rp-switch';
      button.setAttribute('role', 'switch');
      button.setAttribute('aria-checked', String(on));
      button.innerHTML = `<span>${label}</span><i></i>`;
      button.addEventListener('click', flip);
      return button;
    };

    const heading = document.createElement('header');
    heading.innerHTML = '<h2>Grown-ups</h2>';
    heading.append(iconButton('site-tool', ICONS.close, 'Close', close));

    const speed = document.createElement('div');
    speed.className = 'rp-choice';
    speed.innerHTML = '<span>Speed</span>';
    for (const value of SPEEDS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = SPEED_NAMES[value];
      button.setAttribute('aria-pressed', String(settings.speed === value));
      button.addEventListener('click', () => set({ settings: { ...settings, speed: value } }));
      speed.append(button);
    }

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'rp-reset';
    reset.textContent = 'Reset all progress';
    reset.addEventListener('click', () => {
      if (reset.dataset.armed) {
        hooks.update({ ...freshProgress(), skin: hooks.progress().skin, settings: hooks.progress().settings });
        draw();
      } else {
        reset.dataset.armed = 'yes';
        reset.textContent = 'Tap again to erase everything';
      }
    });

    panel.replaceChildren(
      heading,
      toggle('Sound', settings.sound, () => set({ settings: { ...settings, sound: !settings.sound } })),
      ...(canSpeak ? [toggle('Voice', settings.voice, () => set({ settings: { ...settings, voice: !settings.voice } }))] : []),
      speed,
      toggle('Every level open', progress.unlockAll, () => set({ unlockAll: !progress.unlockAll })),
      reset,
    );
  };
  draw();
}
