# PRODUCT.md — Product Context

> Menjelaskan *apa* yang dibangun, *untuk siapa*, dan *aturan main*-nya. Bagian bertanda `{{...}}` harus diisi pemilik portofolio.

---

## 1. Ringkasan produk

**Portofolio interaktif `{{OWNER_NAME}}` berbentuk JRPG pixel 2.5D.** Pengunjung masuk ke sebuah kota kecil, menggerakkan karakter hero (representasi pemilik), dan menemukan isi portofolio dengan cara menjelajah: profil di Guild Hall, proyek di Quest Board, skill di Armory, pengalaman di Library, dan kontak di Post Office.

Produk punya dua wajah dari konten yang sama:

| Mode | Untuk | Bentuk |
|---|---|---|
| **Adventure Mode** | Pengunjung yang punya waktu & ingin terkesan | Dunia 3D yang dijelajahi, dialog, quest, XP, achievement |
| **Quick Read Mode** | Recruiter yang terburu-buru, screen reader, perangkat lemah, SEO | Halaman HTML satu kolom bergaya sama, tanpa WebGL |

Kedua mode bisa ditukar kapan saja dari HUD dan berbagi URL yang setara.

### Value proposition

> "Dalam 10 detik pengunjung tahu ini bukan portofolio biasa; dalam 60 detik mereka tahu siapa saya dan apa yang pernah saya bangun."

---

## 2. Masalah yang diselesaikan

| Masalah | Jawaban produk |
|---|---|
| Portofolio developer terlihat seragam (hero, grid kartu, footer) dan mudah dilupakan | Pengalaman bermain yang khas dan layak dibagikan |
| Klaim skill ("menguasai Three.js, animasi") tidak terbukti | Situsnya sendiri adalah bukti kemampuan teknis & craft |
| Situs "kreatif" sering mengorbankan kecepatan mendapat informasi | Quick Read + Fast Travel: semua konten ≤ 2 interaksi |
| Situs WebGL berat dan tidak aksesibel | Quality tier adaptif, fallback tanpa WebGL, navigasi keyboard penuh |
| Pengunjung pergi setelah melihat 1 proyek | Gamification memberi alasan menjelajah semua bagian |

---

## 3. Target pengguna

### 3.1 Persona

**P1 — Rina, Tech Recruiter / HR** (prioritas tertinggi)
- Waktu: 30–90 detik. Perangkat: laptop kantor, kadang HP.
- Ingin: role, pengalaman, tech stack, link CV, kontak.
- Risiko: bingung dengan kontrol game lalu menutup tab.
- Kebutuhan: tombol "Quick Read" & "Unduh CV" terlihat sejak layar pertama.

**P2 — Dimas, Engineering Lead / Hiring Manager**
- Waktu: 3–10 menit. Perangkat: desktop.
- Ingin: kedalaman proyek, keputusan teknis, kualitas eksekusi, link repo/demo.
- Kebutuhan: detail quest yang substansial (masalah → peran → solusi → hasil), performa mulus.

**P3 — Calon klien / founder**
- Waktu: 2–5 menit. Perangkat: HP dominan.
- Ingin: "bisakah orang ini mengerjakan produk saya?", contoh hasil, cara menghubungi.
- Kebutuhan: pengalaman mobile yang solid, form kontak yang singkat.

**P4 — Sesama developer / komunitas**
- Waktu: bebas. Ingin: eksplorasi, easter egg, cara pembuatannya.
- Kebutuhan: rahasia untuk ditemukan, kredit & catatan teknis, hal yang layak di-screenshot.

### 3.2 Prioritas saat konflik

Kejelasan untuk P1 > kedalaman untuk P2 > kemudahan untuk P3 > kesenangan untuk P4.
Fitur yang menyenangkan P4 tetapi menghambat P1 **harus** bisa dilewati.

---

## 4. Peta dunia ↔ konten

| Lokasi | Section | Isi | Metafora |
|---|---|---|---|
| **Town Gate** | Landing / title screen | Nama, role, pilihan mode, kontrol | "Press Start" |
| **Town Square** | Hub | Papan penunjuk arah, NPC pemandu, air mancur | Titik spawn |
| **Guild Hall** | About | Bio, foto/portrait pixel, status sheet (class, level, stat) | Kartu karakter |
| **Quest Board** | Projects | Daftar proyek sebagai quest + detail | Papan misi |
| **Armory** | Skills | Tech stack sebagai equipment, dikelompokkan per slot | Inventory |
| **Library** | Experience | Riwayat kerja/pendidikan sebagai kronik | Buku sejarah |
| **Post Office** | Contact | Form "kirim surat", link sosial, unduh CV | Kirim merpati pos |
| **Rahasia** | Easter egg | Peti tersembunyi, NPC unik, kode rahasia | Side quest |

Skala: kota muat dalam ±3 layar lebar; berjalan dari ujung ke ujung ≤ 12 detik. Dunia kecil yang padat lebih baik daripada dunia besar yang kosong.

---

## 5. User journey

### 5.1 Jalur utama (Adventure)

```
Buka URL
  → Shell HTML tampil instan (judul, role, tombol mode)         [< 1 dtk]
  → Aset dunia dimuat (loading bar bertema)                       [2–5 dtk]
  → Title screen: "PRESS START" + "Quick Read"
  → Intro singkat (≤ 6 dtk, bisa di-skip): kamera turun ke kota, judul lokasi muncul
  → NPC pemandu menyapa: 2 baris dialog + hint kontrol
  → Pengunjung bebas: jalan / klik bangunan / buka Fast Travel
  → Masuk lokasi → window konten terbuka → +XP, quest log ter-update
  → Semua lokasi utama dikunjungi → achievement "Town Explorer" + ajakan kontak
  → Post Office → kirim pesan / unduh CV / buka sosial
```

### 5.2 Jalur cepat (Quick Read)

```
Buka URL → klik "Quick Read" (atau otomatis: tanpa WebGL / reduced motion / save-data)
  → Halaman satu kolom: About → Projects → Skills → Experience → Contact
  → CTA tetap: Unduh CV, Kirim pesan
  → Banner kecil: "Coba Adventure Mode" (tidak mengganggu)
```

### 5.3 Jalur deep link

`/#/quests/{slug}` membuka dunia dengan hero sudah berada di Quest Board dan detail quest terbuka (atau section yang sama di Quick Read). Dipakai untuk membagikan satu proyek tertentu.

### 5.4 Pengunjung kembali

Progress (XP, lokasi dikunjungi, achievement, preferensi) dimuat dari `localStorage`. Intro dilewati. Sapaan NPC berubah ("Selamat datang kembali").

---

## 6. Fitur utama

Prioritas: **P0** = wajib rilis, **P1** = rilis kalau sempat, **P2** = setelah rilis.

### 6.1 Dunia & eksplorasi

| ID | Fitur | Prioritas | Kriteria terima |
|---|---|---|---|
| W-01 | Dunia diorama HD-2D (kota + 6 lokasi) | P0 | Sesuai `DESIGN.md`; 60 fps desktop, ≥ 30 fps mobile menengah |
| W-02 | Kontrol hero: WASD/panah, klik/tap-to-move | P0 | Hero tidak menembus bangunan; pathing ke titik klik masuk akal |
| W-03 | Interaksi objek: `E`/Enter/Space/tap | P0 | Penanda muncul dalam jangkauan; satu objek aktif pada satu waktu |
| W-04 | Fast Travel menu | P0 | Daftar semua lokasi; pindah dengan transisi ≤ 600 ms; bisa penuh via keyboard |
| W-05 | Sistem dialog (typewriter, skip, pilihan) | P0 | Klik pertama melengkapi teks, klik kedua lanjut |
| W-06 | Kamera follow + tilt-shift + parallax | P0 | Tidak membuat pusing; mati saat reduced motion |
| W-07 | NPC ambient (jalan, idle), partikel (kunang-kunang, daun) | P1 | Tidak menurunkan FPS di bawah target |
| W-08 | Siklus siang/malam atau tema unlockable | P2 | — |

### 6.2 Konten portofolio

| ID | Fitur | Prioritas | Kriteria terima |
|---|---|---|---|
| C-01 | About: bio + status sheet | P0 | Role, ringkasan, lokasi, ketersediaan kerja terlihat tanpa scroll |
| C-02 | Quest Board: daftar & detail proyek | P0 | Tiap proyek: judul, peran, tahun, stack, masalah, solusi, hasil, link, media |
| C-03 | Armory: skill per kategori | P0 | Tanpa "progress bar persen" yang menyesatkan; pakai tingkat (lihat §7.4) |
| C-04 | Library: timeline pengalaman | P0 | Urut terbaru; tiap entri punya pencapaian konkret |
| C-05 | Post Office: form kontak + link + CV | P0 | Form terkirim & tervalidasi; CV terunduh |
| C-06 | Quick Read mode | P0 | Paritas konten 100% dengan Adventure |
| C-07 | Deep link per section & per proyek | P1 | URL bisa dibagikan dan dibuka langsung |
| C-08 | Dwibahasa ID/EN | P2 | — |

### 6.3 Gamification

| ID | Fitur | Prioritas | Kriteria terima |
|---|---|---|---|
| G-01 | XP & Level pengunjung | P0 | Lihat aturan §7.1 |
| G-02 | Quest log (progress eksplorasi) | P0 | Menunjukkan apa yang belum dilihat + cara ke sana |
| G-03 | Achievement + toast | P1 | Minimal 8 achievement (§7.3) |
| G-04 | Collectible tersembunyi (koin/peti) | P1 | Opsional; tidak mengunci konten |
| G-05 | Easter egg (kode rahasia, NPC unik) | P2 | Tidak muncul di Quick Read |
| G-06 | Reward akhir: "ending" kecil + CTA kontak | P1 | Muncul saat main quest 100% |
| G-07 | Persistensi progress + reset | P0 | Bertahan antar-kunjungan; tombol reset dengan konfirmasi |

### 6.4 Sistem

| ID | Fitur | Prioritas |
|---|---|---|
| S-01 | Loading bertahap + fallback tanpa WebGL | P0 |
| S-02 | Quality tier adaptif | P0 |
| S-03 | Pengaturan: suara, kualitas, reduced motion, mode | P0 |
| S-04 | Aksesibilitas (keyboard, screen reader via Quick Read & HUD) | P0 |
| S-05 | SEO & social preview (meta, OG image, JSON-LD Person) | P0 |
| S-06 | Analytics ramah privasi (tanpa cookie) | P1 |

---

## 7. Business logic (aturan permainan)

Semua aturan ini adalah logika murni di `src/game/` dan harus punya unit test.

### 7.1 XP & Level

| Aksi (sekali per item) | XP |
|---|---|
| Mengunjungi lokasi utama pertama kali | 50 |
| Membuka detail satu quest/proyek | 30 |
| Membuka link eksternal proyek (demo/repo) | 10 |
| Berbicara dengan NPC baru | 10 |
| Menemukan collectible | 15 |
| Membuka achievement | sesuai achievement |
| Mengirim pesan kontak | 100 |

- XP hanya diberikan **sekali per ID aksi** (idempoten); mengulang tidak menambah.
- Level: total XP untuk mencapai level `L` = `100 × (L − 1) × L / 2` → LV2 = 100, LV3 = 300, LV4 = 600, LV5 = 1000.
- Level maksimum = level yang tercapai jika semua konten ditemukan (kalibrasi angka agar pas di LV5).
- Naik level memicu efek + toast; **tidak pernah** mengunci konten.

### 7.2 Quest

| Tipe | Contoh | Selesai ketika |
|---|---|---|
| **Main quest** "Kenali Sang Hero" | 5 objektif = 5 lokasi utama | Semua lokasi dikunjungi |
| **Project quest** | Tiap proyek portofolio | Detail dibuka (status: `new` → `read`) |
| **Side quest** | "Temukan 5 koin", "Sapa semua warga" | Syarat terpenuhi |

Status quest: `locked` (tidak dipakai untuk konten portofolio) → `available` → `active` → `completed`.

### 7.3 Achievement (awal)

| ID | Nama | Syarat | XP |
|---|---|---|---|
| `first-steps` | First Steps | Bergerak pertama kali | 10 |
| `town-explorer` | Town Explorer | Semua lokasi utama dikunjungi | 100 |
| `quest-reader` | Quest Reader | Membuka 3 proyek | 50 |
| `completionist` | Completionist | Membuka semua proyek | 100 |
| `social-butterfly` | Social Butterfly | Bicara dengan semua NPC | 50 |
| `treasure-hunter` | Treasure Hunter | Semua collectible ditemukan | 100 |
| `pen-pal` | Pen Pal | Mengirim pesan kontak | 50 |
| `secret-code` | ??? | Memasukkan kode rahasia | 50 |

### 7.4 Representasi skill (Armory)

Skill ditampilkan sebagai equipment dengan **rarity**, bukan persen:

| Rarity | Arti jujur |
|---|---|
| Legendary | Dipakai harian bertahun-tahun, dipakai di produksi, bisa mengajar orang lain |
| Epic | Dipakai di beberapa proyek produksi |
| Rare | Pernah dipakai di proyek nyata |
| Common | Sedang dipelajari / proyek pribadi |

Tiap item menaut ke quest (proyek) yang membuktikannya.

### 7.5 Aturan emas gamification

1. **Tidak ada konten portofolio yang terkunci** di balik level, quest, atau collectible.
2. Semua reward bersifat kosmetik atau naratif.
3. Tidak ada timer, nyawa, atau kondisi kalah.
4. Progress boleh direset pengunjung kapan saja.
5. Gamification tidak tampil di Quick Read (kecuali ajakan mencoba Adventure).

### 7.6 Persistensi

- Kunci `localStorage`: `{{APP_KEY}}:save:v1` → `{ version, xp, visited[], questsRead[], achievements[], collectibles[], npcsMet[], settings }`.
- Skema ber-versi; migrasi saat versi naik; data rusak → reset diam-diam ke default (jangan crash).
- Tidak ada data pribadi yang disimpan. Tidak ada akun.

### 7.7 Kontak

- Field: nama (wajib), email (wajib, valid), pesan (wajib, 10–2000 karakter), honeypot tersembunyi.
- Kirim ke `VITE_CONTACT_ENDPOINT` (layanan form / serverless function). Rate limit sisi klien: 1 kirim per 30 detik.
- Gagal kirim → pesan tetap ada di form + tawarkan alternatif `mailto:`.

---

## 8. Di luar cakupan (non-goals)

- Pertarungan, musuh, HP pemain, game over.
- Multiplayer, akun, leaderboard server.
- CMS/backend sendiri (konten berupa file data di repo).
- Dunia besar atau banyak map; cukup satu kota.
- Blog (bisa ditambahkan nanti sebagai lokasi baru).

---

## 9. Metrik keberhasilan

| Metrik | Target |
|---|---|
| LCP (shell) | ≤ 2.5 dtk di 4G |
| Waktu sampai bisa bergerak (Adventure) | ≤ 6 dtk di 4G, ≤ 3 dtk di broadband |
| FPS | 60 desktop; ≥ 30 mobile menengah |
| Bounce di title screen | < 35% |
| Pengunjung yang membuka ≥ 1 proyek | > 60% |
| Pengunjung yang mencapai Contact | > 25% |
| Lighthouse Accessibility (Quick Read) | ≥ 95 |
| Konversi kontak / unduh CV | Dilacak; baseline ditetapkan setelah 30 hari |

Event analytics minimal: `mode_selected`, `location_visited`, `quest_opened`, `external_link_clicked`, `cv_downloaded`, `contact_submitted`, `achievement_unlocked`, `quality_tier_set`.

---

## 10. Konten yang harus disiapkan pemilik

- [ ] Nama, role/class, tagline 1 kalimat, bio 2–3 paragraf, lokasi, status ketersediaan
- [ ] 4–8 proyek: judul, tahun, peran, stack, masalah, solusi, hasil terukur, link, 1–3 gambar
- [ ] Daftar skill + rarity jujur + proyek pembukti
- [ ] Riwayat kerja/pendidikan dengan pencapaian
- [ ] Email, tautan sosial, file CV (PDF)
- [ ] Teks dialog NPC (≤ 2 baris per giliran)
- [ ] Portrait pixel hero + spritesheet (idle, jalan 4 arah)

---

## 11. Risiko

| Risiko | Mitigasi |
|---|---|
| Recruiter tidak paham kontrol | Quick Read menonjol; Fast Travel; hint kontrol; klik bangunan langsung jalan |
| Performa mobile buruk | Quality tier, DPR cap, lazy load, anggaran aset (lihat `ARCHITECTURE.md`) |
| Scope membengkak (ingin jadi game sungguhan) | Non-goals §8; P0 dulu |
| Produksi aset pixel lama | Mulai dari paket berlisensi, ganti bertahap dengan aset orisinal |
| SEO lemah karena canvas | Konten ada di DOM (Quick Read), meta & JSON-LD |
| Motion sickness | Kamera lembut, reduced motion, tanpa shake berlebih |
