# DESIGN.md — Design System

> Portofolio bergaya **pixel 2.5D (HD-2D)** dengan nuansa JRPG klasik.
> Dokumen ini adalah sumber kebenaran untuk semua keputusan visual. Kalau kode dan dokumen ini berbeda, perbaiki salah satunya — jangan biarkan keduanya berjalan sendiri.

Dokumen terkait: `PRODUCT.md` (apa & untuk siapa), `ARCHITECTURE.md` (cara membangun), `COMPONENTS.md` (API komponen), `UX-GUIDELINES.md` (pola interaksi), `QA-CHECKLIST.md` (verifikasi).

---

## 1. Konsep visual

### 1.1 Satu kalimat

**Sebuah diorama kota kecil saat senja yang bisa dijelajahi — karakter pixel berjalan di dunia 3D mini yang diterangi lentera.**

Portofolio ini bukan "website dengan hiasan pixel". Ini adalah sebuah *overworld* JRPG kecil: tiap bangunan adalah satu bagian portofolio, tiap proyek adalah sebuah quest.

### 1.2 Apa itu "pixel 2.5D"

Gaya ini dikenal sebagai **HD-2D**: sprite pixel art 2D (billboard) yang ditempatkan di lingkungan 3D poligonal, lalu disatukan dengan pencahayaan modern, depth of field tilt-shift, dan partikel sehingga layar terasa seperti maket/diorama. Ada dua lapisan yang harus selalu dibedakan:

| Lapisan | Isi | Sifat |
|---|---|---|
| **Pixel layer** | Sprite karakter, tile, prop, ikon, bingkai UI | Tajam, resolusi rendah, gerak bertahap (stepped), palet terbatas |
| **HD layer** | Cahaya, bayangan, bloom, DoF, kabut, partikel, kamera, teks panjang | Halus, resolusi penuh, gerak mulus |

Kontras antara dua lapisan inilah yang membuat gaya ini terlihat mahal. **Jangan mem-pixel-kan semuanya** (jadi terlihat murahan) dan **jangan menghaluskan pixel** (jadi blur).

### 1.3 Referensi (inspirasi, bukan untuk disalin)

| Referensi | Yang dipelajari |
|---|---|
| Octopath Traveler I/II, Triangle Strategy | Formula HD-2D: sprite + dunia 3D + tilt-shift + point light dari efek |
| Dragon Quest III / I & II HD-2D Remake | Kota yang hangat, warna cerah, keterbacaan overworld |
| Final Fantasy VI (era 16-bit) | Proporsi sprite, window menu, ritme dialog |
| Chrono Trigger | Animasi sprite ekspresif, transisi antar-scene |
| Paper Mario | Karakter "kertas" di dunia 3D, humor dalam interaksi |
| Super Mario RPG | Sudut pandang isometrik, feedback lompat/pukul blok yang memuaskan |

**Aturan IP:** dilarang memakai sprite, tile, musik, font, logo, atau desain karakter dari game di atas. Semua aset harus orisinal, berlisensi CC0/komersial (mis. paket Kenney, itch.io berlisensi jelas), atau dibuat sendiri (Aseprite). Catat lisensi tiap aset di `public/assets/LICENSES.md`.

### 1.4 Design principles

1. **Diorama, bukan dashboard.** Layar pertama harus terlihat seperti dunia, bukan layout web.
2. **Pixel bergerak bertahap, cahaya bergerak halus.** Sprite & UI pixel memakai `steps()`; kamera, cahaya, dan fade memakai easing mulus.
3. **Konten menang atas gimmick.** Setiap info portofolio harus terbaca ≤ 2 interaksi, dan selalu tersedia tanpa WebGL (lihat Quick Read di `PRODUCT.md`).
4. **Satu grid pixel.** Semua ukuran UI adalah kelipatan `--px`; semua tekstur dunia punya kepadatan texel yang sama.
5. **Setiap aksi dibalas.** Hover, fokus, tekan, berhasil, gagal — semuanya punya respons visual (dan audio opsional) dalam ≤ 100 ms.
6. **Hangat di atas dingin.** Dunia berwarna ungu-indigo senja; hal yang penting/interaktif selalu hangat (emas, ember). Mata pengunjung mengikuti cahaya.
7. **Aksesibel sejak awal.** Kontras AA, navigasi keyboard penuh, hormati `prefers-reduced-motion`.

---

## 2. Identitas

| Elemen | Ketentuan |
|---|---|
| Nama dunia | `{{WORLD_NAME}}` (mis. nama kota fiktif; isi sendiri) |
| Pemilik | `{{OWNER_NAME}}` — tampil sebagai "hero" dengan *class* = role (mis. "Frontend Mage") |
| Logo | Wordmark pixel font + emblem 16×16 px (jadi favicon). Skala hanya integer (1×, 2×, 3×, 4×) |
| Tone of voice | Narator JRPG yang ramah: singkat, sedikit jenaka, tidak pernah mengorbankan kejelasan. Lihat `UX-GUIDELINES.md` §10 |
| Waktu dunia | Senja menuju malam (default). Opsi: tema siang sebagai unlockable |

---

## 3. Color palette

Semua warna didefinisikan sebagai token. **Dilarang menulis hex langsung di komponen.**

### 3.1 Core palette

| Token | Hex | Peran |
|---|---|---|
| `night-900` | `#0F0B1E` | Latar terdalam, langit, letterbox |
| `night-800` | `#1A1433` | Permukaan panel (window UI) |
| `night-700` | `#2A2150` | Panel terangkat, hover baris menu |
| `dusk-500` | `#5B4B9E` | Border sekunder, garis dekoratif (bukan untuk teks) |
| `dusk-300` | `#B9A9D9` | Teks sekunder di atas gelap |
| `parchment-100` | `#F4E8C8` | Teks utama di atas gelap; permukaan "kertas" |
| `parchment-300` | `#D9C594` | Bayangan kertas, border luar window |
| `ink-900` | `#1B1420` | Teks di atas parchment/emas; outline sprite |
| `ink-600` | `#5A4630` | Teks sekunder di atas parchment |
| `gold-400` | `#F2C14E` | **Aksen utama**: kursor, fokus, XP, CTA, highlight interaktif |
| `gold-600` | `#C8902A` | Bayangan emas, state pressed |
| `ember-500` | `#E8643C` | Cahaya lentera, aksen hangat sekunder |

### 3.2 Semantic palette

| Token | Hex | Pemakaian |
|---|---|---|
| `hp-500` | `#D8434F` | Fill error/danger (bar, ikon, border) — **bukan untuk teks kecil** |
| `hp-300` | `#FF6B78` | Teks error di atas gelap |
| `herb-400` | `#6BCB77` | Sukses, quest selesai |
| `mana-400` | `#4FB8E8` | Info, link, MP bar |
| `gold-400` | `#F2C14E` | Warning & reward (dibedakan dengan ikon) |

Di atas parchment gunakan varian gelap: error `#A8322F`, sukses `#2E6B3A`, info `#1F5F8A`.

### 3.3 Kontras terverifikasi (WCAG 2.2)

| Foreground | Background | Rasio | Lulus |
|---|---|---|---|
| `parchment-100` | `night-800` | 14.5:1 | AAA |
| `parchment-100` | `night-700` | 12.0:1 | AAA |
| `dusk-300` | `night-800` | 8.2:1 | AAA |
| `gold-400` | `night-800` | 10.5:1 | AAA |
| `mana-400` | `night-800` | 7.8:1 | AAA |
| `herb-400` | `night-800` | 8.8:1 | AAA |
| `hp-300` | `night-800` | 6.4:1 | AA |
| `hp-500` | `night-800` | 4.1:1 | Hanya non-teks / teks besar |
| `dusk-500` | `night-800` | 2.5:1 | **Dekoratif saja** |
| `ink-900` | `parchment-100` | 14.8:1 | AAA |
| `ink-600` | `parchment-100` | 7.3:1 | AAA |
| `ink-900` | `gold-400` | 10.7:1 | AAA |

### 3.4 Aturan pemakaian

- Komposisi layar: ±70% night/dusk, ±20% parchment, ±10% gold/ember. Emas yang terlalu banyak kehilangan maknanya.
- `gold-400` **hanya** untuk hal yang interaktif, terpilih, atau reward.
- Status tidak boleh disampaikan dengan warna saja — selalu dampingi ikon atau teks.
- Palet sprite dunia: maks. 32 warna per atlas, diturunkan dari core palette + ramp material (kayu, batu, daun, air). Simpan sebagai `palette.gpl`/`.ase` di `assets-src/`.
- Outline sprite memakai `ink-900`, bukan hitam murni.

### 3.5 Pencahayaan dunia

| Sumber | Warna | Catatan |
|---|---|---|
| Ambient / hemisphere | langit `#3B2F7A`, tanah `#1A1433` | Intensitas rendah; dunia tidak pernah hitam pekat |
| Key light (bulan/senja) | `#9FB4FF` | Directional, satu-satunya pemberi shadow map |
| Lentera / jendela | `ember-500` → `gold-400` | Point light, radius kecil, flicker halus ±8% |
| Efek magis / reward | `mana-400` atau `gold-400` | Point light sesaat mengikuti efek (ciri khas HD-2D) |
| Fog | `night-900` → `#2A2150` | Menyatukan horizon dengan background halaman |

---

## 4. Typography

HD-2D memakai tipografi **HD yang bersih di atas dunia pixel**. Kita ikuti: pixel font untuk identitas & angka, serif HD untuk bacaan.

| Peran | Font | Lisensi | Pemakaian |
|---|---|---|---|
| Display | **Press Start 2P** | OFL | Judul, nama lokasi, angka besar (LV, XP). Maks. ±24 karakter per baris |
| UI | **Pixelify Sans** (400–700) | OFL | Label, tombol, menu, nama pembicara dialog, tag |
| Body | **Crimson Pro** (400, 600, italic) | OFL | Teks dialog, deskripsi proyek, paragraf, form input |
| Mono | **JetBrains Mono** | OFL | Cuplikan kode, tech stack bila perlu |

Self-host semua font (woff2, subset latin) lewat `@fontsource`; `font-display: swap`; preload hanya Display + Body regular.

### 4.1 Type scale

Font pixel **harus** dirender pada kelipatan ukuran aslinya agar tidak blur: Press Start 2P pada kelipatan 8 px; Pixelify Sans pada ukuran genap.

| Token | Font | Size / line-height | Pemakaian |
|---|---|---|---|
| `display-xl` | Display | 32 / 48 | Title screen |
| `display-lg` | Display | 24 / 36 | Judul layar/section |
| `display-md` | Display | 16 / 24 | Judul panel, nama lokasi |
| `display-sm` | Display | 8 / 16 | Angka HUD, badge — **bukan** untuk kalimat |
| `ui-lg` | UI 600 | 20 / 28 | Tombol besar, item menu |
| `ui-md` | UI 500 | 16 / 24 | Label, tombol default |
| `ui-sm` | UI 500 | 14 / 20 | Tag, caption, hint tombol |
| `body-lg` | Body 400 | 20 / 30 | Teks dialog, lead paragraf |
| `body-md` | Body 400 | 18 / 28 | Paragraf default |
| `body-sm` | Body 400 | 16 / 24 | Catatan, metadata |

Aturan:
- Teks pixel: `-webkit-font-smoothing: none; font-smooth: never; text-rendering: optimizeSpeed`.
- Display selalu UPPERCASE dengan `letter-spacing: 0`. Body sentence case.
- Panjang baris body 45–70 karakter. Body tidak pernah di bawah 16 px.
- Di mobile (< 640 px): `display-xl` turun ke 24, `display-lg` ke 16. Body tetap.
- Bayangan teks pixel: offset keras `--px --px 0 ink-900`, tanpa blur.

---

## 5. Grid pixel, spacing, dan ukuran

### 5.1 Unit pixel UI

```
--px: 4px;   /* ≥ 640px  */
--px: 3px;   /* < 640px  */
```

Satu "pixel UI" = `--px` CSS pixel. Semua border, radius bertingkat, offset bayangan, dan spacing adalah kelipatan `--px`.

### 5.2 Spacing scale

| Token | Nilai | Pada `--px: 4px` |
|---|---|---|
| `space-1` | 1 × px | 4 |
| `space-2` | 2 × px | 8 |
| `space-3` | 3 × px | 12 |
| `space-4` | 4 × px | 16 |
| `space-6` | 6 × px | 24 |
| `space-8` | 8 × px | 32 |
| `space-12` | 12 × px | 48 |
| `space-16` | 16 × px | 64 |

Padding panel default `space-4`; jarak antar-item menu `space-2`; jarak antar-section `space-12`.

### 5.3 Unit dunia (3D)

| Hal | Nilai |
|---|---|
| Kepadatan texel | **32 texel = 1 world unit** (PPU 32) untuk *semua* tekstur |
| Tile tanah | 32×32 px = 1×1 unit |
| Sprite karakter | frame 32×48 px = 1×1.5 unit, pivot di tengah-bawah (kaki) |
| Prop kecil | 16×16 atau 32×32 px |
| Bangunan | Mesh low-poly + tekstur pixel (PPU sama). Tinggi pintu = 2 unit |
| Atlas | Maks. 2048×2048, padding 2 px + extrude 1 px untuk cegah bleeding |

### 5.4 Bentuk

- **Tidak ada `border-radius` halus.** Sudut "bulat" dibuat bertingkat (stair-step) lewat 9-slice atau `clip-path`.
- Border: `--px` (tipis) atau `2 × --px` (window).
- Bayangan UI: offset keras `0 calc(2 * var(--px)) 0 night-900`, tanpa blur.
- Ikon: grid 16×16 px, ditampilkan pada 1×/2×/3× (`image-rendering: pixelated`). Ukuran sentuh tetap ≥ 44×44 CSS px.

---

## 6. Component style (ringkas)

Detail props dan state ada di `COMPONENTS.md`. Di sini hanya bahasa visualnya.

### 6.1 Window (panel dasar)

Semua UI DOM hidup di dalam "window" JRPG:

```
┌───────────────────────┐  ← border luar: parchment-300, 1px
│┌─────────────────────┐│  ← border dalam: gold-600, 1px (hairline)
││  night-800 @ 92%    ││  ← isi: night-800, sedikit transparan + backdrop blur 4px
││                     ││     (blur = HD layer; menyatukan window dengan dunia)
│└─────────────────────┘│
└───────────────────────┘  ← bayangan keras 2px night-900
```

Varian: `window` (gelap, default), `parchment` (terang — untuk bacaan panjang/quest detail), `ghost` (tanpa isi, hanya border — untuk HUD).

### 6.2 Elemen kunci

| Elemen | Gaya |
|---|---|
| Tombol | Blok pixel 2 lapis; hover naik 1px + border emas; pressed turun 1px + bayangan hilang |
| Kursor menu | Segitiga `▶` emas di kiri item terpilih, bob 2 frame (`steps(2)`, 600 ms) |
| Dialog box | Window lebar di bawah layar, nameplate menempel di kiri atas, indikator `▼` berkedip saat teks selesai |
| Stat bar | Track `night-900`, fill tersegmentasi per 2px; HP merah, MP biru, XP emas |
| Tag / badge | Kapsul bertingkat, `ui-sm`, satu warna aksen per kategori |
| Toast achievement | Window kecil meluncur dari atas dengan ikon 32px + kilau emas |
| Focus ring | Outline `gold-400` 1px + offset 1px, berkedip `steps(2)` 1 s (statis saat reduced motion) |
| Penanda interaksi dunia | Ikon `!`/`?` melayang di atas objek + outline emas pada sprite saat dalam jangkauan |

---

## 7. Motion

| Token | Durasi | Pemakaian |
|---|---|---|
| `motion-instant` | 80 ms | Tekan tombol, pindah kursor |
| `motion-fast` | 120 ms | Hover, tooltip |
| `motion-base` | 200 ms | Buka/tutup window, toast |
| `motion-slow` | 320 ms | Transisi panel besar, tab |
| `motion-scene` | 600 ms | Fade/iris antar-scene, fokus kamera |
| `motion-cine` | 1200 ms | Intro, reveal judul lokasi |

| Easing | Nilai | Untuk |
|---|---|---|
| `ease-pixel` | `steps(4, end)` | Window, tombol, kursor, ikon (pixel layer) |
| `ease-smooth` | `power2.inOut` (GSAP) / `cubic-bezier(.45,0,.55,1)` | Kamera, cahaya, fade (HD layer) |
| `ease-pop` | `back.out(1.7)` | Reward, achievement, item muncul |

Aturan:
- Sprite: idle 2–4 frame @ 4 fps; jalan 4–6 frame @ 8 fps; aksi @ 12 fps. Tidak ada tweening posisi sub-pixel pada sprite UI.
- Window terbuka dengan scale Y bertahap dari tengah (gaya menu JRPG), bukan fade halus.
- Teks dialog typewriter: 30 ms/karakter; jeda 150 ms pada `.` `!` `?`; 80 ms pada `,`.
- Kamera: lerp mengikuti hero (damping ±0.1), tidak pernah snap kecuali saat cut scene.
- Maks. satu animasi "besar" pada satu waktu; sisanya menunggu atau dipersingkat.
- **Reduced motion:** matikan camera sway, parallax, partikel, shake, dan typewriter (teks langsung tampil); transisi scene jadi cross-fade 150 ms.

---

## 8. Kamera, layout, dan komposisi

### 8.1 Kamera dunia

| Parameter | Nilai |
|---|---|
| Tipe | Perspective, **FOV 28°** (tele → terasa miniatur) |
| Pitch | 35° menunduk; yaw tetap (tidak ada rotasi bebas) |
| Jarak | Hero menempati ±1/8 tinggi layar di desktop |
| Tilt-shift DoF | Fokus pada bidang hero; blur naik ke tepi atas & bawah layar |
| Bloom | Threshold tinggi; hanya lentera, jendela, efek magis yang berpendar |
| Vignette | Halus, 0.3 |
| Parallax | Lapisan langit/awan/gunung jauh bergerak lebih lambat |

Sprite karakter adalah billboard yang hanya berputar pada sumbu Y agar tetap tegak dan menapak tanah. Bayangan karakter berupa blob gelap elips di tanah (bukan shadow map dari plane).

### 8.2 Layer layar

```
z  4  Overlay sistem   → loading, transisi scene, modal konfirmasi
z  3  Window           → dialog, menu, quest detail, form
z  2  HUD              → status hero, minimap/fast travel, hint tombol, toggle
z  1  Canvas dunia     → R3F (full viewport, fixed)
z  0  Background       → gradien night-900 (terlihat sebelum canvas siap)
```

### 8.3 Safe area HUD

- Margin HUD dari tepi: `space-4` (desktop), `space-2` (mobile) + `env(safe-area-inset-*)`.
- Kiri atas: status hero (nama, LV, XP). Kanan atas: menu, suara, mode. Bawah: dialog box / hint tombol. Tengah selalu bebas untuk dunia.
- Window konten maks. lebar 720 px (bacaan) atau 960 px (grid quest).

### 8.4 Quick Read mode (layout dokumen)

Versi HTML biasa dari seluruh konten, tetap memakai token yang sama: satu kolom maks. 720 px, window `parchment` untuk tiap section, ilustrasi pixel statis sebagai header. Tanpa canvas.

### 8.5 Quick Read: presentasi & gerak (revisi 2026-11-25)

Quick Read tetap jalur tercepat untuk P1 (recruiter), tetapi **tidak boleh terasa seperti dokumen biasa**. Ia adalah "title sequence" JRPG yang bisa dibaca: tiap section dibuka seperti window menu, halaman punya pemandangan kota sendiri, dan ada musik chiptune opsional. Dial: ENERGY 3 / RHYTHM 3 / MOTION 3.

| Elemen | Ketentuan |
|---|---|
| Header | **Diorama 2D berlapis** (bukan foto, bukan gradien halus): langit pita bertingkat dari token (`night-900` → `night-700` → `dusk-500`), bintang berkedip `steps(2)`, bulan, siluet bukit, siluet atap dengan jendela menyala, lalu tanah dengan prop dari atlas dunia (pohon, lentera, Quest Board, air mancur). Hero berjalan masuk dari kiri (sprite strip, `steps()`), Wren menunggu di sisi kanan. Tinggi tetap (tanpa CLS), skala integer (3× desktop, 2× mobile) |
| Intro header | Satu timeline GSAP ≤ 2,4 dtk: bulan naik → lapisan muncul dari belakang ke depan → hero masuk → nama muncul huruf per huruf (`steps`) → tombol terbuka seperti window. Konten bisa dibaca sejak frame pertama; intro tidak pernah memblokir scroll atau klik |
| Parallax | Lapisan header bergerak berbeda kecepatan saat di-scroll (jauh lambat, dekat cepat), via ScrollTrigger `scrub` |
| Section | Tiap section adalah **chapter**: kartu "Chapter I · Guild Hall" (nama tematik + arti literal), lalu window `parchment` yang **terbuka scaleY bertahap** (`steps(4)`) saat masuk viewport, sekali saja |
| Isi section | Gerak hanya yang punya tujuan: gambar quest terbuka dengan wipe pixel bertahap; garis timeline Library "tergambar" mengikuti scroll (`steps`); badge rarity muncul dengan `back.out(1.7)` (ease reward). **Bukan** fade-up di setiap elemen |
| Navigasi | Nav lengket dengan kursor `▶` yang pindah ke section yang sedang dibaca; garis progres baca tipis di bawah nav |
| Musik | Tombol musik di nav (lihat §10). Default mati |
| Reduced motion | Semua di atas mati: tidak ada intro, parallax, reveal, atau kursor animasi. Halaman tampil statis dan lengkap |
| Print / tanpa JS | Semua konten terlihat penuh; state awal animasi hanya dipasang oleh JS, dan `@media print` membatalkannya |

Batas yang tidak boleh dilanggar: konten portofolio tetap terbaca ≤ 2 interaksi, tidak ada scroll-jacking, LCP header ≤ 2,5 dtk, dan animasi hanya memakai `transform`/`opacity`/`clip-path`.

---

## 9. Responsive behavior

| Breakpoint | Lebar | Perilaku |
|---|---|---|
| `xs` | < 480 | `--px: 3px`; HUD ringkas (ikon saja); dialog full-width; kamera lebih jauh 15% |
| `sm` | 480–767 | Sama dengan xs, quest grid 1 kolom |
| `md` | 768–1023 | `--px: 4px`; quest grid 2 kolom; window sebagai sheet tengah |
| `lg` | 1024–1439 | Layout referensi; HUD penuh |
| `xl` | ≥ 1440 | Kamera sedikit lebih dekat; lebar window tetap dibatasi |

Aturan:
- **Portrait:** FOV vertikal dipertahankan, kamera mundur agar lebar dunia yang terlihat ≥ 8 tile. Window muncul sebagai bottom sheet (maks. 85% tinggi layar).
- **Landscape pendek (< 480 px tinggi):** dialog box maks. 40% tinggi; HUD atas disembunyikan saat dialog aktif.
- Input: desktop = keyboard + klik; touch = tap-to-move + tombol aksi kontekstual. Target sentuh ≥ 44×44 px.
- Skala pixel art selalu integer. Kalau ruang tidak cukup, **kurangi konten yang terlihat**, jangan skala pecahan.
- DPR dibatasi: 2 (desktop), 1.5 (mobile).

### 9.1 Quality tier

| Tier | Kondisi | Efek |
|---|---|---|
| `high` | Desktop GPU baik | DoF + bloom + shadow + partikel penuh |
| `medium` | Laptop/mobile kelas atas | Bloom + shadow resolusi rendah, DoF disederhanakan, partikel 50% |
| `low` | Mobile menengah / FPS < 40 | Tanpa DoF & shadow map, bloom mati, vignette statis, partikel 20% |
| `static` | Tanpa WebGL / reduced data | Otomatis ke Quick Read |

Tampilan harus tetap "benar" di tier `low`: palet, komposisi, dan keterbacaan tidak boleh bergantung pada post-processing.

---

## 10. Audio (opsional, default mati)

- Default **mute**; tombol suara selalu terlihat di HUD; pilihan disimpan.
- SFX chiptune pendek (< 300 ms): kursor, konfirmasi, batal, langkah, reward, error.
- BGM satu loop tenang (≤ 60 detik, ≤ 500 KB, ogg + mp3). Volume default 40%.
- **Revisi 2026-11-25:** BGM adalah lagu chiptune **orisinal** gaya JRPG retro (lead square, bass triangle, perkusi noise) yang **disintesis di browser** lewat Web Audio, jadi tidak ada file audio dan tidak ada masalah lisensi. Tersedia di Quick Read (tombol di nav) dan Adventure (Settings). Tetap default mati, baru berbunyi setelah klik pengunjung, berhenti saat tab tersembunyi, dan pilihannya disimpan.
- Tidak ada informasi yang hanya disampaikan lewat suara.

---

## 11. Design tokens (implementasi)

Sumber tunggal: `src/styles/tokens.css` (Tailwind v4 `@theme`). Nilai yang sama diekspor ke `src/world/theme.ts` untuk dipakai di Three.js.

```css
@theme {
  --color-night-900: #0F0B1E;
  --color-night-800: #1A1433;
  --color-night-700: #2A2150;
  --color-dusk-500: #5B4B9E;
  --color-dusk-300: #B9A9D9;
  --color-parchment-100: #F4E8C8;
  --color-parchment-300: #D9C594;
  --color-ink-900: #1B1420;
  --color-ink-600: #5A4630;
  --color-gold-400: #F2C14E;
  --color-gold-600: #C8902A;
  --color-ember-500: #E8643C;
  --color-hp-500: #D8434F;
  --color-hp-300: #FF6B78;
  --color-herb-400: #6BCB77;
  --color-mana-400: #4FB8E8;

  --font-display: "Press Start 2P", monospace;
  --font-ui: "Pixelify Sans", system-ui, sans-serif;
  --font-body: "Crimson Pro", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --ease-pixel: steps(4, end);
  --ease-smooth: cubic-bezier(.45, 0, .55, 1);
}

:root {
  --px: 4px;
  --motion-instant: 80ms;
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
  --motion-scene: 600ms;
}
@media (max-width: 639px) { :root { --px: 3px; } }
```

---

## 12. Do / Don't

| Do | Don't |
|---|---|
| Tekstur `NearestFilter`, tanpa mipmap blur | Membiarkan sprite ter-filter linear (blur) |
| Skala pixel art integer | Skala 1.5×, 2.3×, dst. |
| Emas hanya untuk interaktif/reward | Emas sebagai dekorasi di mana-mana |
| Body text serif HD yang nyaman dibaca | Paragraf panjang dalam Press Start 2P |
| Satu sumber cahaya hangat per titik fokus | Layar penuh lampu sehingga tidak ada hierarki |
| Sudut bertingkat | `rounded-lg`, drop shadow blur, gradien glossy |
| Aset orisinal/berlisensi | Sprite hasil rip dari game komersial |
| Menyediakan jalur cepat ke konten | Memaksa pengunjung berjalan untuk membaca CV |
