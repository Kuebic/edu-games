import { gameStorage, memoryStorage } from '@shared/storage';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { loadProgress } from '../progress';
import { TOPIC_COLOURS, findItPractice, topicBadge } from './practice';

/** An App on a device holding this save, as the Game wrote it, under its real key. */
function app(save: object = {}): App {
  const storage = gameStorage('find-it', memoryStorage({ 'find-it:v1': JSON.stringify(save) }));
  return {
    root: undefined as never,
    progress: loadProgress(storage),
    start: vi.fn(),
    play: vi.fn(),
    corner: { gear: vi.fn(), open: vi.fn() },
  };
}

describe("Find It's Practice", () => {
  it('has Numbers and Letters as Topics, each in its own colour, with its Ranges and All', () => {
    const { topics } = findItPractice(app());
    expect(topics.map((t) => t.name)).toEqual(['Numbers', 'Letters']);
    expect(topics.map((t) => t.colour)).toEqual([TOPIC_COLOURS.number, TOPIC_COLOURS.letter]);
    expect(topics.map((t) => t.items.length)).toEqual([21, 26]);
    expect(topics[0]!.ranges.map((r) => r.label)).toEqual(['0–10', '11–20', 'All']);
    expect(topics[1]!.ranges.map((r) => r.label)).toEqual(['A–E', 'F–J', 'K–O', 'P–T', 'U–Z', 'All']);
    expect(topics[1]!.ways.map((w) => w.text)).toEqual(['🍎 → A', 'A → 🍎', 'Mix']);
  });

  it('reads and saves the Topic, Scope and Way in Find It’s slot', () => {
    const a = app();
    const practice = findItPractice(a);
    practice.chooseTopic(1);
    practice.setScope(1, ['B', 'Q']);
    practice.chooseWay(1, 'find-symbol');
    expect(a.progress.game).toMatchObject({ topic: 'letter', scopes: { letter: ['B', 'Q'] }, ways: { letter: 'find-symbol' } });
    expect(practice.topic()).toBe(1);
    expect(practice.scope(1)).toEqual(['B', 'Q']);
    expect(practice.way(1)).toBe('find-symbol');
    expect(findItPractice(app({ format: 1, game: { topic: 'letter' } })).topic()).toBe(1);
  });

  it('plays the Topic that’s up', () => {
    const a = app();
    findItPractice(a).play(1);
    expect(a.play).toHaveBeenCalledWith('letter');
  });

  it('draws a 3 over beans for Numbers and an A for Letters', () => {
    expect(topicBadge('number')).toMatch(/>3<\/text>/);
    expect(topicBadge('number').match(/<ellipse/g)).toHaveLength(3);
    expect(topicBadge('letter')).toMatch(/>A<\/text>/);
  });
});
