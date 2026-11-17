import { createContext, useContext, useSyncExternalStore } from 'react';

// Reduced motion is a setting (OS default, user override), resolved by the
// app and handed down. Patterns read it here instead of from a store.
const ReducedMotionContext = createContext<boolean>(false);

export const ReducedMotionProvider = ReducedMotionContext.Provider;

export const useReducedMotion = () => useContext(ReducedMotionContext);

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (onChange: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const getSnapshot = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.(QUERY).matches);

/** Live value of the OS preference. */
export const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
