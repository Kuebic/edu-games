import { gameStorage, memoryStorage } from '@shared/storage';
import { isLevelOpen } from '@shared/unlock';
import { describe, expect, it, vi } from 'vitest';
import type { App } from '../app';
import { STAGES } from '../problems';
import { loadSave } from '../progress';
import { snackMathSelect, STAGE_COLOURS, stageBadge } from './select';

vi.mock('../sfx', () => ({ unlockAudio: vi.fn() }));
vi.mock('../speech', () => ({ unlockSpeech: vi.fn() }));
const { unlockAudio } = await import('../sfx');
const { unlockSpeech } = await import('../speech');

/** An App on a save as the Game wrote it, under its real key. */
function app(save: object): App {
  return {
    root: undefined as never,
    save: loadSave(gameStorage('snack-math', memoryStorage({ 'snack-math:v1': JSON.stringify(save) }))),
    persist() {},
    stages: vi.fn(),
    play: vi.fn(),
    stickers: vi.fn(),
    grownup: vi.fn(),
  };
}

describe("Snack Math's level select", () => {
  it('shows the six Stages of four Rounds, by name, each in its own colour', () => {
    const groups = snackMathSelect(app({})).groups();
    expect(groups.map((g) => g.name)).toEqual(STAGES.map((s) => s.label));
    expect(groups.map((g) => g.levels.length)).toEqual([4, 4, 4, 4, 4, 4]);
    expect(new Set(groups.map((g) => g.colour)).size).toBe(STAGE_COLOURS.length);
  });

  it('opens a child who had moved up to Stage 4 on its first Round, with Stages 1 to 3 done and every Stage open', () => {
    const groups = snackMathSelect(app({ stage: 3, stickers: ['🦄'] })).groups();
    expect(groups.map((g) => g.levels.filter((l) => l.done).length)).toEqual([4, 4, 4, 0, 0, 0]);
    expect(groups.map((g) => isLevelOpen(g.levels.map((l) => l.done), 0))).toEqual(Array(6).fill(true));
    const stage4 = groups[3]!.levels.map((l) => l.done);
    expect(stage4.map((_, i) => isLevelOpen(stage4, i))).toEqual([true, false, false, false]);
    // No Sparkles: every Round finishes, so there is nothing to score (ADR 0001).
    expect(groups.flatMap((g) => g.levels).some((l) => 'sparkle' in l)).toBe(false);
  });

  it('calls its Levels Rounds', () => {
    expect(snackMathSelect(app({})).levelWord).toBe('Round');
  });

  it('draws each Stage’s sign over 5 or 10 dots', () => {
    const badges = STAGES.map((stage) => stageBadge(stage, '#000'));
    expect(badges.map((b) => b.match(/<circle/g)!.length)).toEqual([5, 5, 5, 10, 10, 10]);
    expect(badges.map((b) => b.match(/<path d="([^"]*)"/)![1]!.split('M').length - 1)).toEqual([2, 1, 3, 2, 1, 3]);
  });

  it('plays the Round tapped, starting sound and speech inside the tap', () => {
    const a = app({});
    snackMathSelect(a).play(2, 1);
    expect(a.play).toHaveBeenCalledWith(2, 1);
    expect(unlockAudio).toHaveBeenCalled();
    expect(unlockSpeech).toHaveBeenCalled();
  });
});
