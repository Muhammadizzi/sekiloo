# Uji rilis Sealauk

Panduan Fase 1 langkah 7 (PRD Bagian 24): siapkan akun dan kunci, uji dari awal sampai akhir di Midtrans sandbox, jalankan Daftar Cek Sebelum Rilis (PRD 14.4), bersihkan data uji, lalu buka satu kloter percobaan untuk pembeli terbatas.

Database uji dan produksi masih satu project Supabase. Karena itu kloter uji wajib diberi nama berawalan **UJI**, supaya bisa dihapus bersih setelah uji selesai.

## 1. Persiapan oleh pemilik

Kunci rahasia diisi sendiri oleh pemilik. Jangan ditempel di chat, issue, atau commit.

### Supabase

1. Authentication, bagian Sign In / Providers: matikan **Allow new users to sign up**.
2. Authentication, bagian Multi-Factor: nyalakan **TOTP**.
3. Authentication, bagian Users: buat dua akun admin (produksi dan Cikarang).
4. Table Editor, tabel `admin_roles`: tambahkan satu baris per akun. Isinya `user_id`, `role` (`admin_produksi` atau `admin_cikarang`), dan `name`.
5. Project Settings, bagian API Keys: salin **secret key** ke `.env.local` sebagai `SUPABASE_SECRET_KEY`, dan ke environment variable Netlify.
6. Tombol Connect, bagian Session pooler: salin connection string untuk secret backup GitHub (`SUPABASE_DB_URL`).

### Midtrans sandbox

1. Daftar atau masuk ke dashboard Midtrans, lalu pindah ke mode **Sandbox**.
2. Settings, bagian Access Keys: salin **Server Key** sandbox ke `.env.local` dan Netlify sebagai `MIDTRANS_SERVER_KEY`. Biarkan `MIDTRANS_IS_PRODUCTION=false`.
3. Settings, bagian Payment, isian Notification URL: `https://<alamat-web>/api/webhooks/midtrans`. Pakai alamat akhir yang tidak dialihkan (redirect), karena notifikasi yang dialihkan bisa gagal terkirim.

### Netlify

1. Hubungkan repo `sekiloo`, lalu isi environment variable sesuai `.env.example`:
   - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
   - Turnstile dan hash IP: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (kunci asli dari Cloudflare untuk domain web), dan `IP_HASH_SALT`.
   - Midtrans dan alamat web: `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION`, dan `SITE_URL`.
2. Deploy, lalu catat alamat web untuk Notification URL Midtrans di atas.

### GitHub (backup, penjaga Supabase, cek mingguan)

Buat kunci backup sekali saja. Simpan `kunci-backup.txt` di luar komputer kerja, misalnya flashdisk, dan jangan masukkan ke repo:

```bash
age-keygen -o kunci-backup.txt
```

Lalu isi variabel dan secret repo. Nilai `age1...` adalah public key yang dicetak perintah di atas:

```bash
gh variable set SUPABASE_URL --body "https://<project>.supabase.co"
```

```bash
gh variable set SUPABASE_PUBLISHABLE_KEY --body "sb_publishable_..."
```

```bash
gh variable set SITE_URL --body "https://<alamat-web>"
```

```bash
gh variable set BACKUP_AGE_RECIPIENT --body "age1..."
```

```bash
gh secret set SUPABASE_DB_URL
```

Setelah itu jalankan workflow **Jaga Supabase tetap aktif**, **Backup database terenkripsi**, dan **Cek rilis** sekali dari tab Actions untuk memastikan semuanya hijau.

### APK admin

Ikuti `admin/README.md` untuk membangun APK profil `preview`, lalu pasang di HP kedua admin. Setiap HP wajib memakai kunci layar.

## 2. Data untuk uji

Lewat APK admin produksi:

1. Wilayah: aktifkan minimal satu kecamatan dengan ongkir.
2. Produk: aktifkan minimal dua produk lengkap dengan harga, berat isi, dan berat kemas.
3. Kloter **UJI sandbox 1**:
   - Tutup PO sekitar 1 jam lagi, tanggal antar besok.
   - Kapasitas 5 kg, maksimal 3 kg per pesanan.
   - Minimum 1 kg dan 1 pesanan, supaya kloter lolos saat PO tutup.

## 3. Skenario uji sandbox

Centang setiap skenario setelah hasilnya sesuai. Untuk membayar, buka simulator QRIS sandbox Midtrans. Untuk akun yang dibuat setelah 4 November 2024 alamatnya `https://simulator.sandbox.midtrans.com/openapi/qris/index`, dan akun lama memakai alamat simulator yang lama. Salin URL gambar QR dari halaman bayar, tempel di simulator, lalu tekan Scan QR dan bayar.

- [ ] **S1 Bayar sukses.** Checkout satu pesanan lalu bayar lewat simulator. Hasil yang diharapkan:
  - Halaman status berubah menjadi lunas dalam beberapa detik.
  - Sisa kapasitas di kartu kloter berkurang.
  - Pesanan muncul di rekap produksi APK.
- [ ] **S2 Tidak dibayar.** Checkout tanpa membayar. Setelah batas bayar 15 menit lewat ditambah masa tenggang 10 menit, tugas berkala (tiap 5 menit) membatalkannya. Halaman status menampilkan batal, dan kapasitasnya kembali.
- [ ] **S3 Kapasitas (cek no. 8).** Kecilkan sisa kapasitas sampai hanya muat satu pesanan, lalu dua orang checkout bersamaan dari dua HP. Hanya satu yang berhasil, yang lain mendapat pesan kapasitas penuh.
- [ ] **S4 Anti-spam (cek no. 10).**
  - Pesanan belum dibayar ke-3 dari nomor WhatsApp yang sama ditolak.
  - Checkout ke-6 dari jaringan yang sama dalam satu jam ditolak.
  - Checkout dengan captcha yang dihapus lewat DevTools ditolak.
- [ ] **S5 Harga (cek no. 7).** Browser tidak pernah mengirim harga, ongkir, atau total. Keranjang hanya menyimpan id produk dan jumlah, dan jumlah yang diubah jadi 11 di localStorage dipotong kembali ke 10. Penolakan jumlah, produk ganda, dan id rusak di server sudah terbukti di `uji_skema.sql` (blok 1, cek 5a sampai 5c). Yang dicek di sandbox: total di halaman bayar Midtrans sama dengan total di halaman status, dan sama dengan hitungan harga produk ditambah ongkir kecamatan.
- [ ] **S6 Webhook (cek no. 9).**
  - `node scripts/cek-rilis.mjs --situs https://<alamat-web> --tanpa-bundle` menunjukkan signature palsu dibalas 401.
  - Kirim ulang notifikasi dari dashboard Midtrans: log Netlify menulis `duplikat` dan tidak ada yang berubah.
  - Nominal yang berbeda sudah diuji di `supabase/tests/uji_skema.sql` (blok 1, cek 14a).
- [ ] **S7 Cek Pesanan.** Nomor WhatsApp yang salah tidak menemukan pesanan, dan percobaan ke-11 dalam satu jam ditolak.
- [ ] **S8 Login admin (cek no. 4 dan 12).**
  - Kedua akun bisa masuk dengan password dan 2FA.
  - Tutup aplikasi di layar 2FA, lalu buka lagi: tidak ada data yang tampil sebelum kode dimasukkan.
  - Buka ulang aplikasi setelah lebih dari 1 menit: diminta sidik jari atau PIN.
  - Tandai refund selesai: diminta sidik jari atau PIN sekali lagi.
- [ ] **S9 Alur kloter sampai diterima.**
  - Tunggu jam tutup PO, lalu kloter berstatus PO tutup.
  - Admin produksi berangkatkan kloter dan kirim kabar WhatsApp berangkat.
  - Admin Cikarang tandai tiba, dan alamat baru muncul setelah itu.
  - Mulai antar, lalu selesai dengan foto bukti. Halaman status menampilkan selesai.
- [ ] **S10 Gagal antar.** Pesanan kedua gagal diantar, diantar ulang, lalu gagal lagi, sehingga hanya bisa dibatalkan dengan pilihan refund.
- [ ] **S11 Refund.**
  - Admin produksi batalkan satu pesanan lunas dengan alasan gagal produksi, lalu kirim pesan refund.
  - Unggah bukti transfer dan tandai selesai. Halaman status menampilkan pembayaran sudah dikembalikan.
- [ ] **S12 Kloter di bawah minimum.** Buat kloter **UJI sandbox 2** dengan minimum 5 pesanan, isi satu pesanan lunas, lalu tunggu PO tutup. Kloter batal sendiri dan pesanannya masuk daftar refund.
- [ ] **S13 Perubahan jadwal.** Ubah tanggal antar kloter yang sudah berisi pesanan lunas. APK meminta alasan dan sidik jari, lalu menampilkan daftar pembeli yang perlu dikabari.
- [ ] **S14 Cache web.** Ubah harga produk di APK. Halaman produk di web langsung menampilkan harga baru setelah dimuat ulang.

## 4. Daftar Cek Sebelum Rilis

Cek bertanda **otomatis** dijalankan dengan:

```bash
node scripts/cek-rilis.mjs --situs https://<alamat-web>
```

Untuk web lokal, jalankan `pnpm build` lalu `pnpm start`, dan pakai `--situs http://localhost:3000`. Tambahkan `--apk <folder>` untuk memeriksa hasil `npx expo export --platform android` di folder `admin/`.

| No | Cek | Cara di proyek ini | Keadaan 21 Nov 2026 |
|---|---|---|---|
| 1 | 2FA di semua akun layanan | Manual, isi tabel PRD 14.3 | Menunggu pemilik |
| 2 | Tidak ada tabel tanpa RLS | Security Advisor di dashboard Supabase | Lolos. Peringatan yang tersisa disengaja: tabel pesanan tanpa policy karena hanya dibaca lewat fungsi, `get_open_batch` terbuka untuk publik, dan fungsi admin memeriksa peran di dalamnya |
| 3 | Data pesanan tertutup dari publik | Otomatis | Lolos: 8 tabel dan 12 fungsi ditolak untuk publik |
| 4 | Admin tanpa 2FA tidak bisa beraksi | Otomatis (pendaftaran mati) dan S8 | Pendaftaran akun masih terbuka. Penolakan tanpa 2FA sudah terbukti di uji SQL (blok 2 cek C2, blok 4 cek K2) |
| 5 | Kunci rahasia tidak ada di browser atau APK | Otomatis | Lolos untuk bundle web dan APK |
| 6 | Bucket privat benar-benar privat | Otomatis | Lolos |
| 7 | Harga tidak bisa diubah dari browser | S5 | Menunggu uji sandbox |
| 8 | Kapasitas tidak bisa terlampaui | S3 | Logika terbukti di uji SQL, uji bersamaan menunggu sandbox |
| 9 | Webhook palsu ditolak | Otomatis dan S6 | Menunggu `MIDTRANS_SERVER_KEY` (sekarang dibalas 500) |
| 10 | Spam checkout tertahan | S4 | Batas di database terbukti di uji SQL, uji lewat web menunggu sandbox |
| 11 | Halaman status aman | Otomatis | Lolos |
| 12 | Aplikasi admin terkunci | S8 | Menunggu APK di HP |
| 13 | Rencana insiden siap | Isi penanggung jawab di PRD 14.3 | Menunggu pemilik |
| 14 | Backup bisa dipulihkan | Bagian 6 di bawah | Workflow backup siap, menunggu secret dan kunci age |
| 15 | Tidak ada data contoh yang tayang | Otomatis | Belum: catatan untuk pemilik dan nomor WhatsApp contoh masih tampil |

## 5. Setelah uji sandbox

1. Pastikan semua kloter UJI sudah batal atau selesai, dan semua refund uji ditandai selesai.
2. Jalankan `supabase/scripts/bersihkan-data-uji.sql` di SQL Editor Supabase. Skrip ini hanya menghapus kloter berawalan UJI beserta pesanan, pembayaran, refund, dan lognya, lalu mengembalikan nomor invoice ke 0001 kalau tidak ada pesanan lain.
3. Hapus file uji di Storage, bucket `delivery-proofs` dan `refund-proofs`.
4. Ganti ke Midtrans produksi:
   - `MIDTRANS_SERVER_KEY` produksi dan `MIDTRANS_IS_PRODUCTION=true` di Netlify.
   - Notification URL di dashboard produksi.
5. Isi `src/data/kebijakan.ts`, `src/data/halal.ts`, `src/data/keamanan-pangan.ts`, dan `NOMOR_WHATSAPP` di `src/data/kontak.ts`, lalu deploy.
6. Jalankan cek otomatis sampai semuanya lolos, dan pastikan cek manual sudah dicentang.
7. Buka satu kloter percobaan dan bagikan link-nya hanya ke pembeli yang dipilih.

## 6. Memulihkan backup (cek no. 14)

Dilakukan ke project Supabase uji yang terpisah, bukan ke project utama.

1. Unduh artefak backup terbaru dari tab Actions, workflow Backup database terenkripsi.
2. Buka enkripsinya dengan kunci privat:

   ```bash
   age -d -i kunci-backup.txt sealauk-YYYYMMDD-HHMM.tar.gz.age | tar -xzf -
   ```

3. Pulihkan ke project uji (connection string dari tombol Connect di project uji):

   ```bash
   psql --single-transaction --variable ON_ERROR_STOP=1 --file roles.sql --file schema.sql --command 'SET session_replication_role = replica' --file data.sql --dbname "<connection string project uji>"
   ```

4. Bandingkan jumlah baris `orders`, `order_items`, `payments`, `refunds`, dan `products` dengan project utama. Lolos kalau sama.

Backup ini berisi database saja. File foto produk dan bukti di Storage tidak ikut, jadi simpan salinan foto produk asli di tempat lain.
