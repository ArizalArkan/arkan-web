import { describe, expect, it } from 'vitest';
import { formatRoute, parseRoute, readModeParam, sameRoute } from './route';

describe('hash routes', () => {
  it.each([
    ['', { kind: 'home' }],
    ['#/', { kind: 'home' }],
    ['#/about', { kind: 'section', section: 'about' }],
    ['#/quests', { kind: 'section', section: 'quests' }],
    ['#/quests/bank-saqu', { kind: 'quest', questId: 'bank-saqu' }],
    ['#/contact/', { kind: 'section', section: 'contact' }],
    ['#/nowhere', { kind: 'home' }],
    ['#/skills/extra', { kind: 'section', section: 'skills' }],
  ])('%s parses', (hash, route) => {
    expect(parseRoute(hash)).toEqual(route);
  });

  it('round-trips through format', () => {
    for (const hash of ['#/', '#/experience', '#/quests/vision-plus']) {
      expect(formatRoute(parseRoute(hash))).toBe(hash);
    }
  });

  it('compares routes and reads the mode param', () => {
    expect(sameRoute(parseRoute('#/about'), parseRoute('#/about/'))).toBe(true);
    expect(sameRoute(parseRoute('#/about'), parseRoute('#/skills'))).toBe(false);
    expect(readModeParam('?mode=quick&qa=1')).toBe('quick');
    expect(readModeParam('')).toBeNull();
  });
});
