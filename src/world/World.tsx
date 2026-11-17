import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { world } from '@/content/world';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';
import { CameraRig } from './camera/CameraRig';
import { BlockedTapMarker } from './entities/BlockedTapMarker';
import { Hero } from './entities/Hero';
import { LocationSite } from './entities/LocationSite';
import { Npc } from './entities/Npc';
import { Scenery } from './entities/Scenery';
import { groundTiles } from './ground';
import { TileGround } from './primitives/TileGround';
import { useInputSystem } from './systems/useInputSystem';
import { useProximitySystem } from './systems/useProximitySystem';
import { useTravelSystem } from './systems/useTravelSystem';
import { lighting } from './theme';

/** Root scene: the town, its people, and the systems that run it. */
export function World() {
  useInputSystem();
  useProximitySystem();
  useTravelSystem();

  const tiles = useMemo(() => groundTiles(world), []);

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
      <color attach="background" args={[lighting.fogNear]} />
      <hemisphereLight
        args={[lighting.hemisphereSky, lighting.hemisphereGround, lighting.hemisphereIntensity]}
      />
      <directionalLight
        color={lighting.keyLight}
        intensity={lighting.keyIntensity}
        position={[-8, 14, 6]}
      />

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
