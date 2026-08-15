# PRD — Web App E-Commerce Ikan Asap

**Versi:** 0.1 (Draf awal / MVP)
**Tanggal:** 15 Agustus 2026
**Status:** Draf untuk didiskusikan

---

## 1. Latar Belakang & Tujuan

Banyak konsumen ragu mengonsumsi ikan asap karena kekhawatiran soal keamanan pangan, kebersihan proses, dan kehalalan. Web app ini dibuat untuk **membangun kepercayaan** tersebut sekaligus mempermudah pembelian.

**Tujuan utama:**
1. Meyakinkan konsumen bahwa ikan asap ini **aman, sehat, dan halal** untuk dikonsumsi.
2. Memudahkan konsumen memesan dan membayar secara online tanpa perlu membuat akun.
3. Memberi pemilik usaha (admin) kontrol penuh atas produk, stok, dan pesanan.

**Tujuan yang TIDAK dikejar dulu (non-goal MVP):** pengiriman/kurir otomatis, program loyalti, multi-penjual, aplikasi native iOS/Android.

---

## 2. Sasaran & Metrik Keberhasilan

| Sasaran | Metrik |
|---|---|
| Konsumen percaya produk aman & halal | Sertifikat halal & info keamanan tampil di setiap produk; tingkat penyelesaian checkout naik |
| Pembelian mudah di HP | Waktu muat halaman < 3 detik di jaringan 4G; checkout ≤ 4 langkah |
| Tanpa penipuan "pesan lalu kabur" | 0 pesanan disiapkan sebelum pembayaran masuk |
| Admin mudah kelola | Tambah/edit produk & ubah status pesanan < 1 menit |

---

## 3. Target Pengguna & Platform

- **Pembeli (tanpa login):** mayoritas mengakses lewat **HP**. Desain **mobile-first** wajib.
- **Admin (pemilik/pengelola):** login untuk kelola katalog, stok, dan pesanan. Biasanya lewat HP atau laptop.

Platform: **Web app responsif** (bukan aplikasi native). Bisa diakses lewat browser HP; opsional bisa dijadikan PWA (bisa "di-install" ke home screen) di fase berikutnya.

---

## 4. Ruang Lingkup MVP

**Termasuk (In-scope):**
- Katalog produk dengan deskripsi, manfaat kesehatan, dan info halal.
- Keranjang belanja.
- Checkout tanpa akun (hanya isi nama, no. HP, pilih lokasi ambil).
- **3 titik pengambilan (pickup):** Pasar, Rumah Produksi, dan Cikarang — dengan **harga bisa berbeda per lokasi** (Cikarang beda harga).
- Pembayaran online (QRIS / transfer / e-wallet) via payment gateway.
- Alur anti-penipuan berbasis **bayar di muka (prepaid)**.
- Panel admin: login aman, kelola produk, kelola stok, lihat & ubah status pesanan.

**Tidak termasuk (Out-of-scope MVP):**
- Pengiriman ke alamat / hitung ongkir otomatis (semua pesanan = ambil sendiri / pickup).
- Akun pelanggan & riwayat pesanan pelanggan.
- Diskon/kupon, rating & ulasan.

---

## 5. Fitur & User Story

### 5.1 Storefront (sisi pembeli)

- **Katalog produk:** Sebagai pembeli, saya bisa melihat daftar ikan asap beserta foto, harga, dan ketersediaan stok.
- **Detail produk:** Saya bisa membaca deskripsi ikan, **manfaat kesehatan**, dan melihat **sertifikat/label halal** serta info keamanan pangan (misal proses pengasapan, tanggal produksi/kedaluwarsa).
- **Pilih lokasi pengambilan:** Saya memilih salah satu dari 3 titik (Pasar / Rumah Produksi / Cikarang). Harga menyesuaikan lokasi yang dipilih.
- **Keranjang:** Saya bisa menambah/mengurangi jumlah, melihat total.
- **Checkout tanpa login:** Saya isi nama, nomor HP/WhatsApp, dan lokasi ambil, lalu lanjut bayar.
- **Bayar online:** Saya membayar via QRIS/transfer/e-wallet. Setelah bayar, saya dapat nomor pesanan & instruksi pengambilan.
- **Kontak cepat:** Tombol WhatsApp/telepon untuk tanya-jawab cepat.

### 5.2 Kepercayaan & Trust (inti tujuan bisnis)

Elemen ini ditampilkan menonjol karena inilah alasan utama web dibuat:
- Label/sertifikat **Halal** (gambar sertifikat + nomor sertifikat).
- Penjelasan **proses pengasapan** yang higienis (idealnya foto/video singkat).
- **Manfaat gizi** tiap ikan (protein, omega-3, dll.).
- Info **penyimpanan & masa simpan** agar konsumen yakin soal kesegaran.
- (Opsional) Halaman "Tentang Kami" + testimoni.

### 5.3 Panel Admin

- **Login aman** (lihat bagian Keamanan).
- **Kelola produk:** tambah/edit/hapus, unggah foto, atur deskripsi & manfaat.
- **Harga per lokasi:** atur harga khusus untuk Cikarang berbeda dari Pasar/Rumah Produksi.
- **Kelola stok:** ubah jumlah stok; produk otomatis "habis" saat stok 0.
- **Kelola pesanan:** lihat daftar pesanan, status pembayaran, ubah status (Diproses → Siap Diambil → Selesai), lihat kontak pembeli.
- **Dashboard ringkas:** jumlah pesanan hari ini, pesanan menunggu diproses, dsb.

---

## 6. Alur Utama

### 6.1 Alur Pembeli
1. Buka web → lihat katalog.
2. Buka detail produk → baca manfaat & lihat info halal.
3. Pilih **lokasi pengambilan** → harga menyesuaikan.
4. Masukkan ke keranjang → checkout.
5. Isi nama + no. HP + lokasi ambil.
6. Bayar (QRIS/transfer/e-wallet) → status **Menunggu Pembayaran**.
7. Pembayaran terkonfirmasi otomatis → status **Diproses**, pembeli terima nomor pesanan + info ambil.
8. Ambil pesanan di lokasi terpilih → admin tandai **Selesai**.

### 6.2 Alur Admin
1. Login lewat halaman admin.
2. Pantau pesanan masuk yang **sudah dibayar**.
3. Siapkan pesanan → ubah status jadi **Siap Diambil**.
4. Saat pembeli datang & mengambil → tandai **Selesai**.
5. Sewaktu-waktu: perbarui stok, harga, atau produk baru.

---

## 7. Strategi Anti-Penipuan (Prepaid)

Prinsip utama: **barang tidak disiapkan sebelum uang masuk.**

| Kontrol | Cara kerja |
|---|---|
| **Bayar di muka (prepaid)** | Status "Diproses" hanya aktif setelah gateway mengonfirmasi pembayaran. Sebelum itu, pesanan hanya "Menunggu Pembayaran". |
| **Batas waktu bayar** | Jika tidak dibayar dalam mis. 60 menit, pesanan **otomatis batal**. |
| **Reservasi stok sementara** | Saat checkout, stok "dikunci" sementara; jika bayar gagal/timeout, stok **dikembalikan**. Stok baru benar-benar dipotong setelah bayar sukses. |
| **Verifikasi webhook** | Konfirmasi pembayaran hanya diterima dari notifikasi resmi gateway yang tervalidasi (tanda tangan/signature), bukan dari sisi browser yang bisa dipalsukan. |
| **Rate limit** | Batasi jumlah pembuatan pesanan per nomor/IP untuk cegah spam. |

Opsional untuk pesanan borongan: izinkan **DP** (bayar sebagian di muka), sisanya saat ambil. Untuk MVP, disarankan **full prepaid** dulu.

---

## 8. Model Data (Ringkas)

Tabel inti yang dibutuhkan:

- **products** — id, nama, deskripsi, manfaat, foto, info_halal, aktif (boolean).
- **locations** — id, nama (Pasar/Rumah Produksi/Cikarang), alamat, kontak.
- **product_prices** — id, product_id, location_id, harga. *(Inilah yang membuat harga Cikarang bisa berbeda: satu produk punya beberapa baris harga sesuai lokasi.)*
- **inventory** — product_id, location_id, stok. *(Bisa digabung dengan product_prices bila stok tidak dibedakan per lokasi.)*
- **orders** — id, nomor_pesanan, nama_pembeli, no_hp, location_id, status (`menunggu_pembayaran` / `diproses` / `siap_diambil` / `selesai` / `batal`), total, dibuat_pada, dibayar_pada.
- **order_items** — id, order_id, product_id, jumlah, harga_saat_pesan.
- **payments** — id, order_id, gateway_ref, status, metode, jumlah, waktu.
- **admins** — dikelola oleh layanan Auth (Supabase Auth), bukan tabel password buatan sendiri.

> Catatan: harga & stok apakah dibedakan per lokasi, atau hanya Cikarang yang beda? Perlu dikonfirmasi (lihat Bagian 12).

---

## 9. Arsitektur Teknis & Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| **Frontend + Backend** | **Next.js** (React) | Tetap React, tapi punya sisi server bawaan untuk menangani pembayaran & admin dengan aman. Ringan bila pakai Server Components. |
| **Database + Auth + Storage** | **Supabase** (free tier) | Postgres untuk data, Auth siap-pakai untuk login admin, Storage untuk foto produk & sertifikat. Satu paket. |
| **Payment Gateway** | **Midtrans** (atau Xendit) | Mendukung QRIS, transfer bank (VA), dan e-wallet — cocok untuk pasar Indonesia. Ada mode sandbox gratis untuk uji coba. |
| **Hosting/Deploy** | **Vercel** (free tier) | Paling mulus untuk Next.js, HTTPS otomatis, CDN global (cepat di HP), proteksi DDoS dasar. |

**Kenapa bukan React murni (Vite/CRA)?** Karena payment gateway butuh backend untuk menerima webhook dan menyimpan *secret key*. React murni berjalan hanya di browser sehingga kunci pembayaran akan terekspos. Next.js menyelesaikan ini tanpa meninggalkan React.

Semua layanan di atas punya **free tier** yang cukup untuk mulai.

---

## 10. Keamanan

- **HTTPS wajib** — otomatis dari Vercel.
- **Login admin yang benar:**
  - Gunakan **Supabase Auth** (jangan bikin sistem password dari nol).
  - Password kuat + **rate limiting** untuk cegah brute force.
  - Idealnya **2FA/OTP** untuk admin.
- **Soal "sembunyikan URL admin":** boleh sebagai lapisan tambahan, **tapi jangan diandalkan**. Bot menyisir URL umum secara otomatis. Keamanan nyata datang dari auth yang kuat + rate limit, bukan URL rahasia.
- **Proteksi data (RLS):** aktifkan Row Level Security di Supabase agar data pesanan hanya bisa diubah lewat jalur yang sah.
- **Verifikasi webhook pembayaran:** validasi signature dari gateway; jangan percaya konfirmasi dari sisi browser.
- **Simpan kunci rahasia** (secret key gateway, service key Supabase) hanya di server/environment variable, tidak pernah di kode frontend.
- **Rate limit** pada endpoint pembuatan pesanan & login.

---

## 11. Kebutuhan Non-Fungsional

- **Performa mobile:** target LCP < 3 dtk di 4G; kompres & lazy-load gambar; kirim JavaScript seminimal mungkin.
- **Aksesibilitas dasar:** kontras cukup, tombol besar ramah jari.
- **Ketersediaan:** cukup andal untuk skala UMKM; free tier memadai di awal.
- **Skalabilitas:** struktur data sudah siap bila nanti tambah lokasi atau produk.

---

## 12. Pertanyaan Terbuka / Perlu Dikonfirmasi

1. **Harga per lokasi:** Apakah **semua** produk beda harga di Cikarang, atau hanya sebagian? Apakah Pasar & Rumah Produksi harganya sama?
2. **Stok:** Apakah stok dibedakan per lokasi, atau satu stok untuk semua?
3. **Sertifikat halal:** Sudah punya nomor sertifikat & file gambarnya untuk ditampilkan?
4. **Daftar produk awal:** Berapa jenis ikan & datanya (nama, harga, deskripsi, manfaat)?
5. **Jadwal pengambilan:** Apakah ada jam operasional / slot ambil tertentu per lokasi?
6. **Full prepaid atau boleh DP** untuk pesanan besar?
7. **Notifikasi:** Perlu notifikasi WhatsApp otomatis ke pembeli saat pesanan siap? (Bisa fase berikutnya.)

---

## 13. Roadmap Bertahap

**Fase 1 — MVP (fokus dulu di sini)**
- Katalog + detail produk + info halal/manfaat.
- Keranjang + checkout tanpa login.
- 3 lokasi pickup + harga per lokasi.
- Pembayaran prepaid (Midtrans) + alur anti-penipuan.
- Admin: login, kelola produk/stok/harga/pesanan.

**Fase 2 — Peningkatan**
- Notifikasi WhatsApp otomatis.
- Jadikan PWA (bisa di-install ke home screen).
- Dashboard laporan penjualan sederhana.

**Fase 3 — Lanjutan**
- Opsi pengiriman + ongkir.
- Diskon/kupon, ulasan produk.
- Riwayat pesanan (opsional dengan login pembeli).

---

*Dokumen ini draf awal. Setelah pertanyaan di Bagian 12 dijawab, PRD bisa difinalkan dan lanjut ke desain tampilan serta pembangunan.*
