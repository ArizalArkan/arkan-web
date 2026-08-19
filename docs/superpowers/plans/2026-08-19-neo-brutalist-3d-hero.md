# Neo-Brutalist 3D Hero — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the portfolio's design language to neo-brutalism (cream paper, 3px black borders, hard offset shadows, heavy display type) and rebuild the Hero so the 3D hacker-room sits inside a retro OS window that the floating 3D objects visibly escape.

**Architecture:** A Tailwind token layer plus a small set of `@layer components` utilities provide the visual vocabulary. Four new presentational components in `src/components/ui/` wrap that vocabulary. The Hero's escape effect is achieved by rendering a **transparent** WebGL canvas *on top of* and *larger than* a plain DOM window frame — the sky-blue fill is a div behind the canvas, so objects near the canvas edges render over bare cream paper. Existing R3F scene-graph structure, GSAP animations and `useMediaQuery`/`calculateSizes` patterns are preserved.

**Tech Stack:** React 18, Vite 5, Tailwind 3.4, @react-three/fiber 8, @react-three/drei 9.122, three 0.169, GSAP 3, react-responsive.

**Source spec:** `docs/superpowers/specs/2026-08-19-neo-brutalist-3d-hero-design.md`

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Do not run `git commit`, `git add`, or any other git write command.** The user commits their own work. Tasks end at a **Checkpoint** step that reports status only.
- **Do not add any npm dependency**, runtime or dev. Everything needed is already installed.
- **No test framework exists in this project.** There is no vitest, jest, or testing-library. Each task is gated by `npm run lint`, `npm run build`, and **specific named browser observations**. Do not invent a test suite; do not add one.
- **Exact palette values, verbatim:** paper `#FDF6E3` · paper-2 `#F5EFDC` · ink `#0A0A0A` · nb-yellow `#FFD93D` · nb-pink `#FF6B9D` · nb-lime `#A8E10C` · nb-sky `#7DD3FC`
- **Shadow values, verbatim:** `nb` = `4px 4px 0 0 #0A0A0A` · `nb-lg` = `8px 8px 0 0 #0A0A0A` · `nb-xl` = `12px 12px 0 0 #0A0A0A`
- **Corners are sharp.** Never add `rounded-*` to any `nb-` class.
- **Motion is fast.** Every transition in the neo-brutalist system is `duration-150` or faster. No `ease-in-out`, no fades longer than 150ms.
- **Do not modify** `src/sections/About.jsx`, `src/sections/Experience.jsx`, `src/sections/Footer.jsx`, `src/components/Button.jsx`, or `src/components/HackerRoom.jsx`.
- **Do not remove any existing CSS class** from `src/index.css`. The untouched sections depend on `.grid-container`, `.work-*`, `.btn`, `.field-*`, `.social-icon`, `.hero_tag`, `.c-space`, `.nav-*`, `.text-gray_gradient`, `.arrow-gradient`, `.waving-hand`.
- **`src/components/Target.jsx` has uncommitted working-tree changes.** Read the file before editing and preserve whatever is there.

### Deviations from the spec — read before starting

Three spec assumptions were falsified by reading the code. The plan below is correct; the spec is not.

1. **Spec §5.4 says relighting affects Cube and Ring. It does not.** Both use `meshMatcapMaterial` with `toneMapped={false}`, which ignores scene lights entirely. Recoloring them requires *replacing the material*, which Task 4 does.
2. **Spec §5.4 says `Target.jsx` gets `<Outlines>`. It cannot.** `Target` renders `cube.glb` via `<primitive object={scene}>` inside a `<mesh>` that has no geometry of its own; drei's `Outlines` requires parent geometry. Task 4 gives Target a color treatment instead and explains why.
3. **Spec §3.2 says to remove the General Sans and Instrument Serif imports. Do not.** `About.jsx` and others use `font-generalsans` and `font-instrument`; removing the imports breaks the Phase-2 sections that spec §6 promises to keep working. Task 1 *adds* the new font import and leaves existing imports in place. Removing them belongs to Phase 2.

Additionally, `CanvasLoader.jsx` hardcodes `color: '#F1F1F1'` — invisible on cream and sky. The spec listed it as untouched; Task 4 fixes it, because leaving it produces an invisible loading state.

---

## File Structure

**Modified**

| File | Responsibility after this plan |
|---|---|
| `tailwind.config.js` | Design tokens only — colors, shadows, borderWidth, fonts |
| `src/index.css` | Font imports, body ground, `@layer components` neo-brutalist utilities, marquee keyframes. Existing utilities untouched. |
| `src/constants/index.js` | Adds `heroContent` (all hero copy in one object) and retunes `calculateSizes` positions |
| `src/components/Cube.jsx` | Recolored to nb-pink, outlined |
| `src/components/Ring.jsx` | Recolored to nb-yellow, outlined |
| `src/components/ReactLogo.jsx` | Outlined |
| `src/components/Target.jsx` | Recolored (no outline — see Deviation 2) |
| `src/components/CanvasLoader.jsx` | Loader legible on light ground |
| `src/sections/Navbar.jsx` | Neo-brutalist nav |
| `src/sections/Hero.jsx` | Headline block + the transparent-canvas escape stage |
| `src/App.jsx` | Mounts Marquee, wraps Phase-2 sections |

**Created**

| File | Responsibility |
|---|---|
| `src/components/ui/NbButton.jsx` | The press-effect button. Renders `<a>` when given `href`, else `<button>`. |
| `src/components/ui/NbBadge.jsx` | Bordered mono chip on an accent background |
| `src/components/ui/NbWindow.jsx` | OS window chrome — border, title bar, three square dots. Layout-only; positioned by its consumer. |
| `src/components/ui/Marquee.jsx` | Infinite CSS scrolling strip |

---

## Task 1: Design tokens, fonts, and the `nb-` utility layer

Nothing renders differently at the end of this task except the page background turning cream and every section looking wrong. That is expected — Task 7 installs the Phase-2 guard. This task exists to make the vocabulary available to Tasks 2–7.

**Files:**
- Modify: `tailwind.config.js` (whole file)
- Modify: `src/index.css` (imports at top, `body` rule, new `@layer components` block, new keyframes)

**Interfaces:**
- Consumes: nothing
- Produces: Tailwind classes `bg-paper`, `bg-paper-2`, `text-ink`, `border-ink`, `bg-nb-yellow`, `bg-nb-pink`, `bg-nb-lime`, `bg-nb-sky`, `shadow-nb`, `shadow-nb-lg`, `shadow-nb-xl`, `shadow-nb-pink`, `shadow-nb-lime`, `shadow-nb-sky`, `border-3`, `font-display`, `font-sans`, `font-mono`. Component classes `.nb-border`, `.nb-card`, `.nb-btn`, `.nb-badge`, `.nb-window`, `.nb-window-bar`, `.nb-dot`, `.nb-marquee-track`, `.nb-mark`.

- [ ] **Step 1: Replace `tailwind.config.js` entirely**

The existing `black`/`white` scales and the three existing font families are preserved verbatim — the untouched sections compile against them.

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // neo-brutalist system
        display: ['Archivo Black', 'sans-serif'],
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        // retained for the not-yet-converted sections
        generalsans: ['General Sans', 'sans-serif'],
        instrument: ['Instrument Serif', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
        paper: {
          DEFAULT: '#FDF6E3',
          2: '#F5EFDC',
        },
        ink: {
          DEFAULT: '#0A0A0A',
        },
        nb: {
          yellow: '#FFD93D',
          pink: '#FF6B9D',
          lime: '#A8E10C',
          sky: '#7DD3FC',
        },
        black: {
          DEFAULT: '#000',
          100: '#010103',
          200: '#0E0E10',
          300: '#1C1C21',
          500: '#3A3A49',
          600: '#1A1A1A',
        },
        white: {
          DEFAULT: '#FFFFFF',
          800: '#E4E4E6',
          700: '#D6D9E9',
          600: '#AFB0B6',
          500: '#62646C',
        },
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        nb: '4px 4px 0 0 #0A0A0A',
        'nb-lg': '8px 8px 0 0 #0A0A0A',
        'nb-xl': '12px 12px 0 0 #0A0A0A',
        'nb-pink': '4px 4px 0 0 #FF6B9D',
        'nb-lime': '4px 4px 0 0 #A8E10C',
        'nb-sky': '4px 4px 0 0 #7DD3FC',
      },
      backgroundImage: {
        terminal: "url('/assets/terminal.png')",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Add the font import to `src/index.css`**

Insert this as a **new line 4**, directly after the three existing `@import url(...)` lines. Do not delete the existing imports (see Deviation 3). All `@import` rules must stay above `@tailwind base`.

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;700&display=swap');
```

- [ ] **Step 3: Change the `body` rule in `src/index.css`**

Replace the existing rule:

```css
body {
  background: #18181a;
  font-family: 'General Sans', sans-serif;
}
```

with:

```css
body {
  background: #FDF6E3;
  color: #0A0A0A;
  font-family: 'Space Grotesk', sans-serif;
}
```

- [ ] **Step 4: Add the `@layer components` block to `src/index.css`**

Add this as a **new block after the closing brace of the existing `@layer utilities { ... }` block** and before the `.waving-hand` rule. Do not put these inside the existing `@layer utilities` block — component classes composed of other utilities belong in the components layer so later utility classes can override them.

```css
@layer components {
  .nb-border {
    @apply border-3 border-ink;
  }

  .nb-card {
    @apply nb-border bg-white shadow-nb;
  }

  .nb-btn {
    @apply nb-border inline-flex items-center justify-center gap-2
           px-6 py-3 font-display uppercase tracking-tight text-ink
           shadow-nb cursor-pointer select-none
           transition-[transform,box-shadow] duration-150 ease-out;
  }

  .nb-btn:hover {
    @apply translate-x-[4px] translate-y-[4px] shadow-none;
  }

  .nb-btn:active {
    @apply translate-x-[6px] translate-y-[6px] shadow-none;
  }

  .nb-btn:focus-visible {
    @apply outline-none ring-4 ring-nb-sky;
  }

  .nb-badge {
    @apply nb-border inline-flex items-center gap-2 px-3 py-1
           font-mono text-xs uppercase tracking-wide text-ink;
  }

  .nb-window {
    @apply nb-border bg-nb-sky shadow-nb-xl overflow-hidden;
  }

  .nb-window-bar {
    @apply flex items-center gap-2 bg-ink px-3 py-2
           font-mono text-xs uppercase tracking-wide text-paper
           border-b-3 border-ink;
  }

  .nb-dot {
    @apply block h-3 w-3 border-2 border-paper;
  }

  .nb-mark {
    @apply relative inline-block;
  }

  .nb-mark::before {
    content: '';
    @apply absolute left-[-0.1em] right-[-0.1em] top-[0.12em] bottom-[0.12em]
           bg-nb-lime -z-10;
  }

  .nb-marquee-track {
    @apply flex w-max shrink-0 items-center gap-8 whitespace-nowrap;
    animation: nb-marquee var(--nb-marquee-duration, 24s) linear infinite;
  }
}

@keyframes nb-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .nb-marquee-track {
    animation: none;
  }
}
```

**Why `.nb-mark` uses `::before` with `-z-10`:** the lime block must sit *behind* the glyphs. The consuming element needs `relative` and `isolate` so the negative z-index doesn't escape behind the page background — Task 6 applies `isolate` on the `<h1>`.

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: exits 0, prints `✓ built in ...`. If Tailwind errors with `The 'border-3' class does not exist` inside `@apply`, the `borderWidth: { 3: '3px' }` token in Step 1 was not saved — fix it before continuing.

- [ ] **Step 6: Verify lint is clean**

Run: `npm run lint`
Expected: exits 0 with no output.

- [ ] **Step 7: Verify the tokens actually reach the browser**

Run `npm run dev`, open the site, and in DevTools console run:

```js
getComputedStyle(document.body).backgroundColor
```

Expected: `"rgb(253, 246, 227)"`. Any other value means the `body` rule in Step 3 is being overridden — check that no other `background` declaration exists on `body`.

The page will look broken (dark sections on cream). That is correct at this stage.

- [ ] **Step 8: Checkpoint**

Do not commit. Report: tokens and utilities are in place, `npm run build` and `npm run lint` pass, `body` computes to `rgb(253, 246, 227)`. State plainly that the page is intentionally mismatched until Task 7.

---

## Task 2: The four UI primitives

**Files:**
- Create: `src/components/ui/NbButton.jsx`
- Create: `src/components/ui/NbBadge.jsx`
- Create: `src/components/ui/NbWindow.jsx`
- Create: `src/components/ui/Marquee.jsx`

**Interfaces:**
- Consumes: the `.nb-*` classes from Task 1
- Produces:
  - `NbButton({ label, href, variant, className, children })` — `variant` is `'yellow' | 'white' | 'pink' | 'lime'`, default `'yellow'`. Renders `<a href>` when `href` is truthy, otherwise `<button type="button">`.
  - `NbBadge({ children, variant, className })` — same `variant` union, default `'yellow'`.
  - `NbWindow({ title, children, className })` — `title` is the mono text in the bar; `children` render in the body area below the bar. Positioning is the caller's job.
  - `Marquee({ items, durationSeconds, className })` — `items` is `string[]`, `durationSeconds` is a number defaulting to `24`.

- [ ] **Step 1: Create `src/components/ui/NbButton.jsx`**

```jsx
const VARIANTS = {
  yellow: 'bg-nb-yellow',
  white: 'bg-white',
  pink: 'bg-nb-pink',
  lime: 'bg-nb-lime',
};

const NbButton = ({ label, href, variant = 'yellow', className = '', children }) => {
  const classes = `nb-btn ${VARIANTS[variant] ?? VARIANTS.yellow} ${className}`;
  const content = children ?? label;

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes}>
      {content}
    </button>
  );
};

export default NbButton;
```

- [ ] **Step 2: Create `src/components/ui/NbBadge.jsx`**

```jsx
const VARIANTS = {
  yellow: 'bg-nb-yellow',
  white: 'bg-white',
  pink: 'bg-nb-pink',
  lime: 'bg-nb-lime',
};

const NbBadge = ({ children, variant = 'yellow', className = '' }) => (
  <span className={`nb-badge ${VARIANTS[variant] ?? VARIANTS.yellow} ${className}`}>
    {children}
  </span>
);

export default NbBadge;
```

- [ ] **Step 3: Create `src/components/ui/NbWindow.jsx`**

The dots are squares, not circles — that is deliberate, and `.nb-dot` has no border-radius. `aria-hidden` is on the whole frame because it is decoration: the canvas above it carries the real content.

```jsx
const NbWindow = ({ title = 'window', children, className = '' }) => (
  <div className={`nb-window flex flex-col ${className}`} aria-hidden="true">
    <div className="nb-window-bar">
      <span className="nb-dot bg-nb-pink" />
      <span className="nb-dot bg-nb-yellow" />
      <span className="nb-dot bg-nb-lime" />
      <span className="ml-2 truncate">{title}</span>
    </div>
    <div className="relative flex-1">{children}</div>
  </div>
);

export default NbWindow;
```

- [ ] **Step 4: Create `src/components/ui/Marquee.jsx`**

The items array is rendered **twice** inside the track. This is required: the keyframe translates the track by exactly `-50%`, so the second copy must occupy the other half for the loop to be seamless. Changing one without the other produces a visible jump.

```jsx
const Marquee = ({ items, durationSeconds = 24, className = '' }) => {
  const sequence = [...items, ...items];

  return (
    <div
      className={`overflow-hidden border-b-3 border-ink bg-ink py-2 ${className}`}
      role="presentation">
      <div
        className="nb-marquee-track font-mono text-xs uppercase tracking-widest text-nb-yellow"
        style={{ '--nb-marquee-duration': `${durationSeconds}s` }}>
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8">
            {item}
            <span className="text-nb-lime">●</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
```

- [ ] **Step 5: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both exit 0.

Nothing is mounted yet, so there is nothing to observe in the browser. That is expected — these components are consumed in Tasks 5, 6, and 7.

- [ ] **Step 6: Checkpoint**

Do not commit. Report the four files created and that lint and build pass.

---

## Task 3: Hero copy object and retuned 3D positions

**Files:**
- Modify: `src/constants/index.js` — add `heroContent` near the top (after `navLinks`), replace `calculateSizes` at lines 249–258

**Interfaces:**
- Consumes: nothing
- Produces:
  - `heroContent` — shape given verbatim below. Task 6 reads every field.
  - `calculateSizes(isSmall, isMobile, isTablet)` — same signature and same six returned keys as today (`deskScale`, `deskPosition`, `cubePosition`, `reactLogoPosition`, `ringPosition`, `targetPosition`). Only the values change, so no caller breaks.

- [ ] **Step 1: Add `heroContent` to `src/constants/index.js`**

Insert directly after the closing `];` of the `navLinks` array. These strings are **provisional** — the user will supply final copy. They live in one object precisely so that swap is a one-line edit with no JSX change.

```js
export const heroContent = {
  greetings: ['안녕하세요', 'こんにちは', 'Hola', 'Hi', 'Bonjour', 'Hai'],
  name: "I'M ARKAN 👋",
  headline: ['CRAFTING', 'DIGITAL', 'EXPERIENCES.'],
  highlight: 'DIGITAL',
  subhead:
    'Frontend developer building fast, accessible web experiences with React and Three.js.',
  ctaPrimary: { label: 'SEE MY WORK', href: '#work' },
  ctaSecondary: { label: 'ABOUT ME', href: '#about' },
  marquee: [
    'AVAILABLE FOR WORK',
    'REACT',
    'THREE.JS',
    'TAILWIND',
    'TYPESCRIPT',
    'GSAP',
  ],
  windowTitle: 'hacker-room.exe',
};
```

`highlight` is matched against entries of `headline`. If it matches nothing, Task 6's renderer draws no lime marker and the headline still displays correctly — this is intentional so a copy change can never crash the hero.

- [ ] **Step 2: Replace `calculateSizes` (currently lines 249–258)**

**The derivation, so these numbers can be re-derived if the stage size changes.** The camera is a `PerspectiveCamera` at `z=30` with three's default `fov=50`. Visible height at the origin plane is `2 × 30 × tan(25°) ≈ 27.98` world units, so half-height ≈ **13.99**. Visible width is that times the canvas aspect ratio. For the desktop stage (~1152 × 560 css px, aspect ≈ 2.06) visible width ≈ 57.6, half-width ≈ **28.8**.

Task 6 insets the window frame by `4%` horizontally and `14%` vertically. In world units that is `0.04 × 57.6 ≈ 2.3` from each side and `0.14 × 27.98 ≈ 3.9` from top and bottom. So the window covers roughly `|x| < 26.5` and `|y| < 10.1`, and **an object escapes the frame when `|x| > 26.5` or `|y| > 10.1`.**

The desktop values below are chosen to sit just past those thresholds. `Float` adds drift, so the escape amount breathes rather than sitting static.

```js
  export const calculateSizes = (isSmall, isMobile, isTablet) => {
    return {
      deskScale: isSmall ? 0.05 : isMobile ? 0.06 : isTablet ? 0.07 : 0.09,
      deskPosition: isMobile ? [0.5, -4.5, 0] : isTablet ? [0.25, -6, 0] : [0.25, -7, 0],
      // escapes the bottom-right of the frame
      cubePosition: isSmall
        ? [3.5, -8, 0]
        : isMobile
        ? [4.5, -9, 0]
        : isTablet
        ? [9, -10.5, 0]
        : [18, -12, 0],
      // escapes the top-right of the frame
      reactLogoPosition: isSmall
        ? [3, 8.5, 0]
        : isMobile
        ? [4.5, 9.5, 0]
        : isTablet
        ? [9, 11, 0]
        : [20, 12, 0],
      // escapes the left edge of the frame
      ringPosition: isSmall
        ? [-5, 7, 0]
        : isMobile
        ? [-8, 8, 0]
        : isTablet
        ? [-16, 7, 0]
        : [-27.5, 6, 0],
      // stays inside the frame as background depth (z=-10 renders smaller)
      targetPosition: isSmall
        ? [-5, -10, -10]
        : isMobile
        ? [-9, -10, -10]
        : isTablet
        ? [-13, -9, -10]
        : [-18, -12, -10],
    };
  };
```

- [ ] **Step 3: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 4: Checkpoint**

Do not commit. Report that `heroContent` is exported and `calculateSizes` returns the same six keys with retuned values. Note explicitly that the escape thresholds are **starting values derived from an assumed stage size** and get verified visually in Task 7 — they are expected to need nudging.

---

## Task 4: 3D components for a light ground

**Files:**
- Modify: `src/components/Cube.jsx`
- Modify: `src/components/Ring.jsx`
- Modify: `src/components/ReactLogo.jsx`
- Modify: `src/components/Target.jsx` — **read it first, it has uncommitted changes**
- Modify: `src/components/CanvasLoader.jsx`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: no new exports. All five components keep their current default exports, prop signatures, and `useGLTF.preload` calls unchanged, so `Hero.jsx` needs no import changes.

- [ ] **Step 1: Recolor and outline `Cube.jsx`**

The current `<meshMatcapMaterial matcap={texture} toneMapped={false} />` ignores lights entirely — that is why the relighting in Task 6 cannot recolor it. Replace the material and drop the now-unused texture. Add `<Outlines>` as a sibling child of the same mesh, which is how drei attaches an inverted-hull outline to the parent geometry.

Replace the whole file:

```jsx
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { Float, Outlines, useGLTF } from '@react-three/drei';

const Cube = ({ ...props }) => {
  const { nodes } = useGLTF('models/cube.glb');

  const cubeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useGSAP(() => {
    gsap
      .timeline({
        repeat: -1,
        repeatDelay: 0.5,
      })
      .to(cubeRef.current.rotation, {
        y: hovered ? '+=2' : `+=${Math.PI * 2}`,
        x: hovered ? '+=2' : `-=${Math.PI * 2}`,
        duration: 2.5,
        stagger: {
          each: 0.15,
        },
      });
  });

  return (
    <Float floatIntensity={2}>
      <group position={[9, -4, 0]} rotation={[2.6, 0.8, -1.8]} scale={0.84} dispose={null} {...props}>
        <mesh
          ref={cubeRef}
          castShadow
          receiveShadow
          geometry={nodes.Cube.geometry}
          onPointerEnter={() => setHovered(true)}>
          <meshStandardMaterial color="#FF6B9D" roughness={0.6} metalness={0} />
          <Outlines thickness={0.06} color="#0A0A0A" />
        </mesh>
      </group>
    </Float>
  );
};

useGLTF.preload('models/cube.glb');

export default Cube;
```

Note the `material={nodes.Cube.material}` prop was removed along with the `useTexture` import — the explicit `<meshStandardMaterial>` child supersedes it, and leaving the import would fail lint as unused.

- [ ] **Step 2: Recolor and outline `Ring.jsx`**

Same matcap problem. Four torus meshes each get the material and an outline. Everything about the GSAP timeline and the `getRef` collection is unchanged.

Replace only the `return (...)` block and the import line. The new import line:

```jsx
import { Center, Outlines } from '@react-three/drei';
```

The `useTexture` import and the `const texture = useTexture('textures/rings.png');` line are both deleted. The new return block:

```jsx
  return (
    <Center>
      <group scale={0.5}>
        {Array.from({ length: 4 }, (_, index) => (
          <mesh key={index} ref={getRef}>
            <torusGeometry args={[(index + 1) * 0.5, 0.1]} />
            <meshStandardMaterial color="#FFD93D" roughness={0.6} metalness={0} />
            <Outlines thickness={0.04} color="#0A0A0A" />
          </mesh>
        ))}
      </group>
    </Center>
  );
```

- [ ] **Step 3: Outline `ReactLogo.jsx`**

This one keeps its GLB material — the React logo's own color is recognizable and worth preserving. It only gains an outline.

Replace the whole file:

```jsx
import { Float, Outlines, useGLTF } from '@react-three/drei';

const ReactLogo = (props) => {
  const { nodes, materials } = useGLTF('/models/react.glb');
  return (
    <Float floatIntensity={1}>
      <group position={[8, 8, 0]} scale={0.5} {...props}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes['React-Logo_Material002_0'].geometry}
          material={materials['Material.002']}
          position={[0, 0.079, 0.181]}
          rotation={[0, 0, -Math.PI / 2]}
          scale={[0.39, 0.39, 0.5]}>
          <Outlines thickness={0.05} color="#0A0A0A" />
        </mesh>
      </group>
    </Float>
  );
};

useGLTF.preload('/models/react.glb');

export default ReactLogo;
```

- [ ] **Step 4: Recolor `Target.jsx` — read the file first**

**This file has uncommitted working-tree changes. Open it and preserve them.** The instructions below describe the change to make on top of whatever is currently there.

`Target` renders `cube.glb`'s whole `scene` through `<primitive>`, on an outer `<mesh>` that has no geometry of its own. drei's `<Outlines>` builds its hull from the parent's geometry, so it has nothing to work with here and will not render. **Do not add `<Outlines>` to this file.** Instead, traverse the loaded scene and set a flat sky-toned material so the object reads as a deliberate background shape rather than a muddy blob.

Add this import alongside the existing ones:

```jsx
import { useMemo } from 'react';
import * as THREE from 'three';
```

Then, after the `const { scene } = useGLTF('/models/cube.glb')` line, add:

```jsx
  const tintedScene = useMemo(() => {
    const clone = scene.clone(true);
    const material = new THREE.MeshStandardMaterial({
      color: '#A8E10C',
      roughness: 0.7,
      metalness: 0,
    });
    clone.traverse((child) => {
      if (child.isMesh) child.material = material;
    });
    return clone;
  }, [scene]);
```

and change `<primitive object={scene} />` to `<primitive object={tintedScene} />`.

**Why the clone:** `Cube.jsx` also loads `models/cube.glb`, and `useGLTF` caches by URL — mutating `scene` in place would recolor Cube's geometry too. `scene.clone(true)` is what keeps the two independent.

- [ ] **Step 5: Make `CanvasLoader.jsx` legible on a light ground**

Its text is hardcoded `#F1F1F1`, invisible on cream and on sky. Replace the whole file:

```jsx
import { Html, useProgress } from '@react-three/drei';

const CanvasLoader = () => {
  const { progress } = useProgress();

  return (
    <Html
      as="div"
      center
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}>
      <span
        style={{
          display: 'block',
          width: 28,
          height: 28,
          border: '3px solid #0A0A0A',
          background: '#FFD93D',
        }}
      />
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          textTransform: 'uppercase',
          color: '#0A0A0A',
          fontWeight: 700,
          marginTop: 16,
          whiteSpace: 'nowrap',
        }}>
        {progress !== 0 ? `${progress.toFixed(0)}% loaded` : 'loading...'}
      </p>
    </Html>
  );
};

export default CanvasLoader;
```

The previous `<span className='canvas-loader'/>` referenced a class that **is not defined anywhere in `src/index.css`** — the spinner has been invisible all along. The inline block above replaces it.

- [ ] **Step 6: Verify lint catches nothing**

Run: `npm run lint`
Expected: exits 0. If it reports `'useTexture' is defined but never used` in `Cube.jsx` or `Ring.jsx`, the import removal in Steps 1–2 was missed.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 8: Verify in the browser**

Run `npm run dev` and load the page. The hero canvas is still the old full-bleed layout at this point — that is expected, Task 6 rebuilds it.

Observe and confirm all four:
1. The cube renders **pink** with a visible black edge
2. The rings render **yellow** with black edges
3. The React logo has a visible black edge and retains its own color
4. No error in the DevTools console mentioning `Outlines`, `matcap`, or `material`

If the outlines are invisible, the models are likely too small on screen for a `0.04`–`0.06` thickness — raise `thickness` rather than assuming it is broken.

- [ ] **Step 9: Checkpoint**

Do not commit. Report the five files changed and the four browser observations. State explicitly whether outline thickness needed adjusting from the specified values.

---

## Task 5: Neo-brutalist Navbar

**Files:**
- Modify: `src/sections/Navbar.jsx` (whole file)

**Interfaces:**
- Consumes: `navLinks` from `src/constants/index.js` (existing, unchanged); `.nb-*` classes from Task 1
- Produces: default export `Navbar`, no props — `App.jsx` mounts it exactly as it does today

- [ ] **Step 1: Replace `src/sections/Navbar.jsx` entirely**

The `isOpen` / `toggleMenu` / `max-h` transition pattern is kept from the current implementation. What changes is purely presentational, plus one behavior fix: tapping a mobile link now closes the menu, which the current version does not do (its `onClick` is an empty function).

```jsx
import { useState } from 'react';
import { navLinks } from '../constants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const NavItems = ({ onNavigate }) => (
    <ul className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
      {navLinks.map(({ id, href, name }) => (
        <li key={id} className="w-full sm:w-auto">
          <a
            href={href}
            onClick={onNavigate}
            className="group relative isolate block px-3 py-2 font-mono text-sm uppercase tracking-wide text-ink">
            <span
              className="absolute inset-0 -z-10 origin-left scale-x-0 bg-nb-lime
                         transition-transform duration-150 ease-out
                         group-hover:scale-x-100"
              aria-hidden="true"
            />
            {name}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="sticky top-0 z-50 border-b-3 border-ink bg-paper">
      <div className="mx-auto max-w-7xl">
        <div className="c-space mx-auto flex items-center justify-between py-4">
          <a
            href="/"
            className="nb-border bg-ink px-3 py-1.5 font-display text-lg text-nb-yellow shadow-nb">
            ArkDev
          </a>

          <button
            type="button"
            onClick={toggleMenu}
            className="nb-btn bg-nb-yellow !px-3 !py-2 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}>
            <img
              src={isOpen ? '/assets/close.svg' : '/assets/menu.svg'}
              alt=""
              className="h-5 w-5"
            />
          </button>

          <nav className="hidden sm:flex">
            <NavItems />
          </nav>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-150 ease-out sm:hidden ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}>
        <nav className="c-space border-t-3 border-ink bg-paper-2 py-4">
          <NavItems onNavigate={() => setIsOpen(false)} />
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
```

Two details worth understanding rather than copying blindly:
- **`isolate` on the `<a>`** confines the `-z-10` sliding block to that link's stacking context. Without it the lime block renders behind the header background and never appears.
- **`!px-3 !py-2`** overrides `.nb-btn`'s `px-6 py-3` so the mobile toggle is square. The `!` is needed because both live in the components layer.
- The `href` is used as-is from `navLinks` (`#home`, `#about`, …). The old code called `.toLowerCase()` on it, which was a no-op since the values are already lowercase.

- [ ] **Step 2: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 3: Verify in the browser at desktop width**

Run `npm run dev` at a viewport ≥ 1024px. Confirm:
1. Header is cream with a solid 3px black bottom border
2. `ArkDev` is a black block with yellow type and a hard shadow down-right
3. Hovering a nav link sweeps a lime block in from the left, in well under half a second
4. The header stays pinned when scrolling

- [ ] **Step 4: Verify in the browser at mobile width**

Resize to 375px. Confirm:
1. The nav collapses to a square yellow bordered toggle
2. Tapping it opens a cream panel with a 3px top border
3. Tapping a link inside closes the panel

- [ ] **Step 5: Checkpoint**

Do not commit. Report the seven browser observations from Steps 3–4.

---

## Task 6: The Hero and the escape stage

The centerpiece. Read the whole task before starting — the layering is the part that goes wrong if approached piecemeal.

**Files:**
- Modify: `src/sections/Hero.jsx` (whole file)

**Interfaces:**
- Consumes: `heroContent` and `calculateSizes` from Task 3; `NbBadge`, `NbButton`, `NbWindow` from Task 2; the existing `HackerRoom`, `CanvasLoader`, `Target`, `ReactLogo`, `Cube`, `Ring`, `HeroCamera` components (all unchanged signatures)
- Produces: default export `Hero`, no props

- [ ] **Step 1: Replace `src/sections/Hero.jsx` entirely**

```jsx
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMediaQuery } from 'react-responsive';

import { calculateSizes, heroContent } from '../constants';

import HackerRoom from '../components/HackerRoom';
import CanvasLoader from '../components/CanvasLoader';
import Target from '../components/Target';
import ReactLogo from '../components/ReactLogo';
import Cube from '../components/Cube';
import Ring from '../components/Ring';
import HeroCamera from '../components/HeroCamera';
import NbBadge from '../components/ui/NbBadge';
import NbButton from '../components/ui/NbButton';
import NbWindow from '../components/ui/NbWindow';

const Hero = () => {
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isSmall = useMediaQuery({ maxWidth: 440 });

  const sizes = calculateSizes(isSmall, isMobile, isTablet);

  const textRef = useRef(null);
  const { greetings } = heroContent;

  useEffect(() => {
    const ctx = gsap.context(() => {
      let i = 0;

      gsap.to(
        {},
        {
          duration: 2,
          repeat: -1,
          onRepeat: () => {
            gsap.to(textRef.current, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                if (!textRef.current) return;
                textRef.current.innerText = greetings[i];
                gsap.to(textRef.current, { opacity: 1, duration: 0.5 });
                i = (i + 1) % greetings.length;
              },
            });
          },
        },
      );
    });

    return () => ctx.revert();
  }, [greetings]);

  return (
    <section id="home" className="c-space mx-auto w-full max-w-7xl pb-16 pt-10 sm:pt-14">
      {/* ---------- headline block ---------- */}
      <div className="flex flex-col items-start gap-5">
        <NbBadge variant="yellow">
          <span ref={textRef} className="inline-block min-w-[5ch]">
            Hi
          </span>
          <span>{heroContent.name}</span>
        </NbBadge>

        <h1 className="isolate font-display uppercase leading-[0.95] tracking-tight text-ink text-[clamp(2.25rem,8vw,5.5rem)]">
          {heroContent.headline.map((line) => (
            <span key={line} className="block">
              {line === heroContent.highlight ? (
                <span className="nb-mark">{line}</span>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        <p className="max-w-xl text-base text-ink/80 sm:text-lg">{heroContent.subhead}</p>

        <div className="flex flex-wrap gap-4">
          <NbButton
            variant="yellow"
            href={heroContent.ctaPrimary.href}
            label={`${heroContent.ctaPrimary.label} ▸`}
          />
          <NbButton
            variant="white"
            href={heroContent.ctaSecondary.href}
            label={heroContent.ctaSecondary.label}
          />
        </div>
      </div>

      {/* ---------- 3D stage ---------- */}
      {/*
        LAYERING — do not change without reading this.
        z-10  NbWindow  : inset DOM frame, provides the sky fill + chrome
        z-20  Canvas    : TRANSPARENT, spans the FULL wrapper, i.e. larger
                          than the window. Objects positioned past the
                          window's inset therefore render over cream paper.
        The wrapper must NOT get overflow-hidden — that clips the escape.
      */}
      <div className="relative mt-14 h-[380px] w-full sm:h-[460px] lg:h-[560px]">
        <NbWindow
          title={heroContent.windowTitle}
          className="absolute inset-x-[4%] inset-y-[14%] z-10"
        />

        <Canvas className="absolute inset-0 z-20" gl={{ alpha: true }}>
          <Suspense fallback={<CanvasLoader />}>
            <PerspectiveCamera makeDefault position={[0, 0, 30]} />

            <HeroCamera isMobile={isMobile}>
              <HackerRoom
                scale={sizes.deskScale}
                position={sizes.deskPosition}
                rotation={[0, -Math.PI, 0]}
              />
            </HeroCamera>

            <group>
              <Target position={sizes.targetPosition} />
              <ReactLogo position={sizes.reactLogoPosition} />
              <Cube position={sizes.cubePosition} />
              <Ring position={sizes.ringPosition} />
            </group>

            <ambientLight intensity={2} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            <directionalLight position={[-5, 2, -5]} intensity={0.6} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
};

export default Hero;
```

Changes from the previous Hero worth calling out:
- `gl={{ alpha: true }}` and **no** `scene.background` — this is what makes the canvas transparent so the escape works at all.
- Lighting went from `ambient 1` + a `directionalLight` at the origin with `intensity 0.5` (which lights almost nothing, being co-located with the scene center) to `ambient 2` plus a real key at `[5,5,5]` and a fill at `[-5,2,-5]`.
- The `section` is now a normal flow element with `id="home"`, not `min-h-screen` with an absolutely-positioned full-bleed canvas.
- The `if (!textRef.current) return;` guard inside the GSAP callback prevents a null dereference if the component unmounts mid-tween — the old version could throw here on fast navigation.
- The `<Leva>` import and the large commented-out `useControls` block are dropped.

- [ ] **Step 2: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both exit 0. A `'React' is defined but never used` error means the unused `React` import was carried over — the file above does not import it, matching the project's other JSX files.

- [ ] **Step 3: Verify the escape effect at desktop width**

Run `npm run dev` at a viewport ≥ 1280px. This is the observation the whole task exists for. Confirm:
1. A cream page with a black-bordered sky-blue window and a hard 12px offset shadow
2. A black title bar with three **square** dots (pink, yellow, lime) and mono text `hacker-room.exe`
3. The desk renders **inside** the sky-blue area and is clearly lit — not a silhouette
4. **At least two of the cube / React logo / rings visibly cross the window border and sit on the cream paper.** This is the make-or-break observation.
5. The word `DIGITAL` has a lime block behind it, not in front of it
6. Moving the mouse tilts the desk (`HeroCamera` still active)

- [ ] **Step 4: If objects do not escape, adjust — here is the method**

Do not guess. The thresholds derived in Task 3 Step 2 assume a particular canvas aspect. Read the real one in the DevTools console:

```js
const c = document.querySelector('canvas');
console.log(c.clientWidth, c.clientHeight, c.clientWidth / c.clientHeight);
```

Then recompute: `halfHeight = 13.99`, `halfWidth = 13.99 × aspect`. The window covers `|x| < halfWidth × 0.92` and `|y| < halfHeight × 0.72`. Set the desktop entries of `cubePosition` / `reactLogoPosition` / `ringPosition` in `src/constants/index.js` just beyond whichever bound you want that object to cross.

- [ ] **Step 5: If the desk still looks muddy, raise the lights**

This is the spec's one explicit manual judgment call. If the desk reads as a dark silhouette against the sky blue, raise `ambientLight` toward `3` and the key `directionalLight` toward `2.5`, one at a time, re-checking each. **Do not accept a silhouette** — the whole point of the light-ground direction is that the desk is legible.

- [ ] **Step 6: Checkpoint**

Do not commit. Report the six observations from Step 3, and state explicitly whether Step 4 or Step 5 adjustments were needed and what the final values are.

---

## Task 7: Wire up App, guard the Phase-2 sections, responsive pass

**Files:**
- Modify: `src/App.jsx` (whole file)

**Interfaces:**
- Consumes: `Marquee` from Task 2, `heroContent.marquee` from Task 3, the reworked `Navbar` and `Hero`
- Produces: nothing downstream — this is the top of the tree

- [ ] **Step 1: Replace `src/App.jsx` entirely**

The `max-w-7xl` wrapper moves **off** the outer `<main>` so the navbar border and the marquee strip can run full-bleed edge to edge. `Hero` already carries its own `max-w-7xl`, and the Phase-2 wrapper carries one for the sections inside it.

```jsx
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Footer from './sections/Footer';
import Experience from './sections/Experience';
import Marquee from './components/ui/Marquee';
import { heroContent } from './constants';

const App = () => {
  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <Marquee items={heroContent.marquee} durationSeconds={24} />
      <Hero />

      {/*
        PHASE 2 BOUNDARY — remove this wrapper when About / Experience /
        Footer are converted to the neo-brutalist system. Until then it
        preserves the dark ground those sections were designed against.
        The hard seam between the cream hero and this block is expected.
      */}
      <div className="bg-[#18181a]">
        <div className="mx-auto max-w-7xl">
          <About />
          <Experience />
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default App;
```

- [ ] **Step 2: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 3: Verify at 1440px**

Run `npm run dev`. Confirm:
1. Navbar border and black marquee strip both run the **full window width**, not stopping at a centered column
2. The marquee scrolls right-to-left and loops with **no visible jump or gap** at the seam. A jump means the duplicated-array requirement from Task 2 Step 4 was broken.
3. The hero escape effect from Task 6 still works
4. The dark About section begins with a clean horizontal seam
5. **No horizontal page scrollbar.** Check with `document.documentElement.scrollWidth <= document.documentElement.clientWidth` in the console — expected `true`. Escaping 3D objects render inside the canvas and cannot cause overflow, but the marquee track can if the wrapper's `overflow-hidden` was dropped.

- [ ] **Step 4: Verify at 768px — the risk breakpoint**

Resize to exactly 768px. Per the spec this is where escaping objects most likely collide with text. Confirm:
1. The headline does not overlap any 3D object
2. The window frame and its shadow are fully visible, not clipped at the right edge
3. `document.documentElement.scrollWidth <= document.documentElement.clientWidth` is still `true`

If an object collides with the headline, adjust the `isTablet` branch of the offending position in `calculateSizes` — that branch exists specifically so tablet does not interpolate between the mobile and desktop values.

- [ ] **Step 5: Verify at 375px**

Resize to 375px. Confirm:
1. The headline clamps down and does not overflow its container
2. CTA buttons wrap rather than overflowing
3. The stage is ~380px tall and the window frame is fully visible
4. The mobile nav toggle works
5. `document.documentElement.scrollWidth <= document.documentElement.clientWidth` is `true`

- [ ] **Step 6: Verify reduced motion is honored**

In DevTools, Rendering panel → *Emulate CSS media feature prefers-reduced-motion* → `reduce`. Reload.
Expected: the marquee text is **stationary**. The 3D scene keeps animating — that is out of scope for this plan and is not a failure.

- [ ] **Step 7: Verify the console is clean**

With the page freshly loaded at 1440px, confirm the DevTools console shows **no** errors or warnings mentioning WebGL, `THREE`, React keys, or missing assets.

- [ ] **Step 8: Final checkpoint**

Do not commit. Report:
- All observations from Steps 3–7, by breakpoint
- Any values that had to be tuned away from the plan (light intensities, outline thickness, `calculateSizes` entries) and their final settings
- Confirmation that `npm run lint` and `npm run build` both pass
- The reminder that final hero copy is still pending from the user and lives entirely in `heroContent` in `src/constants/index.js`

---

## Post-plan notes

**Known follow-ups, deliberately out of scope:**
- `public/assets/review1–4.png` are deleted in the working tree while `clientReviews` in `src/constants/index.js` still references them. Anything that renders that data will break.
- Phase 2: convert About, Experience, Footer; remove the `bg-[#18181a]` wrapper in `App.jsx`; then the General Sans / Instrument Serif / Manrope font imports and the `generalsans`/`instrument`/`manrope` Tailwind families can finally be dropped, along with the dark-era utilities in `src/index.css`.
- Final hero copy and CTA labels from the user, replacing the provisional `heroContent` defaults.
