import { useFrame } from '@react-three/fiber';
import { useContext, useMemo, useRef } from 'react';
import { PlaneGeometry } from 'three';
import {
  animationOf,
  frameSize,
  frameUv,
  writePlaneUv,
  type AtlasId,
  type UvRect,
} from '../loaders/atlas';
import { useAtlas } from '../loaders/useAtlas';
import { qa } from '../qa';
import { InteractableContext } from './InteractableContext';
import { OUTLINE_OFFSETS } from './spriteShared';

/** Mutable handle: systems change `animation` without a React re-render. */
export type SpriteController = { animation: string };

type AnimatedSpriteProps = {
  atlas: AtlasId;
  /** Animation name from the atlas metadata, e.g. "hero/idle-down". */
  animation: string;
  /** When given, its `animation` field is read every frame and wins over the prop. */
  controller?: SpriteController;
  fps?: number;
  paused?: boolean;
  outline?: boolean;
  castShadow?: boolean;
  onComplete?: () => void;
};

// UV rectangles per animation, resolved once.
const uvCache = new Map<string, { rects: UvRect[]; fps: number; loop: boolean }>();
const clipOf = (atlas: AtlasId, name: string) => {
  const key = `${atlas}:${name}`;
  let clip = uvCache.get(key);
  if (!clip) {
    const animation = animationOf(atlas, name);
    clip = {
      rects: animation.frames.map((frame) => frameUv(atlas, frame)),
      fps: animation.fps,
      loop: animation.loop,
    };
    uvCache.set(key, clip);
  }
  return clip;
};

/**
 * Frame animation by shifting UVs (COMPONENTS.md §6.2). Frames advance on
 * accumulated delta, never setInterval, and nothing here calls setState.
 */
export function AnimatedSprite({
  atlas,
  animation,
  controller,
  fps,
  paused = false,
  outline,
  castShadow = false,
  onComplete,
}: AnimatedSpriteProps) {
  const materials = useAtlas(atlas);
  const inRange = useContext(InteractableContext);
  const firstFrame = animationOf(atlas, animation).frames[0]!;
  const { width, height } = frameSize(atlas, firstFrame);

  // Own geometry: its UVs are rewritten as frames change.
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(width, height);
    writePlaneUv(plane.attributes.uv!, frameUv(atlas, firstFrame));
    return plane;
  }, [atlas, firstFrame, width, height]);

  const state = useRef({ name: '', index: -1, elapsed: 0, done: false });

  useFrame((_, delta) => {
    const name = controller?.animation ?? animation;
    const clip = clipOf(atlas, name);
    const current = state.current;
    if (current.name !== name) {
      current.name = name;
      current.elapsed = 0;
      current.index = -1;
      current.done = false;
    }
    if (!paused && !qa.freeze) current.elapsed += delta;

    const rate = fps ?? clip.fps;
    let index = Math.floor(current.elapsed * rate);
    if (clip.loop) index %= clip.rects.length;
    else if (index >= clip.rects.length) {
      index = clip.rects.length - 1;
      if (!current.done) {
        current.done = true;
        onComplete?.();
      }
    }
    if (index !== current.index) {
      current.index = index;
      writePlaneUv(geometry.attributes.uv!, clip.rects[index]!);
      geometry.attributes.uv!.needsUpdate = true;
    }
  });

  const showOutline = outline ?? inRange;
  return (
    <group>
      <mesh
        geometry={geometry}
        material={materials.lit}
        position-y={height / 2}
        castShadow={castShadow}
      />
      {showOutline
        ? OUTLINE_OFFSETS.map(([dx, dy]) => (
            <mesh
              key={`${dx}:${dy}`}
              geometry={geometry}
              material={materials.outline}
              position={[dx, height / 2 + dy, -0.002]}
            />
          ))
        : null}
    </group>
  );
}
