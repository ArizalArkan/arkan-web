// Establishing shots for each Quick Read chapter, plus the card trims.
// Same texel density and materials as the town (DESIGN.md §5.3, §8.5).

import { Canvas, hex, rng } from './pixel.mjs';
import { P } from './world.mjs';

const W = 360;
const H = 112;
const FEET = 104;
const T = 32;

const C = {
  night800: hex('#1a1433'),
  night700: hex('#2a2150'),
  ridge: hex('#3b2f7a'),
  gold: hex('#f2c14e'),
  ember: hex('#e8643c'),
  parch: hex('#f4e8c8'),
  parchShade: hex('#d9c594'),
  ink: hex('#1b1420'),
  ink600: hex('#5a4630'),
  gold600: hex('#c8902a'),
};

/** Hills and rooftops behind every banner; the page blurs this layer for depth. */
const back = () => {
  const random = rng(301);
  const c = new Canvas(W, H);
  for (let x = 0; x < W; x += 1) {
    const top = Math.round(54 + 8 * Math.sin(x / 41) + 4 * Math.sin(x / 13 + 2));
    c.vline(x, top, H - 1, C.night700);
    c.px(x, top, C.ridge);
  }
  let x = 0;
  while (x < W) {
    const width = 16 + Math.floor(random() * 18);
    const eave = 70 + Math.floor(random() * 10);
    const peak = Math.floor(width / 2);
    for (let i = 0; i < width && x + i < W; i += 1) {
      c.vline(x + i, eave - Math.min(i, width - 1 - i, peak), H - 1, C.night800);
    }
    for (let row = eave + 4; row < H - 6; row += 9) {
      for (let col = x + 3; col < x + width - 4; col += 6) {
        if (random() < 0.4) c.rect(col, row, col + 2, row + 3, random() < 0.3 ? C.ember : C.gold);
      }
    }
    x += width + 1;
  }
  return c;
};

const ground = (c) => {
  const random = rng(302);
  c.rect(0, FEET - 2, W - 1, FEET - 1, P.grassLight);
  c.rect(0, FEET, W - 1, H - 1, P.dirt);
  c.speckle(0, FEET, W - 1, H - 1, P.dirtLight, 0.18, random);
  c.speckle(0, FEET, W - 1, H - 1, P.dirtDark, 0.1, random);
};

/**
 * Front of a building: two tiles of wall under a sloped roof band, the way the
 * 3D houses read from the town camera.
 */
const facade = (c, sprite, { cx, tiles, wall, roof, sign, windows, chimney = false }) => {
  const width = tiles * T;
  const x0 = cx - width / 2;
  const wallTop = FEET - 2 * T;
  const wallTile = sprite(wall);
  const roofTile = sprite(roof);
  for (let y = wallTop; y < FEET; y += 1) {
    for (let x = 0; x < width; x += 1) c.px(x0 + x, y, wallTile.get(x % T, (y - wallTop) % T));
  }
  // Roof: a trapezoid, wider at the eave, sampled from the roof tile.
  const rise = 30;
  for (let k = 0; k < rise; k += 1) {
    const y = wallTop - 1 - k;
    const half = width / 2 + 10 - Math.round((k / rise) * 14);
    for (let x = -half; x < half; x += 1)
      c.px(cx + x, y, roofTile.get((x + 512) % T, (rise - k) % T));
  }
  c.hline(cx - width / 2 - 10, cx + width / 2 + 9, wallTop - 1, C.ink);
  c.hline(cx - width / 2 - 4, cx + width / 2 + 3, wallTop - rise, P.stoneLight);
  if (chimney)
    c.rect(
      cx + width / 4,
      wallTop - rise - 10,
      cx + width / 4 + 8,
      wallTop - rise + 2,
      P.stoneDark,
    );
  const door = sprite('prop/door');
  c.blit(door, cx - 16, FEET - door.h);
  for (const wx of windows) c.blit(sprite('prop/window'), cx + wx - 16, wallTop + 10);
  // The sign hangs right of the door; windows are laid out to leave it room.
  c.blit(sprite(sign), cx + 20, wallTop + 2);
};

const lantern = (c, sprite, x) => {
  const post = sprite('prop/lantern-post');
  c.blit(post, x, FEET - post.h);
  c.blit(sprite('prop/lantern-flame'), x, FEET - 48 - 16);
};

const prop = (c, sprite, name, x) => {
  const art = sprite(name);
  c.blit(art, x, FEET - art.h);
};

const front = (sprite, build) => {
  const c = new Canvas(W, H);
  ground(c);
  build(c);
  return c;
};

/** Gold-edged corner flourish for the chapter cards (top-left; CSS mirrors it). */
const corner = () => {
  const c = new Canvas(12, 12);
  for (let i = 0; i < 12; i += 1) {
    c.px(i, 0, C.ink600);
    c.px(0, i, C.ink600);
  }
  for (let i = 2; i < 8; i += 1) {
    c.px(i, 2, C.gold600);
    c.px(2, i, C.gold600);
  }
  c.rect(4, 4, 5, 5, C.gold600);
  c.px(8, 2, C.ink600);
  c.px(2, 8, C.ink600);
  return c;
};

/** Faint paper grain, tileable, kept close to parchment so text contrast holds. */
const paper = () => {
  const random = rng(303);
  const c = new Canvas(32, 32);
  c.rect(0, 0, 31, 31, C.parch);
  c.speckle(0, 0, 31, 31, hex('#efe2bf'), 0.18, random);
  c.speckle(0, 0, 31, 31, hex('#f8eed6'), 0.08, random);
  return c;
};

/** @param {(name: string) => Canvas} sprite */
export const buildBanners = (sprite) => ({
  'banner-back': back(),
  'banner-guild-hall': front(sprite, (c) => {
    prop(c, sprite, 'prop/tree-a', -14);
    lantern(c, sprite, 52);
    facade(c, sprite, {
      cx: 180,
      tiles: 7,
      wall: 'wall/plaster',
      roof: 'roof/slate',
      sign: 'sign/guild-hall',
      windows: [-80, -48, 80],
      chimney: true,
    });
    lantern(c, sprite, 292);
    prop(c, sprite, 'prop/tree-b', 310);
  }),
  'banner-quest-board': front(sprite, (c) => {
    prop(c, sprite, 'prop/tree-b', -20);
    lantern(c, sprite, 40);
    prop(c, sprite, 'prop/quest-board', 66);
    prop(c, sprite, 'prop/fountain-0', 182);
    lantern(c, sprite, 286);
    prop(c, sprite, 'prop/signpost', 306);
  }),
  'banner-armory': front(sprite, (c) => {
    prop(c, sprite, 'prop/bush', 6);
    lantern(c, sprite, 56);
    facade(c, sprite, {
      cx: 180,
      tiles: 5,
      wall: 'wall/stone',
      roof: 'roof/iron',
      sign: 'sign/armory',
      windows: [-56],
      chimney: true,
    });
    lantern(c, sprite, 288);
    prop(c, sprite, 'prop/tree-a', 304);
  }),
  'banner-library': front(sprite, (c) => {
    prop(c, sprite, 'prop/tree-b', -16);
    lantern(c, sprite, 54);
    facade(c, sprite, {
      cx: 180,
      tiles: 5,
      wall: 'wall/plaster',
      roof: 'roof/teal',
      sign: 'sign/library',
      windows: [-56],
    });
    lantern(c, sprite, 290);
    prop(c, sprite, 'prop/bush', 318);
  }),
  'banner-post-office': front(sprite, (c) => {
    prop(c, sprite, 'prop/signpost', 14);
    lantern(c, sprite, 56);
    facade(c, sprite, {
      cx: 180,
      tiles: 5,
      wall: 'wall/brick',
      roof: 'roof/terra',
      sign: 'sign/post-office',
      windows: [-56],
    });
    lantern(c, sprite, 288);
    prop(c, sprite, 'prop/tree-b', 308);
  }),
  'card-corner': corner(),
  paper: paper(),
});
