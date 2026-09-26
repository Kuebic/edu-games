// @vitest-environment happy-dom
// The Grown-up Corner as a grown-up and a screen reader meet it: found by role and name, tapped with click().
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { choiceRow, grownUpCorner, switchRow, textRow, type CornerSpec } from './grownup';
import { openProgress, type Progress } from './progress';
import { gameStorage, memoryStorage } from './storage';

let root: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<div id="app"><button id="card">card</button></div>';
  root = document.querySelector('#app')!;
});
afterEach(() => void vi.useRealTimers());

const quiet = { sound: () => {}, voice: () => {} };
const testProgress = () =>
  openProgress<{ speed: string }>(gameStorage('g', memoryStorage()), { key: 'v1', sizes: [3], game: { read: () => ({ speed: 'normal' }) } }, quiet);

function corner(progress: Progress<unknown>, spec: CornerSpec = {}, canSpeak = true) {
  return grownUpCorner(root, progress, spec, { canSpeak });
}

const dialog = () => root.querySelector<HTMLElement>('[role="dialog"]');
const byName = (name: string) => root.querySelector<HTMLButtonElement>(`[aria-label="${name}"]`);
const switches = () => [...root.querySelectorAll<HTMLButtonElement>('[role="switch"]')];
const named = (label: string) => switches().find((s) => s.textContent === label)!;
const byText = (text: string) => [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent === text)!;

describe('the Grown-up Corner', () => {
  it('opens as a dialog with the site’s switches, focused, and closes from its X, Done and Escape', () => {
    const closed = vi.fn();
    const c = corner(testProgress(), { closed });
    expect(dialog()).toBeNull();
    c.open();
    const d = dialog()!;
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(d.getAttribute('aria-label')).toBe('Grown-ups');
    expect(switches().map((s) => s.textContent)).toEqual(['Sound', 'Every level open']);
    expect(document.activeElement).toBe(switches()[0]);

    byName('Close')!.click();
    expect(dialog()).toBeNull();
    expect(closed).toHaveBeenCalledOnce();
    c.open();
    byText('Done').click();
    expect(dialog()).toBeNull();
    c.open();
    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dialog()).toBeNull();
    expect(closed).toHaveBeenCalledTimes(3);
  });

  it('opens once at a time', () => {
    const c = corner(testProgress());
    c.open();
    c.open();
    expect(root.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });

  it('shows the Voice switch only in a Game that speaks, where the browser can', () => {
    corner(testProgress(), { voice: true }).open();
    expect(switches().map((s) => s.textContent)).toEqual(['Sound', 'Voice', 'Every level open']);
    dialog()!.remove();
    corner(testProgress(), { voice: true }, false).open();
    expect(switches().map((s) => s.textContent)).toEqual(['Sound', 'Every level open']);
  });

  it('flips a switch in Saved progress, which applies it', () => {
    const applies = { sound: vi.fn(), voice: vi.fn() };
    const progress = openProgress(gameStorage('g', memoryStorage()), { key: 'v1', sizes: [1] }, applies);
    corner(progress).open();
    expect(named('Sound').getAttribute('aria-checked')).toBe('true');
    named('Sound').click();
    expect(named('Sound').getAttribute('aria-checked')).toBe('false');
    expect(progress.settings.sound).toBe(false);
    expect(applies.sound).toHaveBeenLastCalledWith(false);
    named('Every level open').click();
    expect(progress.settings.everyLevelOpen).toBe(true);
  });

  it('shows the Game’s rows and note under the site’s', () => {
    const progress = testProgress();
    const rows = vi.fn(() => [
      choiceRow('Speed', [{ id: 'slow', label: 'Slow' }, { id: 'fast', label: 'Fast' }], () => progress.game.speed, (s) => (progress.game.speed = s)),
    ]);
    corner(progress, { rows, note: 'Every pack is open.' }).open();
    expect(root.querySelector('.site-corner-note')!.textContent).toBe('Every pack is open.');
    expect(byText('Slow').getAttribute('aria-pressed')).toBe('false');
    byText('Fast').click();
    expect(progress.game.speed).toBe('fast');
    expect(byText('Fast').getAttribute('aria-pressed')).toBe('true');
    expect(rows).toHaveBeenCalledOnce();
  });

  it('resets on a second tap only, then says so, and redraws the Game’s rows', () => {
    const progress = testProgress();
    progress.finish(0, 0);
    progress.set('everyLevelOpen', true);
    const rows = vi.fn(() => []);
    corner(progress, { rows }).open();
    const erase = byText('Reset progress');
    erase.click();
    expect(progress.mark(0, 0).done).toBe(true);
    expect(erase.textContent).toBe('Tap again to erase everything');
    erase.click();
    expect(progress.mark(0, 0).done).toBe(false);
    expect(progress.settings.everyLevelOpen).toBe(true);
    expect(erase.textContent).toBe('Progress erased');
    expect(erase.disabled).toBe(true);
    expect(rows).toHaveBeenCalledTimes(2);
  });

  it('gives focus back to the gear on close, unless the screen was redrawn', () => {
    const c = corner(testProgress(), { closed: () => root.querySelector('#card')?.remove() });
    const gear = c.gear();
    root.append(gear);
    gear.focus();
    c.open();
    byText('Done').click();
    expect(document.activeElement).toBe(gear);
    // The gear went with the screen: focus stays wherever the redraw put it.
    const c2 = corner(testProgress(), { closed: () => gear.remove() });
    gear.focus();
    c2.open();
    byText('Done').click();
    expect(document.activeElement).not.toBe(gear);
  });

  it('opens from a gear held for three seconds', () => {
    vi.useFakeTimers();
    const gear = corner(testProgress()).gear();
    root.append(gear);
    expect(gear.className).toContain('site-tool');
    expect(gear.getAttribute('aria-label')).toBe('Grown-ups: press and hold');
    gear.dispatchEvent(new Event('pointerdown', { cancelable: true }));
    vi.advanceTimersByTime(2999);
    expect(dialog()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(dialog()).not.toBeNull();
  });
});

describe('a text row', () => {
  /** Types into the box, as keys do: `input` on each, nothing else. */
  const type = (box: HTMLInputElement, text: string) => {
    box.value = text;
    box.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('is a labelled text box showing what `get` says', () => {
    const row = textRow('Child’s first name', () => 'Sam', () => {});
    root.append(row);
    const box = row.querySelector('input')!;
    expect(box.type).toBe('text');
    expect(box.value).toBe('Sam');
    const label = row.querySelector('label')!;
    expect(label.textContent).toBe('Child’s first name');
    expect(label.htmlFor).toBe(box.id);
  });

  it('saves on change and on blur, not on every key, and only what changed', () => {
    const set = vi.fn();
    const row = textRow('Name', () => '', set);
    root.append(row);
    const box = row.querySelector('input')!;
    type(box, 'S');
    type(box, 'Sa');
    expect(set).not.toHaveBeenCalled();
    box.dispatchEvent(new Event('change'));
    expect(set).toHaveBeenLastCalledWith('Sa');
    box.dispatchEvent(new Event('blur'));
    expect(set).toHaveBeenCalledOnce();
    type(box, 'Sam');
    box.dispatchEvent(new Event('blur'));
    expect(set).toHaveBeenLastCalledWith('Sam');
  });

  it('saves what was typed when the Corner closes with the box still focused', () => {
    let name = '';
    const c = corner(testProgress(), { rows: () => [textRow('Name', () => name, (next) => (name = next))] });
    c.open();
    const box = root.querySelector<HTMLInputElement>('[role="dialog"] input')!;
    box.focus();
    type(box, 'Ann');
    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(name).toBe('Ann');
  });
});

describe('a switch row', () => {
  it('shows and flips what it is given', () => {
    let on = false;
    const row = switchRow('Grown-up pack', () => on, (next) => (on = next));
    expect(row.getAttribute('role')).toBe('switch');
    expect(row.getAttribute('aria-checked')).toBe('false');
    row.click();
    expect(on).toBe(true);
    expect(row.getAttribute('aria-checked')).toBe('true');
  });
});
