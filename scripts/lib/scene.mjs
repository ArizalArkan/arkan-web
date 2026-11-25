// Layers for the Quick Read header diorama (DESIGN.md §8.5). Same texel
// density and palette as the town; the near layer reuses the town's props.

import { Canvas, hex, rng } from './pixel.mjs';
import { P } from './world.mjs';

const H = 96;
const TILE = 256;

const C = {
  night800: hex('#1a1433'),
  night700: hex('#2a2150'),
  ridge: hex('#3b2f7a'),
  dusk: hex('#5b4b9e'),
  parch: hex('#f4e8c8'),
  parchShade: hex('#d9c594'),
  gold: hex('#f2c14e'),
  ember: hex('#e8643c'),
};

/** Rolling hills, tileable: every wave completes whole cycles across the tile. */
const farLayer = () => {
  const c = new Canvas(TILE, H);
  const wave = (x) =>
    58 + 7 * Math.sin((2 * Math.PI * x) / TILE) + 4 * Math.sin((2 * Math.PI * 3 * x) / TILE + 1.3);
  for (let x = 0; x < TILE; x += 1) {
    const top = Math.round(wave(x));
    c.vline(x, top, H - 1, C.night700);
    c.px(x, top, C.ridge);
  }
  return c;
};

/** Rooftop silhouettes with a few lit windows, tileable. */
const midLayer = () => {
  const random = rng(91);
  const c = new Canvas(TILE, H);
  let x = 0;
  while (x < TILE) {
    const width = Math.min(TILE - x, 18 + Math.floor(random() * 16));
    const eave = 66 + Math.floor(random() * 8);
    const peak = Math.floor(width / 2);
    for (let i = 0; i < width; i += 1) {
      // Gabled roof: rise one row per column toward the middle.
      const roof = eave - Math.min(i, width - 1 - i, peak);
      c.vline(x + i, roof, H - 1, C.night800);
    }
    if (random() < 0.5) c.rect(x + 3, eave - peak - 2, x + 5, eave - 1, C.night800); // chimney
    for (let row = eave + 4; row < H - 8; row += 9) {
      for (let col = x + 3; col < x + width - 4; col += 6) {
        if (random() < 0.45) {
          const light = random() < 0.25 ? C.ember : C.gold;
          c.rect(col, row, col + 2, row + 3, light);
          c.px(col + 1, row, C.parch);
        }
      }
    }
    x += width + 1; // one-texel gap reads as separate houses
  }
  return c;
};

const groundStrip = () => {
  const random = rng(92);
  const c = new Canvas(32, H);
  c.rect(0, 86, 31, 87, P.grassLight);
  c.rect(0, 88, 31, H - 1, P.dirt);
  c.speckle(0, 88, 31, H - 1, P.dirtLight, 0.18, random);
  c.speckle(0, 88, 31, H - 1, P.dirtDark, 0.1, random);
  for (let i = 0; i < 6; i += 1) c.px(Math.floor(random() * 32), 85, P.grass);
  return c;
};

/**
 * Foreground: the town's own props on a strip of road, composed for a
 * 480-texel-wide stage with the hero center-left and Wren center-right.
 */
const nearLayer = (sprite) => {
  const W = 480;
  const c = new Canvas(W, H);
  const ground = groundStrip();
  for (let x = 0; x < W; x += 32) c.blit(ground, x, 0);
  const feet = 92;
  const place = (name, x) => {
    const art = sprite(name);
    c.blit(art, x, feet - art.h);
  };
  // Lit pane over the post, 48 texels up, matching the town's Lantern.
  const lantern = (x) => {
    place('prop/lantern-post', x);
    c.blit(sprite('prop/lantern-flame'), x, feet - 48 - 16);
  };
  place('prop/tree-a', -6);
  lantern(74);
  place('prop/quest-board', 96);
  lantern(300);
  place('prop/bush', 330);
  place('prop/signpost', 362);
  place('prop/tree-b', 420);
  return c;
};

const moon = () => {
  const c = new Canvas(24, 24);
  c.ellipse(11.5, 11.5, 10.5, 10.5, C.parch);
  c.ellipse(8, 9, 2.5, 2, C.parchShade);
  c.ellipse(15, 14, 3, 2.5, C.parchShade);
  c.ellipse(12, 6, 1.5, 1, C.parchShade);
  return c;
};

/** Horizontal strip of frames for CSS steps() animation. */
const strip = (frames) => {
  const first = frames[0];
  const c = new Canvas(first.w * frames.length, first.h);
  frames.forEach((frame, index) => c.blit(frame, index * first.w, 0));
  return c;
};

/**
 * @param {(name: string) => Canvas} worldSprite
 * @param {(name: string) => Canvas} characterFrame
 */
export const buildScene = (worldSprite, characterFrame) => ({
  far: farLayer(),
  mid: midLayer(),
  near: nearLayer(worldSprite),
  ground: groundStrip(),
  moon: moon(),
  'hero-walk': strip([0, 1, 2, 3].map((i) => characterFrame(`hero/walk-right-${i}`))),
  'hero-idle': strip([0, 1].map((i) => characterFrame(`hero/idle-down-${i}`))),
  'wren-idle': strip([0, 1].map((i) => characterFrame(`wren/idle-left-${i}`))),
});
