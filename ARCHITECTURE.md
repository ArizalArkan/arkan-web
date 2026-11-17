# ARCHITECTURE.md — Technical Architecture

> Panduan teknis untuk **refactor** codebase portofolio pixel 2.5D. Berlaku untuk manusia maupun AI coding agent: ikuti struktur, batas layer, dan konvensi di sini.

---

## 1. Tech stack

### 1.1 Stack yang dipertahankan

| Teknologi | Peran | Catatan |
|---|---|---|
| **React 19** | UI & komposisi | Function component + hooks saja |
| **Vite** | Dev server & build | Code splitting per chunk dunia |
| **Three.js** | Renderer WebGL | Diakses lewat R3F; impor langsung hanya untuk tipe, math, material |
| **React Three Fiber (v9+)** | Scene graph deklaratif | Versi 9 adalah pasangan React 19 |
| **Drei** | Helper R3F | Pakai seperlunya: `useTexture`, `Billboard`, `PerformanceMonitor`, `AdaptiveDpr`, `Preload`, `useProgress`, `Html` (hemat) |
| **GSAP** | Animasi diskret & timeline | Transisi kamera, intro, UI sequence. Pakai `@gsap/react` (`useGSAP`) |
| **Tailwind CSS** | Styling DOM | Token dari `DESIGN.md` via `@theme` (v4). Jika masih v3, petakan token ke `tailwind.config` |

### 1.2 Tambahan yang direkomendasikan

Ini **di luar** stack Anda saat ini; setujui satu per satu sebelum dipasang.

| Paket | Alasan | Wajib? |
|---|---|---|
| **TypeScript** (strict) | Kontrak data konten, props, dan store; refactor jauh lebih aman | Sangat disarankan |
| **zustand** | State global yang bisa dibaca di luar React & di dalam `useFrame` tanpa re-render | Ya |
| **@react-three/postprocessing** | Tilt-shift DoF, bloom, vignette — inti tampilan HD-2D | Ya |
| **zod** | Validasi skema save data & form kontak | Disarankan |
| **vitest** + **@testing-library/react** | Unit & component test | Ya (lihat `QA-CHECKLIST.md`) |
| **@playwright/test** + **@axe-core/playwright** | E2E, visual regression, a11y | Ya |
| **howler** (atau Web Audio langsung) | SFX/BGM | Opsional |
| **eslint** + **prettier** + **prettier-plugin-tailwindcss** | Konsistensi | Ya |

Sengaja **tidak** dipakai: router besar (cukup hash routing kecil, §7), physics engine (collision grid sederhana cukup), Redux, CSS-in-JS, library UI siap pakai.

---

## 2. Prinsip arsitektur

1. **Tiga dunia yang terpisah:** `game/` (logika murni) ← `world/` (WebGL) dan `ui/` (DOM). `world` dan `ui` tidak saling mengimpor; mereka bicara lewat store.
2. **Konten adalah data.** Tidak ada teks portofolio yang di-hardcode di komponen. Ubah proyek = ubah file di `content/`.
3. **React untuk struktur, ref untuk gerak.** Apa pun yang berubah tiap frame dimutasi lewat ref di `useFrame`/GSAP — bukan `setState`.
4. **Shell dulu, dunia belakangan.** HTML + Quick Read termuat tanpa Three.js; dunia di-`lazy()` load.
5. **Degradasi anggun.** Tiap efek punya versi tier rendah atau bisa dimatikan tanpa merusak tampilan.
6. **Deterministik saat diuji.** Waktu, random, dan animasi bisa dibekukan lewat flag QA.

```
            ┌──────────────┐
            │   content/   │  data statis ber-tipe
            └──────┬───────┘
                   ▼
┌─────────┐   ┌──────────┐   ┌───────────┐
│ world/  │◄──┤  game/   ├──►│   ui/     │
│ (R3F)   │   │ stores + │   │ (DOM/TW)  │
│         ├──►│ rules    │◄──┤           │
└─────────┘   └────┬─────┘   └───────────┘
   aksi            ▼            aksi
              ┌──────────┐
              │services/ │  save, contact, audio, analytics
              └──────────┘
```

---

## 3. Struktur folder

```
.
├── public/
│   ├── assets/
│   │   ├── sprites/          # atlas .png + .json (hero, npc, props)
│   │   ├── tiles/            # tileset
│   │   ├── models/           # .glb bangunan low-poly (opsional)
│   │   ├── ui/               # 9-slice frame, ikon 16px
│   │   ├── audio/            # sfx + bgm (ogg/mp3)
│   │   └── LICENSES.md
│   ├── cv.pdf
│   └── og-image.png
├── assets-src/               # .aseprite, palette, sumber mentah (tidak di-bundle)
├── src/
│   ├── app/
│   │   ├── main.tsx          # entry
│   │   ├── App.tsx           # pilih mode, pasang shell
│   │   ├── AdventureApp.tsx  # lazy: Canvas + HUD
│   │   ├── QuickReadApp.tsx  # halaman dokumen
│   │   └── ErrorBoundary.tsx
│   ├── content/              # DATA portofolio
│   │   ├── profile.ts
│   │   ├── quests.ts         # proyek
│   │   ├── skills.ts
│   │   ├── experience.ts
│   │   ├── dialogs.ts        # skrip NPC
│   │   ├── world.ts          # definisi lokasi, posisi, collider, spawn
│   │   └── schema.ts         # tipe + zod
│   ├── game/                 # LOGIKA murni (tanpa React/Three)
│   │   ├── stores/
│   │   │   ├── useGameStore.ts      # progress: xp, visited, achievements
│   │   │   ├── usePlayerStore.ts    # posisi target, zona, interactable aktif
│   │   │   ├── useUIStore.ts        # window terbuka, dialog, toast queue
│   │   │   └── useSettingsStore.ts  # mode, quality, sound, reducedMotion
│   │   ├── rules/
│   │   │   ├── xp.ts               # levelFromXp, grantXp (idempoten)
│   │   │   ├── quests.ts
│   │   │   └── achievements.ts
│   │   ├── input/                  # keyboard, pointer, action map
│   │   ├── navigation/             # grid collision, pathfinding A*
│   │   └── events.ts               # typed event bus kecil
│   ├── world/                # R3F
│   │   ├── World.tsx               # root scene
│   │   ├── theme.ts                # warna & konstanta dari DESIGN.md
│   │   ├── camera/CameraRig.tsx
│   │   ├── lighting/               # Lighting, Lantern
│   │   ├── effects/Effects.tsx     # postprocessing per tier
│   │   ├── entities/               # Hero, Npc, Building, Collectible, Signpost
│   │   ├── primitives/             # Sprite, AnimatedSprite, TileGround, Interactable, BlobShadow
│   │   ├── systems/                # useMovementSystem, useInteractionSystem, useZoneSystem
│   │   ├── materials/              # sprite material, shader kecil
│   │   └── loaders/                # useAtlas, pixelTexture, preload list
│   ├── ui/                   # DOM
│   │   ├── primitives/             # PixelFrame, PixelButton, Icon, Tag, StatBar, ...
│   │   ├── patterns/               # DialogBox, MenuList, Modal, Toast, FormField
│   │   ├── hud/                    # Hud, HeroStatus, ControlHints, SettingsMenu
│   │   ├── screens/                # TitleScreen, LoadingScreen, QuestBoard, QuestDetail, ...
│   │   └── sections/               # blok konten dipakai Adventure window & Quick Read
│   ├── services/
│   │   ├── save.ts                 # localStorage + versi + migrasi
│   │   ├── contact.ts              # POST form
│   │   ├── audio.ts
│   │   └── analytics.ts
│   ├── lib/                  # util umum, hooks umum (useMediaQuery, usePrefersReducedMotion)
│   ├── styles/
│   │   ├── tokens.css              # @theme
│   │   └── index.css
│   └── test/                 # setup, fixtures
├── e2e/                      # Playwright
└── docs/                     # DESIGN.md, PRODUCT.md, ... (dokumen ini)
```

### Aturan impor (dipaksakan lewat ESLint `no-restricted-imports`)

| Dari | Boleh impor | Dilarang |
|---|---|---|
| `content/` | `lib/` | semua lainnya |
| `game/` | `content/`, `services/`, `lib/` | `world/`, `ui/`, `react`, `three` (kecuali `zustand` & tipe math sederhana) |
| `world/` | `game/`, `content/`, `lib/` | `ui/` |
| `ui/` | `game/`, `content/`, `services/`, `lib/` | `world/`, `three`, `@react-three/*` |
| `app/` | semua | — |

Alias: `@/` → `src/`.

---

## 4. Arsitektur frontend

### 4.1 Boot sequence

```
index.html  → CSS kritis + shell statis (judul, role) + <noscript> ringkasan
main.tsx    → muat settings & save → tentukan mode awal
App.tsx     → mode === 'quick' ? <QuickReadApp/> : <Suspense><AdventureApp/></Suspense>
AdventureApp→ deteksi WebGL → preload atlas → TitleScreen → World + Hud
```

Penentuan mode awal (urut): parameter URL `?mode=` → preferensi tersimpan → tanpa WebGL / `prefers-reduced-motion` / `navigator.connection.saveData` ⇒ `quick` → default `adventure` (title screen tetap menawarkan keduanya).

### 4.2 Canvas

```tsx
<Canvas
  dpr={[1, maxDpr]}                       // 2 desktop, 1.5 mobile
  gl={{ antialias: false, powerPreference: 'high-performance' }}
  camera={{ fov: 28, near: 0.1, far: 200 }}
  frameloop={paused ? 'never' : 'always'} // pause saat tab hidden / window penuh menutup dunia
  shadows={tier !== 'low'}
>
  <PerformanceMonitor onDecline={lowerTier} onIncline={raiseTier} />
  <World />
  <Effects tier={tier} />
</Canvas>
```

- Canvas `position: fixed`, di belakang HUD; HUD adalah DOM biasa (bukan `<Html>` di dalam scene) agar aksesibel dan tajam.
- `<Html>` Drei hanya untuk penanda yang harus menempel ke objek dunia (mis. nama lokasi), dan dibatasi jumlahnya.

### 4.3 Rendering pixel 2.5D

| Hal | Implementasi |
|---|---|
| Tekstur pixel | `magFilter = minFilter = NearestFilter`, `generateMipmaps = false`, `colorSpace = SRGBColorSpace`. Satu helper `pixelTexture()` — jangan diulang manual |
| Sprite | `PlaneGeometry` + material `alphaTest: 0.5` (bukan `transparent`) → masuk depth buffer, tidak ada masalah sorting |
| Billboard | Hanya sumbu Y (sprite tetap tegak) |
| Animasi sprite | Geser `texture.offset`/UV per frame atlas berdasarkan akumulasi waktu; fps per animasi dari metadata atlas |
| Tanah | Satu mesh tile-map (geometri di-merge / shader tilemap), bukan ribuan plane |
| Prop berulang | `InstancedMesh` |
| Bayangan karakter | Blob elips di tanah; shadow map hanya dari bangunan & satu directional light |
| Cahaya lentera | Point light dibatasi (≤ 6 aktif); sisanya dipalsukan dengan sprite glow additive |
| Tilt-shift | `TiltShift2`/DepthOfField dari postprocessing; dimatikan di tier `low` |
| Tone mapping | Konsisten satu setelan; cek warna sprite tidak "washed out" (pertimbangkan `toneMapped={false}` untuk material sprite UI-dunia) |

### 4.4 Loop & animasi

| Jenis gerak | Alat | Aturan |
|---|---|---|
| Kontinu (jalan, follow camera, flicker, partikel) | `useFrame((state, delta) => …)` | Selalu pakai `delta`; mutasi ref; tanpa alokasi objek baru per frame |
| Diskret/berurutan (intro, fokus kamera ke bangunan, transisi scene) | GSAP timeline | Dibuat dalam `useGSAP` agar auto-cleanup; target = ref/objek biasa |
| UI DOM | CSS transition/`steps()` + GSAP untuk sequence | Token durasi dari `DESIGN.md` |

- Saat GSAP mengambil alih kamera (cinematic), set flag `cameraMode = 'cinematic'` agar `CameraRig` berhenti mengikuti hero. Satu pemilik kamera pada satu waktu.
- Semua timeline menghormati `reducedMotion` (durasi → 0 atau diganti fade).
- Clamp `delta` (maks. 1/20 dtk) agar tab yang baru aktif tidak membuat hero "teleport".

### 4.5 Sistem dunia

Sistem adalah hook yang dipasang sekali di `World.tsx`:

| Sistem | Tugas |
|---|---|
| `useInputSystem` | Keyboard/pointer → *action* (`move`, `interact`, `cancel`, `menu`) di store. Dinonaktifkan saat window/dialog terbuka |
| `useMovementSystem` | Gerakkan hero menuju arah/target; cek collision grid; pilih animasi & arah hadap |
| `useZoneSystem` | Deteksi hero masuk zona lokasi → `visitLocation(id)` |
| `useInteractionSystem` | Cari interactable terdekat dalam radius → set `activeInteractableId`; jalankan aksi saat `interact` |
| `useCameraSystem` | Follow + batas dunia + mode cinematic |

Collision & pathfinding memakai grid 2D dari `content/world.ts` (walkable/blocked) + A* sederhana untuk tap-to-move. Tanpa physics engine.

---

## 5. State management

### 5.1 Pembagian state

| Jenis | Tempat | Contoh |
|---|---|---|
| Progress permainan (persisten) | `useGameStore` + `persist` | xp, visited, questsRead, achievements |
| Pengaturan (persisten) | `useSettingsStore` + `persist` | mode, quality, sound, reducedMotion |
| State dunia sesaat | `usePlayerStore` | zona saat ini, interactable aktif, target jalan |
| State UI sesaat | `useUIStore` | window aktif, antrian dialog, antrian toast |
| State per-frame | **ref**, bukan store | posisi hero, posisi kamera, frame sprite |
| State lokal komponen | `useState` | tab terpilih, nilai input form |
| Data server | — | Tidak ada; form kontak cukup `useActionState`/state lokal |

### 5.2 Aturan zustand

```ts
// ✅ selector sempit — re-render hanya saat nilainya berubah
const xp = useGameStore((s) => s.xp);

// ✅ di dalam useFrame: baca tanpa subscribe
useFrame(() => {
  const { moveDir } = usePlayerStore.getState();
});

// ❌ mengambil seluruh store
const store = useGameStore();
```

- Aksi didefinisikan di store dan memanggil fungsi murni dari `game/rules/`. Komponen tidak menghitung XP sendiri.
- Aksi harus idempoten (`visitLocation('guild-hall')` dua kali = efek sekali).
- Efek samping lintas-store (XP naik → toast → SFX) lewat `game/events.ts` atau `subscribe`, bukan saling impor melingkar.
- Posisi hero **tidak** disimpan di store per frame. Kalau UI butuh (mis. minimap), tulis ke store maks. 10×/detik.
- `persist`: `name: '{{APP_KEY}}:save:v1'`, `version`, `migrate`, dan `partialize` hanya field yang perlu.

### 5.3 Alur satu interaksi (contoh)

```
[world] hero masuk radius Quest Board
   → usePlayerStore.setActiveInteractable('quest-board')
[ui]   ControlHints menampilkan "E  Baca papan"
[input] tekan E → action 'interact'
[world] useInteractionSystem → useUIStore.openWindow('quest-board')
[game]  useGameStore.visitLocation('quest-board') → rules/xp.grant → +50 XP (sekali)
[game]  events.emit('xp:gained') → useUIStore.pushToast(...) ; audio.play('reward')
[ui]    QuestBoard window terbuka; input dunia dinonaktifkan; fokus pindah ke window
```

---

## 6. Data konten

```ts
// content/schema.ts (ringkas)
export type Quest = {
  id: string;            // slug, dipakai di URL
  title: string;
  year: number;
  role: string;
  rank: 'S' | 'A' | 'B' | 'C';        // bobot/skala proyek
  summary: string;                     // 1 kalimat
  problem: string; solution: string; outcome: string;
  stack: SkillId[];
  links: { label: string; href: string; kind: 'demo' | 'repo' | 'article' }[];
  media: { src: string; alt: string; width: number; height: number }[];
  featured?: boolean;
};

export type Location = {
  id: LocationId;        // 'guild-hall' | 'quest-board' | ...
  name: string;
  position: [number, number, number];
  zoneRadius: number;
  window: WindowId;      // window UI yang dibuka
  cameraFocus?: { offset: [number, number, number] };
};
```

- Semua konten divalidasi `zod` saat dev/test (bukan saat runtime produksi).
- Setiap gambar wajib `alt`, `width`, `height`.
- Blok `ui/sections/*` menerima data ini dan dipakai ulang oleh window Adventure **dan** Quick Read → paritas konten terjamin secara struktural.

---

## 7. Routing & URL

Hash routing kecil buatan sendiri (`lib/useHashRoute.ts`), disinkronkan dua arah dengan `useUIStore`:

| URL | Arti |
|---|---|
| `/` | Title / hub |
| `/#/about`, `/#/quests`, `/#/skills`, `/#/experience`, `/#/contact` | Section |
| `/#/quests/:id` | Detail proyek |
| `?mode=quick` \| `?mode=adventure` | Paksa mode |
| `?qa=1` | Mode deterministik untuk test (§11) |

Tombol Back browser menutup window teratas terlebih dahulu.

---

## 8. API integration

Aplikasi ini statis; integrasi eksternal minimal dan selalu lewat `services/`.

| Service | Kontrak | Kegagalan |
|---|---|---|
| `contact.send(payload)` | `POST VITE_CONTACT_ENDPOINT` JSON `{name,email,message}`; timeout 10 dtk (`AbortController`); kembalikan `Result<ok, 'network' \| 'validation' \| 'rate-limit' \| 'server'>` | UI menampilkan pesan sesuai jenis; fallback `mailto:` |
| `save.load()/save()` | localStorage, try/catch (private mode bisa melempar), validasi zod, migrasi versi | Data rusak → default |
| `analytics.track(event, props)` | No-op bila env kosong atau Do-Not-Track | Tidak pernah melempar error |
| `audio.play(id)` | Lazy init setelah gesture pengguna pertama | Diam bila gagal |

Aturan:
- Komponen **tidak** memanggil `fetch` langsung.
- Service mengembalikan `Result`, tidak melempar ke UI.
- Rahasia tidak pernah di bundle klien; hanya variabel `VITE_*` yang memang publik. Sertakan `.env.example`.

---

## 9. Component architecture

Detail di `COMPONENTS.md`. Ringkasnya:

```
ui/primitives   → tanpa state bisnis, tanpa store. Hanya props + token.
ui/patterns     → gabungan primitives + perilaku (focus trap, typewriter). Tanpa store.
ui/sections     → menampilkan konten dari content/. Tanpa store (data via props).
ui/screens, hud → terhubung ke store. Merangkai patterns + sections.

world/primitives → Sprite, AnimatedSprite, Interactable… tanpa store.
world/entities   → Hero, Npc, Building… boleh baca store.
world/systems    → hook logika per-frame.
```

Komponen "pintar" (terhubung store) hanya di `screens/`, `hud/`, `entities/`, `systems/`. Sisanya murni dan mudah diuji.

---

## 10. Performa

### 10.1 Anggaran

| Item | Batas |
|---|---|
| JS shell awal (tanpa three) | ≤ 120 KB gzip |
| Chunk dunia (three + r3f + drei + postprocessing + kode dunia) | ≤ 450 KB gzip |
| Aset untuk scene pertama | ≤ 2.5 MB |
| Total transfer first visit | ≤ 4 MB |
| Draw call | ≤ 120 |
| Point light aktif | ≤ 6 |
| Tekstur | Atlas ≤ 2048², total ≤ 6 atlas |
| Long task saat main | Tidak ada > 50 ms setelah load |

### 10.2 Teknik wajib

- `React.lazy` untuk `AdventureApp`; `manualChunks` memisahkan `three` dan `postprocessing`.
- Impor Drei per-nama; jangan `import * as`.
- Preload aset lewat daftar eksplisit (`world/loaders/preload.ts`) + `useProgress` untuk loading bar.
- Geometry/material dibuat sekali (`useMemo`/modul-level) dan dibagi pakai.
- `dispose` otomatis oleh R3F — jangan membuat objek Three di luar React tanpa membersihkannya.
- Pause render saat `document.hidden` atau saat window penuh menutupi dunia.
- `PerformanceMonitor` menurunkan tier; pilihan manual pengguna mengalahkan otomatis.
- PNG dioptimalkan (oxipng/pngquant, palet terindeks). Audio di-lazy-load setelah gesture.

---

## 11. Testability hooks

- `?qa=1` mengaktifkan `window.__QA__`: bekukan clock dunia, seed RNG tetap, matikan partikel & flicker, lewati intro, typewriter instan, `teleport(locationId)`.
- Elemen penting punya `data-testid` stabil (`hud-xp`, `dialog-box`, `window-quest-board`, …).
- Canvas mengekspos `data-ready="true"` saat frame pertama selesai dirender.
- Flag QA tidak boleh mengubah logika bisnis, hanya waktu & keacakan.

---

## 12. Coding conventions

### 12.1 Umum

- TypeScript `strict`; tanpa `any` (pakai `unknown` + narrowing).
- Named export saja (kecuali komponen yang di-`lazy`).
- Satu komponen per file; nama file = nama komponen (`PixelButton.tsx`). Hook: `useThing.ts`. Util: `camelCase.ts`.
- Urutan dalam file: impor → tipe → konstanta → komponen → helper privat.
- Tanpa angka ajaib: durasi, warna, ukuran berasal dari token/`theme.ts`/konstanta bernama.
- Komentar menjelaskan *mengapa*, bukan *apa*.

### 12.2 React

- React 19: `ref` sebagai prop biasa (tanpa `forwardRef`); form memakai `useActionState` bila cocok.
- Jangan menambah `useMemo`/`useCallback` tanpa alasan terukur — kecuali untuk objek Three (geometry, material, vector) yang **harus** stabil.
- Efek hanya untuk sinkronisasi dengan dunia luar; turunan state dihitung saat render.
- Tiap `useEffect` yang mendaftar listener/timeline wajib cleanup.

### 12.3 R3F / Three

- Dilarang `setState` di dalam `useFrame`.
- Dilarang `new Vector3()` dkk. di dalam `useFrame`; pakai scratch object level modul.
- Selalu kalikan `delta`.
- Tekstur pixel hanya lewat `pixelTexture()` / `useAtlas()`.
- Event pointer di mesh: panggil `e.stopPropagation()` bila perlu; set kursor lewat helper, bukan langsung di tiap komponen.
- Warna dari `world/theme.ts`, bukan hex literal.

### 12.4 Tailwind

- Hanya utility dari token; **tanpa** nilai arbitrer (`w-[37px]`) kecuali berbasis `--px` (`p-[calc(var(--px)*3)]`) dan itu pun lebih baik dijadikan utility.
- Dilarang: `rounded-*`, `shadow-*` bawaan (blur), `blur-*` pada elemen pixel.
- Varian komponen lewat peta objek (`const variants = {…}`), bukan rangkaian ternary kelas.
- Urutan kelas otomatis oleh prettier-plugin-tailwindcss.

### 12.5 Git

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `perf:`, `docs:`, `test:`, `chore:`).
- Satu PR = satu tujuan. PR refactor tidak mengubah perilaku.
- Script: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:e2e`, `test:visual`.

---

## 13. Rencana refactor

Urutan ini menjaga aplikasi tetap jalan di setiap langkah.

| Fase | Pekerjaan | Selesai ketika |
|---|---|---|
| **0. Audit** | Catat kondisi sekarang (tabel di bawah); ukur bundle, FPS, Lighthouse sebagai baseline | Baseline tercatat |
| **1. Fondasi** | TypeScript (boleh bertahap `allowJs`), ESLint + aturan impor, alias `@/`, token `tokens.css` + `theme.ts`, Vitest | `lint`, `typecheck`, `test` hijau |
| **2. Ekstrak konten** | Pindahkan semua teks/data ke `content/` + skema | Tidak ada konten hardcode di komponen |
| **3. Ekstrak logika** | Store zustand + `game/rules` + `services/save` dengan unit test | Logika XP/quest teruji tanpa render |
| **4. UI primitives** | Bangun `PixelFrame`, `PixelButton`, `DialogBox`, dst.; ganti UI lama satu per satu | Tidak ada hex/ukuran liar di `ui/` |
| **5. World primitives** | `pixelTexture`, `Sprite`, `AnimatedSprite`, `Interactable`, sistem input/movement/zone | Hero berjalan & berinteraksi lewat sistem baru |
| **6. Tampilan HD-2D** | Kamera, lighting, `Effects` per tier, parallax | Cocok dengan `DESIGN.md` di ketiga tier |
| **7. Quick Read + routing** | `sections/` dipakai dua mode; hash route | Paritas konten & deep link bekerja |
| **8. Gamification** | XP, quest log, achievement, toast, persistensi | Sesuai `PRODUCT.md` §7 |
| **9. Performa & QA** | Code split, anggaran, Playwright visual, axe | `QA-CHECKLIST.md` lulus |

### Audit kondisi saat ini (isi sebelum mulai)

| Area | Kondisi sekarang | Target | Selisih / tindakan |
|---|---|---|---|
| Bahasa (JS/TS) | JavaScript + JSX, 20 file, ±2.960 baris. Tanpa TypeScript, tanpa `tsconfig` | TS strict | Pasang TypeScript (perlu persetujuan §1.2), migrasi bertahap dengan `allowJs` |
| Versi three / r3f / drei / tailwind | React 18.3.1 (bukan 19). `@react-three/fiber` 8.18.0 terpasang tetapi tidak diimpor di mana pun. `three` 0.169.0 hanya dependensi transitif dari `react-globe.gl`. Drei **tidak terpasang**. Tailwind 3.4.17 (PostCSS). Vite 5.4.18. GSAP 3.12.7 + `@gsap/react` 2.1.2 | React 19, r3f v9+, tailwind v4 | Naikkan React ke 19 dan r3f ke 9; pasang `three` dan `@react-three/drei` sebagai dependensi langsung; putuskan Tailwind v4 atau tetap v3 dengan token di `tailwind.config`; buang `react-globe.gl` dan `react-responsive` |
| State management | `useState` lokal per section. Tanpa store, tanpa persistensi | zustand, 4 store | Pasang zustand (perlu persetujuan), bangun 4 store + `services/save` |
| Lokasi konten | `src/constants/index.js` dan `src/constants/cv.js`. Sebagian teks masih hardcode di komponen (judul section, label stat hero, footer). `index.js` juga berisi data template yang tidak dipakai: `clientReviews`, `myProjects`, `workExperiences` | `content/` | Pindahkan konten nyata ke `src/content/` ber-skema; hapus data template (bukan konten pemilik) |
| Struktur folder | `src/sections`, `src/components/ui`, `src/pages`, `src/hooks`, `src/constants`. Tanpa `game/`, `world/`, `ui/`, `services/` | §3 | Bangun struktur §3; situs lama (neo-brutalist, satu halaman scroll) diganti seluruhnya |
| Post-processing | Tidak ada. Tidak ada `<Canvas>` milik sendiri; satu-satunya WebGL adalah globe dari `react-globe.gl` | per tier | Pasang `@react-three/postprocessing` (perlu persetujuan), bangun `Effects` per tier |
| Ukuran bundle (gzip) | Diukur `vite build` 2026-11-17: `index.js` 105,09 KB; chunk `About` (globe + three) 484,42 KB; `CVPage` 1,51 KB; CSS 6,79 KB. Build memberi warning chunk > 500 KB. `public/` 14,8 MB (models 4,2 MB + textures 5,1 MB tidak direferensikan kode) | §10.1 | Shell 105 KB sudah di bawah 120 KB; chunk berat 484 KB melewati batas 450 KB dan akan hilang bersama globe. Hapus aset tak terpakai |
| FPS desktop / mobile | Belum diukur. Situs sekarang tidak punya dunia 3D, jadi angka FPS-nya tidak sebanding dengan target | 60 / ≥ 30 | Ukur setelah Fase 5 (hero bisa berjalan), lalu lagi di Fase 6 dan 9 |
| Test yang ada | Tidak ada test, tidak ada script `typecheck`/`test`. `eslint .` gagal: 26 error, semuanya `react/prop-types` | unit + e2e + visual | Pasang Vitest, Testing Library, Playwright, axe (perlu persetujuan); tambah script §12.5 |
| Lighthouse | Belum diukur | A9: ≥ 90 / 95 / 95 / 95 (Quick Read) | Ukur saat Quick Read ada (Fase 7) |
| Font | 4 `@import` dari CDN (cdnfonts + Google Fonts): General Sans, Instrument Serif, Manrope, Archivo Black, JetBrains Mono, Space Grotesk | Self-host via `@fontsource`: Press Start 2P, Pixelify Sans, Crimson Pro, JetBrains Mono | Paket `@fontsource/*` tidak ada di daftar §1.2, perlu persetujuan |
| Routing | `useHashRoute` buatan sendiri: `/#/cv` + anchor `#about` dst. | §7 | Pertahankan pendekatan hash; tulis ulang sesuai tabel §7. Rute `/#/cv` tidak ada di §7 (perlu keputusan) |
| SEO / meta | `<title>ArkDev</title>`, favicon `vite.svg`. Tanpa description, OG, JSON-LD, `robots.txt`, `sitemap.xml`, `<noscript>` | `QA-CHECKLIST.md` §9 | Bangun di Fase 7 dan 9 |
