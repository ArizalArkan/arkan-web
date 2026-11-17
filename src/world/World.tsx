import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { world } from '@/content/world';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { useGameStore } from '@/game/stores/useGameStore';
import { selectReducedMotion, selectTier, useSettingsStore } from '@/game/stores/useSettingsStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';
import { CameraRig } from './camera/CameraRig';
import { playIntro } from './camera/intro';
import { BlockedTapMarker } from './entities/BlockedTapMarker';
import { Hero } from './entities/Hero';
import { LocationSite } from './entities/LocationSite';
import { Npc } from './entities/Npc';
import { Scenery } from './entities/Scenery';
import { groundTiles } from './ground';
import { Lighting } from './lighting/Lighting';
import { TileGround } from './primitives/TileGround';
import { qa } from './qa';
import { useInputSystem } from './systems/useInputSystem';
import { useProximitySystem } from './systems/useProximitySystem';
import { useTravelSystem } from './systems/useTravelSystem';

/** Root scene: the town, its people, and the systems that run it. */
export function World() {
  useInputSystem();
  useProximitySystem();
  useTravelSystem();

  const storeTier = useSettingsStore(selectTier);
  const tier = qa.tier ?? storeTier;
  const tiles = useMemo(() => groundTiles(world), []);

  // First visit only: a short establishing shot. Never under reduced motion or QA.
  useEffect(() => {
    const isFirstVisit = useGameStore.getState().visited.length === 0;
    const reducedMotion = selectReducedMotion(useSettingsStore.getState());
    if (!isFirstVisit || reducedMotion || qa.enabled) return undefined;
    return playIntro();
  }, []);

  // Click or tap the ground to walk there.
  const onGroundDown = (event: ThreeEvent<PointerEvent>) => {
    if (selectIsWorldBlocked(useUIStore.getState())) return;
    const player = usePlayerStore.getState();
    if (player.isTransitioning) return;
    player.setInputDevice(event.pointerType === 'touch' ? 'touch' : 'pointer');
    player.setMoveTarget({ x: event.point.x, z: event.point.z });
  };

  return (
    <>
      <Lighting tier={tier} />

      <CameraRig />
      <TileGround tiles={tiles} onPointerDown={onGroundDown} />
      {world.locations.map((location) => (
        <LocationSite key={location.id} location={location} />
      ))}
      {world.npcs.map((npc) => (
        <Npc key={npc.id} npc={npc} />
      ))}
      <Scenery />
      <Hero />
      <BlockedTapMarker />
      <ReadySignal />
    </>
  );
}

/** Marks the canvas once a frame has actually been drawn, for tests and loading UI. */
function ReadySignal() {
  const canvas = useThree((state) => state.gl.domElement);
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 1) return;
    frames.current += 1;
    if (frames.current === 2) canvas.dataset.ready = 'true';
  });
  return null;
}
