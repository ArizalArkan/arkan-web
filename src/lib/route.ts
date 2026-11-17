// Hash routes (ARCHITECTURE.md §7). Pure: parse and format only.

export const SECTIONS = ['about', 'quests', 'skills', 'experience', 'contact'] as const;
export type Section = (typeof SECTIONS)[number];

export type Route =
  { kind: 'home' } | { kind: 'section'; section: Section } | { kind: 'quest'; questId: string };

export const HOME: Route = { kind: 'home' };

const isSection = (value: string): value is Section =>
  (SECTIONS as readonly string[]).includes(value);

/** "#/quests/bank-saqu" -> quest route; anything unknown -> home. */
export const parseRoute = (hash: string): Route => {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [first, second] = parts;
  if (!first || !isSection(first)) return HOME;
  if (first === 'quests' && second) return { kind: 'quest', questId: second };
  return { kind: 'section', section: first };
};

export const formatRoute = (route: Route): string => {
  if (route.kind === 'home') return '#/';
  if (route.kind === 'section') return `#/${route.section}`;
  return `#/quests/${encodeURIComponent(route.questId)}`;
};

export const sameRoute = (a: Route, b: Route) => formatRoute(a) === formatRoute(b);

/** Read ?mode= from a search string. */
export const readModeParam = (search: string) => new URLSearchParams(search).get('mode');
