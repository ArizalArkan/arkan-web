import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { copy } from './copy';
import { dialogs, loadingTips } from './dialogs';
import { education, experience } from './experience';
import { profile } from './profile';
import { quests } from './quests';
import {
  dialogSchema,
  educationSchema,
  experienceSchema,
  LOCATION_IDS,
  profileSchema,
  questSchema,
  skillSchema,
  worldSchema,
} from './schema';
import { skills } from './skills';
import { world } from './world';

const publicPath = (src: string) => resolve(process.cwd(), 'public', src.replace(/^\//, ''));

const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
};

describe('content schemas (QA-CHECKLIST A11)', () => {
  it('profile is valid', () => {
    expect(() => profileSchema.parse(profile)).not.toThrow();
  });

  it.each(quests.map((quest) => [quest.id, quest] as const))('quest %s is valid', (_, quest) => {
    expect(() => questSchema.parse(quest)).not.toThrow();
  });

  it.each(skills.map((skill) => [skill.id, skill] as const))('skill %s is valid', (_, skill) => {
    expect(() => skillSchema.parse(skill)).not.toThrow();
  });

  it('experience, education, dialogs and world are valid', () => {
    expect(() => experience.forEach((entry) => experienceSchema.parse(entry))).not.toThrow();
    expect(() => education.forEach((entry) => educationSchema.parse(entry))).not.toThrow();
    expect(() => dialogs.forEach((entry) => dialogSchema.parse(entry))).not.toThrow();
    expect(() => worldSchema.parse(world)).not.toThrow();
  });
});

describe('content cross-references', () => {
  const questIds = new Set(quests.map((quest) => quest.id));
  const skillIds = new Set(skills.map((skill) => skill.id));

  it('ids are unique', () => {
    expect(questIds.size).toBe(quests.length);
    expect(skillIds.size).toBe(skills.length);
    expect(new Set(experience.map((entry) => entry.id)).size).toBe(experience.length);
  });

  it('every quest stack entry is a known skill', () => {
    for (const quest of quests) {
      for (const skillId of quest.stack)
        expect(skillIds, `${quest.id} -> ${skillId}`).toContain(skillId);
    }
  });

  it('every skill proof and experience link points at a real quest', () => {
    for (const skill of skills) {
      for (const questId of skill.provenBy)
        expect(questIds, `${skill.id} -> ${questId}`).toContain(questId);
    }
    for (const entry of experience) {
      if (entry.questId) expect(questIds).toContain(entry.questId);
    }
  });

  it('a ranked skill always has at least one proof quest', () => {
    for (const skill of skills) {
      if (skill.rarity) expect(skill.provenBy.length, skill.id).toBeGreaterThan(0);
    }
  });

  it('every NPC dialog exists', () => {
    const dialogIds = new Set(dialogs.map((dialog) => dialog.id));
    for (const npc of world.npcs) expect(dialogIds).toContain(npc.dialogId);
  });

  it('world has exactly the five main locations', () => {
    expect(world.locations.map((location) => location.id).sort()).toEqual([...LOCATION_IDS].sort());
  });

  it('experience is ordered newest first', () => {
    const startYears = experience.map((entry) => Number(entry.period.slice(0, 4)));
    expect(startYears).toEqual([...startYears].sort((a, b) => b - a));
  });
});

describe('content assets and copy rules', () => {
  it('every referenced image exists in public/', () => {
    const sources = [
      profile.portrait.src,
      ...quests.flatMap((quest) => quest.media.map((m) => m.src)),
    ];
    for (const src of sources) expect(existsSync(publicPath(src)), src).toBe(true);
  });

  it('the CV link, when set, points at a real file', () => {
    if (profile.cv) expect(existsSync(publicPath(profile.cv.href))).toBe(true);
  });

  it('no em dash or template placeholder anywhere in interface copy', () => {
    for (const value of collectStrings([copy, loadingTips])) {
      expect(value).not.toContain('—');
      expect(value).not.toMatch(/\{\{|lorem ipsum/i);
    }
  });

  it('loading tips are 80 characters or fewer', () => {
    for (const tip of loadingTips) expect(tip.length, tip).toBeLessThanOrEqual(80);
  });
});
