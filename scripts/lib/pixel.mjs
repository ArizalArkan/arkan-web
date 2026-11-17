// Tiny pixel-art toolkit for the asset generator: an RGBA canvas, a seeded
// RNG, a PNG encoder (zlib only, no dependencies) and a shelf atlas packer.

import zlib from 'node:zlib';

export const hex = (value) => {
  const n = parseInt(value.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
};

/** Deterministic RNG so the atlas is byte-identical on every run. */
export const rng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  px(x, y, color) {
    if (!color || !this.inside(x, y)) return;
    this.data.set(color, (y * this.w + x) * 4);
  }

  get(x, y) {
    if (!this.inside(x, y)) return [0, 0, 0, 0];
    const i = (y * this.w + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
  }

  alpha(x, y) {
    return this.inside(x, y) ? this.data[(y * this.w + x) * 4 + 3] : 0;
  }

  clear(x, y) {
    if (this.inside(x, y)) this.data.fill(0, (y * this.w + x) * 4, (y * this.w + x) * 4 + 4);
  }

  /** Inclusive rectangle x0..x1, y0..y1. */
  rect(x0, y0, x1, y1, color) {
    for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) this.px(x, y, color);
  }

  hline(x0, x1, y, color) {
    this.rect(x0, y, x1, y, color);
  }

  vline(x, y0, y1, color) {
    this.rect(x, y0, x, y1, color);
  }

  /** Filled ellipse centered on (cx, cy). */
  ellipse(cx, cy, rx, ry, color) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.px(x, y, color);
      }
    }
  }

  /** Sprinkle `color` over already-opaque pixels in a rect with probability p. */
  speckle(x0, y0, x1, y1, color, p, random) {
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        if (this.alpha(x, y) && random() < p) this.px(x, y, color);
      }
    }
  }

  blit(src, dx, dy) {
    for (let y = 0; y < src.h; y += 1) {
      for (let x = 0; x < src.w; x += 1) {
        const c = src.get(x, y);
        if (c[3]) this.px(dx + x, dy + y, c);
      }
    }
  }

  flippedX() {
    const out = new Canvas(this.w, this.h);
    for (let y = 0; y < this.h; y += 1) {
      for (let x = 0; x < this.w; x += 1) out.px(this.w - 1 - x, y, this.get(x, y));
    }
    return out;
  }

  /** 1 px outline around every opaque shape (DESIGN.md §3.4: ink-900, not black). */
  outline(color) {
    const edge = [];
    for (let y = 0; y < this.h; y += 1) {
      for (let x = 0; x < this.w; x += 1) {
        if (this.alpha(x, y)) continue;
        if (
          this.alpha(x - 1, y) ||
          this.alpha(x + 1, y) ||
          this.alpha(x, y - 1) ||
          this.alpha(x, y + 1)
        ) {
          edge.push([x, y]);
        }
      }
    }
    for (const [x, y] of edge) this.px(x, y, color);
    return this;
  }

  /** Integer nearest-neighbour upscale. */
  scaled(factor) {
    const out = new Canvas(this.w * factor, this.h * factor);
    for (let y = 0; y < out.h; y += 1) {
      for (let x = 0; x < out.w; x += 1) {
        out.px(x, y, this.get(Math.floor(x / factor), Math.floor(y / factor)));
      }
    }
    return out;
  }

  colors() {
    const set = new Set();
    for (let i = 0; i < this.data.length; i += 4) {
      if (this.data[i + 3])
        set.add((this.data[i] << 16) | (this.data[i + 1] << 8) | this.data[i + 2]);
    }
    return set;
  }
}

// ---------- PNG ----------

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, body) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0);
  return Buffer.concat([head, body, crc]);
};

export const encodePng = (canvas) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(canvas.w, 0);
  header.writeUInt32BE(canvas.h, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA
  const stride = canvas.w * 4;
  const raw = Buffer.alloc((stride + 1) * canvas.h);
  for (let y = 0; y < canvas.h; y += 1) {
    raw[y * (stride + 1)] = 0;
    raw.set(canvas.data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// ---------- atlas ----------

const PADDING = 2;

/**
 * Shelf-pack sprites into a power-of-two atlas with 2 px padding. Tiles get
 * a 1 px edge extrude so neighbours never bleed (DESIGN.md §5.3).
 * @param {{ name: string, canvas: Canvas, extrude?: boolean }[]} sprites
 */
export const packAtlas = (sprites, size) => {
  const atlas = new Canvas(size, size);
  const frames = {};
  const sorted = [...sprites].sort(
    (a, b) => b.canvas.h - a.canvas.h || a.name.localeCompare(b.name),
  );
  let x = PADDING;
  let y = PADDING;
  let shelf = 0;
  for (const { name, canvas, extrude } of sorted) {
    if (x + canvas.w + PADDING > size) {
      x = PADDING;
      y += shelf + PADDING;
      shelf = 0;
    }
    if (y + canvas.h + PADDING > size) throw new Error(`Atlas ${size} is too small for ${name}`);
    if (extrude) {
      for (let i = 0; i < canvas.w; i += 1) {
        atlas.px(x + i, y - 1, canvas.get(i, 0));
        atlas.px(x + i, y + canvas.h, canvas.get(i, canvas.h - 1));
      }
      for (let j = -1; j <= canvas.h; j += 1) {
        const sy = Math.min(Math.max(j, 0), canvas.h - 1);
        atlas.px(x - 1, y + j, canvas.get(0, sy));
        atlas.px(x + canvas.w, y + j, canvas.get(canvas.w - 1, sy));
      }
    }
    atlas.blit(canvas, x, y);
    frames[name] = { x, y, w: canvas.w, h: canvas.h };
    x += canvas.w + PADDING;
    shelf = Math.max(shelf, canvas.h);
  }
  return { atlas, frames };
};
