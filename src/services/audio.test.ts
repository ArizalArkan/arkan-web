import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Minimal Web Audio fake: records the oscillators each cue creates.
class FakeParam {
  value = 0;
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}
class FakeNode {
  connect = vi.fn((target: unknown) => target);
}
class FakeOscillator extends FakeNode {
  type = 'square';
  frequency = new FakeParam();
  start = vi.fn();
  stop = vi.fn();
}
class FakeGain extends FakeNode {
  gain = new FakeParam();
}
const created: FakeOscillator[] = [];
class FakeAudioContext {
  state = 'suspended';
  currentTime = 0;
  destination = {};
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
  createOscillator() {
    const osc = new FakeOscillator();
    created.push(osc);
    return osc;
  }
  createGain() {
    return new FakeGain();
  }
}

describe('audio service', () => {
  beforeEach(() => {
    created.length = 0;
    vi.resetModules();
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('stays silent while disabled (default mute)', async () => {
    const { audio } = await import('./audio');
    audio.play('confirm');
    expect(created).toHaveLength(0);
  });

  it('plays a short multi-note cue once enabled', async () => {
    const { audio } = await import('./audio');
    audio.setEnabled(true);
    audio.unlock();
    audio.play('reward');
    expect(created).toHaveLength(3);
    for (const osc of created) {
      const [stopAt] = osc.stop.mock.calls[0] as [number];
      expect(stopAt).toBeLessThan(0.3);
    }
  });

  it('pauses, resumes and disables without throwing', async () => {
    const { audio } = await import('./audio');
    audio.setEnabled(true);
    audio.play('cursor');
    audio.pause();
    audio.resume();
    audio.setEnabled(false);
    audio.resume();
    expect(created).toHaveLength(1);
  });

  it('is silent when Web Audio is missing', async () => {
    vi.stubGlobal('AudioContext', undefined);
    const { audio } = await import('./audio');
    audio.setEnabled(true);
    expect(() => {
      audio.unlock();
      audio.play('error');
    }).not.toThrow();
  });
});
