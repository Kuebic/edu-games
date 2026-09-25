import { describe, expect, it, vi } from 'vitest';
import { startGame, startPage, type PageEnv } from './shell';
import { gameStorage, memoryStorage } from './storage';

function fakePage(app: object | null = {}) {
  const document = Object.assign(new EventTarget(), { querySelector: () => app }) as PageEnv['document'];
  const registerOffline = vi.fn();
  const storage = memoryStorage();
  return { env: { document, storage, registerOffline } satisfies PageEnv, document, registerOffline, storage };
}

const fire = (target: EventTarget, type: string, extra: object = {}) => {
  const event = Object.assign(new Event(type, { cancelable: true }), extra);
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

describe('startPage', () => {
  it('finds #app and registers offline', () => {
    const app = {};
    const page = fakePage(app);
    expect(startPage(page.env)).toBe(app);
    expect(page.registerOffline).toHaveBeenCalledOnce();
  });

  it('fails loudly without #app', () => {
    expect(() => startPage(fakePage(null).env)).toThrow('id="app"');
  });

  it('blocks the long-press menu and pinch zoom, but not one-finger drags', () => {
    const page = fakePage();
    startPage(page.env);
    expect(fire(page.document, 'contextmenu')).toBe(true);
    expect(fire(page.document, 'gesturestart')).toBe(true);
    expect(fire(page.document, 'touchmove', { touches: [1, 2] })).toBe(true);
    expect(fire(page.document, 'touchmove', { touches: [1] })).toBe(false);
  });
});

describe('startGame', () => {
  it('saves under the Slug, so existing saves keep loading', () => {
    const page = fakePage();
    page.storage.setItem('way-out:v1', '{"skin":"farm"}');
    const { storage } = startGame('way-out', {}, page.env);
    expect(storage.read('v1')).toEqual({ skin: 'farm' });
    storage.write('v1', { skin: 'space' });
    expect(page.storage.dump()).toEqual({ 'way-out:v1': '{"skin":"space"}' });
  });

  it('calls unlock on every touch, before the page sees it', () => {
    const page = fakePage();
    const unlock = vi.fn();
    startGame('x', { unlock }, page.env);
    fire(page.document, 'pointerdown');
    fire(page.document, 'pointerdown');
    expect(unlock).toHaveBeenCalledTimes(2);
  });
});

describe('gameStorage', () => {
  it('reads nothing from a missing or broken save', () => {
    const storage = gameStorage('g', memoryStorage({ 'g:bad': '{not json' }));
    expect(storage.read('none')).toBeUndefined();
    expect(storage.read('bad')).toBeUndefined();
  });

  it('keeps playing when storage is blocked', () => {
    const blocked = gameStorage('g', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('full'); },
    });
    expect(blocked.read('v1')).toBeUndefined();
    expect(() => blocked.write('v1', {})).not.toThrow();
    const none = gameStorage('g', undefined);
    expect(none.read('v1')).toBeUndefined();
    expect(() => none.write('v1', {})).not.toThrow();
  });

  it('keeps Games apart', () => {
    const backing = memoryStorage();
    gameStorage('a', backing).write('v1', 1);
    expect(gameStorage('b', backing).read('v1')).toBeUndefined();
  });
});
