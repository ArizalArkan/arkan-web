// World art: ground tiles, building materials and props. 32 texels = 1 unit.
// One palette for the whole atlas (max 32 colors, DESIGN.md §3.4): the core
// tokens plus short material ramps tinted toward dusk.

import { Canvas, hex, rng } from './pixel.mjs';

export const P = {
  ink: hex('#1b1420'),
  parch: hex('#f4e8c8'),
  parchShade: hex('#d9c594'),
  parchDark: hex('#b39b6e'),
  gold: hex('#f2c14e'),
  goldDark: hex('#c8902a'),
  herb: hex('#6bcb77'),
  // grass / leaves
  grass: hex('#3f6b52'),
  grassLight: hex('#4f8060'),
  grassDark: hex('#325845'),
  // packed earth path
  dirt: hex('#7a6248'),
  dirtLight: hex('#937a5c'),
  dirtDark: hex('#5a4630'),
  // stone (also the iron-grey armory roof)
  stone: hex('#7d7896'),
  stoneLight: hex('#9a95b3'),
  stoneDark: hex('#5e5a78'),
  mortar: hex('#454060'),
  // wood (dirtDark doubles as the darkest plank)
  wood: hex('#8a5a3c'),
  woodLight: hex('#a8714a'),
  woodDark: hex('#3d2c24'),
  // roofs
  slate: hex('#5b4b9e'),
  slateLight: hex('#7565b8'),
  slateDark: hex('#43387a'),
  terra: hex('#c8553a'),
  terraLight: hex('#e8643c'),
  terraDark: hex('#9a3f2c'),
  // water (also the teal library roof)
  water: hex('#2f6f9e'),
  waterLight: hex('#4fb8e8'),
  waterDark: hex('#1f4f78'),
};

const T = 32;

const pick = (random, list) => list[Math.floor(random() * list.length)];

// ---------- ground ----------

const grassTile = (seed, { flowers = false } = {}) => {
  const r = rng(seed);
  const c = new Canvas(T, T);
  c.rect(0, 0, T - 1, T - 1, P.grass);
  c.speckle(0, 0, T - 1, T - 1, P.grassDark, 0.14, r);
  c.speckle(0, 0, T - 1, T - 1, P.grassLight, 0.1, r);
  for (let i = 0; i < 7; i += 1) {
    const x = Math.floor(r() * 30) + 1;
    const y = Math.floor(r() * 28) + 2;
    c.vline(x, y, y + 1, P.grassLight);
    c.px(x + 1, y - 1, P.grassLight);
  }
  if (flowers) {
    for (let i = 0; i < 4; i += 1) {
      const x = Math.floor(r() * 26) + 3;
      const y = Math.floor(r() * 26) + 3;
      c.px(x, y, pick(r, [P.gold, P.parch]));
      c.px(x, y + 1, P.grassDark);
    }
  }
  return c;
};

const pathTile = (seed) => {
  const r = rng(seed);
  const c = new Canvas(T, T);
  c.rect(0, 0, T - 1, T - 1, P.dirt);
  c.speckle(0, 0, T - 1, T - 1, P.dirtLight, 0.14, r);
  c.speckle(0, 0, T - 1, T - 1, P.dirtDark, 0.08, r);
  for (let i = 0; i < 4; i += 1) {
    const x = Math.floor(r() * 27) + 2;
    const y = Math.floor(r() * 27) + 2;
    c.rect(x, y, x + 1, y, P.stoneLight);
    c.px(x, y + 1, P.dirtDark);
    c.px(x + 1, y + 1, P.dirtDark);
  }
  return c;
};

/** Brick-bond stones: used for the plaza floor and stone walls. */
const stoneBond = (seed, { bw, bh, base, light, dark, mortar }) => {
  const r = rng(seed);
  const c = new Canvas(T, T);
  c.rect(0, 0, T - 1, T - 1, mortar);
  for (let row = 0; row * bh < T; row += 1) {
    const offset = row % 2 ? bw / 2 : 0;
    for (let col = -1; col * bw < T; col += 1) {
      const x0 = col * bw + offset;
      const y0 = row * bh;
      const tone = r() < 0.2 ? dark : base;
      for (let y = y0; y < y0 + bh - 1; y += 1) {
        for (let x = x0; x < x0 + bw - 1; x += 1) c.px(((x % T) + T) % T, y, tone);
      }
      for (let x = x0; x < x0 + bw - 1; x += 1) c.px(((x % T) + T) % T, y0, light);
    }
  }
  return c;
};

// ---------- building materials ----------

const plasterTile = (seed, { timber = true } = {}) => {
  const r = rng(seed);
  const c = new Canvas(T, T);
  c.rect(0, 0, T - 1, T - 1, P.parch);
  c.speckle(0, 0, T - 1, T - 1, P.parchShade, 0.07, r);
  c.rect(0, 28, T - 1, T - 1, P.parchShade);
  if (timber) {
    // Beams on the left and top edges: tiled, they form a half-timber grid.
    c.rect(0, 0, 3, T - 1, P.wood);
    c.vline(3, 0, T - 1, P.dirtDark);
    c.vline(0, 0, T - 1, P.woodLight);
    c.rect(0, 0, T - 1, 3, P.wood);
    c.hline(0, T - 1, 3, P.dirtDark);
    c.hline(4, T - 1, 0, P.woodLight);
  }
  return c;
};

const roofTile = (seed, { base, light, dark }) => {
  const r = rng(seed);
  const c = new Canvas(T, T);
  c.rect(0, 0, T - 1, T - 1, base);
  for (let row = 0; row < 4; row += 1) {
    const y0 = row * 8;
    const offset = row % 2 ? 4 : 0;
    c.hline(0, T - 1, y0, light);
    c.hline(0, T - 1, y0 + 7, dark);
    for (let x = offset; x < T + 8; x += 8) {
      c.vline(x % T, y0 + 1, y0 + 7, dark);
      if (r() < 0.25) c.rect((x + 2) % T, y0 + 2, (x + 4) % T, y0 + 3, light);
    }
  }
  return c;
};

const door = () => {
  const c = new Canvas(T, 64);
  c.rect(2, 4, 29, 63, P.woodDark);
  c.rect(4, 6, 27, 63, P.wood);
  // Arched top.
  for (const [x, y] of [
    [2, 4],
    [3, 4],
    [2, 5],
    [28, 4],
    [29, 4],
    [29, 5],
  ])
    c.clear(x, y);
  for (let x = 6; x <= 26; x += 5) c.vline(x, 8, 63, P.dirtDark);
  c.hline(4, 27, 6, P.woodLight);
  c.vline(4, 6, 63, P.woodLight);
  c.rect(4, 22, 27, 23, P.mortar);
  c.rect(4, 48, 27, 49, P.mortar);
  c.rect(21, 34, 23, 37, P.gold);
  c.px(22, 38, P.goldDark);
  c.rect(0, 62, 31, 63, P.stoneDark);
  return c;
};

/** Lit window. Rendered unlit so it glows at dusk and feeds the bloom pass. */
const windowLit = () => {
  const c = new Canvas(T, T);
  c.rect(6, 4, 25, 27, P.woodDark);
  c.rect(8, 6, 23, 25, P.gold);
  c.rect(10, 8, 21, 16, P.parch);
  c.rect(8, 20, 23, 25, P.goldDark);
  c.vline(15, 6, 25, P.woodDark);
  c.vline(16, 6, 25, P.woodDark);
  c.hline(8, 23, 15, P.woodDark);
  c.rect(4, 27, 27, 28, P.wood);
  return c;
};

const sign = (glyph) => {
  const c = new Canvas(T, T);
  c.vline(15, 0, 5, P.mortar);
  c.vline(16, 0, 5, P.mortar);
  c.rect(5, 6, 26, 27, P.woodDark);
  c.rect(6, 7, 25, 26, P.wood);
  c.hline(6, 25, 7, P.woodLight);
  glyph.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '#') c.px(10 + x, 11 + y, P.gold);
    });
  });
  return c;
};

const GLYPHS = {
  // banner (Guild Hall), sword (Armory), book (Library), letter (Post Office)
  hall: [
    '.##########.',
    '.##########.',
    '.###.##.###.',
    '.##########.',
    '.##########.',
    '.####..####.',
    '.###....###.',
    '.##......##.',
    '.#........#.',
    '............',
    '............',
    '............',
  ],
  sword: [
    '..........##',
    '.........##.',
    '........##..',
    '.......##...',
    '......##....',
    '.....##.....',
    '.#..##......',
    '.####.......',
    '..##........',
    '.####.......',
    '##..#.......',
    '#...........',
  ],
  book: [
    '............',
    '.####..####.',
    '#....##....#',
    '#.##.##.##.#',
    '#....##....#',
    '#.##.##.##.#',
    '#....##....#',
    '#.##.##.##.#',
    '#....##....#',
    '.####..####.',
    '.....##.....',
    '............',
  ],
  letter: [
    '............',
    '############',
    '##........##',
    '#.#......#.#',
    '#..#....#..#',
    '#...#..#...#',
    '#....##....#',
    '#..........#',
    '#..........#',
    '############',
    '............',
    '............',
  ],
};

// ---------- props ----------

const tree = (seed) => {
  const r = rng(seed);
  const c = new Canvas(64, 96);
  c.rect(28, 62, 35, 93, P.wood);
  c.vline(28, 62, 93, P.woodLight);
  c.rect(34, 62, 35, 93, P.woodDark);
  c.rect(25, 90, 38, 93, P.wood);
  c.rect(36, 90, 38, 93, P.woodDark);
  const blobs = [
    [32, 46, 24, 20],
    [20, 38, 16, 15],
    [44, 40, 16, 15],
    [32, 26, 19, 17],
    [24, 54, 14, 10],
    [42, 55, 13, 9],
  ];
  for (const [cx, cy, rx, ry] of blobs) c.ellipse(cx, cy, rx, ry, P.grassDark);
  for (const [cx, cy, rx, ry] of blobs) c.ellipse(cx - 2, cy - 3, rx - 3, ry - 3, P.grass);
  for (const [cx, cy, rx, ry] of blobs.slice(0, 4))
    c.ellipse(cx - 5, cy - 7, rx - 9, ry - 9, P.grassLight);
  for (let i = 0; i < 26; i += 1) {
    const x = Math.floor(r() * 44) + 10;
    const y = Math.floor(r() * 44) + 12;
    if (c.alpha(x, y)) c.px(x, y, r() < 0.3 ? P.herb : P.grassDark);
  }
  return c.outline(P.ink);
};

const bush = (seed) => {
  const r = rng(seed);
  const c = new Canvas(T, T);
  c.ellipse(16, 21, 13, 9, P.grassDark);
  c.ellipse(14, 19, 10, 7, P.grass);
  c.ellipse(11, 16, 5, 3, P.grassLight);
  for (let i = 0; i < 5; i += 1) {
    const x = Math.floor(r() * 20) + 6;
    const y = Math.floor(r() * 10) + 14;
    if (c.alpha(x, y)) c.px(x, y, P.herb);
  }
  return c.outline(P.ink);
};

const lanternPost = () => {
  const c = new Canvas(16, 64);
  c.rect(7, 18, 8, 61, P.mortar);
  c.vline(7, 18, 61, P.stoneDark);
  c.rect(5, 60, 10, 62, P.stoneDark);
  c.rect(4, 6, 11, 17, P.mortar); // lamp housing
  c.rect(5, 8, 10, 15, P.goldDark); // dim pane; the flame sprite covers it
  c.rect(3, 4, 12, 5, P.stoneDark);
  c.rect(6, 2, 9, 3, P.mortar);
  return c.outline(P.ink);
};

/** Just the bright pane, drawn unlit over the post so it reads as a light. */
const lanternFlame = () => {
  const c = new Canvas(16, 16);
  c.rect(5, 4, 10, 11, P.gold);
  c.rect(6, 5, 9, 9, P.parch);
  c.rect(5, 10, 10, 11, P.terraLight);
  return c;
};

const signpost = () => {
  const c = new Canvas(T, 48);
  c.rect(15, 8, 16, 45, P.wood);
  c.vline(15, 8, 45, P.woodLight);
  c.rect(12, 44, 19, 45, P.woodDark);
  // Two boards pointing opposite ways.
  c.rect(6, 10, 27, 17, P.wood);
  c.hline(6, 27, 10, P.woodLight);
  c.rect(28, 12, 29, 15, P.wood);
  c.px(30, 13, P.wood);
  c.px(30, 14, P.wood);
  c.hline(9, 24, 13, P.parch);
  c.rect(4, 22, 25, 29, P.wood);
  c.hline(4, 25, 22, P.woodLight);
  c.rect(2, 24, 3, 27, P.wood);
  c.px(1, 25, P.wood);
  c.px(1, 26, P.wood);
  c.hline(7, 22, 25, P.parch);
  return c.outline(P.ink);
};

const questBoard = () => {
  const c = new Canvas(96, 72);
  // Posts and a small slate roof.
  c.rect(8, 16, 13, 69, P.wood);
  c.rect(82, 16, 87, 69, P.wood);
  c.vline(8, 16, 69, P.woodLight);
  c.vline(82, 16, 69, P.woodLight);
  c.rect(12, 16, 13, 69, P.woodDark);
  c.rect(86, 16, 87, 69, P.woodDark);
  c.rect(2, 8, 93, 15, P.slate);
  c.hline(2, 93, 8, P.slateLight);
  c.hline(2, 93, 15, P.slateDark);
  for (let x = 6; x < 93; x += 8) c.vline(x, 9, 14, P.slateDark);
  c.rect(6, 4, 89, 7, P.slateDark);
  // Board.
  c.rect(14, 20, 81, 56, P.dirtDark);
  c.rect(16, 22, 79, 54, P.wood);
  c.hline(16, 79, 22, P.woodLight);
  for (let x = 28; x < 79; x += 13) c.vline(x, 23, 54, P.dirtDark);
  // Pinned notes: the quests.
  const notes = [
    [19, 25, 14, 16],
    [36, 24, 12, 13],
    [51, 26, 13, 17],
    [66, 24, 11, 13],
    [35, 40, 13, 12],
    [66, 40, 11, 12],
  ];
  notes.forEach(([x, y, w, h], index) => {
    c.rect(x, y, x + w - 1, y + h - 1, P.parch);
    c.hline(x, x + w - 1, y + h - 1, P.parchShade);
    c.vline(x + w - 1, y, y + h - 1, P.parchShade);
    for (let line = 3; line < h - 2; line += 3)
      c.hline(x + 2, x + w - 3 - (line % 2), y + line, P.parchDark);
    c.px(x + Math.floor(w / 2), y, index === 2 ? P.gold : P.terra);
  });
  c.rect(55, 37, 58, 40, P.gold); // seal on the featured quest
  c.px(56, 41, P.goldDark);
  return c.outline(P.ink);
};

const fountain = (frame) => {
  const r = rng(40 + frame);
  const c = new Canvas(96, 80);
  // Basin: a squat stone ring seen from the front.
  c.ellipse(48, 62, 44, 14, P.mortar);
  c.ellipse(48, 59, 44, 13, P.stone);
  c.ellipse(48, 57, 39, 10, P.waterDark);
  c.ellipse(48, 56, 37, 9, P.water);
  for (let i = 0; i < 16; i += 1) {
    const x = Math.floor(r() * 66) + 15;
    const y = Math.floor(r() * 12) + 50;
    if (c.get(x, y)[2] === P.water[2]) c.hline(x, x + 2, y, P.waterLight);
  }
  c.rect(4, 60, 91, 67, P.stone);
  c.ellipse(48, 68, 44, 8, P.stone);
  c.hline(6, 89, 60, P.stoneLight);
  for (let x = 10; x < 90; x += 11) c.vline(x, 61, 72, P.stoneDark);
  c.ellipse(48, 73, 40, 4, P.stoneDark);
  // Pillar and upper bowl.
  c.rect(44, 26, 51, 56, P.stone);
  c.vline(44, 26, 56, P.stoneLight);
  c.rect(50, 26, 51, 56, P.stoneDark);
  c.ellipse(48, 25, 15, 5, P.stoneDark);
  c.ellipse(48, 23, 15, 4, P.stone);
  c.ellipse(48, 22, 11, 2, P.water);
  c.rect(46, 10, 49, 21, P.stoneLight);
  c.px(47 + frame, 8, P.waterLight);
  // Falling water.
  for (const x of [35, 60]) {
    for (let y = 25; y < 54; y += 1) if ((y + frame * 2) % 4 < 2) c.px(x, y, P.waterLight);
  }
  return c.outline(P.ink);
};

const gatePost = () => {
  const c = new Canvas(T, 96);
  const body = stoneBond(77, {
    bw: 16,
    bh: 8,
    base: P.stone,
    light: P.stoneLight,
    dark: P.stoneDark,
    mortar: P.mortar,
  });
  for (let y = 16; y < 94; y += 1) for (let x = 5; x < 27; x += 1) c.px(x, y, body.get(x, y % T));
  c.rect(2, 10, 29, 16, P.stoneDark);
  c.hline(2, 29, 10, P.stoneLight);
  c.rect(6, 4, 25, 9, P.stone);
  c.hline(6, 25, 4, P.stoneLight);
  c.rect(3, 90, 28, 94, P.stoneDark);
  // Small gold pennant.
  c.rect(12, 26, 19, 44, P.gold);
  c.hline(12, 19, 26, P.goldDark);
  c.px(12, 44, P.ink);
  c.px(19, 44, P.ink);
  c.clear(15, 44);
  c.clear(16, 44);
  c.clear(15, 43);
  c.clear(16, 43);
  return c.outline(P.ink);
};

const marker = (kind) => {
  const c = new Canvas(16, 16);
  if (kind === 'exclaim') {
    c.rect(6, 2, 9, 9, P.gold);
    c.rect(6, 12, 9, 14, P.gold);
    c.vline(9, 2, 9, P.goldDark);
    c.vline(9, 12, 14, P.goldDark);
  } else if (kind === 'check') {
    for (const [x, y] of [
      [3, 8],
      [4, 9],
      [5, 10],
      [6, 11],
      [7, 10],
      [8, 9],
      [9, 8],
      [10, 7],
      [11, 6],
      [12, 5],
    ]) {
      c.rect(x, y, x, y + 2, P.herb);
    }
  } else if (kind === 'cross') {
    // "can't walk there"
    for (let i = 3; i <= 12; i += 1) {
      c.rect(i, i, i + 1, i, P.terraLight);
      c.rect(15 - i - 1, i, 15 - i, i, P.terraLight);
    }
  } else {
    // talk: a small speech bubble
    c.rect(2, 3, 13, 10, P.parch);
    c.rect(4, 11, 6, 12, P.parch);
    c.px(4, 13, P.parch);
    for (const x of [5, 8, 11]) c.rect(x - 1, 6, x, 7, P.ink);
  }
  return c.outline(P.ink);
};

/** 16x16 emblem: a shield with an "A". Doubles as the favicon. */
export const emblem = () => {
  const c = new Canvas(16, 16);
  const night = hex('#1a1433');
  c.rect(2, 1, 13, 9, P.gold);
  c.rect(3, 10, 12, 11, P.gold);
  c.rect(4, 12, 11, 12, P.gold);
  c.rect(5, 13, 10, 13, P.gold);
  c.rect(7, 14, 8, 14, P.gold);
  c.rect(3, 2, 12, 9, night);
  c.rect(4, 10, 11, 10, night);
  c.rect(5, 11, 10, 11, night);
  c.rect(6, 12, 9, 12, night);
  // "A"
  c.rect(7, 3, 8, 3, P.parch);
  c.rect(6, 4, 9, 4, P.parch);
  c.rect(5, 5, 6, 9, P.parch);
  c.rect(9, 5, 10, 9, P.parch);
  c.rect(7, 7, 8, 7, P.parch);
  return c;
};

export const buildWorldSprites = () => {
  const stoneWall = {
    bw: 16,
    bh: 8,
    base: P.stone,
    light: P.stoneLight,
    dark: P.stoneDark,
    mortar: P.mortar,
  };
  const cobble = {
    bw: 8,
    bh: 8,
    base: P.stone,
    light: P.stoneLight,
    dark: P.stoneDark,
    mortar: P.mortar,
  };
  const brick = {
    bw: 16,
    bh: 8,
    base: P.terra,
    light: P.terraLight,
    dark: P.terraDark,
    mortar: P.parchDark,
  };
  const tile = (name, canvas) => ({ name, canvas, extrude: true });
  return [
    tile('tile/grass-a', grassTile(1)),
    tile('tile/grass-b', grassTile(2)),
    tile('tile/grass-c', grassTile(3, { flowers: true })),
    tile('tile/path-a', pathTile(4)),
    tile('tile/path-b', pathTile(5)),
    tile('tile/plaza-a', stoneBond(6, cobble)),
    tile('tile/plaza-b', stoneBond(7, cobble)),
    tile('wall/plaster', plasterTile(8)),
    tile('wall/plaster-plain', plasterTile(9, { timber: false })),
    tile('wall/stone', stoneBond(10, stoneWall)),
    tile('wall/brick', stoneBond(11, brick)),
    tile('roof/slate', roofTile(12, { base: P.slate, light: P.slateLight, dark: P.slateDark })),
    tile('roof/terra', roofTile(13, { base: P.terra, light: P.terraLight, dark: P.terraDark })),
    tile('roof/teal', roofTile(14, { base: P.water, light: P.waterLight, dark: P.waterDark })),
    tile('roof/iron', roofTile(15, { base: P.stoneDark, light: P.stone, dark: P.mortar })),
    { name: 'prop/door', canvas: door() },
    { name: 'prop/window', canvas: windowLit() },
    { name: 'sign/guild-hall', canvas: sign(GLYPHS.hall) },
    { name: 'sign/armory', canvas: sign(GLYPHS.sword) },
    { name: 'sign/library', canvas: sign(GLYPHS.book) },
    { name: 'sign/post-office', canvas: sign(GLYPHS.letter) },
    { name: 'prop/tree-a', canvas: tree(21) },
    { name: 'prop/tree-b', canvas: tree(22) },
    { name: 'prop/bush', canvas: bush(23) },
    { name: 'prop/lantern-post', canvas: lanternPost() },
    { name: 'prop/lantern-flame', canvas: lanternFlame() },
    { name: 'prop/signpost', canvas: signpost() },
    { name: 'prop/quest-board', canvas: questBoard() },
    { name: 'prop/fountain-0', canvas: fountain(0) },
    { name: 'prop/fountain-1', canvas: fountain(1) },
    { name: 'prop/gate-post', canvas: gatePost() },
    { name: 'marker/exclaim', canvas: marker('exclaim') },
    { name: 'marker/check', canvas: marker('check') },
    { name: 'marker/talk', canvas: marker('talk') },
    { name: 'marker/cross', canvas: marker('cross') },
  ];
};

export const worldAnimations = {
  'prop/fountain': { frames: ['prop/fountain-0', 'prop/fountain-1'], fps: 4, loop: true },
};
