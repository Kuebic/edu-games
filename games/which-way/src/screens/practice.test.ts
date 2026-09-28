import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { skinPicture, whichWayPractice } from './practice';

/** An App on a device holding this save, as the Game wrote it, under its real key. */
function app(save: object = {}): App {
  const storage = gameStorage('which-way', memoryStorage({ 'which-way:v1': JSON.stringify(save) }));
  return {
    root: undefined as never,
    progress: loadProgress(storage),
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(), open: vi.fn() },
  };
}

describe("Which Way?'s Practice", () => {
  it('has one Topic: the four Arrows in order, their Ranges and All, and the three Ways', () => {
    const { topics } = whichWayPractice(app());
    expect(topics).toHaveLength(1);
    expect(topics[0]!.items).toEqual(['←', '↑', '↓', '→']);
    expect(topics[0]!.ranges.map((r) => r.label)).toEqual(['←→', '↑↓', 'All']);
    expect(topics[0]!.ways.map((w) => w.id)).toEqual(['watch', 'go', 'pick']);
  });

  it('shows the saved Scope as glyphs and saves one as Arrows, in order', () => {
    const a = app();
    const practice = whichWayPractice(a);
    expect(practice.scope(0)).toEqual(['←', '→']);
    practice.setScope(0, ['↓', '←']);
    expect(a.progress.game.scope).toEqual(['left', 'down']);
    practice.chooseWay(0, 'pick');
    expect(a.progress.game.way).toBe('pick');
    expect(whichWayPractice(app({ format: 1, game: { way: 'go' } })).way(0)).toBe('go');
  });

  it('has a Skin chip per Mover, and saves the one picked', () => {
    const a = app();
    const skins = whichWayPractice(a).topics[0]!.skins!;
    expect(skins.chips.map((c) => c.label)).toEqual(['Puppy', 'Ball', 'Car']);
    expect(skins.current()).toBe('puppy');
    skins.choose('car');
    expect(a.progress.game.skin).toBe('car');
    expect(skinPicture('puppy')).toContain('🐶');
    expect(skinPicture('car')).toContain('<rect');
  });

  it('plays with the saved picks', () => {
    const a = app();
    whichWayPractice(a).play(0);
    expect(a.play).toHaveBeenCalled();
  });
});
