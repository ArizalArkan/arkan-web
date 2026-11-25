import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Just enough Web Audio to run the scheduler and count what it queues.
const started: string[] = [];
class Param {
  value = 0;
  setValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
  setTargetAtTime = vi.fn();
}
class Node {
  connect = vi.fn((target: unknown) => target);
  disconnect = vi.fn();
}
class Osc extends Node {
  type = 'square';
  frequency = new Param();
  start = vi.fn(() => started.push(`osc:${this.type}`));
  stop = vi.fn();
}
class Source extends Node {
  buffer: unknown = null;
  start = vi.fn(() => started.push('noise'));
  stop = vi.fn();
}
class Gain extends Node {
  gain = new Param();
}
class Filter extends Node {
  type = 'lowpass';
  frequency = new Param();
}
class FakeContext {
  currentTime = 0;
  sampleRate = 8000;
  state = 'running';
  destination = {};
  resume = vi.fn(async () => undefined);
  createOscillator = () => new Osc();
  createGain = () => new Gain();
  createBufferSource = () => new Source();
  createBiquadFilter = () => new Filter();
  createBuffer = (_channels: number, length: number) => ({
    getChannelData: () => new Float32Array(length),
  });
}

describe('music player', () => {
  beforeEach(() => {
    started.length = 0;
    vi.resetModules();
    vi.useFakeTimers();
    vi.stubGlobal('AudioContext', FakeContext);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('queues lead, bass and drums ahead of the clock, and stops cleanly', async () => {
    const { music } = await import('./music');
    const { getAudioContext } = await import('./audioContext');
    expect(music.isPlaying()).toBe(false);
    music.start();
    music.start(); // a second start is ignored
    expect(music.isPlaying()).toBe(true);

    const ctx = getAudioContext() as unknown as FakeContext;
    ctx.currentTime = 2;
    vi.advanceTimersByTime(50);
    expect(started.some((entry) => entry === 'osc:square')).toBe(true);
    expect(started.some((entry) => entry === 'osc:triangle')).toBe(true);
    expect(started).toContain('noise');

    music.stop();
    expect(music.isPlaying()).toBe(false);
    const queued = started.length;
    ctx.currentTime = 4;
    vi.advanceTimersByTime(200);
    expect(started.length).toBe(queued);
  });

  it('does nothing without Web Audio', async () => {
    vi.stubGlobal('AudioContext', undefined);
    const { music } = await import('./music');
    expect(() => {
      music.start();
      music.stop();
    }).not.toThrow();
    expect(music.isPlaying()).toBe(false);
  });
});
