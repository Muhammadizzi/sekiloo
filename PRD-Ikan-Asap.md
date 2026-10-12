# PRD — sekiloo: Web Toko Ikan Asap + Aplikasi Admin

**Versi:** 0.3
**Tanggal:** 7 Oktober 2026
**Status:** Draf, stack & hosting sudah dikunci, data asli belum lengkap

---

## Ringkasan perubahan dari versi 0.1

| Topik | Versi 0.1 | Versi 0.2 |
|---|---|---|
| Bentuk produk | Satu web app, admin login di web | **Dua produk:** web toko tanpa login sama sekali + **aplikasi admin Android (APK)** |
| Harga & stok | Per lokasi (masih pertanyaan) | **Per zona:** Pasar & Rumah Produksi berbagi harga dan stok, Cikarang sendiri |
| Status pesanan pembeli | Tidak diatur | Link status dengan token acak + halaman Cek Pesanan + kode ambil |
| Anti-spam | Rate limit umum | Aturan khusus checkout tanpa login (batas pesanan belum dibayar, batas jumlah) |
| Webhook pembayaran | Verifikasi signature | Checklist lengkap: signature, status, nominal, tidak diproses dua kali |
| Keamanan admin | Supabase Auth, "idealnya 2FA" | Pendaftaran dimatikan, **MFA wajib**, cek peran, log perubahan |
| Data pribadi | Tidak disebut | Kepatuhan UU PDP (UU No. 27/2022) |
| Performa | Target LCP saja | Anggaran ukuran halaman + aturan foto + ukuran awal yang sudah diukur |
| Beranda | Tidak dirinci | Struktur 9 bagian, mengacu Russ & Daughters (lihat mockup) |

**Perubahan di versi 0.3:**

| Topik | Versi 0.2 | Versi 0.3 |
|---|---|---|
| Hosting web | Vercel (free tier) | **Netlify Free** — paket gratis Vercel melarang pemakaian komersial |
| Bahasa & framework | Next.js + TypeScript | Tetap. **PHP/Laravel sudah ditimbang dan ditolak** (lihat Bagian 12) |
| Biaya | Hanya disebut "free tier cukup untuk awal" | Bagian 11.3 baru: rincian biaya, potongan Midtrans, dan patokan kapan upgrade |
| Supabase gratis | Dipakai tanpa catatan | Tiga pengaman wajib (Bagian 10.6): anti-pause, backup sendiri, batas project |

---

## 1. Latar Belakang & Tujuan

Banyak konsumen ragu mengonsumsi ikan asap karena khawatir soal keamanan pangan, kebersihan proses, dan kehalalan. sekiloo dibuat untuk **membangun kepercayaan** itu sekaligus mempermudah pembelian.

**Tujuan utama:**
1. Meyakinkan konsumen bahwa ikan asap ini **aman, higienis, dan halal**.
2. Memudahkan konsumen memesan dan membayar online **tanpa membuat akun**.
3. Memberi pemilik usaha kontrol penuh atas produk, harga, stok, dan pesanan **dari aplikasi di HP-nya**.

**Bukan tujuan MVP:** pengiriman/kurir, program loyalti, multi-penjual, aplikasi pembeli (iOS/Android), aplikasi admin untuk iPhone.

---

## 2. Sasaran & Metrik Keberhasilan

| Sasaran | Metrik |
|---|---|
| Konsumen percaya produk aman & halal | Nomor sertifikat halal + tombol cek di halal.go.id tampil di setiap produk; tingkat penyelesaian checkout |
| Pembelian mudah di HP | LCP < 3 detik di 4G (PageSpeed Insights mode mobile); checkout ≤ 4 langkah |
| Tidak ada "pesan lalu kabur" | 0 pesanan disiapkan sebelum pembayaran lunas |
| Pembeli mau bayar di muka | Persentase pesanan yang batal karena tidak dibayar (dipantau sejak minggu pertama) |
| Admin mudah mengelola | Ubah status pesanan atau stok < 30 detik dari aplikasi |
| Data web selalu benar | Perubahan harga/stok/produk dari aplikasi admin tampil di web ≤ 1 menit |

---

## 3. Produk, Pengguna & Platform

sekiloo terdiri dari **dua produk** yang memakai **satu database yang sama**.

| | Web toko | Aplikasi admin |
|---|---|---|
| Bentuk | Link web biasa (mis. `sekiloo.id`) | Aplikasi Android, dipasang dari file **APK** (tanpa Play Store) |
| Pengguna | Pembeli, mayoritas lewat HP | **Hanya pemilik usaha** (1–2 akun, akses penuh) |
| Login | **Tidak ada login sama sekali**, baik untuk pembeli maupun admin | Wajib login + verifikasi 2 langkah (MFA) |
| Isi | Beranda, katalog, detail produk, keranjang, checkout, status pesanan, lokasi & jam, FAQ | Login, dashboard, pesanan, produk, harga & stok, lokasi & jadwal libur |
| Desain | Mobile-first, design system di `src/app/globals.css` | Mengikuti warna & tipografi yang sama |

Web toko **tidak memiliki halaman admin, halaman login, atau tautan ke aplikasi admin**. Keamanan tetap tidak bergantung pada hal ini (lihat Bagian 10).

---

## 4. Ruang Lingkup MVP

**Termasuk:**
- Web toko: beranda, katalog 4 kategori, detail produk, pemilih lokasi ambil dengan harga zona, keranjang, checkout tanpa akun, halaman status pesanan, Cek Pesanan, Lokasi & Jam, FAQ.
- 3 titik ambil: Pasar, Rumah Produksi, Cikarang, dengan harga & stok **per zona**.
- Pembayaran di muka (QRIS / transfer VA / e-wallet) lewat Midtrans.
- Aplikasi admin Android: login + MFA, dashboard ringkas, kelola pesanan, verifikasi kode ambil, kelola produk, harga & stok per zona, jam operasional & jadwal libur.
- Pembaruan otomatis web setelah data diubah dari aplikasi admin.

**Tidak termasuk (MVP):**
- Pengiriman ke alamat / ongkir. Semua pesanan diambil sendiri.
- Akun & riwayat pesanan pembeli.
- Notifikasi push ke HP admin dan notifikasi WhatsApp otomatis ke pembeli (Fase 2).
- Peran petugas titik ambil (Fase 2).
- Aplikasi admin iPhone, distribusi lewat Play Store.
- Diskon/kupon, rating & ulasan.

---

## 5. Fitur

### 5.1 Web toko — Beranda

Struktur mengacu pola Russ & Daughters, disesuaikan untuk toko yang masih harus meyakinkan pembeli baru. Mockup: https://claude.ai/code/artifact/6414a0dd-9efe-4473-9d07-4e43c1088299

| Urutan | Bagian | Isi |
|---|---|---|
| 1 | Header | Wordmark, ikon keranjang dengan jumlah item (selalu terlihat), menu |
| 2 | Hero | Foto hero, satu kalimat, **4 tombol besar 2×2**: Pesan Sekarang · Lokasi & Jam · Cek Pesanan · Chat WhatsApp |
| 3 | Buka hari ini | Jam tiap titik ambil, status buka/tutup, catatan libur terdekat |
| 4 | Produk | Chip kategori + produk terlaris **lengkap dengan harga** |
| 5 | Kenapa aman | Sertifikat halal + tombol cek halal.go.id, langkah proses pengasapan, tabel masa simpan |
| 6 | Lokasi ambil | Kartu per titik: alamat, jam, zona harga, tombol petunjuk arah, tombol pesan |
| 7 | Cerita usaha | Foto dapur + 2–3 kalimat dari pemilik |
| 8 | Sering ditanyakan | Tanpa akun, cara bayar, batas waktu bayar, harga Cikarang, pengantaran |
| 9 | Footer | Tombol WhatsApp, tautan cepat, metode pembayaran |

**Sengaja tidak dipakai:** popup diskon saat web dibuka, tombol ke marketplace/Linktree, peta Google Maps yang disematkan, feed Instagram/TikTok.

### 5.2 Web toko — Katalog & Detail Produk

- **Kategori:** Ikan, Kepala, Jeroan, Telur. Hanya kategori Ikan yang punya cara jual **potongan** atau **utuh (per ekor)**.
- **Harga per unit** (per pack / potong / ekor), bukan per kilo. Ukuran kemasan wajib tertulis.
- **Harga di katalog:** harga zona reguler ditulis besar, harga Cikarang ikut disebut kecil di bawahnya supaya tidak jadi kejutan.
- **Status stok:** Tersedia / Menipis (sisa N) / Habis. Bila zona reguler habis tapi Cikarang masih ada, ditulis.
- **Detail produk:** galeri, pemilih lokasi ambil (harga & stok berubah sesuai zona), alasan selisih harga Cikarang, info halal, manfaat, proses pengasapan, penyimpanan.

### 5.3 Web toko — Keranjang, Checkout & Status Pesanan

- **Keranjang:** satu lokasi ambil per pesanan. Mengganti lokasi menghitung ulang harga sesuai zona.
- **Checkout:** isi nama, nomor WhatsApp, konfirmasi lokasi ambil. Nama & nomor boleh diingat di HP pembeli (localStorage) untuk pesanan berikutnya.
- **Pembayaran:** Midtrans Snap. Batas waktu bayar 60 menit.
- **Halaman status pesanan** (`/pesanan/{token}`):
  - Token acak minimal 128 bit, tidak berurutan dan tidak bisa ditebak.
  - Menampilkan kode pesanan, status, isi pesanan, lokasi & jam ambil, **kode ambil 6 digit** (setelah lunas).
  - Nomor HP ditampilkan tersamar (0812\*\*\*\*7890). Halaman diberi `noindex`.
  - Tombol "Bagikan ke WhatsApp" agar pembeli bisa menyimpan link sendiri.
- **Cek Pesanan:** masukkan kode pesanan + nomor WhatsApp → diarahkan ke halaman status. Dibatasi percobaannya.
- **Kontak cepat:** tombol WhatsApp di hero, halaman produk, dan footer.

### 5.4 Kepercayaan (inti tujuan bisnis)

- **Halal:** nomor sertifikat, lembaga penerbit, masa berlaku, gambar sertifikat, dan tombol **"Cek keaslian di halal.go.id"**.
- **Proses pengasapan:** langkah konkret (jenis kayu, suhu, durasi, cara pengemasan), idealnya dengan foto dapur asli.
- **Manfaat:** hanya klaim yang punya sumber. Tidak ada klaim medis ("menyehatkan jantung", dsb). Angka gizi hanya dari hasil uji lab produk sendiri.
- **Penyimpanan & masa simpan:** suhu ruang, kulkas, freezer. Angka dari uji ketahanan produk, bukan perkiraan.
- **Cerita usaha:** ditulis oleh pemilik, bukan dikarang.

### 5.5 Aplikasi Admin (Android)

| Menu | Fitur |
|---|---|
| **Login** | Email + password, lalu kode dari aplikasi authenticator (MFA). Tidak ada tombol daftar. |
| **Dashboard** | Pesanan hari ini, pesanan lunas yang belum disiapkan, pesanan siap diambil, produk yang stoknya menipis |
| **Pesanan** | Daftar per status & per lokasi; detail pesanan; ubah status sesuai urutan; **verifikasi kode ambil** sebelum menandai Selesai; tombol WhatsApp ke pembeli |
| **Produk** | Tambah, edit, nonaktifkan (tidak dihapus permanen); foto dari kamera/galeri, **dikompres di HP sebelum diunggah** |
| **Harga & Stok** | Harga & stok per zona (reguler / Cikarang), alasan harga Cikarang, ambang stok menipis |
| **Lokasi & Libur** | Alamat, jam operasional, keterangan tiap titik ambil; jadwal libur (semua lokasi atau per lokasi) |
| **Akun** | Ganti password, kelola MFA, **keluar dari semua perangkat** |

Setiap perubahan dari aplikasi tercatat di log (siapa, apa, kapan, nilai lama → baru).

---

## 6. Alur Utama

### 6.1 Alur Pembeli
1. Buka web → beranda atau katalog.
2. Buka detail produk → baca info halal, proses, penyimpanan.
3. Pilih lokasi ambil → harga & stok menyesuaikan zona.
4. Masukkan ke keranjang → checkout, isi nama + nomor WhatsApp.
5. Server menghitung ulang harga, **mengurangi stok tersedia**, membuat pesanan berstatus **Menunggu Pembayaran**.
6. Bayar lewat Midtrans (maks. 60 menit).
7. Midtrans mengirim notifikasi lunas ke server → status **Diproses** → pembeli diarahkan ke halaman status berisi kode ambil.
8. Datang ke lokasi, tunjukkan kode ambil → admin menandai **Selesai**.

### 6.2 Alur Admin (aplikasi)
1. Buka aplikasi → login + MFA.
2. Lihat pesanan **lunas** di dashboard.
3. Siapkan pesanan → ubah status jadi **Siap Diambil**.
4. Pembeli datang → cocokkan kode ambil → tandai **Selesai**.
5. Sewaktu-waktu: ubah stok, harga, produk, jam, atau jadwal libur → web ikut diperbarui otomatis.

### 6.3 Urutan Status Pesanan

```text
menunggu_pembayaran ──(lunas)──► diproses ──(admin)──► siap_diambil ──(admin + kode ambil cocok)──► selesai
        │
        └──(kedaluwarsa / dibatalkan / ditolak)──► batal  → stok dikembalikan
```

Urutan ini **dijaga oleh database**, bukan oleh aplikasi. Status tidak bisa melompat (mis. dari Menunggu Pembayaran langsung ke Selesai).

---

## 7. Anti-Penipuan & Anti-Spam

Prinsip utama: **barang tidak disiapkan sebelum uang masuk**, dan **server tidak pernah percaya data dari browser**.

| Kontrol | Cara kerja |
|---|---|
| **Bayar di muka** | Status Diproses hanya bisa diset oleh notifikasi Midtrans yang lolos verifikasi. |
| **Harga dihitung server** | Browser hanya mengirim produk, jumlah, dan lokasi. Server mengambil harga dari database sesuai zona lokasi. |
| **Stok atomik** | Stok dikurangi dalam satu transaksi dengan syarat `stok >= jumlah`. Dua pembeli barang terakhir: hanya satu yang berhasil. |
| **Batas waktu bayar** | `expiry` Midtrans Snap = 60 menit, sama dengan `kedaluwarsa_pada` di database. Notifikasi `expire` membatalkan pesanan; tugas terjadwal di database (pg_cron, tiap 5 menit) jadi jaring pengaman. |
| **Verifikasi notifikasi Midtrans** | (1) `signature_key` = SHA512(order_id + status_code + gross_amount + Server Key) harus cocok; (2) hanya `settlement` (atau `capture` bila kartu kredit diaktifkan) yang dianggap lunas; (3) `gross_amount` harus sama dengan total pesanan; (4) notifikasi yang sama tidak diproses dua kali. |
| **Tanpa bukti transfer manual** | Tidak ada unggah bukti transfer. Screenshot palsu tidak punya jalur masuk. |
| **Anti menahan stok** | Maks. 2 pesanan menunggu pembayaran per nomor WhatsApp; maks. 5 pesanan baru per IP per jam; maks. 10 unit per produk per pesanan. *(Angka awal, disetel setelah ada data nyata.)* |
| **Captcha cadangan** | Bila tetap ada spam, pasang captcha tak terlihat (mis. Cloudflare Turnstile) di checkout. |
| **Kode ambil** | Pesanan hanya diserahkan setelah kode ambil 6 digit cocok. |

DP (bayar sebagian) **tidak** dipakai di MVP.

---

## 8. Model Data (Ringkas)

Bentuk tipe di `src/types/product.ts` sudah disusun mendekati tabel ini.

| Tabel | Kolom penting | Catatan |
|---|---|---|
| **zones** | id (`reguler` / `cikarang`), nama | Nama internal, tidak ditampilkan ke pembeli |
| **locations** | id, nama, alamat, jam_operasional, keterangan, zona_id, urutan | Satu-satunya penghubung lokasi → zona |
| **holidays** | id, location_id (kosong = semua lokasi), tanggal, keterangan | Untuk "Buka hari ini" |
| **categories** | id (`ikan` / `kepala` / `jeroan` / `telur`), nama, urutan | |
| **products** | id, slug, nama, kategori_id, cara_jual (hanya ikan), satuan, ukuran_kemasan, deskripsi, halal, pengasapan, penyimpanan, ambang_stok_menipis, aktif | Tidak dihapus permanen, cukup `aktif = false` |
| **product_photos** | id, product_id, path_storage, alt, urutan | File di Supabase Storage |
| **product_benefits** | id, product_id, judul, keterangan, sumber | `sumber` kosong = belum terverifikasi |
| **product_zones** | product_id, zona_id, harga, stok, alasan | Harga (rupiah, bilangan bulat) & stok tersedia per zona |
| **orders** | id, kode_pesanan, token_status, kode_ambil, nama_pembeli, no_hp, location_id, zona_id, status, total, kedaluwarsa_pada, dibuat_pada, dibayar_pada, diambil_pada | `token_status` & `kode_ambil` acak |
| **order_items** | id, order_id, product_id, jumlah, harga_saat_pesan | Harga dicatat saat pesan |
| **payments** | id, order_id, midtrans_order_id, transaction_status, gross_amount, metode, payload, diterima_pada | Satu baris per notifikasi, untuk mencegah proses ganda |
| **admins** | user_id (auth.users), nama, dibuat_pada | Daftar akun yang boleh mengelola |
| **audit_log** | id, admin_id, aksi, tabel, id_baris, data_lama, data_baru, waktu | Diisi otomatis oleh database |

---

## 9. Arsitektur Teknis & Stack

```text
Pembeli ──► Web toko (Next.js, Netlify) ── tanpa login ─────────┐
                 ▲                                              │
                 │ revalidasi                                   ▼
                 └──────────── Database Webhook ◄──── Supabase (Postgres + Auth + Storage)
                                                                ▲
Admin ────► Aplikasi admin Android (Expo) ─── login + MFA ──────┘
Midtrans ─► Route Handler notifikasi di web toko ───────────────► Supabase
```

| Lapisan | Pilihan | Alasan |
|---|---|---|
| **Web toko** | Next.js 16 (App Router) di **Netlify** | Server bawaan untuk membuat pesanan, menerima notifikasi Midtrans, dan menyimpan kunci rahasia. Server Components → JavaScript kecil di HP. Netlify mendukung penuh Next.js 16, termasuk Server Actions dan `revalidateTag`, dan **paket gratisnya boleh dipakai untuk berjualan**. |
| **Aplikasi admin** | **Expo (React Native) + TypeScript** *(usulan)* | Bahasa & gaya React yang sama dengan web. EAS Build bisa menghasilkan **APK** (`buildType: "apk"`, distribusi internal) tanpa Play Store. **EAS Update** mengirim perbaikan JavaScript tanpa pasang ulang APK. Siap untuk notifikasi push di Fase 2. |
| **Database, Auth, Storage** | **Supabase** | Postgres + RLS, login admin dengan MFA TOTP, Storage untuk foto & sertifikat, Database Webhooks, pg_cron. |
| **Pembayaran** | **Midtrans Snap** | QRIS, VA, e-wallet; sandbox gratis untuk uji coba. |

**Kenapa Netlify, bukan Vercel:** paket gratis Vercel (Hobby) dibatasi untuk pemakaian non-komersial, sehingga toko yang berjualan wajib pindah ke Pro (US$20/bulan per anggota) sejak hari pertama. Netlify mengizinkan pemakaian komersial di paket gratisnya.

**Cara jatah Netlify terpakai (300 kredit/bulan):**
- Deploy ke web utama: **15 kredit per deploy**
- Data yang dikirim ke pengunjung: 20 kredit per GB
- Permintaan halaman: 2 kredit per 10.000
- Deploy preview dan deploy yang gagal: **gratis**

Konsekuensi cara kerja: **kerjakan perubahan di branch** dan tinjau lewat deploy preview, lalu gabungkan ke `main` hanya saat benar-benar rilis. Deploy yang boros kredit adalah deploy ke web utama, bukan jumlah pengunjung. ⚠️ Kalau kredit habis, seluruh web di-pause sampai bulan berikutnya.

**Bagian server di web toko (semuanya tanpa login):**
- **Buat pesanan** (Server Action): validasi input, hitung harga, kurangi stok, buat transaksi Midtrans.
- **Notifikasi Midtrans** (Route Handler): verifikasi sesuai Bagian 7, ubah status pesanan.
- **Revalidasi** (Route Handler, dilindungi `REVALIDATION_SECRET`): dipanggil Supabase Database Webhook saat produk, harga, stok, lokasi, atau libur berubah, lalu memanggil `revalidateTag(tag, 'max')`.
- **Status pesanan & Cek Pesanan**: dibaca server berdasarkan token, tidak dibuka lewat RLS ke publik.

**Kesegaran data:**
- Konten jarang berubah (produk, lokasi, libur) di-cache dengan tag dan diperbarui lewat revalidasi.
- Angka stok di halaman boleh tertinggal beberapa detik, **tetapi checkout selalu memeriksa stok langsung di database**.

**Aplikasi admin terhubung langsung ke Supabase** memakai kunci publik + sesi login admin. Semua hak aksesnya ditentukan RLS dan fungsi database, bukan oleh kode aplikasi.

---

## 10. Keamanan

### 10.1 Prinsip
Tidak adanya halaman admin di web **bukan** pengaman. Pengaman sebenarnya: **login + MFA, aturan database (RLS), dan pemeriksaan di server**.

### 10.2 Hak akses (RLS)

| Siapa | Boleh | Tidak boleh |
|---|---|---|
| **Publik** (web, tanpa login) | Membaca produk aktif, kategori, lokasi, harga & stok, jadwal libur | Menulis apa pun langsung ke database; membaca pesanan |
| **Server web** (kunci service role) | Membuat pesanan, mencatat notifikasi pembayaran, membaca pesanan berdasarkan token | — |
| **Admin** (login + terdaftar di `admins` + sesi MFA `aal2`) | Membaca pesanan; mengubah status lewat fungsi database; mengelola produk, harga, stok, lokasi, libur | Mengubah status di luar urutan; menghapus log |

### 10.3 Web toko
- HTTPS otomatis dari Netlify.
- Server Action & Route Handler diperlakukan sebagai endpoint publik: semua input divalidasi di server.
- Rate limit pada pembuatan pesanan & Cek Pesanan.
- Kunci rahasia (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `REVALIDATION_SECRET`) hanya di environment variable Netlify, tidak pernah masuk ke GitHub.

### 10.4 Aplikasi admin
- **Pendaftaran dimatikan** ("Allow new users to sign up" = off). Akun admin dibuat manual oleh pemilik.
- **MFA TOTP wajib.** Tanpa MFA, aksi admin ditolak database.
- **APK hanya berisi URL Supabase + kunci publik.** Kunci service role dan Server Key Midtrans **tidak pernah** masuk ke aplikasi, karena isi APK bisa dibongkar.
- **Kunci tanda tangan APK (keystore) disimpan & di-backup.** Kalau hilang, update tidak bisa dipasang di atas aplikasi lama.
- **File APK dibagikan lewat link privat**, bukan diunggah ke tempat umum.
- **HP hilang:** ganti password, keluar dari semua perangkat, reset MFA.
- Batas percobaan login gagal (bawaan Supabase Auth).

### 10.5 Data pribadi (UU PDP, UU No. 27/2022)
- Data yang dikumpulkan hanya nama & nomor WhatsApp, untuk memproses dan menyerahkan pesanan.
- Halaman **Kebijakan Privasi** di web toko: data apa, untuk apa, berapa lama disimpan, cara minta dihapus.
- Masa simpan data pembeli ditentukan (lihat pertanyaan terbuka), setelah itu disamarkan.
- Nomor HP ditampilkan tersamar di halaman publik.

### 10.6 Pengaman wajib selama memakai Supabase paket gratis

Paket gratis dipakai dulu selama masa uji (lihat Bagian 11.3), tapi tiga hal berikut **tidak boleh dilewat**:

| Risiko | Pengaman |
|---|---|
| **Database di-pause** setelah seminggu tanpa aktivitas, sehingga checkout mati | Tugas terjadwal harian (GitHub Actions) yang menjalankan satu query ringan. Supabase juga mengirim email peringatan sekitar seminggu sebelum pause. |
| **Tidak ada backup sama sekali** di paket gratis | Backup mandiri terjadwal (GitHub Actions → `pg_dump`). Isinya nama & nomor WhatsApp pembeli, jadi **wajib dienkripsi** dan tidak boleh disimpan di repo publik. |
| **Batas 2 project aktif** | Project `ikan-asap` yang sudah ada diaktifkan kembali, bukan bikin project baru. |

---

## 11. Kebutuhan Non-Fungsional

### 11.1 Performa web toko

**Ukuran awal** (hasil `npm run build`, 14 September 2026, beranda, gzip):

| Bagian | Ukuran |
|---|---|
| HTML | 6,9 kB |
| CSS | 7,4 kB |
| JavaScript (browser modern) | 135,5 kB |
| Font | 0 kB (font sistem) |
| Foto | belum ada |

**Anggaran:**
- JavaScript beranda ≤ 200 kB gzip.
- Total beranda termasuk foto ≤ ~1 MB.
- LCP < 3 detik di 4G.

**Aturan:**
- Foto lewat `next/image`. Foto hero dimuat duluan, sisanya lazy-load.
- Aplikasi admin mengompres foto sebelum unggah (mis. lebar maks. 1600 px).
- Tidak ada embed Google Maps, feed media sosial, widget chat, atau pixel iklan berlebihan.
- Script Midtrans Snap hanya dimuat di halaman pembayaran.
- FAQ memakai `<details>` bawaan. Slider produk cukup CSS.
- Animasi asap di mockup hanya pengganti foto, **tidak dibawa ke web asli**.
- **Kompres foto sumber sebelum di-commit.** `public/ikan-asap-hero.png` saat ini 2,4 MB. Ukuran yang dikirim ke pembeli sudah ditangani `next/image`, tapi file sebesar itu membuat repo berat dan build lebih lama. Simpan versi WebP yang sudah dikecilkan.

### 11.2 Lainnya
- **Aksesibilitas:** pasangan warna lolos WCAG AA (sudah diverifikasi di design system), area sentuh ≥ 44 px, zoom tidak dikunci.
- **Aplikasi admin:** nyaman dipakai satu tangan, tombol aksi besar, bekerja di jaringan seluler.
- **Ketersediaan:** paket gratis Netlify, Supabase, dan Expo cukup untuk masa uji, dengan pengaman di Bagian 10.6.
- **Skalabilitas:** tambah lokasi cukup satu baris `locations` + pilih zona; tambah zona dijaga TypeScript.

### 11.3 Biaya

**Biaya tetap bulanan selama masa uji: Rp 0.** Yang pasti keluar hanya potongan Midtrans per transaksi berhasil.

| Layanan | Masa uji | Setelah terbukti laku |
|---|---|---|
| Hosting web | **Netlify Free** — Rp 0, boleh komersial, 300 kredit/bulan | Netlify Personal US$9/bulan |
| Database | **Supabase Free** — Rp 0, dengan pengaman Bagian 10.6 | Supabase Pro mulai US$25/bulan: backup harian, tidak pernah di-pause |
| Pembayaran | **Midtrans** — tanpa biaya daftar & bulanan | Sama |
| Aplikasi admin | **Expo Free** — Rp 0, jatah build bulanan cukup untuk 1–2 pengguna | Tetap gratis |
| Domain | Opsional: subdomain gratis, atau `.my.id` ±Rp 15–30 ribu/tahun | `.id` ±Rp 120–250 ribu/tahun |
| Play Store / Apple | Tidak perlu (APK dipasang langsung) | Tidak perlu |

**Potongan Midtrans per transaksi berhasil:**

| Metode | Potongan |
|---|---|
| **QRIS** (termasuk dibayar dari e-wallet & m-banking) | **0,7%**, sudah termasuk PPN |
| GoPay / ShopeePay langsung | 2%, sudah termasuk PPN |
| Transfer Virtual Account | Rp 4.000, belum termasuk PPN |
| Kartu kredit | 2,9% + Rp 2.000, belum termasuk PPN |

Untuk MVP, **aktifkan QRIS lebih dulu** karena potongannya paling kecil dan tetap bisa dibayar dari hampir semua aplikasi.

**Patokan kapan mulai berlangganan:**
- **Supabase Pro:** begitu pesanan sudah rutin tiap minggu, karena pada titik itu kehilangan data atau database ter-pause terlalu mahal akibatnya.
- **Netlify berbayar:** begitu pemakaian kredit sering mendekati 300 per bulan.
- **Domain `.id`:** begitu promosi keluar dari lingkaran pembeli pertama.

---

## 12. Keputusan yang Sudah Diambil

| Tanggal | Keputusan |
|---|---|
| Agustus 2026 | Harga & stok **per zona**: Pasar + Rumah Produksi = zona reguler (satu harga, satu stok); Cikarang = zona sendiri, harga selalu lebih tinggi dengan alasan tertulis |
| Agustus 2026 | 4 kategori (Ikan, Kepala, Jeroan, Telur); cara jual potongan/utuh hanya untuk Ikan; harga per unit |
| 14 Sep 2026 | Pembeli **tanpa login**; fungsi akun diganti link status + Cek Pesanan + kode ambil |
| 14 Sep 2026 | Web toko **tanpa login sama sekali**; admin memakai **aplikasi Android (APK)** terpisah |
| 14 Sep 2026 | Aplikasi admin **hanya untuk pemilik**; peran petugas di Fase 2 |
| 14 Sep 2026 | Notifikasi push ke admin **di Fase 2** |
| 14 Sep 2026 | Struktur beranda mengacu **Russ & Daughters** (lihat Bagian 5.1) |
| 14 Sep 2026 | **Full prepaid** di MVP, tanpa DP |
| 7 Okt 2026 | **Tetap Next.js + TypeScript.** PHP/Laravel ditimbang lalu ditolak: keuntungan terbesarnya (panel admin gratis Filament) tidak terpakai karena admin tetap berbentuk APK, sementara biayanya menulis ulang ±7.000 baris kode yang sudah jalan dan kehilangan jaminan kompilator atas aturan zona & kategori |
| 7 Okt 2026 | **Hosting Netlify Free**, bukan Vercel Hobby, karena paket gratis Vercel melarang pemakaian komersial |
| 7 Okt 2026 | **Supabase paket gratis dulu** dengan tiga pengaman di Bagian 10.6, dan patokan upgrade di Bagian 11.3 |

---

## 13. Pertanyaan Terbuka

1. **Sertifikat halal:** nomor, lembaga, masa berlaku, dan scan sertifikatnya.
2. **Daftar produk awal:** nama, ukuran kemasan, harga reguler & Cikarang, stok awal, foto.
3. **Data lokasi asli:** alamat lengkap, jam operasional, dan jadwal libur tiap titik ambil.
4. **Uji produk:** hasil uji masa simpan dan (bila ada) uji gizi.
5. **Batas waktu pengambilan:** berapa hari pesanan lunas ditunggu? Apa yang terjadi kalau pembeli tidak datang?
6. **Pembatalan setelah bayar:** apakah ada refund? Dalam kondisi apa, dan bagaimana caranya?
7. **Masa simpan data pembeli:** usulan 12 bulan, lalu nama & nomor disamarkan.
8. **Angka anti-spam** di Bagian 7 sudah sesuai atau perlu diubah?
9. **Akun Midtrans:** siapa pemilik akun, dan dokumen usaha untuk aktivasi produksi sudah siap?
10. **Domain:** nama domain web toko.
11. **HP admin:** siapa yang memegang, dan siapa cadangannya kalau HP hilang atau rusak?
12. **Cerita usaha & foto dapur:** siapa yang menyiapkan?

---

## 14. Roadmap Bertahap

**Fase 1 — MVP**
- Web toko: beranda baru, katalog, detail produk, keranjang, checkout, status pesanan, Cek Pesanan, Lokasi & Jam, FAQ, Kebijakan Privasi.
- Supabase: tabel, RLS, fungsi urutan status, audit log, pg_cron pembatalan.
- Midtrans: Snap + notifikasi + anti-spam.
- Aplikasi admin APK: login + MFA, dashboard, pesanan + kode ambil, produk, harga & stok, lokasi & libur.
- Revalidasi web otomatis dari perubahan database.

**Fase 2 — Peningkatan**
- Notifikasi push ke HP admin saat ada pesanan lunas.
- Notifikasi WhatsApp otomatis ke pembeli (lunas, siap diambil).
- Scan QR kode ambil dari kamera aplikasi admin.
- Peran petugas titik ambil (akses terbatas).
- Laporan penjualan sederhana.

**Fase 3 — Lanjutan**
- Pengiriman + ongkir.
- Diskon/kupon, ulasan produk.
- Riwayat pesanan pembeli (login dengan OTP WhatsApp, tanpa password).
- Aplikasi admin iPhone / distribusi lewat toko aplikasi.

---

## 15. Referensi

| Referensi | Yang diambil |
|---|---|
| [Russ & Daughters](https://www.russanddaughters.com/) | Tombol aksi besar di hero, jam buka + catatan libur, kartu lokasi, cerita & edukasi |
| [Acme Smoked Fish](https://acmesmokedfish.com/) | Navigasi per jenis produk, foto makanan, resep |
| [Fishwife](https://eatfishwife.com/) | Transparansi asal produk, jaminan pembeli pertama. **Tidak ditiru:** popup diskon |
| [H. Forman & Son](https://www.formans.co.uk/) | Cerita proses pengasapan yang spesifik |
| [Bandeng Juwana Elrina](https://bandengjuwana.com/) | Kartu cabang, FAQ. **Tidak ditiru:** pesanan dilempar ke marketplace |
| [BPJPH — cek sertifikat halal](https://bpjph.halal.go.id/read/cek-status-sertifikasi-halal-produk-di-halal-go-id-ini-caranya) | Tombol cek keaslian sertifikat |
| [Supabase MFA (TOTP)](https://supabase.com/docs/guides/auth/auth-mfa/totp) · [Supabase Auth config](https://supabase.com/docs/guides/auth/general-configuration) | MFA admin, mematikan pendaftaran |
| [Midtrans notifikasi](https://docs.midtrans.com/docs/https-notification-webhooks) · [Midtrans custom expiry](https://docs.midtrans.com/reference/custom-expiry-object) | Verifikasi notifikasi, batas waktu bayar |
| [Expo EAS Build — APK](https://docs.expo.dev/build-reference/apk/) · [Expo — paket & kuota](https://docs.expo.dev/billing/plans/) | Build APK aplikasi admin, batas paket gratis |
| [Netlify — harga & kredit](https://www.netlify.com/pricing/) · [cara kredit bekerja](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/) · [paket gratis untuk komersial](https://answers.netlify.com/t/can-we-use-netlify-free-plan-for-commercial-purposes/41545) · [dukungan Next.js 16](https://www.netlify.com/changelog/next-js-16-deploy-on-netlify/) | Pilihan hosting & anggaran kredit |
| [Vercel — Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) | Alasan paket gratis Vercel tidak dipakai |
| [Supabase — harga](https://supabase.com/pricing) · [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing) | Batas paket gratis & pengaman Bagian 10.6 |
| [Midtrans — biaya transaksi](https://midtrans.com/id/biaya) | Potongan per metode pembayaran |

---

*Langkah berikutnya: jawab pertanyaan di Bagian 13, lalu mulai Fase 1 dari skema database & RLS, karena web toko dan aplikasi admin sama-sama bergantung padanya.*
