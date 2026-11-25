// Generates every pixel-art asset in the project from code:
//   node scripts/build-sprites.mjs      (or: npm run assets)
// Output is deterministic, so the PNGs can be committed and re-built freely.
// All art is original to this project (see public/assets/LICENSES.md).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCharacter, characterAnimations } from './lib/characters.mjs';
import { Canvas, encodePng, hex, packAtlas } from './lib/pixel.mjs';
import { buildBanners } from './lib/banners.mjs';
import { buildScene } from './lib/scene.mjs';
import { buildWorldSprites, emblem, worldAnimations } from './lib/world.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/assets/sprites');
// Atlas metadata is imported by the world code, so it lives in src/.
const metaDir = path.join(root, 'src/world/atlases');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(metaDir, { recursive: true });

const MAX_COLORS = 32;

// Hero: the owner as drawn in his portrait. Black spiky hair, glasses,
// black hoodie with lime drawstrings.
const heroLook = {
  skin: hex('#f0c8a0'),
  skinShade: hex('#d09a78'),
  hair: hex('#2a2233'),
  hairLight: hex('#453d55'),
  top: hex('#342c40'),
  topLight: hex('#4a4159'),
  topDark: hex('#221c2b'),
  accent: hex('#6bcb77'),
  legs: hex('#3d4a78'),
  legsDark: hex('#2c3558'),
  shoes: hex('#f4e8c8'),
  lens: hex('#b9a9d9'),
};

// Wren, the town guide: teal robe, wide slate hat, auburn hair.
const wrenLook = {
  skin: hex('#f0c8a0'),
  skinShade: hex('#d09a78'),
  hair: hex('#c8553a'),
  hairLight: hex('#e8643c'),
  top: hex('#2f6f9e'),
  topLight: hex('#4fb8e8'),
  topDark: hex('#1f4f78'),
  accent: hex('#f2c14e'),
  legs: hex('#2f6f9e'),
  legsDark: hex('#1f4f78'),
  shoes: hex('#5a4630'),
  robe: true,
  hat: { base: hex('#5b4b9e'), light: hex('#7565b8'), dark: hex('#43387a'), band: hex('#f2c14e') },
};

const write = (name, { atlas, frames }, animations) => {
  const colors = atlas.colors().size;
  if (colors > MAX_COLORS) throw new Error(`${name}: ${colors} colors, the limit is ${MAX_COLORS}`);
  fs.writeFileSync(path.join(outDir, `${name}.png`), encodePng(atlas));
  fs.writeFileSync(
    path.join(metaDir, `${name}.json`),
    `${JSON.stringify({ image: `/assets/sprites/${name}.png`, size: { w: atlas.w, h: atlas.h }, ppu: 32, frames, animations }, null, 2)}\n`,
  );
  console.log(
    `${name}.png  ${atlas.w}x${atlas.h}  ${Object.keys(frames).length} frames  ${colors} colors`,
  );
};

const characterSprites = [
  ...buildCharacter('hero', heroLook),
  ...buildCharacter('wren', wrenLook, ['idle']),
];
const worldSprites = buildWorldSprites();

write('characters', packAtlas(characterSprites, 256), {
  ...characterAnimations('hero'),
  ...characterAnimations('wren', ['idle']),
});

write('world', packAtlas(worldSprites, 512), worldAnimations);

// Quick Read header layers (DESIGN.md §8.5).
const byName = (list) => (name) => {
  const found = list.find((entry) => entry.name === name);
  if (!found) throw new Error(`Missing sprite ${name}`);
  return found.canvas;
};
const sceneDir = path.join(root, 'public/assets/scene');
fs.mkdirSync(sceneDir, { recursive: true });
for (const [name, canvas] of Object.entries(
  buildScene(byName(worldSprites), byName(characterSprites)),
)) {
  fs.writeFileSync(path.join(sceneDir, `${name}.png`), encodePng(canvas));
}
for (const [name, canvas] of Object.entries(buildBanners(byName(worldSprites)))) {
  fs.writeFileSync(path.join(sceneDir, `${name}.png`), encodePng(canvas));
}
console.log('scene layers and chapter banners for Quick Read');

// Favicon and app icons from the 16x16 emblem, integer scales only.
const mark = emblem();
const iconOn = (size, scale) => {
  const canvas = new Canvas(size, size);
  canvas.rect(0, 0, size - 1, size - 1, hex('#0f0b1e'));
  const art = mark.scaled(scale);
  canvas.blit(art, Math.floor((size - art.w) / 2), Math.floor((size - art.h) / 2));
  return canvas;
};
fs.writeFileSync(path.join(root, 'public/favicon-16.png'), encodePng(mark));
fs.writeFileSync(path.join(root, 'public/favicon-32.png'), encodePng(mark.scaled(2)));
fs.writeFileSync(path.join(root, 'public/apple-touch-icon.png'), encodePng(iconOn(180, 9)));
fs.writeFileSync(path.join(root, 'public/icon-512.png'), encodePng(iconOn(512, 24)));
console.log('favicon-16/32, apple-touch-icon (180), icon-512');
