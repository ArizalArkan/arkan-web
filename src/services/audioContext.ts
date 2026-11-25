// One AudioContext for sound effects and music, created on first use.

let context: AudioContext | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (context) return context;
  const Ctor = typeof window === 'undefined' ? undefined : window.AudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
};

/** The context if it already exists; never creates one. */
export const peekAudioContext = () => context;
