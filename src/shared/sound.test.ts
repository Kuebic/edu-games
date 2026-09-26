import { describe, expect, it, vi } from 'vitest';
import { createSound, type SoundEnv } from './sound';

/** Just enough of a Web Audio node: what the Sound sets and connects. */
function fakeNode() {
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const node = {
    type: 'sine',
    buffer: undefined as unknown,
    gain: param(),
    frequency: param(),
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  node.connect.mockReturnValue(node);
  return node;
}

/** A context that starts suspended, as on iOS, and logs the nodes it makes. */
class FakeContext {
  static made: FakeContext[] = [];
  state: AudioContextState = 'suspended';
  currentTime = 10;
  destination = { kind: 'destination' };
  sampleRate = 48000;
  resumes = 0;
  nodes: { kind: string; node: ReturnType<typeof fakeNode> }[] = [];
  constructor() {
    FakeContext.made.push(this);
  }
  resume() {
    this.resumes++;
    this.state = 'running';
    return Promise.resolve();
  }
  createGain() {
    return this.make('gain');
  }
  createOscillator() {
    return this.make('oscillator');
  }
  createBufferSource() {
    return this.make('source');
  }
  decodeAudioData(data: unknown) {
    return Promise.resolve({ decoded: data });
  }
  private make(kind: string) {
    const node = fakeNode();
    this.nodes.push({ kind, node });
    return node;
  }
}

/** A fetch that answers with the URL itself as the bytes, or fails for a URL ending in "!". */
const fakeFetch = vi.fn((url: string) =>
  url.endsWith('!') ? Promise.reject(new Error('404')) : Promise.resolve({ arrayBuffer: () => Promise.resolve(url) }),
);

function soundOver(extra: Partial<SoundEnv> = {}) {
  FakeContext.made = [];
  fakeFetch.mockClear();
  const vibrate = vi.fn();
  const sound = createSound({ AudioContext: FakeContext as unknown as typeof AudioContext, fetch: fakeFetch as unknown as typeof fetch, vibrate, ...extra });
  return { sound, vibrate, context: () => FakeContext.made[0]!, nodes: (kind: string) => FakeContext.made[0]!.nodes.filter((n) => n.kind === kind).map((n) => n.node) };
}

const settle = () => new Promise((r) => setTimeout(r, 0));

describe('the Sound', () => {
  describe('unlocks', () => {
    it('with one context, made on the first touch and resumed while suspended', () => {
      const { sound, context } = soundOver();
      expect(sound.audio()).toBeUndefined();
      sound.unlockAudio();
      sound.unlockAudio();
      expect(FakeContext.made).toHaveLength(1);
      expect(context().resumes).toBe(1);
      expect(sound.audio()).toBe(context());
      // Suspended again by the browser: the next touch resumes it.
      context().state = 'suspended';
      expect(sound.audio()).toBeUndefined();
      sound.unlockAudio();
      expect(context().resumes).toBe(2);
    });

    it('quietly, where making a context throws', () => {
      const Throws = function () {
        throw new Error('no');
      } as unknown as typeof AudioContext;
      const { sound } = soundOver({ AudioContext: Throws });
      expect(() => sound.unlockAudio()).not.toThrow();
      expect(sound.audio()).toBeUndefined();
    });
  });

  describe('the Sound switch', () => {
    it('off: no context for recipes, no note, no buzz', () => {
      const { sound, vibrate, nodes } = soundOver();
      sound.unlockAudio();
      sound.setSoundEnabled(false);
      expect(sound.audio()).toBeUndefined();
      sound.note({ from: 440 });
      expect(nodes('oscillator')).toEqual([]);
      sound.buzz(20);
      expect(vibrate).not.toHaveBeenCalled();
      sound.setSoundEnabled(true);
      sound.buzz(20);
      expect(vibrate).toHaveBeenCalledWith(20);
    });
  });

  describe('a note', () => {
    it('glides from one frequency to another over its length, faded in and out', () => {
      const { sound, nodes, context } = soundOver();
      sound.unlockAudio();
      sound.note({ from: 300, to: 360, at: 0.5, length: 0.2, volume: 0.05, wave: 'triangle' });
      const [tone] = nodes('oscillator');
      const [gain] = nodes('gain');
      expect(tone!.type).toBe('triangle');
      expect(tone!.frequency.setValueAtTime).toHaveBeenCalledWith(300, 10.5);
      expect(tone!.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(360, 10.7);
      expect(tone!.start).toHaveBeenCalledWith(10.5);
      expect(tone!.stop.mock.calls[0]![0]).toBeCloseTo(10.72);
      expect(gain!.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.05, 10.51);
      expect(gain!.connect).toHaveBeenCalledWith(context().destination);
    });

    it('holds its frequency when given only one', () => {
      const { sound, nodes } = soundOver();
      sound.unlockAudio();
      sound.note({ from: 880 });
      expect(nodes('oscillator')[0]!.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(880, 10.12);
    });
  });

  describe('a clip', () => {
    it('registered before the first touch is fetched and decoded on it, then plays', async () => {
      const { sound, nodes } = soundOver();
      const tap = sound.clip('tap.ogg');
      expect(fakeFetch).not.toHaveBeenCalled();
      sound.unlockAudio();
      expect(fakeFetch).toHaveBeenCalledWith('tap.ogg');
      tap();
      expect(nodes('source')).toEqual([]);
      await settle();
      tap();
      expect(nodes('source')).toHaveLength(1);
      expect(nodes('source')[0]!.buffer).toEqual({ decoded: 'tap.ogg' });
      expect(nodes('source')[0]!.start).toHaveBeenCalledOnce();
    });

    it('registered after the first touch is fetched at once, and only once', () => {
      const { sound } = soundOver();
      sound.unlockAudio();
      sound.clip('pop.ogg');
      sound.clip('pop.ogg');
      expect(fakeFetch.mock.calls.filter(([url]) => url === 'pop.ogg')).toHaveLength(1);
    });

    it('that fails to load stays silent', async () => {
      const { sound, nodes } = soundOver();
      const bad = sound.clip('gone.ogg!');
      sound.unlockAudio();
      await settle();
      bad();
      expect(nodes('source')).toEqual([]);
    });

    it('is silent with sound off', async () => {
      const { sound, nodes } = soundOver();
      const tap = sound.clip('tap.ogg');
      sound.unlockAudio();
      await settle();
      sound.setSoundEnabled(false);
      tap();
      expect(nodes('source')).toEqual([]);
    });
  });

  it('cheers with the site’s jingle', async () => {
    const { sound, nodes } = soundOver();
    sound.cheer();
    sound.unlockAudio();
    await settle();
    // Silent before the touch, like a Game's own clip; registered from the start, so it decoded with the touch.
    sound.cheer();
    expect(nodes('source')).toHaveLength(1);
  });

  it('buzzes where the device can, and shrugs where it throws', () => {
    const { sound } = soundOver({ vibrate: () => {
      throw new Error('not allowed');
    } });
    expect(() => sound.buzz(10)).not.toThrow();
    const { sound: mute } = soundOver({ vibrate: undefined });
    expect(() => mute.buzz(10)).not.toThrow();
  });
});

// Node, with nothing stubbed, is the path this covers.
it('the Sound is quiet and safe where the browser has no Web Audio', () => {
  const sound = createSound({});
  sound.unlockAudio();
  sound.setSoundEnabled(true);
  expect(sound.audio()).toBeUndefined();
  sound.note({ from: 440 });
  sound.clip('x.ogg')();
  sound.cheer();
  sound.buzz(10);
});
