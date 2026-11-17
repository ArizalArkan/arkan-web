import { beforeEach, describe, expect, it } from 'vitest';
import { world } from '@/content/world';
import { openLocation, openQuest, talkTo } from '../actions';
import { emptyProgress } from '../rules/progress';
import { useGameStore } from '../stores/useGameStore';
import { useUIStore } from '../stores/useUIStore';
import {
  buildGrid,
  isWalkable,
  moveWithCollision,
  nearestWalkable,
  talkPoint,
  type Point,
} from './grid';
import {
  animationFor,
  createBody,
  facingFor,
  HERO_SPEED,
  MAX_DT,
  stepBody,
  teleportBody,
} from './movement';
import { findPath, hasLineOfSight } from './path';
import { nearestInteractable, zoneAt } from './zones';

const grid = buildGrid(world);
const guild = world.locations.find((location) => location.id === 'guild-hall')!;
const out: Point = { x: 0, z: 0 };

describe('collision grid', () => {
  it('spawn, every door and every NPC talk spot are walkable', () => {
    expect(isWalkable(grid, world.spawn[0], world.spawn[2])).toBe(true);
    for (const location of world.locations) {
      expect(isWalkable(grid, location.door[0], location.door[2]), location.id).toBe(true);
    }
    for (const npc of world.npcs) {
      // NPCs are solid; the spot in front of them is where the hero stands to talk.
      expect(isWalkable(grid, npc.position[0], npc.position[2])).toBe(false);
      const [tx, , tz] = talkPoint(npc.position);
      expect(isWalkable(grid, tx, tz), npc.id).toBe(true);
    }
  });

  it('blocks buildings, obstacles and everything outside the town', () => {
    expect(isWalkable(grid, guild.position[0], guild.position[2])).toBe(false);
    expect(isWalkable(grid, 0, 1)).toBe(false); // fountain
    expect(isWalkable(grid, 100, 0)).toBe(false);
    expect(isWalkable(grid, world.size.w / 2 - 0.1, 0)).toBe(false);
  });

  it('finds the nearest walkable point from inside a building', () => {
    const point = nearestWalkable(grid, guild.position[0], guild.position[2]);
    expect(isWalkable(grid, point.x, point.z)).toBe(true);
    expect(Math.hypot(point.x - guild.position[0], point.z - guild.position[2])).toBeLessThan(5);
    expect(nearestWalkable(grid, 0, 8)).toEqual({ x: 0, z: 8 });
  });

  it('slides along a wall instead of stopping dead', () => {
    // Walk north-east into the guild hall's south wall: z is blocked, x still moves.
    const wallZ = guild.position[2] + guild.footprint.d / 2 + 0.3;
    const start = { x: 0, z: wallZ + 0.3 };
    moveWithCollision(grid, start.x, start.z, 0.4, -0.6, out);
    expect(out.x).toBeCloseTo(0.4);
    expect(out.z).toBe(start.z);
  });
});

describe('pathfinding', () => {
  it('reaches every door from spawn without crossing blocked cells', () => {
    const from = { x: world.spawn[0], z: world.spawn[2] };
    for (const location of world.locations) {
      const to = { x: location.door[0], z: location.door[2] };
      const { points, reached } = findPath(grid, from, to);
      expect(reached, location.id).toBe(true);
      expect(points.at(-1)).toEqual(to);
      let previous = from;
      for (const point of points) {
        expect(hasLineOfSight(grid, previous, point), location.id).toBe(true);
        previous = point;
      }
    }
  });

  it('goes around the fountain, not through it', () => {
    const { points, reached } = findPath(grid, { x: 0, z: 6 }, { x: 0, z: -3 });
    expect(reached).toBe(true);
    expect(points.length).toBeGreaterThan(1);
    expect(points.some((point) => Math.abs(point.x) > 1.5)).toBe(true);
  });

  it('walks to the nearest point when the target is unreachable', () => {
    const target = { x: guild.position[0], z: guild.position[2] };
    const { points, reached } = findPath(grid, { x: 0, z: 6 }, target);
    expect(reached).toBe(false);
    const end = points.at(-1)!;
    expect(isWalkable(grid, end.x, end.z)).toBe(true);
    expect(Math.hypot(end.x - target.x, end.z - target.z)).toBeLessThan(4);
  });

  it('returns an empty or single-step path when already there', () => {
    const { points, reached } = findPath(grid, { x: 0, z: 8 }, { x: 0.1, z: 8 });
    expect(reached).toBe(true);
    expect(points).toEqual([{ x: 0.1, z: 8 }]);
  });
});

describe('movement', () => {
  const walk = (dirX: number, dirZ: number, seconds: number, hz: number) => {
    const body = createBody(0, 8);
    const dt = 1 / hz;
    for (let t = 0; t < seconds - 1e-9; t += dt) stepBody(grid, body, dirX, dirZ, dt);
    return body;
  };

  it('covers the same distance at 30, 60 and 144 Hz', () => {
    const distances = [30, 60, 144].map((hz) => Math.abs(walk(1, 0, 1, hz).x));
    for (const distance of distances) expect(distance).toBeCloseTo(HERO_SPEED, 1);
  });

  it('normalizes diagonal speed', () => {
    const body = walk(1, -1, 0.5, 60);
    expect(Math.hypot(body.x, body.z - 8)).toBeCloseTo(HERO_SPEED * 0.5, 1);
  });

  it('clamps a huge delta so a woken tab cannot teleport the hero', () => {
    const body = createBody(0, 8);
    stepBody(grid, body, 1, 0, 5);
    expect(body.x).toBeCloseTo(HERO_SPEED * MAX_DT);
  });

  it('faces the way it moves and idles when stopped', () => {
    const body = createBody(0, 8);
    stepBody(grid, body, -1, 0, 1 / 60);
    expect(animationFor(body)).toBe('walk-left');
    stepBody(grid, body, 0, 0, 1 / 60);
    expect(animationFor(body)).toBe('idle-left');
    expect(facingFor(1, 0, 'up')).toBe('right');
    expect(facingFor(1, -1, 'left')).toBe('up');
    expect(facingFor(0, 1, 'up')).toBe('down');
    expect(facingFor(0, 0, 'right')).toBe('right');
  });

  it('follows a path, reports arrival once, and keyboard input cancels it', () => {
    const body = createBody(0, 8);
    body.path = findPath(grid, { x: 0, z: 8 }, { x: 3, z: 8 }).points;
    let arrivals = 0;
    for (let i = 0; i < 120; i += 1) {
      stepBody(grid, body, 0, 0, 1 / 60);
      if (body.justArrived) arrivals += 1;
    }
    expect(body.x).toBeCloseTo(3);
    expect(arrivals).toBe(1);
    expect(body.isMoving).toBe(false);

    body.path = [{ x: -5, z: 8 }];
    stepBody(grid, body, 0, 1, 1 / 60);
    expect(body.path).toEqual([]);
    expect(body.facing).toBe('down');
  });

  it('does not walk through a wall', () => {
    const body = createBody(0, guild.position[2] + guild.footprint.d / 2 + 0.6);
    for (let i = 0; i < 120; i += 1) stepBody(grid, body, 0, -1, 1 / 60);
    expect(isWalkable(grid, body.x, body.z)).toBe(true);
    expect(body.z).toBeGreaterThan(guild.position[2] + guild.footprint.d / 2);
    expect(body.isMoving).toBe(false);
  });

  it('teleports cleanly', () => {
    const body = createBody(0, 8);
    body.path = [{ x: 1, z: 1 }];
    teleportBody(body, 13, -2);
    expect(body).toMatchObject({ x: 13, z: -2, facing: 'up', path: [], isMoving: false });
  });
});

describe('zones and interactables', () => {
  it('finds the zone at each door and none in open ground', () => {
    for (const location of world.locations) {
      expect(zoneAt(world, location.door[0], location.door[2])).toBe(location.id);
    }
    expect(zoneAt(world, 0, 9)).toBeNull();
  });

  it('only the closest interactable in range is active', () => {
    const items = [
      { id: 'near', x: 1, z: 0, radius: 1.5 },
      { id: 'far', x: 1.4, z: 0, radius: 1.5 },
      { id: 'out', x: 9, z: 9, radius: 1.5 },
    ];
    expect(nearestInteractable(items, 0.8, 0)?.id).toBe('near');
    expect(nearestInteractable(items, 1.3, 0)?.id).toBe('far');
    expect(nearestInteractable(items, -5, -5)).toBeNull();
  });
});

describe('shared actions', () => {
  beforeEach(() => {
    useGameStore.setState({ ...emptyProgress(), xp: 0 });
    useUIStore.setState({ window: null, questId: null, dialog: null, toasts: [] });
  });

  it('opening a location opens its window and counts as the visit, once', () => {
    openLocation('armory');
    openLocation('armory');
    expect(useUIStore.getState().window).toBe('armory');
    expect(useGameStore.getState().visited).toEqual(['armory']);
    expect(useGameStore.getState().xp).toBe(50);
  });

  it('opening a quest visits the board and marks it read', () => {
    openQuest('bank-saqu');
    expect(useUIStore.getState()).toMatchObject({ window: 'quest-board', questId: 'bank-saqu' });
    expect(useGameStore.getState()).toMatchObject({
      visited: ['quest-board'],
      questsRead: ['bank-saqu'],
    });
  });

  it('the second talk with an NPC is flagged as a repeat', () => {
    talkTo('wren');
    expect(useUIStore.getState().dialog).toMatchObject({
      dialogId: 'guide-intro',
      isRepeat: false,
    });
    talkTo('wren');
    expect(useUIStore.getState().dialog?.isRepeat).toBe(true);
    talkTo('nobody');
    expect(useGameStore.getState().npcsMet).toEqual(['wren']);
  });
});
