// Chiptune SFX synthesized with Web Audio (DESIGN.md §10). No audio files,
// so nothing to license or download. Muted by default, created lazily after
// the first user gesture, and silent if anything fails.

export type SfxId = 'cursor' | 'confirm' | 'cancel' | 'step' | 'reward' | 'error';

type Note = { freq: number; at: number; dur: number; type?: OscillatorType };

// Each cue stays under 300 ms.
const CUES: Record<SfxId, Note[]> = {
  cursor: [{ freq: 880, at: 0, dur: 0.04, type: 'square' }],
  confirm: [
    { freq: 660, at: 0, dur: 0.06, type: 'square' },
    { freq: 990, at: 0.06, dur: 0.09, type: 'square' },
  ],
  cancel: [
    { freq: 520, at: 0, dur: 0.06, type: 'square' },
    { freq: 350, at: 0.06, dur: 0.09, type: 'square' },
  ],
  step: [{ freq: 140, at: 0, dur: 0.03, type: 'triangle' }],
  reward: [
    { freq: 784, at: 0, dur: 0.07, type: 'square' },
    { freq: 988, at: 0.07, dur: 0.07, type: 'square' },
    { freq: 1319, at: 0.14, dur: 0.12, type: 'square' },
  ],
  error: [
    { freq: 220, at: 0, dur: 0.1, type: 'sawtooth' },
    { freq: 196, at: 0.1, dur: 0.14, type: 'sawtooth' },
  ],
};

const VOLUME = 0.4 * 0.25; // 40% default (DESIGN.md §10), scaled down for square waves.

let context: AudioContext | null = null;
let isEnabled = false;

const getContext = () => {
  if (context) return context;
  const Ctor = typeof window === 'undefined' ? undefined : window.AudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
};

export const audio = {
  setEnabled(next: boolean) {
    isEnabled = next;
    if (!next) void context?.suspend().catch(() => undefined);
  },

  /** Call from a user gesture handler (click/keydown) before the first play. */
  unlock() {
    try {
      void getContext()
        ?.resume()
        .catch(() => undefined);
    } catch {
      // Ignore: audio is optional.
    }
  },

  play(id: SfxId) {
    if (!isEnabled) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
      const start = ctx.currentTime;
      for (const note of CUES[id]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = note.type ?? 'square';
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(VOLUME, start + note.at);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + note.at + note.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start + note.at);
        osc.stop(start + note.at + note.dur + 0.02);
      }
    } catch {
      // Silent on failure, by design.
    }
  },

  /** Stop sound while the tab is hidden (UX-GUIDELINES.md §9.5). */
  pause() {
    void context?.suspend().catch(() => undefined);
  },
  resume() {
    if (isEnabled) void context?.resume().catch(() => undefined);
  },
};
