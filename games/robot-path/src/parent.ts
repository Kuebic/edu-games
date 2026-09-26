// The parent menu, behind a 3-second hold on the gear. Words are fine here: it's for grown-ups.

import { canSpeak } from '@shared/voice';
import { ICONS, iconButton } from './icons';
import { SPEEDS, type Progress, type Speed } from './progress';

export interface ParentHooks {
  progress: Progress;
  close(): void;
}

const SPEED_NAMES: Record<Speed, string> = { slow: 'Slow', normal: 'Normal', fast: 'Fast' };

export function showParent(host: HTMLElement, hooks: ParentHooks): void {
  const veil = document.createElement('div');
  veil.className = 'rp-veil';
  const panel = document.createElement('section');
  panel.className = 'rp-parent site-grownup';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Grown-ups');
  veil.append(panel);
  host.append(veil);
  const opener = document.activeElement;

  const close = () => {
    veil.remove();
    hooks.close();
    // Focus goes back to what had it, unless the level select was redrawn and focused a card of its own.
    if (opener instanceof HTMLElement && opener !== document.body && opener.isConnected) opener.focus();
  };

  const draw = () => {
    const { progress } = hooks;
    const { settings } = progress;
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

    const flip = (setting: 'sound' | 'voice' | 'everyLevelOpen') => {
      progress.set(setting, !settings[setting]);
      draw();
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
      button.setAttribute('aria-pressed', String(progress.game.speed === value));
      button.addEventListener('click', () => {
        progress.game.speed = value;
        progress.save();
        draw();
      });
      speed.append(button);
    }

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'rp-reset';
    reset.textContent = 'Reset all progress';
    reset.addEventListener('click', () => {
      if (reset.dataset.armed) {
        progress.reset();
        draw();
      } else {
        reset.dataset.armed = 'yes';
        reset.textContent = 'Tap again to erase everything';
      }
    });

    // Focus goes into the Corner as it opens, and stays on the same button when a choice redraws it.
    const buttons = () => [...panel.querySelectorAll('button')];
    const opening = !panel.hasChildNodes();
    const focused = buttons().indexOf(document.activeElement as HTMLButtonElement);
    panel.replaceChildren(
      heading,
      toggle('Sound', settings.sound, () => flip('sound')),
      ...(canSpeak ? [toggle('Voice', settings.voice, () => flip('voice'))] : []),
      speed,
      toggle('Every level open', settings.everyLevelOpen, () => flip('everyLevelOpen')),
      reset,
    );
    if (opening || focused !== -1) buttons()[Math.max(focused, 0)]!.focus();
  };
  draw();
}
