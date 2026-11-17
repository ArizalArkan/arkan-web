// Chibi character generator. Frame is 32x48 with the feet on row 46 and the
// pivot at bottom-center (DESIGN.md §5.3). All original art.

import { Canvas, hex } from './pixel.mjs';

export const FRAME_W = 32;
export const FRAME_H = 48;

const INK = hex('#1b1420');

/**
 * @typedef {object} Look
 * @property {number[]} skin @property {number[]} skinShade
 * @property {number[]} hair @property {number[]} hairLight
 * @property {number[]} top @property {number[]} topLight @property {number[]} topDark
 * @property {number[]} accent  drawstrings / trim
 * @property {number[]} legs @property {number[]} legsDark
 * @property {number[]} shoes
 * @property {number[]} [lens]   glasses lens color; omit for no glasses
 * @property {{ base: number[], light: number[], dark: number[], band: number[] }} [hat]
 * @property {boolean} [robe]    long robe that hides the legs
 */

/**
 * @param {'down'|'up'|'left'} dir
 * @param {{ bob?: number, liftL?: number, liftR?: number, swing?: number, stride?: number }} pose
 * @param {Look} look
 */
const drawOne = (dir, pose, look) => {
  const c = new Canvas(FRAME_W, FRAME_H);
  const b = -(pose.bob ?? 0); // body offset: negative = up
  const liftL = pose.liftL ?? 0;
  const liftR = pose.liftR ?? 0;
  const swing = pose.swing ?? 0;
  const stride = pose.stride ?? 0;

  if (dir === 'left') drawSide(c, { b, liftL, liftR, swing, stride }, look);
  else drawFrontBack(c, dir === 'up', { b, liftL, liftR, swing }, look);

  return c.outline(INK);
};

const drawLeg = (c, x0, x1, lift, look, dark = false) => {
  const bottom = 45 - lift;
  c.rect(x0, 38, x1, bottom - 2, dark ? look.legsDark : look.legs);
  c.rect(x0, bottom - 1, x1, bottom, look.shoes);
};

const drawFrontBack = (c, isBack, { b, liftL, liftR, swing }, look) => {
  // Legs (or robe hem).
  if (look.robe) {
    c.rect(10, 37 + b, 21, 45, look.top);
    c.rect(10, 44, 21, 45, look.topDark);
    c.vline(21, 37 + b, 45, look.topDark);
    c.rect(12, 45, 14, 45, look.shoes);
    c.rect(17, 45, 19, 45, look.shoes);
  } else {
    drawLeg(c, 12, 15, liftL, look);
    drawLeg(c, 16, 19, liftR, look);
    c.vline(16, 38, 43 - Math.max(liftL, liftR), look.legsDark);
  }

  // Arms, swinging opposite each other.
  const armL = 27 + b + swing;
  const armR = 27 + b - swing;
  c.rect(9, armL, 10, armL + 7, look.top);
  c.rect(9, armL + 8, 10, armL + 9, look.skin);
  c.rect(21, armR, 22, armR + 7, look.topDark);
  c.rect(21, armR + 8, 22, armR + 9, look.skinShade);

  // Torso.
  c.rect(11, 26 + b, 20, 37 + b, look.top);
  c.vline(20, 26 + b, 37 + b, look.topDark);
  c.hline(11, 20, 37 + b, look.topDark);
  c.vline(11, 27 + b, 35 + b, look.topLight);
  if (isBack) {
    // Hood resting on the shoulders.
    c.rect(12, 26 + b, 19, 28 + b, look.topLight);
    c.hline(13, 18, 29 + b, look.topDark);
  } else {
    c.vline(14, 27 + b, 31 + b, look.accent);
    c.vline(17, 27 + b, 31 + b, look.accent);
    c.hline(13, 18, 34 + b, look.topDark); // pocket
  }

  // Head.
  c.rect(9, 13 + b, 22, 25 + b, look.skin);
  c.rect(10, 12 + b, 21, 12 + b, look.skin);
  c.clear(9, 25 + b);
  c.clear(22, 25 + b);
  c.vline(22, 14 + b, 24 + b, look.skinShade);

  if (isBack) {
    c.rect(8, 11 + b, 23, 22 + b, look.hair);
    c.rect(9, 23 + b, 22, 23 + b, look.hair);
    c.hline(10, 16, 12 + b, look.hairLight);
  } else {
    // Hair: cap, side locks and a jagged fringe.
    c.rect(8, 11 + b, 23, 16 + b, look.hair);
    c.rect(8, 17 + b, 9, 20 + b, look.hair);
    c.rect(22, 17 + b, 23, 20 + b, look.hair);
    for (const x of [11, 12, 15, 18, 19]) c.px(x, 17 + b, look.hair);
    c.hline(10, 15, 12 + b, look.hairLight);

    if (look.lens) {
      c.rect(10, 18 + b, 14, 21 + b, INK);
      c.rect(17, 18 + b, 21, 21 + b, INK);
      c.rect(11, 19 + b, 13, 20 + b, look.lens);
      c.rect(18, 19 + b, 20, 20 + b, look.lens);
      c.hline(15, 16, 19 + b, INK);
      c.px(12, 20 + b, INK);
      c.px(19, 20 + b, INK);
    } else {
      c.rect(12, 19 + b, 12, 20 + b, INK);
      c.rect(19, 19 + b, 19, 20 + b, INK);
    }
    c.hline(15, 16, 23 + b, look.skinShade);
  }

  // Spiky tufts on top (skipped under a hat).
  if (!look.hat)
    for (const x of [10, 13, 14, 17, 20, 21]) c.px(x, 10 + b - (x % 3 === 1 ? 1 : 0), look.hair);

  if (look.hat) drawHat(c, 16, b, look.hat);
};

const drawSide = (c, { b, liftL, liftR, swing, stride }, look) => {
  // Legs: far leg darker, spread by the stride.
  if (look.robe) {
    c.rect(11, 37 + b, 20, 45, look.top);
    c.rect(11, 44, 20, 45, look.topDark);
    c.rect(11 - Math.abs(stride), 45, 14, 45, look.shoes);
  } else {
    drawLeg(c, 15 + stride, 18 + stride, liftR, look, true);
    drawLeg(c, 13 - stride, 16 - stride, liftL, look);
  }

  // Torso (narrower in profile).
  c.rect(12, 26 + b, 19, 37 + b, look.top);
  c.vline(19, 26 + b, 37 + b, look.topDark);
  c.hline(12, 19, 37 + b, look.topDark);
  c.rect(17, 26 + b, 20, 29 + b, look.topLight); // hood behind the neck

  // Near arm swings forward and back.
  const ax = 14 - swing * 2;
  c.rect(ax, 27 + b, ax + 2, 34 + b, look.topLight);
  c.rect(ax, 35 + b, ax + 2, 36 + b, look.skin);

  // Head in profile, facing left.
  c.rect(10, 13 + b, 21, 25 + b, look.skin);
  c.rect(11, 12 + b, 20, 12 + b, look.skin);
  c.clear(21, 25 + b);
  c.px(9, 21 + b, look.skin); // nose
  c.hline(11, 12, 23 + b, look.skinShade);

  // Hair: top and the whole back of the head.
  c.rect(10, 11 + b, 22, 15 + b, look.hair);
  c.rect(15, 16 + b, 22, 23 + b, look.hair);
  for (const x of [10, 12, 13]) c.px(x, 16 + b, look.hair);
  c.hline(11, 16, 12 + b, look.hairLight);
  if (!look.hat) for (const x of [11, 14, 17, 20]) c.px(x, 10 + b - (x % 2), look.hair);

  if (look.lens) {
    c.rect(10, 18 + b, 13, 21 + b, INK);
    c.rect(11, 19 + b, 12, 20 + b, look.lens);
    c.hline(14, 16, 19 + b, INK); // temple arm
  }
  c.px(11, 20 + b, INK);

  if (look.hat) drawHat(c, 16, b, look.hat);
};

const drawHat = (c, cx, b, hat) => {
  // Wide brim with a soft cone that leans back.
  c.rect(cx - 10, 12 + b, cx + 9, 13 + b, hat.base);
  c.hline(cx - 10, cx + 9, 13 + b, hat.dark);
  c.rect(cx - 6, 10 + b, cx + 5, 11 + b, hat.band);
  const rows = [
    [cx - 6, cx + 5],
    [cx - 5, cx + 5],
    [cx - 4, cx + 4],
    [cx - 3, cx + 4],
    [cx - 2, cx + 4],
    [cx, cx + 5],
    [cx + 2, cx + 5],
  ];
  rows.forEach(([x0, x1], index) => {
    c.hline(x0, x1, 9 + b - index, hat.base);
    c.px(x0, 9 + b - index, hat.light);
    c.px(x1, 9 + b - index, hat.dark);
  });
};

const POSES = {
  idle: [{}, { bob: -1 }],
  walk: [
    { swing: 1, stride: 2 },
    { bob: 1, liftL: 2, stride: 0 },
    { swing: -1, stride: -2 },
    { bob: 1, liftR: 2, stride: 0 },
  ],
};

/**
 * Build every frame for one character.
 * @returns {{ name: string, canvas: Canvas }[]}
 */
export const buildCharacter = (id, look, animations = ['idle', 'walk']) => {
  const frames = [];
  for (const animation of animations) {
    POSES[animation].forEach((pose, index) => {
      for (const dir of ['down', 'up', 'left']) {
        const canvas = drawOne(dir, pose, look);
        frames.push({ name: `${id}/${animation}-${dir}-${index}`, canvas });
        if (dir === 'left') {
          frames.push({ name: `${id}/${animation}-right-${index}`, canvas: canvas.flippedX() });
        }
      }
    });
  }
  return frames;
};

export const characterAnimations = (id, animations = ['idle', 'walk']) => {
  const fps = { idle: 4, walk: 8 };
  const out = {};
  for (const animation of animations) {
    for (const dir of ['down', 'up', 'left', 'right']) {
      out[`${id}/${animation}-${dir}`] = {
        frames: POSES[animation].map((_, index) => `${id}/${animation}-${dir}-${index}`),
        fps: fps[animation],
        loop: true,
      };
    }
  }
  return out;
};
