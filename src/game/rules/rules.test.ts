import { describe, expect, it } from 'vitest';
import { quests } from '@/content/quests';
import { LOCATION_IDS } from '@/content/schema';
import { ACHIEVEMENTS, newlyMetAchievements } from './achievements';
import { applyAction, type GameAction } from './actions';
import { secondsUntilAllowed, validateContact, validateField } from './contactForm';
import { resolveInitialMode } from './mode';
import {
  catalog,
  computeXp,
  designedMaxLevel,
  emptyProgress,
  maxXp,
  mergeProgress,
  sanitizeProgress,
  type Progress,
} from './progress';
import {
  isMainQuestComplete,
  mainQuestObjectives,
  mainQuestStatus,
  projectQuestStatus,
} from './quests';
import { levelFromXp, levelProgress, MAX_LEVEL, XP, xpForLevel } from './xp';

const run = (actions: GameAction[], start: Progress = emptyProgress()) =>
  actions.reduce(
    (acc, action) => {
      const result = applyAction(acc.progress, action);
      return { progress: result.progress, events: [...acc.events, ...result.events] };
    },
    { progress: start, events: [] as ReturnType<typeof applyAction>['events'] },
  );

describe('levels (PRODUCT.md §7.1)', () => {
  it('uses the 100 / 300 / 600 / 1000 thresholds', () => {
    expect([2, 3, 4, 5].map(xpForLevel)).toEqual([100, 300, 600, 1000]);
  });

  it.each([
    [0, 1],
    [99, 1],
    [100, 2],
    [299, 2],
    [300, 3],
    [600, 4],
    [999, 4],
    [1000, 5],
    [99999, MAX_LEVEL],
  ])('xp %i is level %i', (xp, level) => {
    expect(levelFromXp(xp)).toBe(level);
  });

  it('reports progress inside the level and caps at max', () => {
    expect(levelProgress(150)).toEqual({ level: 2, current: 50, needed: 200, isMax: false });
    expect(levelProgress(1200)).toMatchObject({ level: 5, isMax: true, needed: 0 });
  });
});

describe('XP grants', () => {
  it('grants each action once, even when repeated 10 times', () => {
    const repeated = Array.from(
      { length: 10 },
      () => ({ type: 'visit', locationId: 'armory' }) as const,
    );
    const { progress } = run(repeated);
    expect(computeXp(progress)).toBe(XP.visitLocation);
  });

  it('returns the same object and no events for a repeat', () => {
    const first = applyAction(emptyProgress(), { type: 'readQuest', questId: 'bank-saqu' });
    const second = applyAction(first.progress, { type: 'readQuest', questId: 'bank-saqu' });
    expect(second.progress).toBe(first.progress);
    expect(second.events).toEqual([]);
  });

  it('ignores unknown ids', () => {
    const { progress, events } = run([
      { type: 'readQuest', questId: 'not-a-quest' },
      { type: 'meetNpc', npcId: 'ghost' },
      { type: 'openLink', questId: 'bank-saqu', index: 99 },
      { type: 'collect', collectibleId: 'coin-1' },
    ]);
    expect(progress).toEqual(emptyProgress());
    expect(events).toEqual([]);
  });

  it('awards link, npc and contact XP from the table', () => {
    const { progress } = run([
      { type: 'openLink', questId: 'bank-saqu', index: 0 },
      { type: 'meetNpc', npcId: 'wren' },
      { type: 'sendContact' },
      { type: 'sendContact' },
    ]);
    const achievementXp = progress.achievements.reduce((sum, id) => sum + ACHIEVEMENTS[id].xp, 0);
    expect(computeXp(progress) - achievementXp).toBe(XP.openLink + XP.meetNpc + XP.sendContact);
    expect(progress.achievements).toEqual(expect.arrayContaining(['pen-pal', 'social-butterfly']));
  });

  it('emits exactly one level-up event when crossing a threshold', () => {
    const { events } = run([
      { type: 'visit', locationId: 'guild-hall' },
      { type: 'visit', locationId: 'armory' },
    ]);
    expect(events.filter((event) => event.type === 'levelUp')).toEqual([
      { type: 'levelUp', level: 2 },
    ]);
  });

  it('emits events in announce order: domain, xp, achievement, level, main quest', () => {
    const almost = run(
      LOCATION_IDS.slice(0, 4).map((locationId) => ({ type: 'visit', locationId }) as const),
    );
    const { events } = applyAction(almost.progress, { type: 'visit', locationId: LOCATION_IDS[4] });
    expect(events.map((event) => event.type)).toEqual([
      'locationVisited',
      'xp',
      'achievement',
      'levelUp',
      'mainQuestComplete',
    ]);
  });

  it('first step unlocks First Steps once', () => {
    const { progress, events } = run([{ type: 'move' }, { type: 'move' }]);
    expect(progress.achievements).toEqual(['first-steps']);
    expect(events.filter((event) => event.type === 'achievement')).toHaveLength(1);
  });
});

describe('main quest and project quests (PRODUCT.md §7.2)', () => {
  it('completes only when all five locations are visited, in any order', () => {
    const reversed = [...LOCATION_IDS].reverse();
    let progress = emptyProgress();
    expect(mainQuestStatus(progress)).toBe('available');
    reversed.forEach((locationId, index) => {
      progress = applyAction(progress, { type: 'visit', locationId }).progress;
      expect(isMainQuestComplete(progress)).toBe(index === reversed.length - 1);
    });
    expect(mainQuestStatus(progress)).toBe('completed');
    expect(mainQuestObjectives(progress).every((objective) => objective.isDone)).toBe(true);
  });

  it('is active after the first visit', () => {
    const { progress } = run([{ type: 'visit', locationId: 'library' }]);
    expect(mainQuestStatus(progress)).toBe('active');
  });

  it('marks project quests new until read', () => {
    const { progress } = run([{ type: 'readQuest', questId: 'altaraone' }]);
    expect(projectQuestStatus(progress, 'altaraone')).toBe('read');
    expect(projectQuestStatus(progress, 'bank-saqu')).toBe('new');
  });
});

describe('achievements (PRODUCT.md §7.3)', () => {
  it('Quest Reader opens at exactly 3 quests, Completionist at all', () => {
    const ids = quests.map((quest) => quest.id);
    let progress = emptyProgress();
    ids.forEach((questId, index) => {
      progress = applyAction(progress, { type: 'readQuest', questId }).progress;
      expect(progress.achievements.includes('quest-reader')).toBe(index >= 2);
      expect(progress.achievements.includes('completionist')).toBe(index === ids.length - 1);
    });
  });

  it('never grants Treasure Hunter while the town has no collectibles', () => {
    expect(newlyMetAchievements(emptyProgress(), catalog)).not.toContain('treasure-hunter');
  });

  it('no achievement condition is met on an empty save', () => {
    expect(newlyMetAchievements(emptyProgress(), catalog)).toEqual([]);
  });
});

describe('max XP calibration', () => {
  it('finding everything reaches the designed max level, which is never above LV5', () => {
    expect(levelFromXp(maxXp())).toBe(designedMaxLevel());
    expect(designedMaxLevel()).toBeLessThanOrEqual(MAX_LEVEL);
  });

  it('playing through all content reaches exactly maxXp', () => {
    const actions: GameAction[] = [
      { type: 'move' },
      ...LOCATION_IDS.map((locationId) => ({ type: 'visit', locationId }) as const),
      ...quests.map((quest) => ({ type: 'readQuest', questId: quest.id }) as const),
      ...quests.flatMap((quest) =>
        quest.links.map((_, index) => ({ type: 'openLink', questId: quest.id, index }) as const),
      ),
      ...catalog.npcs.map((npcId) => ({ type: 'meetNpc', npcId }) as const),
      { type: 'sendContact' },
    ];
    expect(computeXp(run(actions).progress)).toBe(maxXp());
  });
});

describe('progress hygiene', () => {
  it('sanitize drops unknown and duplicate ids', () => {
    const dirty = {
      ...emptyProgress(),
      visited: ['armory', 'armory', 'moon'],
      achievements: ['pen-pal', 'hacker'],
    } as unknown as Progress;
    expect(sanitizeProgress(dirty)).toMatchObject({
      visited: ['armory'],
      achievements: ['pen-pal'],
    });
  });

  it('merge is a union', () => {
    const a = run([{ type: 'visit', locationId: 'armory' }]).progress;
    const b = run([{ type: 'visit', locationId: 'library' }, { type: 'sendContact' }]).progress;
    const merged = mergeProgress(a, b);
    expect(merged.visited.sort()).toEqual(['armory', 'library']);
    expect(merged.contactSent).toBe(true);
  });
});

describe('initial mode (ARCHITECTURE.md §4.1)', () => {
  const base = {
    urlMode: null,
    savedMode: null,
    hasWebgl: true,
    prefersReducedMotion: false,
    saveData: false,
  };

  it.each([
    [{}, 'adventure', 'default'],
    [{ urlMode: 'quick' }, 'quick', 'url'],
    [{ urlMode: 'nonsense' }, 'adventure', 'default'],
    [{ savedMode: 'quick' as const }, 'quick', 'saved'],
    [{ urlMode: 'adventure', savedMode: 'quick' as const }, 'adventure', 'url'],
    [{ prefersReducedMotion: true }, 'quick', 'reduced-motion'],
    [{ saveData: true }, 'quick', 'save-data'],
    [{ savedMode: 'adventure' as const, prefersReducedMotion: true }, 'adventure', 'saved'],
    [{ hasWebgl: false, urlMode: 'adventure' }, 'quick', 'no-webgl'],
  ])('%o -> %s', (overrides, mode, reason) => {
    expect(resolveInitialMode({ ...base, ...overrides })).toEqual({ mode, reason });
  });
});

describe('contact form validation (UX-GUIDELINES.md §6)', () => {
  it('flags every empty field', () => {
    expect(Object.keys(validateContact({ name: '', email: '', message: '' }))).toEqual([
      'name',
      'email',
      'message',
    ]);
  });

  it.each([
    ['name', 'A', true],
    ['name', 'Al', false],
    ['name', 'x'.repeat(81), true],
    ['email', 'name@domain', true],
    ['email', 'name@domain.com', false],
    ['message', 'x'.repeat(9), true],
    ['message', 'x'.repeat(10), false],
    ['message', 'x'.repeat(2000), false],
    ['message', 'x'.repeat(2001), true],
  ] as const)('%s=%j error=%s', (field, value, hasError) => {
    expect(Boolean(validateField(field, value))).toBe(hasError);
  });

  it('counts down the 30 s rate limit', () => {
    expect(secondsUntilAllowed(null, 1000)).toBe(0);
    expect(secondsUntilAllowed(0, 1)).toBe(30);
    expect(secondsUntilAllowed(0, 29_001)).toBe(1);
    expect(secondsUntilAllowed(0, 30_000)).toBe(0);
  });
});
