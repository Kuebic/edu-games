import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { holdToActivate } from './hold';

/** Just enough of a button: events, classes, a style and a disabled flag. */
function fakeButton() {
  const classes = new Set<string>();
  const button = Object.assign(new EventTarget(), {
    disabled: false,
    html: '',
    vars: {} as Record<string, string>,
    captured: [] as number[],
    classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) },
    style: { setProperty(name: string, value: string) { button.vars[name] = value; } },
    insertAdjacentHTML(_: string, html: string) { button.html += html; },
    setPointerCapture(id: number) { button.captured.push(id); },
    classes,
    holding: () => classes.has('site-holding'),
  });
  return button;
}

const fire = (target: EventTarget, type: string, extra: object = {}) => {
  const event = Object.assign(new Event(type, { cancelable: true }), extra);
  target.dispatchEvent(event);
  return event;
};

describe('holdToActivate', () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  function held(ms = 3000) {
    const button = fakeButton();
    const action = vi.fn();
    holdToActivate(button as unknown as HTMLElement, ms, action);
    return { button, action };
  }

  it('acts once the button is held long enough, with a ring filling meanwhile', () => {
    const { button, action } = held();
    expect(button.html).toContain('class="site-ring"');
    expect(button.classes.has('site-hold')).toBe(true);
    expect(button.vars['--site-hold-ms']).toBe('3000ms');
    const down = fire(button, 'pointerdown', { pointerId: 7 });
    expect(down.defaultPrevented).toBe(true);
    expect(button.captured).toEqual([7]);
    expect(button.holding()).toBe(true);
    vi.advanceTimersByTime(2999);
    expect(action).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledOnce();
    expect(button.holding()).toBe(false);
  });

  it.each(['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture', 'blur'])('does nothing if let go early (%s)', (type) => {
    const { button, action } = held(1000);
    fire(button, 'pointerdown', { pointerId: 1 });
    vi.advanceTimersByTime(900);
    fire(button, type);
    expect(button.holding()).toBe(false);
    vi.advanceTimersByTime(5000);
    expect(action).not.toHaveBeenCalled();
  });

  it('ignores a disabled button', () => {
    const { button, action } = held(1000);
    button.disabled = true;
    fire(button, 'pointerdown', { pointerId: 1 });
    expect(button.holding()).toBe(false);
    vi.advanceTimersByTime(5000);
    expect(action).not.toHaveBeenCalled();
  });

  it('can be held from the keyboard', () => {
    const { button, action } = held(1000);
    fire(button, 'keydown', { key: 'Enter' });
    fire(button, 'keydown', { key: 'Enter', repeat: true });
    vi.advanceTimersByTime(1000);
    expect(action).toHaveBeenCalledOnce();
    fire(button, 'keydown', { key: ' ' });
    fire(button, 'keyup');
    vi.advanceTimersByTime(5000);
    expect(action).toHaveBeenCalledOnce();
  });
});
