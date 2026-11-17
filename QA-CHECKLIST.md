# QA-CHECKLIST.md — Quality Assurance (Mandatory)

> Tidak ada rilis tanpa lulus checklist ini. Setiap butir bisa diverifikasi: ada cara cek dan kriteria lulus.
> Acuan: `DESIGN.md` (visual), `PRODUCT.md` (fungsi & aturan), `UX-GUIDELINES.md` (pola), `ARCHITECTURE.md` §10–11 (anggaran & hook QA).

---

## 0. Cara memakai

### 0.1 Kapan dijalankan

| Momen | Yang dijalankan |
|---|---|
| Setiap commit (pre-commit) | lint, typecheck, unit test terkait |
| Setiap PR (CI) | §1 otomatis penuh: lint, typecheck, unit, e2e smoke, a11y, visual, anggaran bundle |
| Sebelum rilis | Seluruh dokumen ini, termasuk bagian manual & perangkat nyata |
| Setelah rilis | §11 smoke produksi |

### 0.2 Tingkat keparahan

| Level | Definisi | Aturan rilis |
|---|---|---|
| **S1 Blocker** | Konten tak bisa diakses, crash, data hilang, tidak bisa kontak | Rilis **dilarang** |
| **S2 Major** | Fitur P0 rusak sebagian, a11y AA gagal, FPS di bawah target | Rilis dilarang kecuali ada persetujuan tertulis + tiket |
| **S3 Minor** | Cacat visual kecil, salah ketik, animasi kurang halus | Boleh rilis, wajib tiket |
| **S4 Polish** | Saran peningkatan | Backlog |

### 0.3 Mode deterministik

Semua test otomatis pada dunia 3D memakai `?qa=1` (clock beku, RNG ber-seed, partikel & flicker mati, intro dilewati, typewriter instan). Tunggu `canvas[data-ready="true"]` sebelum mengambil screenshot atau berinteraksi.

### 0.4 Format laporan bug

```
Judul      : [Area] Ringkasan singkat
Severity   : S1–S4
Lingkungan : perangkat, OS, browser+versi, viewport, tier kualitas, mode
Langkah    : 1… 2… 3…
Hasil      : yang terjadi
Harapan    : yang seharusnya (rujuk dokumen & pasal)
Bukti      : screenshot/video, log console
```

---

## 1. Gerbang otomatis (CI)

| # | Pemeriksaan | Perintah | Lulus bila |
|---|---|---|---|
| A1 | Lint | `npm run lint` | 0 error, 0 warning |
| A2 | Typecheck | `npm run typecheck` | 0 error |
| A3 | Unit & component | `npm run test -- --coverage` | Semua hijau; coverage `game/` ≥ 90%, `services/` ≥ 80%, `ui/primitives` + `patterns` ≥ 70% |
| A4 | Build | `npm run build` | Sukses tanpa warning ukuran chunk |
| A5 | Anggaran bundle | script size-check | Shell ≤ 120 KB gz; chunk dunia ≤ 450 KB gz |
| A6 | E2E | `npm run test:e2e` | Semua skenario §6 hijau di Chromium, Firefox, WebKit |
| A7 | Aksesibilitas | axe di dalam e2e | 0 pelanggaran `serious`/`critical` |
| A8 | Visual regression | `npm run test:visual` | Diff di bawah ambang (§2.2) |
| A9 | Lighthouse CI (Quick Read, mobile) | lhci | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 |
| A10 | Tautan | link checker | 0 tautan internal/eksternal rusak |
| A11 | Validasi konten | test skema zod | Semua data `content/` valid; tiap gambar punya alt+dimensi |
| A12 | Aturan impor layer | ESLint `no-restricted-imports` | 0 pelanggaran (`ui` ↮ `world`) |

---

## 2. Visual regression

### 2.1 Daftar snapshot wajib

Viewport: **360×740** (mobile), **768×1024** (tablet), **1440×900** (desktop). Dunia: tier `high` dan `low`.

| ID | Layar | Mobile | Tablet | Desktop |
|---|---|---|---|---|
| V01 | Loading screen (50%) | ☐ | ☐ | ☐ |
| V02 | Title screen | ☐ | ☐ | ☐ |
| V03 | Town Square — spawn (tier high) | ☐ | ☐ | ☐ |
| V04 | Town Square — spawn (tier low) | ☐ | ☐ | ☐ |
| V05 | Tiap lokasi: hero di depan bangunan (×5) | ☐ | ☐ | ☐ |
| V06 | Dialog box + nameplate + pilihan | ☐ | ☐ | ☐ |
| V07 | Window Guild Hall (StatusSheet) | ☐ | ☐ | ☐ |
| V08 | Window Quest Board (daftar) | ☐ | ☐ | ☐ |
| V09 | Detail quest (atas & setelah scroll) | ☐ | ☐ | ☐ |
| V10 | Window Armory (tiap tab) | ☐ | ☐ | ☐ |
| V11 | Window Library | ☐ | ☐ | ☐ |
| V12 | Post Office: form kosong / error / loading / sukses | ☐ | ☐ | ☐ |
| V13 | Fast Travel menu | ☐ | ☐ | ☐ |
| V14 | Quest log (kosong & terisi) | ☐ | ☐ | ☐ |
| V15 | Settings + ConfirmDialog reset | ☐ | ☐ | ☐ |
| V16 | Toast: xp, achievement, error | ☐ | ☐ | ☐ |
| V17 | Error state: WebGL tak didukung, aset gagal | ☐ | ☐ | ☐ |
| V18 | Quick Read: halaman penuh | ☐ | ☐ | ☐ |
| V19 | Katalog komponen: tiap primitive × varian × state | — | — | ☐ |
| V20 | Mode reduced motion: title + dialog | ☐ | — | ☐ |

### 2.2 Aturan

- [ ] Baseline dibuat di **satu lingkungan tetap** (container CI, Chromium, software GL) — bukan dari laptop pribadi
- [ ] Ambang: UI DOM `maxDiffPixelRatio ≤ 0.01`; layar dengan canvas `≤ 0.03`
- [ ] Font sudah termuat sebelum screenshot (`document.fonts.ready`)
- [ ] Animasi CSS dibekukan; kursor berkedip dimatikan
- [ ] Perubahan baseline hanya lewat PR dengan gambar before/after dan alasan
- [ ] Snapshot dunia juga dicek manual tiap rilis di GPU nyata (software GL tidak mewakili bloom/DoF secara sempurna)

### 2.3 Inspeksi visual manual (kesesuaian `DESIGN.md`)

**Pixel integrity**
- [ ] Tidak ada sprite/ikon blur (zoom browser 100%, 125%, 150%, 200%)
- [ ] Semua pixel art berskala integer; tidak ada pixel "gepeng" atau tidak seragam
- [ ] Tidak ada *texture bleeding* (garis warna asing di tepi tile/sprite) saat kamera bergerak
- [ ] Tidak ada *shimmer*/kedip pada tile saat kamera bergerak pelan
- [ ] Tidak ada celah antar-tile
- [ ] Kepadatan texel seragam (bangunan, tanah, karakter terlihat "satu dunia")
- [ ] Font pixel tajam (ukuran sesuai kelipatan), tanpa anti-aliasing

**Komposisi HD-2D**
- [ ] Hero selalu dalam bidang fokus; DoF memburamkan tepi atas/bawah, bukan subjek
- [ ] Bloom hanya pada sumber cahaya; teks UI tidak berpendar
- [ ] Sprite tidak terlihat "terbang": blob shadow menempel di kaki
- [ ] Tidak ada z-fighting; sprite tidak menembus dinding secara janggal
- [ ] Urutan kedalaman benar saat hero lewat di depan/belakang objek
- [ ] Tier `low` tetap terlihat disengaja, bukan rusak

**Token**
- [ ] Tidak ada warna di luar palet (cek cepat: cari hex literal di `src/` — hanya boleh di `tokens.css` & `theme.ts`)
- [ ] Tidak ada `border-radius` halus atau shadow blur
- [ ] Spacing kelipatan `--px`
- [ ] Emas hanya pada elemen interaktif/terpilih/reward
- [ ] Maks. satu tombol `primary` per window

---

## 3. Responsive testing

### 3.1 Matriks viewport

| Viewport | Contoh | Portrait | Landscape |
|---|---|---|---|
| 320×568 | Ponsel kecil | ☐ | ☐ |
| 360×740 | Android umum | ☐ | ☐ |
| 390×844 | iPhone | ☐ | ☐ |
| 430×932 | Ponsel besar | ☐ | ☐ |
| 768×1024 | Tablet | ☐ | ☐ |
| 1024×768 | Tablet landscape / laptop kecil | — | ☐ |
| 1280×720 | Laptop | — | ☐ |
| 1440×900 | Desktop referensi | — | ☐ |
| 1920×1080 | Full HD | — | ☐ |
| 2560×1440 | QHD / ultrawide | — | ☐ |

### 3.2 Butir per viewport

- [ ] Tidak ada scroll horizontal; tidak ada konten terpotong
- [ ] HUD berada di safe area (notch, home indicator, `env(safe-area-inset-*)`)
- [ ] `--px` berganti 4 → 3 di bawah 640 px tanpa merusak layout
- [ ] Hero & bangunan terdekat terlihat penuh; lebar dunia terlihat ≥ 8 tile di portrait
- [ ] Dialog box tidak menutupi hero; ≤ 40% tinggi layar di landscape pendek
- [ ] Window menjadi bottom sheet di mobile; isi bisa di-scroll sampai habis
- [ ] Target sentuh ≥ 44×44 px; jarak antar-target cukup
- [ ] Body text ≥ 16 px; panjang baris 45–70 karakter di desktop
- [ ] Rotasi perangkat saat window terbuka: layout menyesuaikan, state tidak hilang
- [ ] Resize jendela desktop secara kontinu: canvas ikut tanpa distorsi aspek
- [ ] Keyboard virtual muncul (form kontak): field aktif tetap terlihat, tombol kirim terjangkau
- [ ] Zoom browser 200%: Quick Read tetap terbaca tanpa scroll dua arah
- [ ] Layar DPR 1, 2, 3: pixel art tetap tajam; DPR render dibatasi sesuai `DESIGN.md` §9

---

## 4. Accessibility (target WCAG 2.2 AA)

### 4.1 Otomatis

- [ ] axe: 0 pelanggaran serious/critical pada title, HUD, tiap window, modal, Quick Read
- [ ] Lighthouse Accessibility ≥ 95 (Quick Read)

### 4.2 Keyboard (manual, tanpa mouse)

- [ ] Elemen fokus pertama = skip link ("Lewati ke konten / Buka Quick Read")
- [ ] Seluruh alur §6.1 bisa diselesaikan hanya dengan keyboard
- [ ] Urutan Tab logis; fokus **selalu terlihat** (ring emas)
- [ ] Fokus terperangkap di window/modal; `Esc` menutup; fokus kembali ke pemicu
- [ ] `MenuList`: panah, Home/End, Enter berfungsi; kursor membungkus
- [ ] Tidak ada keyboard trap di canvas
- [ ] Shortcut huruf (`M`, `Q`, `E`) nonaktif saat mengetik di input
- [ ] Setiap `Interactable` dunia terjangkau via Fast Travel

### 4.3 Screen reader (VoiceOver + Safari, NVDA + Firefox/Chrome)

- [ ] Halaman punya `lang`, `<title>` bermakna, satu `h1`, landmark lengkap
- [ ] Canvas punya label & deskripsi alternatif; pengguna diarahkan ke Quick Read
- [ ] Teks dialog dibacakan **utuh sekali** (bukan per karakter typewriter)
- [ ] Toast diumumkan (`status`/`alert`) tanpa mencuri fokus
- [ ] Tombol-ikon punya nama; ikon dekoratif disembunyikan
- [ ] Form: label terhubung, error diumumkan, field invalid ditandai
- [ ] `StatBar` membacakan nilai ("XP 150 dari 300")
- [ ] Gambar proyek punya alt deskriptif; dekoratif `alt=""`
- [ ] Quick Read memberi paritas konten 100% dengan Adventure

### 4.4 Visual & motion

- [ ] Kontras teks ≥ 4.5:1 (besar ≥ 3:1); komponen UI & fokus ≥ 3:1 — cocokkan dengan tabel `DESIGN.md` §3.3
- [ ] Teks di atas dunia 3D selalu berada di dalam window (tidak langsung di atas scene)
- [ ] Informasi tidak hanya lewat warna (rarity, status, error punya ikon/teks)
- [ ] `prefers-reduced-motion: reduce`: tanpa camera sway, parallax, shake, partikel, typewriter; transisi jadi fade singkat
- [ ] Tidak ada kilatan > 3 kali/detik
- [ ] Zoom teks 200% tidak memotong konten (Quick Read & window)
- [ ] `forced-colors` / high contrast: Quick Read tetap terbaca
- [ ] Tidak ada audio autoplay; kontrol suara terlihat & terjangkau keyboard

---

## 5. Interaction testing

### 5.1 Gerak & dunia

- [ ] WASD dan panah menggerakkan hero 8 arah; kecepatan diagonal dinormalisasi
- [ ] Animasi & arah hadap sesuai arah gerak; kembali `idle` saat berhenti
- [ ] Klik/tap tanah: hero menuju titik lewat jalur masuk akal (tidak menembus bangunan)
- [ ] Klik titik tak terjangkau: menuju titik terdekat + penanda "×"
- [ ] Collision: tidak bisa menembus bangunan/NPC/batas peta; tidak bisa terjebak (uji menyusuri semua dinding & sudut)
- [ ] Kamera mengikuti mulus, berhenti di batas dunia, tanpa jitter
- [ ] Menahan tombol lalu pindah tab lalu kembali: hero tidak berjalan sendiri / teleport
- [ ] Dua input bersamaan (keyboard + klik): tidak konflik
- [ ] Kecepatan gerak sama pada 30, 60, dan 144 Hz (berbasis `delta`)

### 5.2 Interaksi objek

- [ ] Penanda muncul pada objek interaktif; outline + hint muncul dalam radius
- [ ] Dua objek berdekatan: hanya yang terdekat aktif
- [ ] `E`/Enter/Space/klik/tap memicu aksi yang sama
- [ ] Klik objek jauh: hero mendekat lalu berinteraksi otomatis
- [ ] Input dunia mati saat window/dialog terbuka; hidup lagi setelah ditutup
- [ ] Hover mesh mengubah kursor; kursor pulih saat keluar

### 5.3 Dialog

- [ ] Input pertama melengkapi teks, kedua lanjut halaman
- [ ] Tekan cepat berkali-kali tidak melewatkan halaman atau memicu aksi ganda
- [ ] Pilihan: navigasi panah, konfirmasi, batal
- [ ] Skip dialog (`Esc`) bekerja; dialog ulang dipersingkat
- [ ] Jeda tanda baca terasa alami; teks tidak meluber dari kotak (uji teks terpanjang)

### 5.4 Window, menu, HUD

- [ ] Buka/tutup: animasi sesuai token, tanpa kedip konten
- [ ] Hanya satu window terbuka; detail quest → kembali memulihkan posisi scroll daftar
- [ ] Back browser menutup window teratas; Forward membukanya lagi
- [ ] Fast Travel memindahkan hero + transisi; tidak bisa dipicu ganda saat transisi
- [ ] Toggle suara/kualitas/mode langsung berlaku & tersimpan
- [ ] Matriks state (hover/fokus/pressed/disabled/loading) benar pada tiap komponen interaktif
- [ ] Toast: antre, gabung XP beruntun, jeda saat hover, hilang sendiri

### 5.5 Animasi & feel

- [ ] Sprite & UI pixel bergerak bertahap; kamera & cahaya halus (`DESIGN.md` §7)
- [ ] Tidak ada animasi yang memblokir input > 600 ms tanpa bisa di-skip
- [ ] Intro bisa di-skip; tidak diputar pada kunjungan ulang
- [ ] Setiap input mendapat respons visual ≤ 100 ms
- [ ] Tidak ada animasi yang saling bertabrakan (mis. buka window saat transisi scene)

### 5.6 Sentuh

- [ ] Tap-to-move akurat; drag tidak menggulir halaman di belakang canvas
- [ ] `ActionButton` muncul/hilang sesuai jangkauan
- [ ] Bottom sheet: scroll isi vs swipe-tutup tidak saling mengganggu
- [ ] Double-tap tidak memicu zoom di canvas; pinch-zoom Quick Read tetap bisa
- [ ] Multi-touch tidak membuat hero macet

---

## 6. Functional verification

### 6.1 Alur kritis (e2e wajib — semua S1 bila gagal)

| ID | Skenario | Lulus bila |
|---|---|---|
| F01 | First visit → loading → title → Press Start → bisa bergerak | ≤ 6 dtk di 4G tersimulasi; tanpa error console |
| F02 | Title → Quick Read | Seluruh konten tampil tanpa memuat chunk dunia |
| F03 | Kunjungi 5 lokasi via jalan kaki | Tiap window benar; +50 XP sekali per lokasi |
| F04 | Kunjungi 5 lokasi via Fast Travel | Sama dengan F03 |
| F05 | Buka Quest Board → detail quest → link demo/repo | Detail lengkap; link buka tab baru dengan `rel` aman |
| F06 | Kirim form kontak valid | Request terkirim (mock); konfirmasi tampil; +XP; achievement `pen-pal` |
| F07 | Unduh CV | File terunduh, nama file benar, bukan 404 |
| F08 | Deep link `/#/quests/:id` | Detail quest terbuka langsung (kedua mode) |
| F09 | Reload setelah progres | XP, lokasi, achievement, pengaturan pulih |
| F10 | Ganti mode Adventure ↔ Quick Read | Tanpa reload penuh; progress tetap; section setara |
| F11 | Tanpa WebGL (dinonaktifkan) | Otomatis Quick Read + banner; tanpa crash |
| F12 | Reset progress | Konfirmasi muncul; Batal tidak mengubah apa pun; Hapus mengembalikan ke awal |

### 6.2 Aturan permainan (`PRODUCT.md` §7 — unit test)

- [ ] XP diberikan **sekali** per ID aksi (ulang 10× tetap sekali)
- [ ] Ambang level benar: 100 / 300 / 600 / 1000
- [ ] Naik level memicu tepat satu event
- [ ] Main quest selesai ⇔ kelima lokasi dikunjungi (urutan apa pun)
- [ ] Tiap achievement terbuka tepat pada syaratnya dan hanya sekali
- [ ] Tidak ada konten portofolio yang terkunci pada save kosong
- [ ] Total XP maksimum mencapai level maksimum yang dirancang

### 6.3 Persistensi

- [ ] Save ber-versi; migrasi v(n-1) → v(n) teruji
- [ ] Save rusak (JSON invalid / skema salah) → default tanpa crash
- [ ] localStorage tidak tersedia (private mode / kuota penuh) → aplikasi tetap jalan
- [ ] Dua tab terbuka: tidak saling merusak save
- [ ] Tidak ada data pribadi tersimpan

### 6.4 Form kontak

| Kasus | Harapan |
|---|---|
| Semua kosong → submit | Error di tiap field; fokus ke field pertama |
| Email tidak valid | Error spesifik saat blur |
| Pesan 9 karakter / 2001 karakter | Error batas |
| Koreksi field yang error | Error hilang saat mengetik |
| Submit valid | Loading → sukses; tombol tak bisa diklik ganda |
| Jaringan mati | Error + isi form utuh + link `mailto:` |
| Server 500 / timeout 10 dtk | Error sesuai katalog `UX-GUIDELINES.md` §4.2 |
| Kirim 2× dalam 30 dtk | Ditahan dengan hitung mundur |
| Honeypot terisi | Ditolak diam-diam |
| Input berisi HTML/script | Ditampilkan sebagai teks; tidak dieksekusi |
| Tutup window saat ada draf | Draf pulih saat dibuka lagi |

### 6.5 Konten

- [ ] Tidak ada placeholder tersisa (`{{...}}`, "Lorem ipsum", "TODO")
- [ ] Ejaan & tata bahasa diperiksa; istilah sesuai glosarium
- [ ] Semua tautan eksternal hidup dan menuju tempat yang benar
- [ ] Tahun, peran, dan angka pencapaian akurat
- [ ] Gambar proyek termuat, tajam, proporsional, ber-alt
- [ ] Email & tautan sosial benar (uji klik satu per satu)
- [ ] Lisensi aset tercatat di `LICENSES.md`; tidak ada aset hasil rip

### 6.6 Error & kondisi tepi

- [ ] Offline di tengah sesi: dunia yang sudah termuat tetap jalan; aksi jaringan memberi error yang benar
- [ ] Throttle "Slow 3G": pesan loading lambat muncul > 8 dtk; tawaran Quick Read
- [ ] Satu aset 404: retry → error state dengan Coba Lagi
- [ ] WebGL context lost (paksa via `WEBGL_lose_context`): pulih atau error state
- [ ] Crash satu window (lempar error buatan): ErrorBoundary menahan, sisanya hidup
- [ ] Tab di-background 5 menit lalu kembali: tanpa lompatan, audio berhenti saat tersembunyi
- [ ] Deep link tidak dikenal: jatuh ke daftar + toast
- [ ] JavaScript mati: `<noscript>` menampilkan ringkasan & kontak

---

## 7. Performance

| Metrik | Alat | Target |
|---|---|---|
| LCP (shell) | Lighthouse mobile | ≤ 2.5 dtk |
| CLS | Lighthouse | ≤ 0.05 |
| INP | Web Vitals | ≤ 200 ms |
| Waktu sampai bisa bergerak | Performance mark | ≤ 6 dtk (4G), ≤ 3 dtk (broadband) |
| FPS desktop (tier high) | Overlay stats / DevTools | 60 stabil, 1% low ≥ 50 |
| FPS mobile menengah | Perangkat nyata | ≥ 30 stabil |
| Draw call | `renderer.info` | ≤ 120 |
| JS shell / chunk dunia | size-check | ≤ 120 KB / ≤ 450 KB gz |
| Transfer first visit | Network panel | ≤ 4 MB |
| Memori setelah 10 menit | DevTools Memory | Tidak naik terus (tanpa leak) |

- [ ] Buka-tutup tiap window 20× → jumlah geometry/texture di `renderer.info.memory` kembali stabil
- [ ] Ganti mode 10× → tidak ada canvas/listener ganda
- [ ] Tidak ada long task > 50 ms saat bermain (setelah load)
- [ ] Render berhenti saat tab tersembunyi (cek penggunaan GPU/CPU)
- [ ] CPU throttle 4× (DevTools): tier turun otomatis, masih bisa dimainkan
- [ ] Perangkat tidak panas berlebih / baterai tidak terkuras setelah 5 menit di mobile
- [ ] Tidak ada warning React/Three di console (key, act, deprecated, texture resize)

---

## 8. Browser & device testing

### 8.1 Matriks

| Platform | Browser | Versi | Adventure | Quick Read |
|---|---|---|---|---|
| Windows | Chrome | 2 terakhir | ☐ | ☐ |
| Windows | Edge | 2 terakhir | ☐ | ☐ |
| Windows | Firefox | 2 terakhir | ☐ | ☐ |
| macOS | Safari | 2 terakhir | ☐ | ☐ |
| macOS | Chrome | terbaru | ☐ | ☐ |
| macOS | Firefox | terbaru | ☐ | ☐ |
| iOS | Safari | 2 mayor terakhir | ☐ | ☐ |
| iOS | Chrome | terbaru | ☐ | ☐ |
| Android | Chrome | 2 terakhir | ☐ | ☐ |
| Android | Samsung Internet | terbaru | ☐ | ☐ |
| Android | Firefox | terbaru | ☐ | ☐ |

**Perangkat nyata minimal:** 1 iPhone, 1 Android kelas menengah (±3 tahun), 1 laptop GPU terintegrasi, 1 desktop/laptop GPU diskrit. Emulator tidak cukup untuk FPS, sentuh, dan suhu.

### 8.2 Butir khusus per browser

- [ ] **Safari/iOS:** `100dvh` benar (address bar), safe area, audio baru aktif setelah gesture, tidak ada zoom saat fokus input, tidak ada bounce scroll di belakang canvas
- [ ] **Safari:** `image-rendering: pixelated` tajam; `backdrop-filter` bekerja atau fallback rapi
- [ ] **Firefox:** rendering font pixel tajam; pointer events pada canvas; post-processing identik
- [ ] **Samsung Internet:** mode gelap paksa tidak merusak warna
- [ ] **Semua:** warna konsisten (color space), tidak ada perbedaan gamma mencolok antar-browser
- [ ] **Layar HDR / wide gamut:** emas & ember tidak oversaturasi
- [ ] **Trackpad vs mouse vs touch vs stylus:** semua bisa berinteraksi
- [ ] Ekstensi umum (ad blocker, dark reader) tidak mematahkan situs

---

## 9. SEO, metadata, keamanan

- [ ] `<title>`, meta description, canonical, `lang` benar
- [ ] Open Graph + Twitter card; `og-image` 1200×630 tampil di validator
- [ ] Favicon & ikon aplikasi (pixel, tajam di 16/32/180/512)
- [ ] JSON-LD `Person` valid
- [ ] `robots.txt` & `sitemap.xml` ada
- [ ] Konten utama ada di DOM (lihat sumber Quick Read / `noscript`)
- [ ] HTTPS; tanpa mixed content
- [ ] Header keamanan dasar (CSP sesuai, `X-Content-Type-Options`, `Referrer-Policy`)
- [ ] Tidak ada rahasia di bundle (cari `KEY`, `SECRET`, `TOKEN` di `dist/`)
- [ ] Link eksternal `rel="noopener noreferrer"`
- [ ] `npm audit` tanpa kerentanan high/critical pada dependensi produksi
- [ ] Analytics tanpa cookie / menghormati Do-Not-Track

---

## 10. Sign-off rilis

| Gerbang | Status | Diperiksa oleh | Tanggal |
|---|---|---|---|
| §1 CI hijau seluruhnya | ☐ | | |
| §2 Visual: baseline disetujui + inspeksi manual | ☐ | | |
| §3 Responsive: matriks lengkap | ☐ | | |
| §4 Aksesibilitas: otomatis + keyboard + screen reader | ☐ | | |
| §5 Interaksi | ☐ | | |
| §6 Fungsional: F01–F12 + aturan + form + konten | ☐ | | |
| §7 Performa di perangkat nyata | ☐ | | |
| §8 Matriks browser/perangkat | ☐ | | |
| §9 SEO & keamanan | ☐ | | |
| Tidak ada bug S1/S2 terbuka | ☐ | | |
| Bug S3 tercatat sebagai tiket | ☐ | | |

**Keputusan:** ☐ Rilis ☐ Tahan — Catatan: ______________________

---

## 11. Smoke test pasca-rilis (produksi, ≤ 10 menit)

- [ ] URL produksi terbuka tanpa error console (desktop + 1 ponsel)
- [ ] Title → Press Start → bergerak → buka 1 lokasi
- [ ] Quick Read terbuka & lengkap
- [ ] Form kontak: kirim pesan uji dan **pastikan benar-benar sampai** di inbox
- [ ] CV terunduh
- [ ] Deep link satu proyek bekerja; preview tautan (OG) tampil saat dibagikan
- [ ] Analytics menerima event
- [ ] Cache/CDN menyajikan versi terbaru (hash aset baru)
- [ ] Rencana rollback siap (deploy sebelumnya bisa dipulihkan)
