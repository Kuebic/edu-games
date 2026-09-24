import { homeButton } from '../../shared/home-button';
import { ICONS } from './icons';
import { CHAPTERS, LEVELS } from './levels';
import { type Progress, isUnlocked, nextLevel } from './progress';
import { play, unlockAudio } from './sound';

/** Level select: one row per chapter, marked with how many boxes it uses. */
export function showPicker(root: HTMLElement, progress: Progress, open: (level: number) => void): () => void {
  const screen = document.createElement('main');
  screen.className = 'picker';
  const current = nextLevel(progress, LEVELS.length);
  const buttons: HTMLButtonElement[] = [];
  screen.append(homeButton());

  let index = 0;
  for (const chapter of CHAPTERS) {
    const row = document.createElement('section');
    row.className = 'chapter';

    const badge = document.createElement('div');
    badge.className = 'chapter-badge';
    for (let b = 0; b < chapter.boxes; b++) {
      const box = document.createElement('div');
      box.className = 'mini-box';
      badge.append(box);
    }

    const grid = document.createElement('div');
    grid.className = 'chapter-levels';
    for (let n = 0; n < chapter.levels.length; n++) {
      const level = index++;
      const button = document.createElement('button');
      button.className = 'level-button';
      if (!isUnlocked(progress, level)) {
        button.disabled = true;
        button.classList.add('locked');
        button.innerHTML = ICONS.lock;
      } else {
        button.innerHTML = `<span>${level + 1}</span>`;
        if (progress.solved.includes(level)) {
          button.classList.add('solved');
          button.insertAdjacentHTML('beforeend', `<i class="level-star">${ICONS.star}</i>`);
        }
        if (level === current) button.classList.add('current');
        button.addEventListener('click', () => {
          unlockAudio();
          play('tap');
          open(level);
        });
      }
      buttons.push(button);
      grid.append(button);
    }

    row.append(badge, grid);
    screen.append(row);
  }

  root.replaceChildren(screen);
  const focusLevel = (level: number) => {
    const button = buttons[level];
    if (button && !button.disabled) button.focus();
  };
  focusLevel(current);
  buttons[current]?.scrollIntoView({ block: 'center' });

  // Up and down go by what is on screen, since chapter rows wrap and differ in length.
  const verticalNeighbour = (from: number, dir: 1 | -1): number => {
    const origin = buttons[from]!.getBoundingClientRect();
    let best = from;
    let bestRow = Infinity;
    let bestColumn = Infinity;
    buttons.forEach((button, i) => {
      const rect = button.getBoundingClientRect();
      const row = (rect.top - origin.top) * dir;
      const column = Math.abs(rect.left - origin.left);
      if (row < 1) return;
      if (row < bestRow - 1 || (Math.abs(row - bestRow) <= 1 && column < bestColumn)) {
        best = i;
        bestRow = row;
        bestColumn = column;
      }
    });
    return best;
  };

  // Arrow keys walk between unlocked levels; Enter or Space opens one.
  const onKey = (event: KeyboardEvent) => {
    const focused = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const at = focused === -1 ? current : focused;
    const target = {
      ArrowLeft: () => at - 1,
      ArrowRight: () => at + 1,
      ArrowUp: () => verticalNeighbour(at, -1),
      ArrowDown: () => verticalNeighbour(at, 1),
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    focusLevel(target());
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
