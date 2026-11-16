# COMPONENTS.md — Component Guidelines

> Definisi komponen reusable: kapan dipakai, props, varian, state, komposisi, dan aturan konsistensi. Gaya visual mengacu ke `DESIGN.md`; letak folder ke `ARCHITECTURE.md` §3.

---

## 1. Aturan umum

### 1.1 Lapisan komponen

| Lapisan | Folder | Boleh akses store? | Contoh |
|---|---|---|---|
| UI primitive | `ui/primitives` | Tidak | `PixelFrame`, `PixelButton`, `Icon` |
| UI pattern | `ui/patterns` | Tidak | `DialogBox`, `MenuList`, `Modal`, `Toast` |
| Section | `ui/sections` | Tidak (data via props) | `QuestDetailSection`, `StatusSheet` |
| Screen / HUD | `ui/screens`, `ui/hud` | Ya | `QuestBoardWindow`, `Hud` |
| World primitive | `world/primitives` | Tidak | `Sprite`, `AnimatedSprite`, `Interactable` |
| World entity | `world/entities` | Ya | `Hero`, `Npc`, `Building` |

Sebelum membuat komponen baru: cek daftar di dokumen ini → bisa dengan varian/komposisi? → baru buat, lalu **tambahkan ke dokumen ini**.

### 1.2 Konvensi props

| Aturan | Contoh |
|---|---|
| Varian visual: `variant` | `variant="primary" \| "secondary" \| "ghost" \| "danger"` |
| Ukuran: `size` | `size="sm" \| "md" \| "lg"` |
| Boolean: awalan `is`/`has` atau nama native | `isLoading`, `disabled`, `isSelected` |
| Handler: `on` + kata kerja | `onSelect`, `onClose`, `onInteract` |
| Selalu terima `className` (digabung paling akhir) dan teruskan `...rest` ke elemen akar | — |
| `ref` sebagai prop biasa (React 19) | — |
| Default eksplisit di destrukturisasi | `{ variant = 'primary', size = 'md' }` |
| Hindari prop boolean yang saling eksklusif | ❌ `primary secondary` → ✅ `variant` |
| Komponen controlled bila punya nilai | `value` + `onChange`; boleh `defaultValue` |

Penggabungan kelas memakai helper `cn()` (clsx + tailwind-merge). Varian didefinisikan sebagai peta objek.

### 1.3 Matriks state interaktif (wajib untuk semua elemen interaktif)

| State | Visual | Catatan |
|---|---|---|
| `default` | Gaya dasar | — |
| `hover` | Naik 1px, border `gold-400` | Hanya perangkat dengan hover (`@media (hover:hover)`) |
| `focus-visible` | Focus ring emas (`DESIGN.md` §6.2) | Tidak boleh dihilangkan |
| `active/pressed` | Turun 1px, bayangan hilang | `motion-instant` |
| `selected` | Kursor `▶` + latar `night-700` | `aria-selected`/`aria-current` |
| `disabled` | Opasitas 50%, tanpa hover, kursor default | `disabled` atau `aria-disabled` |
| `loading` | Label diganti indikator titik berjalan, lebar tetap | `aria-busy`, tidak bisa diklik |

### 1.4 Aksesibilitas dasar

- Pakai elemen semantik (`button`, `a`, `dialog`, `ul`) sebelum ARIA.
- Semua kontrol bisa dicapai dan dioperasikan dengan keyboard.
- Ikon tanpa label wajib `aria-label`; ikon dekoratif `aria-hidden`.
- Target sentuh ≥ 44×44 CSS px.

---

## 2. UI primitives

### 2.1 `PixelFrame`

Window/panel dasar. Semua permukaan UI dibangun dari ini.

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `variant` | `'window' \| 'parchment' \| 'ghost'` | `'window'` | Gelap / kertas terang / hanya border |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | `space-2 / 4 / 6` |
| `as` | elemen | `'div'` | `section`, `article`, `aside`, … |
| `title` | `ReactNode` | — | Nameplate di sudut kiri atas |

Aturan: jangan menumpuk `PixelFrame` lebih dari 2 tingkat; di dalam `window` pakai pembatas garis `dusk-500`, bukan frame baru.

### 2.2 `PixelButton`

| Prop | Tipe | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `isLoading` | `boolean` | `false` |
| `iconLeft` / `iconRight` | `IconName` | — |
| `href` | `string` | — (jika ada → render `<a>`) |
| `sfx` | `'confirm' \| 'cancel' \| 'none'` | `'confirm'` |

| Varian | Pemakaian | Batas |
|---|---|---|
| `primary` | Aksi utama (emas, teks `ink-900`) | **Maks. 1 per window** |
| `secondary` | Aksi pendamping (border parchment) | — |
| `ghost` | Aksi tersier, tombol HUD | — |
| `danger` | Destruktif (reset progress) | Selalu lewat konfirmasi |

Label: kata kerja, ≤ 3 kata ("Kirim Surat", "Lihat Demo"). Link eksternal otomatis mendapat ikon `external` + `rel="noopener noreferrer"`.

### 2.3 `Icon`

| Prop | Tipe | Default |
|---|---|---|
| `name` | `IconName` (union dari sprite ikon) | wajib |
| `size` | `1 \| 2 \| 3` (kelipatan 16 px) | `1` |
| `label` | `string` | — (tanpa label → `aria-hidden`) |

Satu sprite sheet ikon; `image-rendering: pixelated`. Dilarang memakai library ikon vektor.

### 2.4 `Tag`

| Prop | Tipe | Default |
|---|---|---|
| `tone` | `'neutral' \| 'gold' \| 'mana' \| 'herb' \| 'hp'` | `'neutral'` |
| `icon` | `IconName` | — |

Untuk tech stack, tahun, status quest. Bukan tombol; bila bisa diklik pakai `PixelButton size="sm" variant="ghost"`.

### 2.5 `RarityBadge`

`rarity: 'common' | 'rare' | 'epic' | 'legendary'` → warna + label teks (warna tidak berdiri sendiri). Dipakai di Armory.

### 2.6 `StatBar`

| Prop | Tipe | Default |
|---|---|---|
| `kind` | `'hp' \| 'mp' \| 'xp'` | `'xp'` |
| `value` / `max` | `number` | wajib |
| `label` | `string` | wajib (untuk a11y) |
| `showValue` | `boolean` | `true` |

Render `role="progressbar"` + `aria-valuenow/min/max`. Perubahan nilai dianimasikan bertahap (`steps`), dengan kilau saat penuh.

### 2.7 `Portrait`

`src`, `alt`, `size: 'sm' (32) | 'md' (64) | 'lg' (96)`, `frame?: boolean`. Skala integer saja.

### 2.8 `Kbd`

Menampilkan tombol keyboard/gestur sebagai keycap pixel: `<Kbd>E</Kbd>`. Di perangkat sentuh, `ControlHints` menggantinya dengan ikon tap.

### 2.9 `Divider`, `VisuallyHidden`, `Spinner`

- `Divider`: garis `dusk-500` 1px, opsional ornamen tengah.
- `VisuallyHidden`: teks hanya untuk screen reader.
- `Spinner`: sprite 4 frame (jam pasir/kristal), `steps(4)`, punya `label`.

---

## 3. UI patterns

### 3.1 `DialogBox`

Kotak dialog JRPG di bawah layar.

| Prop | Tipe | Keterangan |
|---|---|---|
| `speaker` | `{ name: string; portrait?: string }` | Nameplate + potret |
| `lines` | `string[]` | Tiap elemen = satu halaman dialog (≤ 140 karakter) |
| `choices` | `{ id: string; label: string }[]` | Muncul setelah baris terakhir (maks. 4) |
| `onChoose` | `(id) => void` | — |
| `onFinish` | `() => void` | — |
| `typeSpeed` | `number` | 30 ms/karakter; `0` = instan |

State mesin: `typing` → `waiting` (indikator `▼`) → `typing` (halaman berikut) … → `choosing` → `closed`.

| Input | `typing` | `waiting` | `choosing` |
|---|---|---|---|
| Enter / Space / E / klik / tap | Lengkapi teks | Halaman berikut | Pilih item |
| ↑ ↓ | — | — | Pindah kursor |
| Esc | Tutup (jika `dismissible`) | Tutup | Batal = pilihan terakhir |

A11y: kontainer `role="dialog"` `aria-live="polite"`; teks **lengkap** langsung ada di DOM untuk screen reader, efek typewriter hanya visual (`aria-hidden` pada lapisan animasi). Reduced motion → instan.

### 3.2 `MenuList` + `MenuItem`

Daftar pilihan vertikal dengan kursor `▶`.

| Prop | Tipe |
|---|---|
| `items` | `{ id; label; icon?; hint?; disabled?; badge? }[]` |
| `value` / `onChange` | id terpilih (controlled) |
| `onConfirm` | `(id) => void` |
| `orientation` | `'vertical' \| 'grid'` |

Keyboard: ↑↓ (dan ←→ pada grid) pindah, Home/End, Enter/Space konfirmasi, ketik huruf = lompat. Roving `tabindex`; `role="menu"`/`menuitem` atau `listbox`/`option` sesuai konteks. Kursor membungkus dari akhir ke awal. Hover mouse memindahkan kursor; klik = konfirmasi.

### 3.3 `Modal` / `ConfirmDialog`

Dibangun di atas `<dialog>` native.

| Prop | Tipe | Default |
|---|---|---|
| `open` / `onClose` | — | wajib |
| `title` | `string` | wajib (`aria-labelledby`) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `dismissible` | `boolean` | `true` (Esc & klik backdrop) |

`ConfirmDialog` menambah: `message`, `confirmLabel`, `cancelLabel`, `tone: 'default' | 'danger'`, `onConfirm`. Fokus awal di **Batal** untuk aksi destruktif. Fokus terperangkap di dalam; saat tutup kembali ke pemicu.

### 3.4 `Window` (konten lokasi)

Kontainer untuk konten lokasi (About, Quest Board, dst.) di Adventure Mode.

| Prop | Tipe |
|---|---|
| `id` | `WindowId` |
| `title` | `string` |
| `icon` | `IconName` |
| `variant` | `'window' \| 'parchment'` |
| `onClose` | `() => void` |
| `footer` | `ReactNode` (hint tombol / aksi) |

Perilaku: animasi buka gaya menu JRPG; header lengket dengan tombol tutup; isi scroll internal; di mobile menjadi bottom sheet 85% tinggi. Hanya **satu** `Window` terbuka pada satu waktu (detail quest menggantikan isi, dengan tombol kembali).

### 3.5 `Tabs`

`items`, `value`, `onChange`. Tampilan tab berupa "pembatas buku". Keyboard ←→, `role="tablist"`. Dipakai di Armory (kategori skill) dan Quest Board (filter).

### 3.6 `Toast` / `ToastViewport`

| Prop | Tipe | Default |
|---|---|---|
| `kind` | `'achievement' \| 'xp' \| 'success' \| 'error' \| 'info'` | `'info'` |
| `title` | `string` | wajib |
| `description` | `string` | — |
| `icon` | `IconName` | per `kind` |
| `duration` | `number` | 4000 ms (`error`: 8000, bisa ditutup manual) |

Antrian FIFO, maks. 2 terlihat; XP beruntun digabung ("+80 XP"). `role="status"` (error: `role="alert"`). Jeda saat hover/fokus.

### 3.7 `FormField`, `TextInput`, `TextArea`

| Prop (`FormField`) | Tipe |
|---|---|
| `label` | `string` (selalu terlihat) |
| `hint` | `string` |
| `error` | `string` |
| `required` | `boolean` |
| `children` | input |

`FormField` mengurus `id`, `htmlFor`, `aria-describedby`, `aria-invalid`. Input: latar `night-900`, border parchment, teks Body 18px (≥ 16px agar iOS tidak zoom). `TextArea` punya penghitung karakter. Aturan validasi di `UX-GUIDELINES.md` §6.

### 3.8 `Tooltip`

Untuk label tombol-ikon HUD. Muncul pada hover (jeda 300 ms) dan fokus; tidak berisi informasi penting; tidak dipakai di perangkat sentuh.

### 3.9 `EmptyState`, `ErrorState`

| Prop | Tipe |
|---|---|
| `illustration` | `IconName`/sprite |
| `title` | `string` |
| `description` | `string` |
| `action` | `{ label; onClick }` |

Isi teks mengikuti `UX-GUIDELINES.md` §3–4.

### 3.10 `SceneTransition`

Overlay transisi antar-scene. `kind: 'fade' | 'iris'`, `isActive`, `onMidpoint`, `onDone`. Reduced motion → fade 150 ms.

---

## 4. Sections (konten, dipakai dua mode)

Semua section menerima data dari `content/` lewat props dan **tidak** tahu sedang dirender di `Window` (Adventure) atau halaman (Quick Read). Prop `headingLevel` mengatur `h1–h3` agar hierarki dokumen benar.

| Komponen | Data | Isi |
|---|---|---|
| `StatusSheet` | `profile` | Potret, nama, class, level, stat, bio, ketersediaan |
| `QuestCard` | `quest` | Rank, judul, ringkasan, tag stack, status `new`/`read` |
| `QuestList` | `quests[]` | Grid `QuestCard` + filter |
| `QuestDetailSection` | `quest` | Masalah → peran → solusi → hasil, media, link |
| `EquipmentGrid` | `skills[]` | Item per slot + `RarityBadge` + tautan ke quest pembukti |
| `ChronicleTimeline` | `experience[]` | Entri kronologis |
| `ContactSection` | `profile.links` | Form + link sosial + unduh CV |

`QuestCard` state: `default`, `hover`, `focus`, `selected`, `read` (centang kecil). Seluruh kartu adalah satu target klik (`<a>`/`<button>` membungkus), bukan tombol di dalam kartu.

---

## 5. HUD & screens

| Komponen | Tugas | Store |
|---|---|---|
| `Hud` | Tata letak safe area; sembunyikan sebagian saat dialog | `useUIStore` |
| `HeroStatus` | Nama, LV, `StatBar xp` | `useGameStore` |
| `ControlHints` | Hint kontekstual ("`E` Bicara"), berganti untuk sentuh | `usePlayerStore` |
| `ActionButton` | Tombol aksi besar di perangkat sentuh, muncul saat ada interactable | `usePlayerStore` |
| `HudMenuButton`, `SoundToggle`, `ModeToggle` | Tombol-ikon dengan `aria-label` + `Tooltip` | `useSettingsStore` |
| `FastTravelMenu` | `MenuList` lokasi + status dikunjungi | `useGameStore` |
| `QuestLog` | Progress main/side quest | `useGameStore` |
| `SettingsMenu` | Suara, kualitas, reduced motion, reset | `useSettingsStore` |
| `TitleScreen` | Judul, "Press Start", "Quick Read" | — |
| `LoadingScreen` | Progress + tip | `useProgress` |
| `LocationBanner` | Nama lokasi muncul saat masuk zona | `usePlayerStore` |

---

## 6. World primitives (R3F)

### 6.1 `Sprite`

Plane bertekstur pixel.

| Prop | Tipe | Default |
|---|---|---|
| `atlas` | `AtlasId` | wajib |
| `frame` | `string` | wajib |
| `billboard` | `boolean` | `true` (sumbu Y) |
| `anchor` | `'bottom' \| 'center'` | `'bottom'` |
| `flipX` | `boolean` | `false` |
| `outline` | `boolean` | `false` (highlight emas saat bisa diinteraksi) |

Ukuran dunia dihitung otomatis dari ukuran frame ÷ 32 (PPU). **Jangan** memberi `scale` non-integer.

### 6.2 `AnimatedSprite`

Menambah: `animation: string`, `fps?: number`, `loop?: boolean`, `onComplete?`, `paused?`. Animasi didefinisikan di metadata atlas (`{ idle: { frames: [...], fps: 4 } }`). Pergantian frame berbasis akumulasi `delta`, bukan `setInterval`.

### 6.3 `Interactable`

Membungkus objek dunia agar bisa diinteraksi.

| Prop | Tipe | Keterangan |
|---|---|---|
| `id` | `string` | Unik |
| `radius` | `number` | Jarak aktif (default 1.5 unit) |
| `prompt` | `string` | Teks hint ("Baca papan") |
| `marker` | `'talk' \| 'look' \| 'enter' \| 'none'` | Ikon melayang |
| `onInteract` | `() => void` | — |
| `label` | `string` | Nama untuk daftar aksesibel/Fast Travel |

Mendaftarkan diri ke interaction system; menangani klik/tap (hero berjalan mendekat lalu berinteraksi); mengubah kursor menjadi pointer. Setiap `Interactable` **wajib** punya padanan di Fast Travel/Quick Read agar terjangkau tanpa pointer.

### 6.4 Lainnya

| Komponen | Keterangan |
|---|---|
| `TileGround` | Props `map`, `tileset`. Satu draw call |
| `BlobShadow` | Bayangan elips di bawah sprite |
| `Lantern` | Sprite + glow additive + point light opsional (`castLight`) + flicker |
| `Particles` | `kind: 'fireflies' \| 'leaves' \| 'sparkle'`, `count` diskalakan tier |
| `ParallaxLayer` | Lapisan latar dengan faktor gerak |
| `WorldLabel` | Teks/ikon yang menempel di objek (pakai hemat) |
| `Zone` | Area pemicu lokasi (tak terlihat; debug wireframe saat `?debug`) |

## 7. World entities

| Komponen | Props utama | Catatan |
|---|---|---|
| `Hero` | — | Dikendalikan movement system; animasi `idle/walk` × 4 arah |
| `Npc` | `id`, `position`, `dialogId`, `behavior: 'idle' \| 'wander' \| 'patrol'` | Menghadap hero saat diajak bicara |
| `Building` | `locationId`, `model`/`sprite` | Berisi `Interactable` (pintu) + `Zone` + `Lantern` |
| `Signpost` | `text`, `target` | Petunjuk arah |
| `Collectible` | `id`, `kind` | Hilang setelah diambil (cek `useGameStore`) |
| `Chest` | `id`, `reward` | Animasi buka sekali |

---

## 8. Pola komposisi

```tsx
// Screen = store + pattern + section
function QuestBoardWindow() {
  const read = useGameStore((s) => s.questsRead);
  const close = useUIStore((s) => s.closeWindow);
  return (
    <Window id="quest-board" title="Quest Board" icon="scroll" onClose={close}
            footer={<ControlHints.Static items={[['Enter', 'Buka'], ['Esc', 'Tutup']]} />}>
      <QuestList quests={quests} readIds={read} headingLevel={2} />
    </Window>
  );
}

// Entity = primitive + interactable
function QuestBoard({ position }: { position: Vec3 }) {
  const open = useUIStore((s) => s.openWindow);
  return (
    <group position={position}>
      <Interactable id="quest-board" label="Quest Board" prompt="Baca papan"
                    marker="look" onInteract={() => open('quest-board')}>
        <Sprite atlas="props" frame="quest-board" />
      </Interactable>
      <BlobShadow />
      <Lantern position={[0.8, 0, 0.2]} castLight />
    </group>
  );
}
```

Prinsip: komposisi lewat `children`/slot lebih baik daripada menambah prop boolean; primitive tidak pernah mengimpor store; satu komponen satu tanggung jawab.

---

## 9. Aturan konsistensi UI

1. Semua permukaan = `PixelFrame`. Tidak ada kartu dengan gaya sendiri.
2. Satu `primary` button per window.
3. Tutup selalu di kanan atas + `Esc`; kembali selalu di kiri atas + `Backspace`/tombol Back.
4. Urutan tombol konfirmasi: **Batal** kiri, **Aksi** kanan.
5. Ikon selalu dari sprite ikon, ukuran kelipatan 16.
6. Kata yang sama untuk hal yang sama (glosarium di `UX-GUIDELINES.md` §10).
7. Warna & spacing hanya dari token.
8. Tiap komponen interaktif memenuhi matriks state §1.3.
9. Tiap komponen baru punya: tipe props, contoh pemakaian, test minimal (render + a11y + interaksi utama), dan entri di dokumen ini.

## 10. Definition of Done komponen

- [ ] Props ber-tipe, default jelas, `className` & `...rest` diteruskan
- [ ] Semua state di §1.3 ada dan terlihat benar
- [ ] Operasi keyboard lengkap; fokus terlihat
- [ ] Nama aksesibel benar (cek dengan axe)
- [ ] Hanya token; tanpa hex/px liar
- [ ] Reduced motion ditangani
- [ ] Benar pada `--px` 3 dan 4, lebar 360 px s.d. 1920 px
- [ ] Unit/component test + snapshot visual
- [ ] Terdaftar di `COMPONENTS.md`
