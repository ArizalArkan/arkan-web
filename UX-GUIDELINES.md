# UX-GUIDELINES.md — UX Guidelines

> Pola interaksi agar pengalaman terasa konsisten, masuk akal, dan tetap seperti JRPG. Komponen yang disebut di sini didefinisikan di `COMPONENTS.md`.

---

## 1. Prinsip UX

1. **Pengunjung tidak pernah tersesat.** Selalu ada jalan keluar (Esc/tutup), jalan pintas (Fast Travel), dan jalan cepat (Quick Read).
2. **Tunjukkan, lalu biarkan.** Ajari kontrol sekali lewat konteks; jangan tutorial panjang.
3. **Respons ≤ 100 ms.** Setiap input dibalas visual seketika, walau hasil akhirnya butuh waktu.
4. **Tema tidak boleh mengaburkan makna.** Label bertema boleh, asal maknanya jelas tanpa menebak ("Post Office — Kontak").
5. **Tidak ada jalan buntu.** Setiap error & empty state menawarkan langkah berikutnya.
6. **Hormati waktu & perangkat.** Semua animasi naratif bisa di-skip; preferensi diingat.

---

## 2. Loading

### 2.1 Tahapan

| Tahap | Tampilan | Target |
|---|---|---|
| 0. HTML shell | Latar `night-900`, nama & role, tombol **Quick Read** sudah bisa diklik | < 1 dtk |
| 1. Muat dunia | `LoadingScreen`: sprite hero berjalan di tempat, bar progress nyata (`useProgress`), tip bergantian tiap 3 dtk | 2–5 dtk |
| 2. Siap | Bar penuh → "PRESS START" berkedip | — |
| 3. Masuk | Transisi iris/fade → intro (≤ 6 dtk, bisa di-skip) | — |

### 2.2 Aturan

- Progress harus **nyata** (berdasar aset termuat), tidak mundur, tidak berhenti lama di 99%.
- Loading > 8 detik → tampilkan "Koneksi lambat? **Buka Quick Read**".
- Loading > 20 detik atau aset gagal → error state (§4) dengan Coba Lagi + Quick Read.
- Loading dalam aplikasi (gambar proyek, kirim form): skeleton/Spinner **di tempat**, tidak memblokir seluruh layar.
- Gambar: placeholder berdimensi tetap (tanpa layout shift) → gambar muncul dengan fade 120 ms.
- Tombol yang sedang memproses: `isLoading`, lebar tetap, tidak bisa diklik dua kali.
- Operasi < 300 ms tidak menampilkan indikator (menghindari kedip).
- Kunjungan ulang (aset di-cache): lewati tip, langsung ke title.

### 2.3 Isi tip loading

Berguna, bukan basa-basi: kontrol ("Tekan `M` untuk Fast Travel"), fakta tentang pemilik, atau humor ringan. Maks. 80 karakter.

---

## 3. Empty state

Kosong bukan error. Selalu: **ilustrasi kecil + apa artinya + apa yang bisa dilakukan**.

| Situasi | Judul | Deskripsi | Aksi |
|---|---|---|---|
| Quest log belum ada progres | "Petualangan baru dimulai" | "Kunjungi bangunan di kota untuk mengisi catatan ini." | Buka Fast Travel |
| Filter proyek tanpa hasil | "Tidak ada quest di kategori ini" | "Coba kategori lain." | Reset filter |
| Achievement belum ada | "Belum ada lencana" | Tampilkan siluet terkunci + syaratnya | — |
| Collectible 0 | "Kantong masih kosong" | "Konon ada koin tersembunyi di sudut kota…" | — |
| Proyek tanpa media | (jangan tampilkan area kosong) | Sembunyikan blok media | — |

Achievement rahasia tampil sebagai "???" dengan petunjuk samar — bukan disembunyikan total.

---

## 4. Error state

### 4.1 Prinsip

- Bahasa manusia: **apa yang terjadi → apa dampaknya → apa yang bisa dilakukan**. Tanpa kode error mentah, tanpa menyalahkan pengguna.
- Boleh bertema, tapi kalimat kedua harus literal.
- Input pengguna tidak pernah hilang karena error.
- Detail teknis hanya ke console/analytics.

### 4.2 Katalog

| Kasus | Pesan | Tindakan sistem |
|---|---|---|
| WebGL tidak didukung | "Perangkat ini belum bisa membuka dunia 3D. Kamu tetap bisa membaca semuanya di Quick Read." | Otomatis ke Quick Read + banner info |
| WebGL context lost | "Dunia sempat menghilang. Memulihkan…" | Coba restore; gagal → tombol Muat Ulang + Quick Read |
| Aset gagal dimuat | "Sebagian dunia gagal dimuat. Periksa koneksimu lalu coba lagi." | Retry otomatis 2× (backoff) → tombol Coba Lagi + Quick Read |
| Crash komponen (ErrorBoundary) | "Ada yang tidak beres di sini." | Boundary per-window: sisa aplikasi tetap hidup; tombol Tutup / Muat Ulang |
| Form: jaringan gagal | "Surat gagal terkirim karena koneksi. Pesanmu masih aman di sini." | Tombol Kirim Ulang + link `mailto:` |
| Form: server error | "Kantor pos sedang bermasalah. Coba lagi sebentar, atau kirim lewat email." | Sama |
| Form: rate limit | "Tunggu 30 detik sebelum mengirim lagi." | Hitung mundur di tombol |
| Deep link tidak dikenal | "Quest itu tidak ditemukan." | Buka Quest Board + toast info |
| Save rusak / localStorage tidak tersedia | (diam) atau toast sekali: "Progress tidak dapat disimpan di browser ini." | Jalan tanpa persistensi |
| Performa rendah | Toast: "Kualitas grafis diturunkan agar lebih lancar." | Turunkan tier; bisa diubah di Settings |
| Gambar proyek gagal | Placeholder pixel + alt text | — |

### 4.3 Tampilan

- Error inline (form): teks `hp-300` + ikon, tepat di bawah field.
- Error lokal (window): `ErrorState` di dalam window.
- Error global: layar penuh di atas latar `night-900` dengan dua tombol.
- `Toast kind="error"`: hanya untuk kegagalan yang tidak butuh keputusan; bertahan 8 dtk, bisa ditutup.

---

## 5. Success feedback

Skala umpan balik mengikuti besarnya pencapaian. **Jangan merayakan hal kecil secara berlebihan.**

| Tingkat | Peristiwa | Feedback |
|---|---|---|
| **Mikro** | Hover, pindah kursor, tekan tombol | Perubahan state + SFX blip (jika suara aktif) |
| **Kecil** | +XP, link disalin, pengaturan tersimpan | Angka "+30 XP" melayang dari sumber → bar XP terisi; toast ringkas bila perlu |
| **Sedang** | Lokasi baru, quest dibaca, collectible | `LocationBanner` / centang di kartu / sprite kilau + toast |
| **Besar** | Naik level, achievement | Toast `achievement` + kilau emas + jingle pendek; dunia **tidak** di-pause |
| **Puncak** | Main quest 100%, pesan terkirim | Momen khusus ≤ 4 dtk (bisa di-skip): efek cahaya + dialog NPC + CTA berikutnya |

Aturan:
- Feedback tidak memblokir input, kecuali tingkat Puncak (dan itu pun bisa di-skip).
- XP beruntun digabung menjadi satu toast.
- Setelah form terkirim: ganti form dengan konfirmasi ("Surat terkirim! Balasan biasanya dalam 1–2 hari."), sediakan "Kirim surat lain"; fokus pindah ke judul konfirmasi.
- Setiap sukses juga diumumkan ke screen reader (`role="status"`).
- Reduced motion: partikel & kilau diganti perubahan warna statis.

---

## 6. Form validation

Berlaku untuk form kontak (dan form lain di masa depan).

| Aturan | Detail |
|---|---|
| Kapan validasi | Saat **blur** pertama kali; setelah ada error → validasi ulang saat **mengetik**; semua field saat **submit** |
| Jangan | Menampilkan error saat pengguna baru mulai mengetik; menonaktifkan tombol submit karena form belum valid |
| Saat submit gagal validasi | Fokus ke field error pertama; ringkasan diumumkan (`aria-live`) |
| Label | Selalu terlihat di atas field; placeholder bukan pengganti label |
| Wajib/opsional | Tandai yang **opsional** ("(opsional)") bila mayoritas wajib |
| Pesan error | Spesifik & memberi solusi |
| Atribut | `type="email"`, `autocomplete="name"`/`"email"`, `inputmode`, `maxlength`, `required` |
| Penghitung | Pesan: "132 / 2000" — berubah `hp-300` saat lewat batas |
| Anti-spam | Honeypot tersembunyi; tanpa CAPTCHA yang mengganggu |
| Draf | Simpan isi form di `sessionStorage`; pulihkan bila window ditutup tak sengaja |

| Field | Aturan | Pesan error |
|---|---|---|
| Nama | Wajib, 2–80 karakter | "Tulis namamu dulu, ya." |
| Email | Wajib, format valid | "Email ini sepertinya belum lengkap. Contoh: nama@domain.com" |
| Pesan | Wajib, 10–2000 karakter | "Pesan terlalu pendek — minimal 10 karakter." / "Pesan terlalu panjang (maks. 2000 karakter)." |

Status tombol submit: `default` "Kirim Surat" → `loading` "Mengirim…" → sukses (form diganti konfirmasi) / gagal (kembali `default` + error di atas tombol).

---

## 7. Confirmation dialog

Konfirmasi hanya untuk aksi yang **merusak atau sulit dibatalkan**. Terlalu banyak konfirmasi membuat orang berhenti membaca.

| Aksi | Konfirmasi? | Catatan |
|---|---|---|
| Reset progress | **Ya** (`tone="danger"`) | "Hapus semua progress? XP, lencana, dan catatan quest akan hilang. Tindakan ini tidak bisa dibatalkan." → [Batal] [Hapus Progress] |
| Menutup form kontak yang sudah diisi | **Ya** — atau simpan draf otomatis (lebih baik) | "Buang draf surat?" |
| Membuka link eksternal | Tidak | Buka tab baru + ikon external |
| Ganti mode Adventure ↔ Quick Read | Tidak | Reversibel, state tersimpan |
| Skip intro / dialog | Tidak | — |
| Mengubah kualitas/suara | Tidak | Langsung berlaku |

Aturan dialog:
- Judul = pertanyaan spesifik; tombol = kata kerja spesifik ("Hapus Progress"), bukan "Ya/OK".
- Fokus awal pada aksi **aman** (Batal). Esc = Batal. Klik backdrop = Batal.
- Urutan: Batal (kiri), Aksi (kanan). Aksi destruktif memakai `variant="danger"`.
- Untuk aksi reversibel, lebih baik **Undo** lewat toast daripada konfirmasi.

---

## 8. Navigation

### 8.1 Model navigasi

Tiga cara menuju konten yang sama — pengunjung memilih:

| Cara | Untuk | Bagaimana |
|---|---|---|
| **Jelajah** | Yang ingin bermain | Jalan ke bangunan, interaksi |
| **Fast Travel** | Yang ingin cepat tapi tetap di dunia | Menu daftar lokasi (`M` / tombol peta) |
| **Quick Read** | Yang hanya ingin membaca | Halaman dokumen dengan anchor nav |

### 8.2 Kontrol

| Aksi | Keyboard | Mouse | Sentuh |
|---|---|---|---|
| Bergerak | WASD / panah | Klik tanah | Tap tanah |
| Interaksi | `E` / Enter / Space | Klik objek | Tap objek / `ActionButton` |
| Fast Travel | `M` | Tombol HUD | Tombol HUD |
| Quest log | `Q` | Tombol HUD | Tombol HUD |
| Menu / pengaturan | `Esc` (saat tak ada window) | Tombol HUD | Tombol HUD |
| Tutup / batal | `Esc` | Tombol ✕ / backdrop | Tombol ✕ / swipe turun (sheet) |
| Kembali | `Backspace` / Back browser | Tombol ← | Tombol ← / Back |
| Lanjut dialog | Enter / Space / `E` | Klik | Tap |

- Shortcut huruf nonaktif saat fokus berada di input teks.
- `Tab` selalu bekerja untuk berpindah antar kontrol HUD/window.
- Hint kontrol kontekstual selalu terlihat di bawah layar dan menyesuaikan perangkat input terakhir yang dipakai.
- Skip link "Lewati ke konten / Buka Quick Read" sebagai elemen fokus pertama.

### 8.3 Orientasi

- `LocationBanner` saat masuk zona baru.
- Papan penunjuk arah di Town Square; bangunan yang belum dikunjungi punya penanda `!`.
- Fast Travel menunjukkan status tiap lokasi (baru / dikunjungi).
- Quest log menjawab "apa lagi yang belum kulihat?".
- Kamera dibatasi tepi dunia; hero tidak bisa keluar peta atau terjebak.
- Hero diam > 20 detik tanpa window terbuka pada kunjungan pertama → NPC pemandu memberi petunjuk sekali.

### 8.4 Window & fokus

- Membuka window: input dunia berhenti, fokus pindah ke judul window, dunia diredupkan sedikit (tetap terlihat).
- Menutup window: fokus kembali ke pemicu (atau canvas), hero tetap di tempat.
- Hanya satu window + (opsional) satu modal di atasnya.
- URL berubah saat window dibuka (deep link); Back browser = tutup/kembali.

### 8.5 Quick Read

- Nav lengket berisi anchor section + tombol "Adventure Mode".
- Urutan: About → Projects → Skills → Experience → Contact.
- Heading hierarkis (satu `h1`), landmark (`header`, `nav`, `main`, `footer`).

---

## 9. Interaction patterns

### 9.1 Dialog NPC

- Maks. **2 baris per halaman, 3 halaman per giliran**. Lebih dari itu → pindahkan ke window konten.
- Klik pertama melengkapi teks; klik kedua lanjut. Tahan/`Esc` untuk skip seluruh dialog.
- Dialog yang sudah pernah dibaca dipersingkat pada kunjungan berikut.
- Pilihan dialog: maks. 4, aksi utama di urutan pertama, selalu ada pilihan keluar.
- Informasi penting portofolio **tidak** boleh hanya ada di dialog.

### 9.2 Affordance objek dunia

| State | Tanda |
|---|---|
| Bisa diinteraksi (jauh) | Penanda `!`/`?` melayang, bob halus |
| Dalam jangkauan / hover | Outline emas pada sprite + hint "`E` …" + kursor pointer |
| Sedang berinteraksi | Penanda hilang, kamera sedikit fokus |
| Sudah dikunjungi | Penanda berubah (centang kecil / redup) |

Klik objek yang jauh: hero berjalan ke sana lalu otomatis berinteraksi. Tap di area tak terjangkau: hero menuju titik terdekat + penanda "×" singkat.

### 9.3 Hover, fokus, tekan

Mengikuti matriks state `COMPONENTS.md` §1.3. Hover tidak pernah menjadi satu-satunya cara mengungkap informasi.

### 9.4 Scroll

- Tidak ada scroll halaman di Adventure Mode (canvas fixed). Scroll hanya di dalam window.
- Tidak ada scroll-jacking di Quick Read.
- Posisi scroll window diingat saat kembali dari detail quest ke daftar.

### 9.5 Suara

- Default mati. Saat pertama dinyalakan, mainkan SFX konfirmasi sebagai bukti.
- BGM berhenti saat tab tidak aktif.
- Tidak ada autoplay audio.

### 9.6 Pengaturan & preferensi

- Semua preferensi langsung berlaku dan tersimpan.
- `prefers-reduced-motion` dipakai sebagai default, bisa diubah manual.
- Pilihan kualitas manual mengalahkan penyesuaian otomatis.

### 9.7 Mobile

- Tap-to-move sebagai default (tanpa joystick virtual yang menutupi layar).
- `ActionButton` muncul di kanan bawah saat ada objek dalam jangkauan.
- Window sebagai bottom sheet; swipe turun untuk menutup (dengan tombol ✕ tetap ada).
- Kunci orientasi **tidak** dipaksakan; kedua orientasi harus berfungsi.
- Cegah zoom tak sengaja pada double-tap di canvas, **tanpa** mematikan pinch-zoom halaman Quick Read.

---

## 10. Microcopy & glosarium

### 10.1 Suara tulisan

Ramah, ringkas, sedikit jenaka; kalimat aktif; menyapa dengan "kamu". Humor tidak pernah di pesan error kritis.

### 10.2 Glosarium (gunakan konsisten)

| Istilah tema | Arti literal | Aturan |
|---|---|---|
| Quest | Proyek | Sebut "Quest (Proyek)" pada kemunculan pertama |
| Quest Board | Daftar proyek | — |
| Guild Hall | Tentang saya | Subjudul "About" |
| Armory / Equipment | Skill / tech stack | — |
| Library / Chronicle | Pengalaman | — |
| Post Office / Surat | Kontak / pesan | Tombol: "Kirim Surat" |
| XP / LV | Progres eksplorasi pengunjung | Bukan penilaian skill pemilik |
| Fast Travel | Pindah cepat antar lokasi | — |
| Quick Read | Mode baca tanpa game | Jangan diganti-ganti namanya |
| Adventure Mode | Mode dunia 3D | — |

### 10.3 Pola label

| Elemen | Pola | Contoh |
|---|---|---|
| Tombol | Kata kerja + objek | "Lihat Demo", "Unduh CV" |
| Hint | `Tombol` + aksi | "`E` Bicara" |
| Toast | Hasil, bukan proses | "Lencana baru: Town Explorer" |
| Error | Kejadian + solusi | Lihat §4.2 |
| Link eksternal | Sebut tujuan | "Buka repo di GitHub" |

---

## 11. Checklist UX per fitur baru

- [ ] Bisa dicapai lewat Jelajah, Fast Travel, **dan** Quick Read?
- [ ] Punya loading, empty, error, dan success state?
- [ ] Bisa dioperasikan penuh dengan keyboard dan sentuh?
- [ ] Bisa di-skip / ditutup dengan `Esc`?
- [ ] Reduced motion ditangani?
- [ ] Teks mengikuti glosarium?
- [ ] Tidak mengunci konten portofolio di balik permainan?
