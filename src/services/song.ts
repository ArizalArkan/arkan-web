// "Dusk over Arkan Journey": an original 16-bar chiptune loop, written for
// this project. Pure data and parsing only; music.ts plays it.
//
// Lead bars are 16 sixteenth-note tokens: a note ("A4", "G#4") starts a note,
// "-" holds the previous one, "." is a rest.

export const BPM = 92;
export const STEPS_PER_BAR = 16;

type ChordName = 'Am' | 'F' | 'C' | 'G' | 'E';

const CHORD_TONES: Record<ChordName, [string, string, string]> = {
  Am: ['A', 'C', 'E'],
  F: ['F', 'A', 'C'],
  C: ['C', 'E', 'G'],
  G: ['G', 'B', 'D'],
  E: ['E', 'G#', 'B'],
};

const PROGRESSION: ChordName[] = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'];

const LEAD_A = [
  'A4 - C5 - E5 - D5 C5 B4 - A4 - - - E4 -',
  'F4 - A4 - C5 - - - D5 - C5 - A4 - - -',
  'G4 - C5 - E5 - G5 - F5 - E5 - D5 - C5 -',
  'D5 - - - B4 - G4 - A4 - B4 - D5 - - -',
  'E5 - - - A5 - G5 - E5 - D5 - C5 - - -',
  'C5 - D5 - E5 - F5 - E5 - C5 - A4 - - -',
  'B4 - D5 - G5 - F5 - E5 - D5 - B4 - - -',
  'G#4 - B4 - E5 - - - E5 - D5 - C5 - B4 -',
];

// Second half: calmer lead over an arpeggio, ending on E to loop back to Am.
const LEAD_B = [
  'C5 - - - B4 - A4 - E4 - - - A4 - B4 -',
  'C5 - - - A4 - F4 - A4 - C5 - F5 - - -',
  'E5 - - - D5 - C5 - G4 - - - C5 - D5 -',
  'D5 - - - - - B4 - G4 - - - - - - -',
  'A4 - C5 - E5 - A5 - G5 - E5 - C5 - E5 -',
  'F5 - E5 - C5 - A4 - C5 - D5 - E5 - - -',
  'D5 - B4 - G4 - B4 - D5 - G5 - F5 - D5 -',
  'E5 - - - - - - - G#4 - - - B4 - - -',
];

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

export const noteToMidi = (note: string): number => {
  const match = /^([A-G]#?)(-?\d)$/.exec(note);
  const index = match ? NOTE_INDEX[match[1]!] : undefined;
  if (!match || index === undefined) throw new Error(`Bad note "${note}"`);
  return (Number(match[2]) + 1) * 12 + index;
};

export const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export type NoteEvent = { step: number; midi: number; length: number };

/** Turn bar strings into note events with absolute step positions. */
export const parseBars = (bars: string[]): NoteEvent[] => {
  const events: NoteEvent[] = [];
  bars.forEach((bar, barIndex) => {
    const tokens = bar.trim().split(/\s+/);
    if (tokens.length !== STEPS_PER_BAR) {
      throw new Error(`Bar ${barIndex + 1} has ${tokens.length} steps, expected ${STEPS_PER_BAR}`);
    }
    tokens.forEach((token, index) => {
      const step = barIndex * STEPS_PER_BAR + index;
      if (token === '-') {
        const last = events[events.length - 1];
        // A hold only extends a note that is still sounding.
        if (last && last.step + last.length === step) last.length += 1;
      } else if (token !== '.') {
        events.push({ step, midi: noteToMidi(token), length: 1 });
      }
    });
  });
  return events;
};

const chordAt = (bar: number) => PROGRESSION[bar % PROGRESSION.length]!;

/** Root, octave and fifth in eighth notes, chiptune-bass style. */
const bassLine = (bars: number): NoteEvent[] => {
  const events: NoteEvent[] = [];
  for (let bar = 0; bar < bars; bar += 1) {
    const [root, , fifth] = CHORD_TONES[chordAt(bar)];
    const pattern = [`${root}2`, `${root}3`, `${fifth}2`, `${root}3`];
    for (let eighth = 0; eighth < 8; eighth += 1) {
      const note = pattern[eighth % pattern.length]!;
      events.push({ step: bar * STEPS_PER_BAR + eighth * 2, midi: noteToMidi(note), length: 2 });
    }
  }
  return events;
};

/** Sixteenth-note arpeggio for the second half: root, third, fifth, third. */
const arpeggio = (fromBar: number, bars: number): NoteEvent[] => {
  const events: NoteEvent[] = [];
  for (let bar = fromBar; bar < fromBar + bars; bar += 1) {
    const [root, third, fifth] = CHORD_TONES[chordAt(bar)];
    const cycle = [`${root}4`, `${third}4`, `${fifth}4`, `${third}4`];
    for (let step = 0; step < STEPS_PER_BAR; step += 1) {
      events.push({
        step: bar * STEPS_PER_BAR + step,
        midi: noteToMidi(cycle[step % 4]!),
        length: 1,
      });
    }
  }
  return events;
};

export type Drum = 'kick' | 'snare' | 'hat';
export type DrumEvent = { step: number; drum: Drum };

const drums = (bars: number): DrumEvent[] => {
  const events: DrumEvent[] = [];
  for (let bar = 0; bar < bars; bar += 1) {
    const base = bar * STEPS_PER_BAR;
    events.push({ step: base, drum: 'kick' }, { step: base + 8, drum: 'kick' });
    events.push({ step: base + 4, drum: 'snare' }, { step: base + 12, drum: 'snare' });
    for (const hat of [2, 6, 10, 14]) events.push({ step: base + hat, drum: 'hat' });
  }
  return events;
};

export const buildSong = () => {
  const bars = LEAD_A.length + LEAD_B.length;
  return {
    bars,
    totalSteps: bars * STEPS_PER_BAR,
    stepSeconds: 60 / BPM / 4,
    lead: parseBars([...LEAD_A, ...LEAD_B]),
    bass: bassLine(bars),
    arp: arpeggio(LEAD_A.length, LEAD_B.length),
    drums: drums(bars),
  };
};

export type Song = ReturnType<typeof buildSong>;
