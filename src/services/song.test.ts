import { describe, expect, it } from 'vitest';
import { buildSong, midiToFrequency, noteToMidi, parseBars, STEPS_PER_BAR } from './song';

describe('song data', () => {
  it('converts note names to MIDI and frequency', () => {
    expect(noteToMidi('A4')).toBe(69);
    expect(noteToMidi('C4')).toBe(60);
    expect(noteToMidi('G#4')).toBe(68);
    expect(midiToFrequency(69)).toBeCloseTo(440);
    expect(() => noteToMidi('H2')).toThrow();
  });

  it('parses holds and rests into note lengths', () => {
    const events = parseBars(['A4 - - . C5 - . . . . . . . . . .']);
    expect(events).toEqual([
      { step: 0, midi: 69, length: 3 },
      { step: 4, midi: 72, length: 2 },
    ]);
  });

  it('rejects bars of the wrong length', () => {
    expect(() => parseBars(['A4 -'])).toThrow(/expected 16/);
  });

  it('builds a loop under 60 seconds where every part fits inside it', () => {
    const song = buildSong();
    expect(song.totalSteps).toBe(song.bars * STEPS_PER_BAR);
    expect(song.totalSteps * song.stepSeconds).toBeLessThanOrEqual(60);
    for (const part of [song.lead, song.bass, song.arp]) {
      expect(part.length).toBeGreaterThan(0);
      for (const event of part)
        expect(event.step + event.length).toBeLessThanOrEqual(song.totalSteps);
    }
    expect(song.drums.every((event) => event.step < song.totalSteps)).toBe(true);
  });
});
