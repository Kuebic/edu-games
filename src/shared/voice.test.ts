import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createVoice, type Page } from './voice';

/** An utterance as the engine sees it: the fields the Voice sets, and the callbacks it waits on. */
class FakeUtterance {
  voice: { name: string; lang: string } | null = null;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

const aVoice = (name: string, lang: string, localService = true) => ({ name, lang, localService }) as SpeechSynthesisVoice;

/** Just enough of a speech engine: a voice list, and a log of what was spoken and cancelled. */
function fakeSynth(voices: SpeechSynthesisVoice[] = []) {
  const spoken: FakeUtterance[] = [];
  const synth = Object.assign(new EventTarget(), {
    voices,
    spoken,
    cancelled: 0,
    getVoices: () => synth.voices,
    speak: (u: FakeUtterance) => void spoken.push(u),
    cancel: () => void synth.cancelled++,
  });
  return synth;
}

function fakePage(): Page {
  return Object.assign(new EventTarget(), { hidden: false });
}

const voiceOver = (synth: ReturnType<typeof fakeSynth>, page?: Page) => createVoice(synth as unknown as SpeechSynthesis, page);

describe('the Voice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('picks a voice', () => {
    const named = (synth: ReturnType<typeof fakeSynth>) => {
      void voiceOver(synth).say('hi');
      return synth.spoken[0]!.voice?.name;
    };

    it('a preferred one over the rest, whatever its order in the list', () => {
      expect(named(fakeSynth([aVoice('Daniel', 'en-GB'), aVoice('Samantha', 'en-US'), aVoice('Karen', 'en-AU')]))).toBe('Samantha');
      expect(named(fakeSynth([aVoice('Daniel', 'en-GB'), aVoice('Karen', 'en-AU')]))).toBe('Karen');
    });

    it('else a local en-US, else any en-US, else any English, else the engine’s default', () => {
      expect(named(fakeSynth([aVoice('Remote', 'en-US', false), aVoice('Local', 'en-US')]))).toBe('Local');
      expect(named(fakeSynth([aVoice('Daniel', 'en-GB'), aVoice('Remote', 'en-US', false)]))).toBe('Remote');
      expect(named(fakeSynth([aVoice('Amélie', 'fr-CA'), aVoice('Daniel', 'en-GB')]))).toBe('Daniel');
      expect(named(fakeSynth([aVoice('Amélie', 'fr-CA')]))).toBeUndefined();
    });

    it('again when the browser fills the list late', () => {
      const synth = fakeSynth([]);
      const voice = voiceOver(synth);
      synth.voices = [aVoice('Samantha', 'en-US')];
      synth.dispatchEvent(new Event('voiceschanged'));
      void voice.say('hi');
      expect(synth.spoken[0]!.voice?.name).toBe('Samantha');
    });
  });

  describe('says a line', () => {
    it('cutting off the last one, in the picked voice, slow and a touch high', () => {
      const synth = fakeSynth([aVoice('Moira', 'en-IE')]);
      const voice = voiceOver(synth);
      void voice.say('Help the red car get out.');
      expect(synth.cancelled).toBe(1);
      expect(synth.spoken).toHaveLength(1);
      const [line] = synth.spoken;
      expect(line).toMatchObject({ text: 'Help the red car get out.', lang: 'en-IE', rate: 0.9, pitch: 1.1, volume: 1 });
    });

    it('in en-US when the engine has no English voice', () => {
      const synth = fakeSynth([]);
      void voiceOver(synth).say('hi');
      expect(synth.spoken[0]).toMatchObject({ voice: null, lang: 'en-US' });
    });

    it.each(['onend', 'onerror'] as const)('resolves when the engine says %s', async (event) => {
      const synth = fakeSynth();
      const done = vi.fn();
      void voiceOver(synth).say('hi').then(done);
      await Promise.resolve();
      expect(done).not.toHaveBeenCalled();
      synth.spoken[0]![event]!();
      await Promise.resolve();
      expect(done).toHaveBeenCalledOnce();
    });

    it('resolves by itself when the engine never says end', async () => {
      const synth = fakeSynth();
      const done = vi.fn();
      void voiceOver(synth).say('hi').then(done);
      await vi.advanceTimersByTimeAsync(1500 + 2 * 90 - 1);
      expect(done).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(done).toHaveBeenCalledOnce();
    });
  });

  describe('the Voice switch', () => {
    it('off: says nothing, resolves at once, and hushes what was being said', async () => {
      const synth = fakeSynth();
      const voice = voiceOver(synth);
      voice.setVoiceEnabled(false);
      expect(synth.cancelled).toBe(1);
      const done = vi.fn();
      void voice.say('hi').then(done);
      await Promise.resolve();
      expect(synth.spoken).toEqual([]);
      expect(done).toHaveBeenCalledOnce();
    });

    it('on again: speaks', () => {
      const synth = fakeSynth();
      const voice = voiceOver(synth);
      voice.setVoiceEnabled(false);
      voice.setVoiceEnabled(true);
      void voice.say('hi');
      expect(synth.spoken).toHaveLength(1);
    });
  });

  describe('unlocks', () => {
    it('with one silent line, once, even with the Voice off', () => {
      const synth = fakeSynth();
      const voice = voiceOver(synth);
      voice.setVoiceEnabled(false);
      voice.unlockVoice();
      voice.unlockVoice();
      expect(synth.spoken).toHaveLength(1);
      expect(synth.spoken[0]).toMatchObject({ text: ' ', volume: 0 });
    });
  });

  it('hushes when the page hides', () => {
    const synth = fakeSynth();
    const page = fakePage();
    voiceOver(synth, page);
    page.dispatchEvent(new Event('visibilitychange'));
    expect(synth.cancelled).toBe(0);
    page.hidden = true;
    page.dispatchEvent(new Event('visibilitychange'));
    expect(synth.cancelled).toBe(1);
  });

  it('hushes on demand', () => {
    const synth = fakeSynth();
    voiceOver(synth).hush();
    expect(synth.cancelled).toBe(1);
  });
});

// Outside the describe above on purpose: Node, with nothing stubbed, is the path this covers.
it('the Voice is quiet and safe where the browser can’t speak', async () => {
  const voice = createVoice(undefined, fakePage());
  expect(voice.canSpeak).toBe(false);
  voice.unlockVoice();
  voice.setVoiceEnabled(true);
  voice.hush();
  await expect(voice.say('hi')).resolves.toBeUndefined();
});
