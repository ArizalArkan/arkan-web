# Neo-Brutalist 3D Rework — Design System + Hero

**Date:** 2026-08-19
**Status:** Approved, not yet implemented
**Scope:** Phase 1 — design-system foundation, Navbar, Hero. About / Experience / Footer are explicitly out of scope.

---

## 1. Goal

Rework the portfolio's visual language from its current dark, soft, gradient-driven style into **neo-brutalism** — cream paper, 3px black borders, hard offset shadows, saturated color blocks, heavy display type — while **keeping every existing 3D asset and the R3F scene graph intact**.

The unifying concept: the 3D hacker-room scene is framed as a **retro desktop OS window** punched into the paper, and the smaller 3D objects (cube, ring, React logo) **escape that window frame** onto the cream page. The 3D subject is a computer, so the window chrome is thematically earned rather than decorative.

### Non-goals
- Converting About, Experience, or Footer (deferred to Phase 2)
- Adding new 3D models or new npm dependencies
- Touching `clientReviews`, `myProjects`, or the project-video carousel
- Any git commits — the user commits their own work

---

## 2. Design decisions (settled)

| Decision | Choice |
|---|---|
| Palette base | Light paper + color blocks |
| Hero layout | Retro OS window frame with escaping 3D objects |
| Accents | Playful 4-color: yellow / pink / lime / sky |
| Typography | Archivo Black (display) + Space Grotesk (body) + JetBrains Mono (chrome) |
| 3D treatment | Colored canvas panel + brighter lighting + black outline pass. Baked GLB textures preserved. |
| Corner radius | Sharp (`rounded-none`) throughout — not the 5px neobrutalism.dev rounding |
| Scope | Design system + Navbar + Hero only |

---

## 3. Design system

### 3.1 Tokens — `tailwind.config.js` (`theme.extend`)

Added alongside the existing `black`/`white` scales, which stay so the untouched dark sections keep compiling.

```
colors:
  paper:   DEFAULT #FDF6E3   2: #F5EFDC
  ink:     DEFAULT #0A0A0A
  nb:      yellow #FFD93D · pink #FF6B9D · lime #A8E10C · sky #7DD3FC

boxShadow:
  nb      4px 4px 0 0 #0A0A0A
  nb-lg   8px 8px 0 0 #0A0A0A
  nb-xl   12px 12px 0 0 #0A0A0A
  nb-pink 4px 4px 0 0 #FF6B9D
  nb-lime 4px 4px 0 0 #A8E10C
  nb-sky  4px 4px 0 0 #7DD3FC

borderWidth: 3 → '3px'

fontFamily:
  display: ['Archivo Black', 'sans-serif']
  sans:    ['Space Grotesk', 'sans-serif']
  mono:    ['JetBrains Mono', 'monospace']
```

The existing `generalsans` / `instrument` / `manrope` families remain registered — Phase 2 sections still reference them.

### 3.2 Fonts — `src/index.css`

Replace the General Sans / Instrument Serif imports with a **single** Google Fonts request loading only the weights used:
- Archivo Black (400 — its only weight)
- Space Grotesk (400, 500, 700)
- JetBrains Mono (400, 700)

Keep the Manrope import; Phase 2 sections depend on it.

### 3.3 Utilities — `src/index.css`, `@layer components`

Added **alongside** the existing `@layer utilities` block. Nothing existing is removed or renamed, so `.grid-container`, `.work-*`, `.btn`, `.hero_tag` etc. continue to serve the untouched sections.

| Class | Definition |
|---|---|
| `.nb-border` | `border-[3px] border-ink` |
| `.nb-card` | `.nb-border` + `bg-white` + `shadow-nb` |
| `.nb-btn` | `.nb-border`, `font-display uppercase tracking-tight`, `px-6 py-3`, `shadow-nb`, `transition-[transform,box-shadow] duration-150` |
| `.nb-btn:hover` | `translate-x-[4px] translate-y-[4px] shadow-none` — the shadow collapses under the button (physical press) |
| `.nb-btn:active` | `translate-x-[6px] translate-y-[6px]` |
| `.nb-badge` | `.nb-border`, `font-mono text-xs uppercase`, `px-3 py-1` |
| `.nb-window` | `.nb-border` + `shadow-nb-xl`, `bg-nb-sky` |
| `.nb-window-bar` | `bg-ink text-paper font-mono text-xs`, `border-b-[3px] border-ink`, flex row |
| `.nb-dot` | `w-3 h-3 border-2 border-paper` — square, not round |

**Motion rule:** every transition in this system is `duration-150` or faster with no easing curve softer than `ease-out`. Neo-brutalism reads as instant and physical; slow fades break it.

---

## 4. Navbar

- Cream background, `border-b-[3px] border-ink`, sticky at `top-0 z-50`
- `ArkDev` wordmark: black block, yellow Archivo Black type, `.nb-border`
- Nav links: `font-mono uppercase text-sm`. On hover, a lime block slides in behind the word (`relative` link, `absolute inset-0 bg-nb-lime -z-10 scale-x-0 → scale-x-100`, `origin-left`, 150ms)
- Mobile toggle: square `.nb-btn` in yellow
- Mobile sidebar: replaces the current `backdrop-blur` sheet with a cream `.nb-card` panel carrying `shadow-nb-lg`. The existing `isOpen` `max-h` transition pattern is retained.

### 4.1 Marquee strip

Directly beneath the navbar: a black full-bleed strip, `border-b-[3px] border-ink`, mono uppercase yellow text scrolling right-to-left:

`AVAILABLE FOR WORK ● REACT ● THREE.JS ● TAILWIND ● TYPESCRIPT ●`

- Implemented as a new `src/components/ui/Marquee.jsx` taking `items` and `speed`
- Pure CSS `@keyframes` on `translateX(-50%)` with the content duplicated twice — no JS ticker, no GSAP
- Wrapped in `@media (prefers-reduced-motion: reduce) { animation: none }`

---

## 5. Hero

### 5.1 Structure

```
<section id="home">
  ├─ Badge      .nb-badge on nb-yellow — GSAP language rotator lives here
  ├─ <h1>       Archivo Black, uppercase, clamp()-sized, with a lime
  │             marker block behind one word
  ├─ Subhead    Space Grotesk
  ├─ CTA row    yellow .nb-btn + white .nb-btn
  └─ 3D stage   (see 5.3)
</section>
```

### 5.2 Copy — provisional

All hero strings live in a single exported `heroContent` object in `src/constants/index.js` so final copy is a one-line change with no JSX edits. The user will supply final copy and CTA labels later; until then these defaults ship:

```js
export const heroContent = {
  greetings:  ['안녕하세요', 'こんにちは', 'Hola', 'Hi', 'Bonjour', 'Hai'],
  name:       "I'M ARKAN 👋",
  headline:   ['CRAFTING', 'DIGITAL', 'EXPERIENCES.'],  // array = one line per element
  highlight:  'DIGITAL',                                 // which word gets the lime marker
  subhead:    'Frontend developer building fast, accessible web experiences with React and Three.js.',
  ctaPrimary:   { label: 'SEE MY WORK', href: '#work' },
  ctaSecondary: { label: 'ABOUT ME',    href: '#about' },
};
```

`highlight` is matched against `headline` entries; if it matches nothing, no marker renders and the headline still displays correctly.

### 5.3 The 3D stage — escape mechanism

The defining detail. The canvas is **transparent and larger than the window frame**; the sky-blue fill is a plain DOM element sitting *behind* it. Objects positioned near the canvas edges therefore render over bare cream paper, genuinely overlapping and escaping the border.

```jsx
<div className="relative w-full">          {/* wrapper, generous padding */}

  {/* z-10 — the window, BEHIND the canvas */}
  <div className="absolute inset-x-8 inset-y-14 z-10 nb-window">
    <div className="nb-window-bar">
      <span className="nb-dot bg-nb-pink" />
      <span className="nb-dot bg-nb-yellow" />
      <span className="nb-dot bg-nb-lime" />
      <span>hacker-room.exe</span>
    </div>
  </div>

  {/* z-20 — transparent canvas, OVERFLOWS the window */}
  <Canvas className="absolute inset-0 z-20" gl={{ alpha: true }}>
    ...
  </Canvas>
</div>
```

Requirements:
- `<Canvas>` gets `gl={{ alpha: true }}` and **no** `scene.background` — WebGL clears to transparent
- The window div must not set `overflow: hidden` on the wrapper, or the escape is clipped
- The title bar renders beneath the canvas; 3D objects drifting across it is intended, not a defect
- Nothing in the window frame is interactive, so it needs no pointer handling; the canvas above it receives all pointer events (`HeroCamera`'s mouse-follow keeps working unchanged)

### 5.4 3D scene changes

| File | Change |
|---|---|
| `Hero.jsx` | `gl={{ alpha: true }}`; lighting relit for paper: `ambientLight intensity={2}`, `directionalLight position={[5,5,5]} intensity={1.5}`, plus a fill light from `[-5,2,-5]` at `0.6`. Current values (`ambient 1`, `directional 0.5` at origin) render the desk as a near-silhouette on a light ground. |
| `Cube.jsx`, `Ring.jsx`, `ReactLogo.jsx`, `Target.jsx` | Add drei's `<Outlines thickness={0.05} color="#0A0A0A" />` inside each mesh so the 3D carries the same black-border language as the DOM. **Verified: `Outlines` is present in the installed @react-three/drei 9.122.0 (`node_modules/@react-three/drei/core/Outlines.js`) — no new dependency.** |
| `Ring.jsx`, `Cube.jsx` | Recolor to `nb.pink` / `nb.yellow` |
| `constants/index.js` → `calculateSizes` | Retune `targetPosition`, `reactLogoPosition`, `cubePosition`, `ringPosition` so the floaters land **outside** the window rect at each breakpoint. This is the tuning-heavy step. |
| `HackerRoom.jsx` | No structural change; verify it reads correctly under the new lighting. |

`Target.jsx` currently has uncommitted working-tree changes — reconcile with those rather than overwriting them.

---

## 6. Scope guard — keeping Phase 2 sections alive

`body` background moves from `#18181a` to `paper` in `index.css`. To stop that from breaking the three untouched sections, `App.jsx` wraps them:

```jsx
<Navbar />
<Marquee />
<Hero />
<div className="bg-[#18181a]">      {/* Phase 2 boundary — remove when converted */}
  <About />
  <Experience />
  <Footer />
</div>
```

The result is a deliberate hard seam between the cream hero and the dark lower page. This is a known, temporary, visible mismatch — not a defect — and the comment marks it for removal in Phase 2.

`src/components/Button.jsx` is left untouched; About and Footer still consume it.

---

## 7. Responsive behavior

| Breakpoint | Behavior |
|---|---|
| `<768` (mobile) | Headline clamps to ~2.5rem; stage height ~340px; escaping objects pull in tight or hide entirely (they collide with text at this width); CTAs stack full-width; marquee speeds up |
| `768–1024` (tablet) | **The risk breakpoint.** Escaping objects are most likely to overlap the headline here. Stage height ~440px; floater positions get their own tuned values rather than interpolating between mobile and desktop |
| `>1024` (desktop) | Full design as specified; stage height ~560px; maximum escape offset |

The existing `useMediaQuery` + `calculateSizes` pattern is retained — only the position values change.

---

## 8. Files touched

**Modified**
- `tailwind.config.js` — tokens
- `src/index.css` — fonts, `@layer components` utilities, body background
- `src/App.jsx` — Marquee mount + Phase 2 wrapper
- `src/sections/Navbar.jsx` — rewrite
- `src/sections/Hero.jsx` — rewrite
- `src/constants/index.js` — `heroContent`, retuned `calculateSizes`
- `src/components/Cube.jsx`, `Ring.jsx`, `ReactLogo.jsx`, `Target.jsx` — outlines + recolor

**New**
- `src/components/ui/NbButton.jsx`
- `src/components/ui/NbBadge.jsx`
- `src/components/ui/NbWindow.jsx`
- `src/components/ui/Marquee.jsx`

**Untouched:** `About.jsx`, `Experience.jsx`, `Footer.jsx`, `Button.jsx`, `HackerRoom.jsx`, `HeroCamera.jsx`, `CanvasLoader.jsx`

---

## 9. Verification

Each is a command with observable output, run before the work is called done:

1. `npm run lint` — exits clean
2. `npm run build` — exits clean
3. `npm run dev` — hero renders and is manually checked at 375px, 768px, and 1440px viewport widths, confirming: window frame renders with title bar; at least one 3D object visibly overlaps the frame border on desktop; no horizontal page scroll at any width; nav and CTAs are clickable; the GSAP greeting rotator still cycles
4. Browser console shows no WebGL or React errors on load

**Manual judgment call (not automatable):** whether the relit desk reads clearly against sky blue. If it still looks muddy after the specified light values, tune intensities before proceeding — do not accept a silhouette.

---

## 10. Known follow-ups (out of scope)

- `public/assets/review1–4.png` are deleted in the working tree while `clientReviews` in `src/constants/index.js` still references them. This will break whenever that data is rendered.
- Phase 2: convert About, Experience, Footer and remove the `bg-[#18181a]` wrapper.
- Final hero copy and CTA labels from the user, replacing the provisional `heroContent` defaults.
