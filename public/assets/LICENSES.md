# Asset licenses

Every file under `public/assets/` is listed here. Nothing in this project is
taken from a commercial game.

| File(s) | What | Source | License / status |
|---|---|---|---|
| `arkanava.webp` | Pixel-art portrait of the owner | Supplied by the owner (previous site) | Owner's asset. TODO(owner): confirm origin and usage rights |
| `arkan.png` | Owner image from the previous site (currently unused) | Supplied by the owner | Owner's asset |
| `banksaqu.webp`, `altaraone.webp`, `ruparupacom.webp`, `vision+.webp`, `indihome.webp`, `dataexchange.webp`, `palapaone.webp` | Project preview images | Supplied by the owner (previous site) | Owner's screenshots of products they worked on. Product names and logos belong to their owners |
| `ruparupa.png`, `telkom.png`, `vision.png` | Company logos (currently unused) | Supplied by the owner (previous site) | Trademarks of their owners; nominative use only |

## Generated pixel art

| File(s) | What | Source | License / status |
|---|---|---|---|
| `sprites/characters.png` (metadata in `src/world/atlases/characters.json`) | Hero (idle, walk, 4 directions) and Wren the guide (idle, 4 directions) | Drawn in code by `scripts/build-sprites.mjs` for this project | Original work, owned by the project. Placeholder quality: replace with hand-drawn sprites when available |
| `sprites/world.png` (metadata in `src/world/atlases/world.json`) | Ground tiles, wall and roof materials, door, window, signs, trees, bush, lantern, signpost, quest board, fountain, gate post, markers | Same generator | Original work, owned by the project. Placeholder quality |
| `/favicon-16.png`, `/favicon-32.png`, `/apple-touch-icon.png`, `/icon-512.png` | Shield emblem with an "A" | Same generator | Original work, owned by the project |

No sprite, tile, font or sound comes from a commercial game. Sound effects are
synthesized at runtime (`src/services/audio.ts`), so there are no audio files.

## Fonts (bundled from npm, not in this folder)

| Font | Package | License |
|---|---|---|
| Press Start 2P | `@fontsource/press-start-2p` | SIL Open Font License 1.1 |
| Pixelify Sans | `@fontsource-variable/pixelify-sans` | SIL Open Font License 1.1 |
| Crimson Pro | `@fontsource-variable/crimson-pro` | SIL Open Font License 1.1 |
| JetBrains Mono | `@fontsource-variable/jetbrains-mono` | SIL Open Font License 1.1 |

## Quick Read scene and music

| File(s) | What | Source | License / status |
|---|---|---|---|
| `scene/far.png`, `scene/mid.png`, `scene/near.png`, `scene/ground.png`, `scene/moon.png`, `scene/hero-*.png`, `scene/wren-idle.png` | Layers and sprite strips for the Quick Read header diorama | Drawn in code by `scripts/lib/scene.mjs`, reusing the town's own sprites | Original work, owned by the project |
| (no file) "Dusk over Arkan Journey" | 16-bar background chiptune loop | Composed for this project in `src/services/song.ts`, synthesized at runtime by `src/services/music.ts` | Original work, owned by the project |
