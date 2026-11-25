import { getAudioContext } from './audioContext';
import { buildSong, midiToFrequency, type Drum, type NoteEvent, type Song } from './song';

// Background music player (DESIGN.md §10). A small look-ahead scheduler
// queues notes slightly ahead of the audio clock so timing never drifts
// with the main thread. Default off; only ever started by a visitor's click.

const VOLUME = 0.4 * 0.22; // 40% default, scaled down for square waves.
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.12;

type Voice = 'lead' | 'bass' | 'arp';

const VOICES: Record<Voice, { type: OscillatorType; gain: number; release: number }> = {
  lead: { type: 'square', gain: 0.55, release: 0.04 },
  bass: { type: 'triangle', gain: 0.9, release: 0.02 },
  arp: { type: 'square', gain: 0.16, release: 0.01 },
};

let song: Song | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let timer: number | undefined;
let nextStep = 0;
let nextTime = 0;
const byStep = new Map<number, { voice: Voice | Drum; event?: NoteEvent }[]>();

const indexSong = (current: Song) => {
  byStep.clear();
  const add = (step: number, entry: { voice: Voice | Drum; event?: NoteEvent }) => {
    const list = byStep.get(step) ?? [];
    list.push(entry);
    byStep.set(step, list);
  };
  for (const voice of ['lead', 'bass', 'arp'] as const) {
    for (const event of current[voice]) add(event.step, { voice, event });
  }
  for (const event of current.drums) add(event.step, { voice: event.drum });
};

const noiseBuffer = (ctx: AudioContext) => {
  if (noise) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
  const data = noise.getChannelData(0);
  // Seeded noise so every loop sounds the same.
  let seed = 7;
  for (let i = 0; i < data.length; i += 1) {
    seed = (seed * 16807) % 2147483647;
    data[i] = (seed / 2147483647) * 2 - 1;
  }
  return noise;
};

const playTone = (
  ctx: AudioContext,
  out: AudioNode,
  voice: Voice,
  event: NoteEvent,
  at: number,
  step: number,
) => {
  const settings = VOICES[voice];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const end = at + event.length * step;
  osc.type = settings.type;
  osc.frequency.value = midiToFrequency(event.midi);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(settings.gain, at + 0.005);
  gain.gain.setValueAtTime(settings.gain * 0.75, Math.max(at + 0.006, end - settings.release));
  gain.gain.linearRampToValueAtTime(0, end);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(end + 0.02);
};

const playDrum = (ctx: AudioContext, out: AudioNode, drum: Drum, at: number) => {
  if (drum === 'kick') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, at);
    osc.frequency.exponentialRampToValueAtTime(45, at + 0.12);
    gain.gain.setValueAtTime(0.9, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
    osc.connect(gain).connect(out);
    osc.start(at);
    osc.stop(at + 0.16);
    return;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const length = drum === 'snare' ? 0.12 : 0.03;
  source.buffer = noiseBuffer(ctx);
  filter.type = drum === 'snare' ? 'bandpass' : 'highpass';
  filter.frequency.value = drum === 'snare' ? 1800 : 7000;
  gain.gain.setValueAtTime(drum === 'snare' ? 0.35 : 0.12, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  source.connect(filter).connect(gain).connect(out);
  source.start(at);
  source.stop(at + length + 0.01);
};

const schedule = () => {
  const ctx = getAudioContext();
  if (!ctx || !song || !master) return;
  while (nextTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
    for (const entry of byStep.get(nextStep) ?? []) {
      if (entry.event)
        playTone(ctx, master, entry.voice as Voice, entry.event, nextTime, song.stepSeconds);
      else playDrum(ctx, master, entry.voice as Drum, nextTime);
    }
    nextTime += song.stepSeconds;
    nextStep = (nextStep + 1) % song.totalSteps;
  }
};

export const music = {
  isPlaying: () => timer !== undefined,

  /** Start the loop. Must be called from (or after) a user gesture. */
  start() {
    if (timer !== undefined) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      void ctx.resume().catch(() => undefined);
      if (!song) {
        song = buildSong();
        indexSong(song);
      }
      master = ctx.createGain();
      master.gain.value = VOLUME;
      master.connect(ctx.destination);
      nextStep = 0;
      nextTime = ctx.currentTime + 0.06;
      schedule();
      timer = window.setInterval(schedule, LOOKAHEAD_MS);
    } catch {
      // Music is optional: fail silently.
    }
  },

  stop() {
    window.clearInterval(timer);
    timer = undefined;
    const ctx = getAudioContext();
    const out = master;
    master = null;
    if (!ctx || !out) return;
    // Short fade so stopping never clicks.
    out.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    window.setTimeout(() => out.disconnect(), 200);
  },
};
