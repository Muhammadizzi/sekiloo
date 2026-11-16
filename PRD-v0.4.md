# PRD v0.4: sekiloo, Jastip PO Ikan Asap Cikarang

**Versi:** 0.4
**Tanggal:** 17 November 2026
**Status:** Draf. Keputusan inti sudah dikunci, data operasional asli belum lengkap (lihat Bagian 23).
**Menggantikan:** `PRD-Ikan-Asap.md` (v0.3). File lama disimpan sebagai arsip.

---

## Ringkasan perubahan dari v0.3

| Topik | v0.3 | v0.4 |
|---|---|---|
| Model bisnis | Stok siap jual, pembeli ambil sendiri | Pre-order per kloter, diantar ke alamat pembeli |
| Wilayah | 3 titik ambil: Pasar, Rumah Produksi, Cikarang | Hanya Cikarang, 5 kecamatan |
| Harga | Dua zona harga (reguler dan Cikarang) | Satu harga Cikarang (sudah termasuk kemasan vakum) + ongkir flat per kecamatan |
| Batas jumlah pesanan | Stok per zona | Kapasitas kloter dalam gram, dikunci saat checkout |
| Penyerahan barang | Diambil di titik ambil dengan kode ambil | Diantar admin Cikarang, ada status gagal antar |
| Admin | 1 akun pemilik | 2 role: `admin_produksi` (desa) dan `admin_cikarang`, di tabel `admin_roles` |
| Pembatalan dan refund | Belum diatur | Alur lengkap, termasuk kloter batal kalau di bawah minimum |
| Notifikasi WhatsApp | Otomatis di Fase 2 | MVP manual lewat tombol `wa.me` di APK, Fase 2 lewat API resmi WhatsApp |
| Konten | Tidak ada | Artikel dan testimoni di Fase 2, AI Deteksi di Fase 3 dengan batasan ketat |
| Tetap berlaku | | Tanpa login pembeli, Next.js + TypeScript, Netlify, Supabase, Midtrans, APK Expo, 2FA admin, halal, UU PDP, warna Dapur Asap |

---

## 1. Latar Belakang & Tujuan

sekiloo menjual ikan asap produksi desa kepada pembeli di Cikarang lewat sistem jastip pre-order. Pesanan dikumpulkan per kloter, ikan diasap dan divakum sesuai jumlah pesanan yang sudah dibayar, dibawa ke Cikarang dalam cool box, lalu diantar ke rumah pembeli.

Banyak konsumen ragu membeli ikan asap karena khawatir soal kebersihan, kehalalan, dan kesegarannya. Untuk produk yang menempuh perjalanan dari desa, keraguan soal kesegaran makin besar. Web ini dibuat untuk menjawab keraguan itu sekaligus mempermudah pemesanan.

**Tujuan:**
1. Meyakinkan pembeli bahwa ikan asap ini halal, higienis, dan tetap aman setelah perjalanan ke Cikarang.
2. Pembeli bisa memesan dan membayar dari HP tanpa membuat akun.
3. Produksi hanya sebanyak pesanan yang sudah lunas, jadi tidak ada stok sisa dan tidak ada barang disiapkan sebelum uang masuk.
4. Dua admin bisa menjalankan satu kloter, dari buka PO sampai pesanan terakhir diantar, lewat aplikasi di HP.

**Bukan tujuan MVP:** wilayah selain Cikarang, ambil sendiri di titik ambil, akun pembeli, aplikasi untuk pembeli, aplikasi admin untuk iPhone, diskon dan kupon.

---

## 2. Sasaran & Metrik

| Sasaran | Metrik |
|---|---|
| Pembeli percaya | Nomor sertifikat halal dan tombol cek di halal.go.id tampil; persentase checkout yang selesai dibayar |
| Mudah dipakai di HP | LCP < 3 detik di 4G (PageSpeed Insights mode mobile); checkout ≤ 4 langkah |
| Tidak ada barang disiapkan sebelum bayar | 0 pesanan masuk rekap produksi sebelum lunas |
| Kapasitas tidak pernah terlampaui | 0 pesanan lunas yang harus di-refund karena kloter penuh |
| Kloter layak jalan | Persentase kloter yang mencapai minimum; rata-rata keterisian kapasitas |
| Pengantaran berhasil | Persentase pesanan selesai pada percobaan antar pertama; jumlah gagal antar per kloter |
| Refund terkendali | Jumlah refund per kloter dan lama penyelesaiannya |

---

## 3. Model Bisnis: Jastip PO per Kloter

### 3.1 Perjalanan satu kloter

| Tahap | Dikerjakan oleh | Yang terjadi |
|---|---|---|
| 1. Buka kloter | `admin_produksi` | Menentukan jam tutup PO, tanggal antar, kapasitas (gram), dan syarat minimum |
| 2. Pemesanan | Pembeli | Memilih produk, mengisi alamat dan pin peta, lalu membayar. Kapasitas dikunci saat checkout |
| 3. Tutup PO | Sistem, otomatis | Kloter ditutup pada jam tutup. Kalau di bawah minimum, kloter batal dan semua pesanan lunas di-refund |
| 4. Produksi dan vakum | `admin_produksi` | Melihat rekap total item dari pesanan lunas, mengasap, memvakum, memberi label |
| 5. Berangkat | `admin_produksi` | Menandai kloter berangkat. Semua pesanan lunas di kloter itu ikut berubah status |
| 6. Tiba | `admin_cikarang` | Menandai kloter tiba. Barang masuk freezer atau kulkas |
| 7. Antar | `admin_cikarang` | Mengantar per pesanan, lalu menandai selesai atau gagal antar |

### 3.2 Aturan jadwal
- `delivery_date` harus memberi waktu cukup untuk produksi dan perjalanan setelah `close_order_at`. Jarak minimumnya ditentukan pemilik (Bagian 23), dan sistem menolak kloter yang jaraknya kurang.
- MVP hanya mengizinkan satu kloter berstatus `open` pada satu waktu, supaya keranjang dan halaman depan tidak perlu memilih kloter.

---

## 4. Produk, Pengguna & Platform

Sistem terdiri dari dua aplikasi yang memakai satu database Supabase.

| | Web pembeli | APK admin |
|---|---|---|
| Bentuk | Link web, umumnya dibuka dari WhatsApp | Aplikasi Android, dipasang dari file APK tanpa Play Store |
| Pengguna | Pembeli di Cikarang | `admin_produksi` dan `admin_cikarang` |
| Login | Tidak ada | Wajib: email, password, dan kode 2FA |
| Teknologi | Next.js 16 (App Router) + TypeScript + Tailwind CSS + Framer Motion | Expo (React Native) + TypeScript |

### Pembagian wewenang

| Pengguna | Siapa | Wewenang |
|---|---|---|
| Pembeli (tanpa akun) | Warga Cikarang | Melihat katalog dan kloter aktif, memesan, membayar, melihat status lewat link bertoken, mengirim testimoni lewat link bertoken (Fase 2) |
| `admin_produksi` | Admin di desa | Produk, kloter (buat, ubah, batalkan), wilayah dan ongkir, rekap produksi, berangkatkan kloter, batalkan pesanan karena gagal produksi, proses refund |
| `admin_cikarang` | Admin di Cikarang | Melihat kloter, menandai kloter tiba, daftar antar dengan alamat dan peta, status pengantaran |

Pengelolaan kloter dan refund diletakkan di `admin_produksi` supaya hanya satu orang yang berwenang mengubah jadwal dan mengembalikan uang. Ini asumsi PRD dan perlu dikonfirmasi (Bagian 23).

---

## 5. Ruang Lingkup per Fase

### MVP
- **Web:** beranda, katalog dan detail produk, kartu kloter aktif (jam tutup, tanggal antar, sisa kapasitas), keranjang, checkout tanpa akun dengan peta, pembayaran Midtrans, halaman status bertoken, Cek Pesanan, Halal & Keamanan Pangan, wilayah dan ongkir, FAQ, Kebijakan Privasi, Syarat Pemesanan.
- **Backend:** tabel dan RLS, fungsi checkout yang mengunci kapasitas, captcha dan batas permintaan di checkout, webhook Midtrans, tugas terjadwal (tutup kloter, pesanan kedaluwarsa), log perubahan status.
- **APK admin:** login dengan 2FA, menu sesuai role, aksi per kloter, tombol WhatsApp manual.

### Fase 2
Testimoni terverifikasi, artikel edukasi (MDX), notifikasi WhatsApp otomatis lewat API resmi, video hero yang diputar saat ditekan, notifikasi push ke APK, dan kuota per produk bila kapasitas produksi ternyata juga membatasi.

### Fase 3
AI Deteksi, dengan batasan di Bagian 17.3. Dinilai ulang sebelum dibangun.

### Tidak termasuk
Wilayah selain Cikarang, ambil sendiri, akun pembeli, diskon dan kupon, aplikasi untuk pembeli, aplikasi admin iPhone, distribusi lewat Play Store.

---

## 6. Web Pembeli

### 6.1 Halaman

| Halaman | Isi | Fase |
|---|---|---|
| Beranda `/` | Hero dengan foto proses pengasapan asli, kartu kloter aktif, katalog singkat, cara kerja PO dalam bahasa pembeli, wilayah dan ongkir, ringkasan halal dan keamanan pangan, FAQ | MVP |
| Katalog `/produk` dan detail `/produk/[slug]` | Foto, nama, satuan (ekor, pack irisan, bungkus), berat isi, harga, deskripsi, cara simpan | MVP |
| Keranjang `/keranjang` | Item, subtotal, total berat dibanding sisa kapasitas | MVP |
| Checkout `/checkout` | Isian di Bagian 6.3, ringkasan biaya, batas waktu bayar | MVP |
| Status pesanan `/pesanan/[token]` | Bagian 6.4 | MVP |
| Cek pesanan `/cek-pesanan` | Nomor invoice + nomor WhatsApp | MVP |
| Halal & Keamanan Pangan `/halal` | Bagian 15 | MVP |
| Kebijakan Privasi `/privasi` dan Syarat Pemesanan `/syarat` | Bagian 16, aturan refund, gagal antar, perubahan jadwal | MVP |
| Artikel `/artikel` | Bagian 17.1 | Fase 2 |
| Ulasan `/ulasan/[token]` | Bagian 17.2 | Fase 2 |
| AI Deteksi `/deteksi` | Bagian 17.3 | Fase 3 |

### 6.2 Keranjang
- Satu keranjang hanya untuk kloter yang sedang buka, disimpan di HP pembeli (localStorage).
- Subtotal langsung tampil. Ongkir muncul setelah kecamatan dipilih di checkout.
- Kalau total berat keranjang melebihi sisa kapasitas, pembeli diberi tahu sebelum checkout. Pengecekan akhir tetap di server.
- Maksimal 10 unit per produk, dan berat per pesanan tidak boleh melebihi `max_order_weight_gram` kloter (nilai awal di Bagian 23). Batas berat mencegah satu pesanan menghabiskan kapasitas kloter.

### 6.3 Checkout

| Isian | Wajib | Catatan |
|---|---|---|
| Nama pemesan | Ya | |
| Nomor WhatsApp | Ya | Diterima dalam format 08 atau 628, disimpan dalam satu format |
| Kecamatan | Ya | Dipilih dari daftar wilayah layanan, menentukan ongkir |
| Alamat lengkap | Ya | Jalan, nomor rumah, RT/RW, perumahan atau cluster |
| Patokan atau catatan | Tidak | |
| Pin lokasi | Ya | Peta Leaflet + OpenStreetMap. Peta dibuka di titik tengah kecamatan, pembeli menggeser pin ke rumahnya |
| Nama dan nomor penerima | Tidak | Diisi kalau penerima berbeda dari pemesan |
| Persetujuan | Ya | Centang Kebijakan Privasi dan Syarat Pemesanan |

Aturan:
- Browser hanya mengirim `batch_id`, daftar `{ product_id, quantity }`, `area_id`, data alamat, koordinat, dan data pemesan. Harga, ongkir, total, dan berat dihitung ulang di server.
- Koordinat harus berada di dalam batas wilayah layanan Cikarang. Validasi per kecamatan yang lebih ketat menyusul kalau data batas wilayahnya tersedia.
- Checkout ditutup 15 menit sebelum `close_order_at` (usulan).
- Checkout dilindungi captcha tak terlihat (Cloudflare Turnstile) sejak MVP.
- Batas waktu bayar ditampilkan dengan jam yang jelas, misalnya "Bayar sebelum 20.45".
- Peta hanya dimuat di halaman checkout dan wajib mencantumkan atribusi OpenStreetMap.

### 6.4 Halaman status `/pesanan/[token]`
- Token dibuat acak minimal 128 bit, tidak berurutan, dan tidak bisa ditebak.
- Isi: nomor invoice, urutan status, item, total, tanggal antar, kecamatan, alamat tersamar, tombol lanjut bayar (kalau belum lunas), tombol simpan link ke WhatsApp, tombol hubungi admin.
- Nomor HP ditampilkan tersamar (0812****7890) dan alamat hanya sebagian, karena link bisa saja diteruskan ke orang lain. Halaman diberi `noindex`.
- Halaman memakai header `Referrer-Policy: no-referrer`, supaya token di URL tidak ikut terkirim ke situs lain saat pembeli menekan link keluar.
- Menampilkan nomor WhatsApp resmi sekiloo beserta peringatan anti-penipuan (Bagian 14.3).
- Status lunas dibaca dari database hasil webhook, bukan dari parameter redirect Midtrans.

### 6.5 Cek Pesanan
Pembeli yang kehilangan link memasukkan nomor invoice dan nomor WhatsApp, lalu diarahkan ke halaman statusnya. Jumlah percobaan dibatasi per IP.

### 6.6 Kartu kloter aktif
- Menampilkan jam tutup PO, tanggal antar, dan bar sisa kapasitas.
- Sisa kapasitas = kapasitas dikurangi berat pesanan lunas dan berat pesanan menunggu bayar yang belum kedaluwarsa.
- Ditampilkan sebagai persentase dan perkiraan kg ("sisa ±8 kg"), bukan angka gram.
- Datanya harus segar: diperbarui setiap ada pesanan dibuat, lunas, atau kedaluwarsa.
- Kalau kloter penuh atau sudah tutup, tombol pesan nonaktif dengan alasannya, plus info kloter berikutnya kalau sudah dijadwalkan.

---

## 7. Aplikasi Admin (APK)

### 7.1 Umum
- Login dengan email, password, dan kode aplikasi authenticator (2FA). Tidak ada halaman daftar.
- Menu tampil sesuai role di `admin_roles`. Akun tanpa role ditolak.
- Setiap aksi tercatat di log.

### 7.2 `admin_produksi`

| Menu | Fitur |
|---|---|
| Kloter | Buat, ubah (wajib alasan kalau sudah ada pesanan lunas), batalkan (semua pesanan lunas masuk daftar refund) |
| Rekap produksi | Total per produk dari pesanan lunas di kloter ini, plus daftar per pesanan (nama pemesan dan item) untuk label kemasan. Tanpa alamat |
| Berangkatkan kloter | Satu aksi untuk semua pesanan lunas di kloter |
| Pesanan | Detail pesanan; batalkan karena gagal produksi (masuk daftar refund) |
| Refund | Daftar refund menunggu; tandai selesai dengan bukti transfer |
| Produk | Tambah, ubah, nonaktifkan. Foto dikompres di HP sebelum diunggah |
| Wilayah dan ongkir | Daftar kecamatan, ongkir, aktif atau nonaktif |

### 7.3 `admin_cikarang`

| Menu | Fitur |
|---|---|
| Kloter | Melihat jadwal dan isi kloter; menandai kloter tiba di Cikarang |
| Daftar antar | Pesanan di kloter yang sudah tiba, dikelompokkan per kecamatan: alamat, patokan, penerima, tombol buka lokasi di aplikasi peta |
| Per pesanan | Mulai antar, selesai (foto bukti opsional), gagal antar (alasan wajib), coba antar lagi |
| WhatsApp | Tombol pesan siap kirim per pesanan |

Tombol buka lokasi dibuat aplikasi dari koordinat yang tersimpan, bukan dari link yang diketik pembeli.

### 7.4 Pesan WhatsApp manual (MVP)
Tombol membuka WhatsApp di HP admin dengan pesan yang sudah terisi lewat link `wa.me`. Admin tinggal menekan kirim.

| Momen | Dikirim oleh | Tujuan pesan |
|---|---|---|
| Pesanan diantar hari ini | `admin_cikarang` | Supaya pembeli ada di rumah. Berisi perkiraan jam dan link status |
| Gagal antar | `admin_cikarang` | Mengatur antar ulang |
| Refund | `admin_produksi` | Memberi tahu alasan dan meminta nomor rekening atau e-wallet tujuan refund |
| Kloter berangkat (opsional) | `admin_produksi` | Kabar bahwa pesanan sedang dalam perjalanan |

Konfirmasi lunas tidak perlu dikirim manual: setelah membayar, pembeli langsung diarahkan ke halaman statusnya.

---

## 8. Kloter & Kapasitas

### 8.1 Satuan berat
- Semua berat disimpan dalam gram (bilangan bulat) dan ditampilkan dalam kg.
- Tiap produk punya dua berat: `net_weight_gram` (berat isi, ditampilkan ke pembeli) dan `ship_weight_gram` (berat setelah divakum dan dikemas). Kapasitas dihitung dari `ship_weight_gram`, karena yang dibatasi adalah muatan cool box.
- `capacity_gram` per kloter diisi dari kapasitas cool box perjalanan, dan tidak boleh melebihi kapasitas freezer atau kulkas di Cikarang.

### 8.2 Penguncian kapasitas saat checkout
1. Fungsi database mengunci baris kloter (`SELECT ... FOR UPDATE`).
2. Menghitung berat terpakai: pesanan lunas ditambah pesanan menunggu bayar yang belum kedaluwarsa.
3. Kalau pesanan baru muat dan beratnya tidak melebihi `max_order_weight_gram`, pesanan dibuat dengan status menunggu bayar dan `expires_at`. Kalau tidak, checkout ditolak dan pembeli diberi tahu alasannya serta sisa kapasitas.
4. Pesanan yang kedaluwarsa otomatis melepas kapasitasnya.

Kapasitas terpakai dihitung dari pesanan, tidak disimpan sebagai angka penghitung terpisah, supaya tidak pernah selisih setelah pembatalan atau refund.

### 8.3 Batas waktu
- `expires_at` = yang lebih awal antara 15 menit setelah checkout dan `close_order_at`. Nilai yang sama dikirim ke Midtrans sebagai custom expiry. Waktu 15 menit cukup untuk membayar lewat QRIS, dan memperpendek waktu kapasitas tertahan oleh pesanan yang tidak dibayar. Kalau Virtual Account diaktifkan, batasnya ditentukan saat itu.
- Checkout ditutup 15 menit sebelum `close_order_at` (usulan).
- Pembayaran dengan `transaction_time` sebelum `expires_at` tetap sah, walaupun notifikasinya baru tiba setelah kloter tutup.

### 8.4 Penutupan dan syarat minimum
- Tugas terjadwal (`pg_cron`, tiap 5 menit) menutup kloter yang sudah melewati `close_order_at`.
- Saat ditutup, kloter dievaluasi. Kloter hanya jalan kalau total berat pesanan lunas ≥ 3.000 gram **dan** jumlah pesanan lunas ≥ 5. Kalau salah satu tidak terpenuhi, kloter batal: semua pesanan lunas dibatalkan dan masuk daftar refund, pesanan yang belum dibayar ikut dibatalkan.
- Syarat minimum disimpan per kloter (`min_weight_gram`, `min_orders`) dengan nilai awal 3.000 dan 5, supaya bisa diubah tanpa mengubah kode.
- Kalau kloter batal, `admin_produksi` mendapat daftar pembeli yang perlu dihubungi untuk refund.

### 8.5 Mengubah kloter yang sudah berisi pesanan lunas
- Kapasitas tidak boleh diturunkan di bawah berat yang sudah terpakai.
- Mengubah tanggal antar atau jam tutup wajib disertai alasan, tercatat di log, dan memunculkan daftar pembeli yang perlu dikabari.
- Usulan: pembeli yang tidak bisa menerima di tanggal baru boleh meminta refund (Bagian 23).

---

## 9. Status & Alur

Status hanya bisa berubah lewat fungsi database yang mengecek aturan di bawah. Aplikasi tidak boleh mengubah kolom status secara langsung.

### 9.1 Status pesanan (`order_status`)

| Dari | Ke | Pemicu | Oleh |
|---|---|---|---|
| `waiting_payment` | `processing_vacuum` | Notifikasi lunas yang valid | Sistem (webhook) |
| `waiting_payment` | `cancelled` | Lewat `expires_at`, atau pembayaran ditolak | Sistem |
| `processing_vacuum` | `shipped_to_cikarang` | Kloter berangkat | `admin_produksi` (aksi kloter) |
| `processing_vacuum` | `cancelled` + refund | Gagal produksi, atau kloter batal | `admin_produksi` atau sistem |
| `shipped_to_cikarang` | `arrived_in_cikarang` | Kloter tiba | `admin_cikarang` (aksi kloter) |
| `shipped_to_cikarang` atau `arrived_in_cikarang` | `cancelled` + refund | Barang rusak atau hilang | Admin, alasan wajib |
| `arrived_in_cikarang` | `out_for_delivery` | Mulai antar | `admin_cikarang` |
| `out_for_delivery` | `completed` | Pesanan diterima | `admin_cikarang` |
| `out_for_delivery` | `delivery_failed` | Pembeli tidak di tempat atau tidak bisa dihubungi | `admin_cikarang`, alasan wajib |
| `delivery_failed` | `out_for_delivery` | Antar ulang, maksimal 1 kali | `admin_cikarang` |
| `delivery_failed` | `cancelled` | Antar ulang gagal, atau masa simpan habis | `admin_cikarang`, refund sesuai kebijakan |

### 9.2 Status pembayaran (`payment_status`)
Alurnya: `pending` → `paid`, `expired`, atau `failed`. Dari `paid` bisa berlanjut ke `refund_pending` → `refunded`.

| `order_status` | `payment_status` yang sah |
|---|---|
| `waiting_payment` | `pending` |
| `processing_vacuum` sampai `completed`, termasuk `delivery_failed` | `paid` |
| `cancelled` | `expired`, `failed`, `refund_pending`, `refunded`, atau `paid` (hanya kalau kebijakan gagal antar menetapkan tanpa refund) |

### 9.3 Status kloter

| Status | Arti | Pemicu |
|---|---|---|
| `open` | Menerima pesanan | Dibuat `admin_produksi` |
| `closed` | PO tutup, lolos minimum, sedang produksi | Sistem pada `close_order_at` |
| `cancelled` | Batal karena di bawah minimum atau dibatalkan admin | Sistem atau `admin_produksi` |
| `in_transit` | Dalam perjalanan ke Cikarang | `admin_produksi` |
| `arrived_in_cikarang` | Tiba, disimpan di freezer atau kulkas | `admin_cikarang` |
| `completed` | Semua pesanan di kloter sudah berstatus akhir | Sistem |

---

## 10. Pembayaran, Pembatalan & Refund

### 10.1 Midtrans Snap
- Metode MVP: QRIS, karena potongannya paling kecil dan bisa dibayar dari hampir semua e-wallet dan m-banking. Virtual Account opsional (Bagian 23).
- Transaksi dibuat server setelah pesanan dan kapasitasnya terkunci. `order_id` Midtrans memakai nomor invoice yang unik.
- Custom expiry Midtrans = `expires_at` pesanan.

### 10.2 Pemeriksaan webhook `/api/webhooks/midtrans`
1. Cocokkan `signature_key` dengan SHA512(`order_id` + `status_code` + `gross_amount` + Server Key). Kalau tidak cocok, tolak.
2. Disarankan: cek ulang status transaksi ke API Midtrans sebelum mengubah data.
3. `gross_amount` harus sama dengan `total_amount` pesanan.
4. Idempotensi: notifikasi dengan pasangan `transaction_id` dan `transaction_status` yang sama hanya diproses sekali. Semua notifikasi disimpan di tabel `payments`.
5. `settlement` menjadikan pesanan lunas, selama `transaction_time` sebelum `expires_at`. `pending` tidak mengubah apa pun. `expire`, `cancel`, dan `deny` mengubah pembayaran menjadi `expired` atau `failed` dan melepas kapasitas.
6. Pembayaran yang masuk untuk pesanan yang sudah `cancelled` otomatis menjadi `refund_pending` dan masuk daftar refund.
7. Setelah status berubah, data kapasitas di web ikut diperbarui.
8. Balas Midtrans dengan HTTP 200 secepatnya. Proses berat tidak dikerjakan di jalur webhook.

### 10.3 Refund
- **Penyebab:** kloter di bawah minimum, kloter dibatalkan admin, gagal produksi, barang rusak di perjalanan, pembayaran masuk setelah pesanan batal, gagal antar dan perubahan jadwal (sesuai kebijakan masing-masing).
- **Cara di MVP:** manual. `admin_produksi` menghubungi pembeli lewat WhatsApp untuk meminta nomor rekening atau e-wallet, mentransfer, mengunggah bukti, lalu menandai refund selesai. Refund lewat API Midtrans tidak tersedia untuk semua metode pembayaran, jadi tidak dijadikan andalan.
- Refund hanya dimulai oleh admin, dan hanya lewat nomor WhatsApp yang tercatat di pesanan. Permintaan refund dari nomor lain ditolak. Admin tidak pernah meminta kode OTP, PIN, atau biaya apa pun (Bagian 14.3).
- Nomor rekening pembeli tidak disimpan di database. Yang disimpan cukup bukti transfer.
- Target lama refund ditulis di Syarat Pemesanan (Bagian 23).
- Pembeli tidak bisa membatalkan sendiri setelah lunas, kecuali lewat kebijakan perubahan jadwal.

---

## 11. Pengantaran & Rantai Dingin

### 11.1 Hari antar
1. Kloter tiba, `admin_cikarang` menandainya tiba, barang masuk freezer atau kulkas.
2. `admin_cikarang` menyusun urutan antar per kecamatan dari daftar antar.
3. Sebelum berangkat, admin mengirim pesan "diantar hari ini" ke tiap pembeli.
4. Per pesanan: mulai antar, lalu selesai (foto bukti opsional) atau gagal antar.

### 11.2 Gagal antar
- Alasan wajib dipilih: tidak di tempat, tidak bisa dihubungi, alamat tidak ditemukan, atau ditolak.
- Barang dikembalikan ke freezer.
- Usulan kebijakan: satu kali antar ulang, paling lambat sehari setelahnya dan masih dalam masa simpan. Kalau gagal lagi, pesanan dibatalkan. Refund atau tidak untuk kasus yang disebabkan pembeli diputuskan pemilik (Bagian 23), lalu ditulis jelas di Syarat Pemesanan sebelum pembeli membayar.

### 11.3 SOP rantai dingin
Angka di bawah menunggu data asli dan hasil uji ketahanan produk.

| Tahap | Syarat |
|---|---|
| Setelah divakum | Disimpan dingin sampai kloter berangkat |
| Perjalanan desa ke Cikarang | Cool box dengan ice gel, durasi maksimum [menunggu data] |
| Di Cikarang | Freezer atau kulkas. Kapasitasnya menjadi batas atas `capacity_gram` |
| Pengantaran | Tas atau box dingin. Batas maksimum di luar pendingin [dari uji ketahanan] |
| Label kemasan | Nama produk, berat isi, tanggal produksi, kode kloter, cara simpan, batas konsumsi |

Angka suhu dan masa simpan hanya boleh diambil dari uji ketahanan produk, bukan perkiraan. Salah menulisnya bisa membuat orang sakit.

---

## 12. Model Data (Supabase PostgreSQL)

| Tabel | Kolom penting | Catatan |
|---|---|---|
| `admin_roles` | `user_id` (ref `auth.users`), `role` (`admin_produksi` / `admin_cikarang`), `name`, `created_at` | Diisi manual lewat dashboard Supabase. Tidak ada aplikasi yang boleh menulis ke tabel ini |
| `products` | `id`, `slug`, `name`, `description`, `unit_type` (`ekor` / `pack_irisan` / `bungkus`), `net_weight_gram`, `ship_weight_gram`, `price`, `image_path`, `is_active`, `sort_order` | `price` dalam rupiah bulat, sudah termasuk kemasan vakum |
| `service_areas` | `id`, `name`, `delivery_fee`, `center_lat`, `center_lng`, `is_active`, `sort_order` | Isi awal: Cikarang Utara, Barat, Selatan, Timur, Pusat |
| `po_batches` | `id`, `name`, `close_order_at`, `delivery_date`, `capacity_gram`, `max_order_weight_gram`, `min_weight_gram` (default 3000), `min_orders` (default 5), `status`, `cancel_reason`, `created_by`, `created_at` | Maksimal satu kloter `open` |
| `orders` | `id`, `invoice_number`, `status_token`, `batch_id`, `buyer_name`, `buyer_phone`, `recipient_name`, `recipient_phone`, `area_id`, `address_text`, `address_note`, `lat`, `lng`, `subtotal`, `delivery_fee`, `total_amount`, `total_weight_gram`, `payment_status`, `order_status`, `cancel_reason`, `expires_at`, `paid_at`, `shipped_at`, `arrived_at`, `delivered_at`, `delivery_attempts`, `proof_photo_path`, `consent_at`, `created_at` | `status_token` acak minimal 128 bit dan unik |
| `order_items` | `id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`, `ship_weight_at_purchase_gram` | Harga dan berat dicatat saat pesan |
| `payments` | `id`, `order_id`, `transaction_id`, `transaction_status`, `payment_type`, `gross_amount`, `transaction_time`, `raw_payload`, `received_at` | Unik pada (`transaction_id`, `transaction_status`) untuk idempotensi |
| `refunds` | `id`, `order_id`, `amount`, `reason`, `status` (`pending` / `done`), `proof_path`, `processed_by`, `processed_at` | Tanpa nomor rekening pembeli |
| `status_log` | `id`, `order_id` atau `batch_id`, `actor` (id admin, `system`, atau `midtrans`), `from_status`, `to_status`, `note`, `created_at` | Diisi otomatis dan tidak bisa dihapus |
| `testimonials` (Fase 2) | `id`, `order_id` (unik), `rating` (1-5), `comment`, `photo_path`, `is_published`, `created_at` | Ditambah kolom `orders.review_token` |
| Artikel (Fase 2) | File MDX di repo | Tidak perlu tabel dan menu admin |

Tipe TypeScript untuk tabel di atas dibuat otomatis dengan `supabase gen types` ke `types/database.ts`.

**Penyimpanan file (Supabase Storage):**

| Bucket | Akses | Isi |
|---|---|---|
| `product-images` | Publik | Foto produk |
| `delivery-proofs` | Privat, dibuka lewat link sementara | Foto bukti antar. Memperlihatkan rumah pembeli |
| `refund-proofs` | Privat, dibuka lewat link sementara | Bukti transfer refund. Berisi data bank |
| `testimonial-photos` (Fase 2) | Privat sampai ulasan disetujui | Foto testimoni |

---

## 13. Arsitektur Teknis

```text
Pembeli (HP, dari link WhatsApp)
        |
        v
Web pembeli: Next.js 16 di Netlify
  - baca katalog, kloter, wilayah   -> Supabase (anon key, dibatasi RLS)
  - checkout                        -> fungsi database create_order -> Midtrans Snap
  - halaman status bertoken         -> dibaca server (service role)

Midtrans --notifikasi--> /api/webhooks/midtrans --> Supabase

APK admin (Expo) --login + 2FA--> Supabase (aksi lewat fungsi database)

Supabase: Postgres + Auth (khusus admin) + Storage + pg_cron
```

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Web pembeli | Next.js 16 App Router, TypeScript strict, Tailwind CSS, Framer Motion | Hosting Netlify Free, boleh untuk berjualan |
| Database, login admin, file | Supabase Free | Pengaman di Bagian 14 |
| Pembayaran | Midtrans Snap | QRIS dulu |
| Peta | Leaflet + OpenStreetMap | Gratis, wajib atribusi, hanya dimuat di checkout |
| Aplikasi admin | Expo + TypeScript, APK lewat EAS Build | Distribusi internal |
| Tugas terjadwal | `pg_cron` di Supabase | Tutup kloter, pesanan kedaluwarsa, kloter selesai |

**Bagian server di web:**
- Checkout memanggil fungsi database `create_order` (mengunci kapasitas), lalu membuat transaksi Midtrans.
- Webhook Midtrans sesuai Bagian 10.2.
- Halaman status dan Cek Pesanan dibaca server berdasarkan token, tidak dibuka lewat RLS ke publik.
- Perubahan produk, kloter, dan wilayah memperbarui cache halaman lewat `revalidateTag`. Data kapasitas kloter tidak di-cache lama.

**Pengaman Supabase Free (dari v0.3):**
- Database di-pause setelah seminggu tanpa aktivitas. Jeda antarkloter bisa lebih dari seminggu, jadi tugas harian GitHub Actions menjalankan satu query ringan.
- Paket gratis tidak punya backup. Backup dibuat sendiri lewat GitHub Actions, dienkripsi, dan tidak disimpan di repo publik.

---

## 14. Keamanan

Prinsipnya: browser dan APK tidak pernah dipercaya untuk harga, ongkir, kapasitas, atau status.

### 14.1 Hak akses (RLS)

| Siapa | Boleh | Tidak boleh |
|---|---|---|
| Publik (anon key) | Membaca produk aktif, kloter yang buka atau terjadwal (tanpa data pesanan), wilayah dan ongkir | Membaca atau menulis pesanan, pembayaran, refund |
| Server web (service role) | Membuat pesanan lewat `create_order`, mencatat webhook, membaca pesanan berdasarkan token | |
| `admin_produksi` (sesi 2FA `aal2`) | Mengelola produk, kloter, wilayah; rekap produksi tanpa alamat; berangkatkan kloter; membatalkan pesanan dan memproses refund | Mengubah role, melompati aturan status, menghapus log |
| `admin_cikarang` (sesi 2FA `aal2`) | Melihat kloter; menandai kloter tiba; membaca alamat dan koordinat pesanan di kloter yang sudah tiba; status pengantaran | Mengubah produk, harga, kloter, refund |

### 14.2 Aturan wajib
- `admin_roles` tidak punya aturan tulis untuk aplikasi mana pun. Role diubah hanya lewat dashboard Supabase.
- Supabase Auth: pendaftaran dimatikan, 2FA (TOTP) wajib, dan semua aturan serta fungsi admin mengecek sesi `aal2`.
- Kunci rahasia (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `REVALIDATION_SECRET`, dan nanti kunci API WhatsApp serta AI) hanya disimpan di environment variable Netlify. APK hanya membawa URL Supabase dan anon key. Setiap file yang memakai kunci rahasia diberi `import "server-only"`, supaya build langsung gagal kalau file itu terbawa ke browser.
- Anti-spam checkout: captcha tak terlihat (Cloudflare Turnstile) sejak MVP, maksimal 2 pesanan menunggu bayar per nomor WhatsApp, 5 checkout per IP per jam, 10 unit per produk, dan berat maksimal per pesanan (angka awal). Tanpa ini, seseorang bisa mengunci kapasitas dengan banyak pesanan yang tidak dibayar menjelang tutup PO. Pembeli asli jadi tidak bisa memesan, dan kloter bisa jatuh di bawah minimum lalu batal.
- Upload foto (produk, bukti antar, testimoni): hanya JPG, PNG, atau WEBP, maksimal 2 MB, dicek dari isi file (bukan nama file), diproses ulang, dan metadata EXIF dibuang. Foto dari HP bisa menyimpan lokasi GPS rumah. Foto bukti antar dan bukti refund disimpan di bucket privat (Bagian 12).
- APK: dikunci sidik jari atau PIN setiap dibuka, dan aksi sensitif (refund, batalkan kloter atau pesanan, ubah jadwal) wajib verifikasi ulang. 2FA hanya melindungi saat login, bukan sesi yang sudah aktif di HP yang hilang. Keystore di-backup, file APK dibagikan lewat link privat. Kalau HP admin hilang: ganti password, keluarkan semua perangkat, reset 2FA.
- Tidak ada pengecualian RLS atau validasi harga untuk mempermudah testing.

### 14.3 Keamanan operasional

**Akun layanan.** Kunci utama sistem ini bukan aplikasi admin, tapi akun-akun di bawah. Kalau salah satu dibobol, pelaku tidak perlu lewat aplikasi sama sekali. Semua wajib memakai 2FA, dan kode cadangannya disimpan offline, tidak di repo.

| Akun | Pemegang | 2FA aktif |
|---|---|---|
| Supabase | [menunggu] | Belum |
| Netlify | [menunggu] | Belum |
| Midtrans | [menunggu] | Belum |
| GitHub | [menunggu] | Belum |
| Expo | [menunggu] | Belum |
| Registrar domain | [menunggu] | Belum |
| Email yang dipakai untuk akun-akun di atas | [menunggu] | Belum |

**Pencegahan penipuan lewat WhatsApp.** Refund manual membuka dua celah: orang lain mengaku sebagai pembeli dan meminta refund ke rekeningnya, atau penipu mengaku admin sekiloo dan meminta kode OTP atau "biaya refund" ke pembeli. Karena itu:
- Refund hanya dimulai oleh admin, dan hanya lewat nomor WhatsApp yang tercatat di pesanan.
- Nomor WhatsApp resmi sekiloo ditulis di footer web, halaman status, dan Syarat Pemesanan, bersama kalimat: "Admin sekiloo tidak pernah meminta kode OTP, PIN, password, atau biaya apa pun untuk refund."

**Ketersediaan.** Di paket gratis Netlify, seluruh web di-pause kalau kredit bulanan habis, jadi spam permintaan saja sudah bisa mematikan toko. Captcha dan batas permintaan di Bagian 14.2 sekaligus melindungi kredit. Pemakaian kredit dipantau setiap minggu, dan paket dinaikkan ke berbayar sebelum mendekati 300 kredit.

**HP admin.** HP wajib memakai kunci layar, dan aplikasi admin dikunci sidik jari atau PIN setiap dibuka (Bagian 14.2). HP `admin_cikarang` berisi alamat pembeli, jadi HP yang hilang diperlakukan sebagai insiden.

**Rencana insiden kebocoran data.** Penanggung jawab: [menunggu, Bagian 23 nomor 21].
1. Hentikan kebocoran: ganti kunci yang mungkin bocor (service role key, Server Key Midtrans, password database), lalu keluarkan semua sesi admin.
2. Cari tahu data apa yang terdampak dan sejak kapan, dari `status_log` serta log Supabase dan Netlify.
3. Kirim pemberitahuan tertulis kepada pembeli yang terdampak paling lambat 3×24 jam, sesuai kewajiban UU PDP.
4. Catat kejadian, penyebab, dan perbaikannya.

### 14.4 Daftar cek sebelum rilis

Kloter percobaan pertama hanya boleh dibuka kalau semua cek di bawah lolos. Cek nomor 2 dan 3 diulang setiap ada migrasi database, dan cek nomor 14 diulang setiap bulan.

| No | Cek | Cara memeriksa | Lolos kalau |
|---|---|---|---|
| 1 | Akun layanan memakai 2FA | Buka pengaturan keamanan tiap akun di tabel Bagian 14.3 | Semua aktif |
| 2 | Tidak ada tabel tanpa RLS | Security Advisor di dashboard Supabase | Tidak ada peringatan RLS |
| 3 | Data pesanan tertutup dari publik | Tes otomatis: baca `orders`, `order_items`, `payments`, `refunds` dengan anon key | Kosong atau ditolak |
| 4 | Admin tanpa 2FA tidak bisa beraksi | Login admin tanpa menyelesaikan 2FA, lalu coba aksi admin | Ditolak |
| 5 | Kunci rahasia tidak terbawa ke browser atau APK | Cari nama dan nilai kunci rahasia di hasil build web (`.next/static`) dan di bundle APK | Tidak ditemukan |
| 6 | Bucket privat benar-benar privat | Buka file di `delivery-proofs` dan `refund-proofs` lewat URL langsung, tanpa link sementara | Ditolak |
| 7 | Harga tidak bisa diubah dari browser | Kirim checkout dengan harga, ongkir, atau total yang diubah | Total dihitung ulang dengan benar |
| 8 | Kapasitas tidak bisa terlampaui | Kirim beberapa checkout bersamaan yang totalnya melebihi sisa kapasitas | Hanya yang muat yang berhasil |
| 9 | Webhook palsu ditolak | Kirim notifikasi dengan signature salah, dengan nominal berbeda, dan notifikasi yang sama dua kali | Tidak ada data yang berubah |
| 10 | Spam checkout tertahan | Checkout berulang dari satu IP dan satu nomor WhatsApp, juga tanpa token captcha | Diblokir setelah batas |
| 11 | Halaman status aman | Cek header dan isi `/pesanan/[token]` | Ada `Referrer-Policy: no-referrer` dan `noindex`, nomor dan alamat tersamar |
| 12 | Aplikasi admin terkunci | Buka APK, lalu coba proses refund | Diminta sidik jari atau PIN, lalu verifikasi ulang untuk refund |
| 13 | Rencana insiden siap | Baca rencana di Bagian 14.3 | Penanggung jawab sudah terisi |
| 14 | Backup bisa dipulihkan | Pulihkan backup terenkripsi ke project uji | Data utuh |

---

## 15. Halal & Keamanan Pangan

Bagian ini adalah alasan utama web ini dibuat.

- **Sertifikat halal:** nomor sertifikat, lembaga penerbit, masa berlaku, scan sertifikat, dan tombol "Cek keaslian di halal.go.id".
- **Izin edar pangan:** perlu dicek izin yang berlaku untuk ikan asap kemasan vakum (PIRT atau BPOM), karena produk yang butuh penyimpanan dingin bisa punya aturan berbeda. Nomornya ditampilkan setelah ada.
- **Proses produksi:** langkah pengasapan yang konkret (jenis kayu, suhu, durasi, cara vakum), dengan foto atau video dapur asli.
- **Rantai dingin:** ringkasan SOP Bagian 11.3 dalam bahasa sederhana untuk pembeli.
- **Penyimpanan:** suhu dan masa simpan di suhu ruang, kulkas, freezer, dan setelah kemasan dibuka. Angka dari uji ketahanan.
- **Klaim gizi:** tidak ada angka gizi kecuali dari uji lab produk sendiri, dan tidak ada klaim kesehatan atau medis. Aturan ini juga berlaku untuk artikel dan AI Deteksi.

---

## 16. Privasi (UU PDP, UU No. 27 Tahun 2022)

| Data | Untuk apa | Siapa yang bisa melihat |
|---|---|---|
| Nama pemesan dan penerima | Label kemasan dan pengantaran | `admin_produksi` (nama saja), `admin_cikarang` |
| Nomor WhatsApp | Info pengantaran dan refund | `admin_cikarang`, `admin_produksi` |
| Alamat, patokan, koordinat | Pengantaran | `admin_cikarang`, hanya untuk kloter yang sudah tiba |
| Status dan metode pembayaran | Pencatatan transaksi | `admin_produksi`. Nomor kartu atau rekening tidak pernah disimpan |

Aturan:
- Persetujuan diminta di checkout (centang) dan waktunya dicatat di `consent_at`.
- Halaman Kebijakan Privasi menjelaskan data apa yang dikumpulkan, untuk apa, siapa yang memprosesnya (sekiloo dan Midtrans), berapa lama disimpan, dan cara meminta penghapusan.
- Usulan masa simpan: 12 bulan setelah pesanan selesai. Setelah itu nama, nomor, alamat, dan koordinat dianonimkan, sementara data transaksi tanpa identitas tetap disimpan (Bagian 23).
- Permintaan hapus data diterima lewat WhatsApp dan diproses `admin_produksi`.
- Halaman status menyamarkan nomor HP dan alamat.
- Data pribadi tidak dikirim ke layanan AI.
- File backup dienkripsi.
- Kalau terjadi kebocoran data, jalankan rencana insiden di Bagian 14.3. UU PDP mewajibkan pemberitahuan tertulis kepada pembeli yang terdampak paling lambat 3×24 jam.

---

## 17. Konten & Fitur Tambahan

### 17.1 Artikel edukasi (Fase 2)
- Disimpan sebagai file MDX di repo, jadi tidak butuh tabel atau menu admin.
- Topik awal: menyimpan ikan asap vakum, menghangatkan tanpa merusak tekstur, resep sambal dan masakan, dan gizi ikan asap (tanpa angka kecuali dari uji lab).
- Ditulis atau diperiksa pemilik usaha sebelum terbit.

### 17.2 Testimoni terverifikasi (Fase 2)
- Hanya untuk pesanan `completed`. Link `/ulasan/[token]` dikirim lewat WhatsApp, hanya bisa dipakai sekali, dan berlaku 30 hari.
- Isi: rating 1-5, komentar, foto opsional (aturan upload di Bagian 14.2).
- Tampil setelah disetujui admin. Moderasi hanya untuk konten tidak pantas atau data pribadi, bukan untuk menyaring ulasan buruk.
- Bagian testimoni tidak ditampilkan sebelum ada ulasan asli.

### 17.3 AI Deteksi (Fase 3)
Fitur ini hanya dibangun kalau setelah MVP terbukti dibutuhkan pembeli. Batasan wajibnya:
- **Boleh:** menebak jenis ikan beserta tingkat keyakinannya, memberi ide resep, menyarankan produk dari katalog.
- **Tidak boleh:** menyebut angka gizi, menyatakan ikan aman atau tidak aman dimakan, atau membuat klaim kesehatan.
- Dibatasi per IP, memakai captcha, dan punya batas biaya harian, karena tiap foto memakai kredit API berbayar.
- Foto tidak disimpan setelah dianalisis, dan tidak ada data pribadi yang ikut dikirim.

---

## 18. Notifikasi WhatsApp

- **MVP:** manual lewat tombol `wa.me` di APK (Bagian 7.4).
- **Tidak memakai Fonnte atau Wablas.** Keduanya umumnya bekerja dengan menautkan nomor WhatsApp biasa, bukan API resmi, sehingga nomornya berisiko diblokir. WhatsApp adalah saluran utama ke pembeli, jadi risiko ini terlalu besar.
- **Fase 2:** WhatsApp Business Platform resmi dari Meta, dengan template pesan yang disetujui. Momennya: lunas, kloter berangkat, diantar hari ini, gagal antar, refund. Biayanya dihitung per percakapan.

---

## 19. Kebutuhan Non-Fungsional

### 19.1 Performa
- LCP < 3 detik di 4G, JavaScript beranda ≤ 200 kB gzip, dan total beranda termasuk foto ≤ sekitar 1 MB.
- Hero di MVP berupa foto (lewat `next/image`), bukan video. Video di Fase 2 hanya diputar saat ditekan, ukurannya ≤ 3 MB, dan tidak diputar otomatis untuk pengguna yang mengaktifkan "kurangi gerak". Alasannya biaya: 1.000 kunjungan × 3 MB ≈ 3 GB ≈ 60 dari 300 kredit gratis Netlify per bulan, hanya untuk video.
- Leaflet hanya dimuat di checkout, dan script Midtrans hanya di langkah pembayaran.
- Foto sumber dikompres ke WebP sebelum masuk repo atau storage.

### 19.2 Tampilan dan gerak
- Mobile-first, karena sebagian besar pembeli membuka link dari WhatsApp di HP.
- Warna Dapur Asap dari `src/app/globals.css`. Hijau dipakai khusus untuk penanda halal.
- Framer Motion dipakai untuk kartu produk yang muncul saat digulir (sudah ada) dan bar kapasitas kloter.
- Efek kecil yang sering muncul dibuat dengan CSS supaya tidak menambah JavaScript (komponen di `src/components/ui/`, contohnya di `/styleguide`):
  - tombol mengecil 3% saat ditekan, sebagai umpan balik sentuh di HP;
  - kartu yang bisa ditekan naik 2 px dengan bayangan saat disorot kursor (hanya di perangkat yang punya hover), dan latarnya menggelap saat ditekan di HP;
  - skeleton dengan kilau (shimmer) saat memuat, bentuknya meniru konten asli dan selalu ditemani teks status.
- Semua animasi mengikuti setelan "kurangi gerak". Satu-satunya animasi yang berulang adalah kilau skeleton, dan hanya selama data sedang dimuat.
- Teks tegak sebagai ciri khas (komponen `LabelTegak`): satu label di tepi hero, huruf serif biasa, dibaca dari bawah ke atas searah asap yang naik, dengan garis emas tipis di atasnya. Di bawah 768 px berubah jadi label mendatar di atas judul. Tidak dipakai untuk harga, nama produk, tombol, atau status.
- Pekerjaan UI mengikuti aturan antislop di `CLAUDE.md`.

### 19.3 Aksesibilitas
Kontras teks memenuhi WCAG AA, target sentuh minimal 44 px, zoom tidak dikunci, dan semua kontrol bisa dipakai dengan keyboard.

---

## 20. Biaya

| Layanan | MVP | Catatan |
|---|---|---|
| Hosting web | Rp 0 | Netlify Free, boleh untuk berjualan |
| Database | Rp 0 | Supabase Free dengan pengaman. Pro mulai US$25/bulan begitu pesanan rutin tiap minggu |
| Pembayaran | Per transaksi berhasil | QRIS 0,7% sudah termasuk PPN |
| Aplikasi admin | Rp 0 | Expo Free |
| Peta | Rp 0 | Leaflet + OpenStreetMap |
| Captcha | Rp 0 | Cloudflare Turnstile |
| WhatsApp | Rp 0 (manual) | Fase 2: API resmi, biaya per percakapan |
| AI Deteksi | Tidak ada | Fase 3: biaya per foto |
| Domain | Opsional | `.my.id` atau `.id` |

---

## 21. Dampak ke Kode yang Sudah Ada

**Bisa dipakai lagi:** design system (`globals.css`, warna Dapur Asap), komponen UI (Button, Badge, Card, Section, Header, Footer), kartu produk dan animasinya (`KartuProduk`, `KartuMuncul`, `PenyediaGerak`) dengan penyesuaian data, setup framer-motion dan pnpm, serta `CatatanPlaceholder`.

**Tidak dipakai lagi:** dua zona harga (`ZonaId`, `product.zona`), tiga titik ambil (`LOKASI`, `PemilihLokasi`, pilihan lokasi di `PembelianContext`), kode ambil, serta kategori kepala/jeroan/telur dan `caraJual`, yang diganti `unit_type`. Kategori lama hanya dipertahankan kalau pemilik masih mau menjual produk itu (Bagian 23).

**Sebelum Fase 1:** kumpulkan dulu pekerjaan yang tercecer (perubahan yang belum di-commit, branch `arena/01a0e352-sekiloo`, dan stash) ke `main`.

---

## 22. Keputusan yang Sudah Diambil

| Tanggal | Keputusan |
|---|---|
| 14 Sep 2026 | Pembeli tanpa login. Masih berlaku |
| 14 Sep 2026 | Admin memakai APK Android terpisah, web tanpa halaman admin. Masih berlaku |
| 14 Sep 2026 | Bayar penuh di muka, tanpa DP. Masih berlaku |
| 7 Okt 2026 | Next.js + TypeScript (PHP ditolak), hosting Netlify Free, Supabase Free dengan pengaman. Masih berlaku |
| 17 Nov 2026 | Fokus hanya Cikarang, model jastip PO per kloter, pesanan diantar ke alamat pembeli |
| 17 Nov 2026 | Dua zona harga, tiga titik ambil, dan kode ambil dicabut |
| 17 Nov 2026 | Checkout tanpa akun: nama, nomor WhatsApp, alamat, dan pin peta Leaflet/OpenStreetMap. Status pesanan dan link testimoni lewat URL bertoken acak |
| 17 Nov 2026 | Kapasitas kloter dihitung dari berat (gram), dikunci saat checkout |
| 17 Nov 2026 | Ongkir flat per kecamatan, dipilih dari daftar wilayah layanan |
| 17 Nov 2026 | Kloter batal dan semua pesanan lunas di-refund kalau saat tutup PO total berat < 3 kg atau pesanan < 5 |
| 17 Nov 2026 | Midtrans Snap dengan pengecekan signature, kesesuaian nominal, idempotensi, dan `expires_at` yang tidak melewati `close_order_at` |
| 17 Nov 2026 | Status `arrived_in_cikarang` dan `delivery_failed` ditambahkan |
| 17 Nov 2026 | Role admin di tabel `admin_roles` terpisah, 2FA wajib |
| 17 Nov 2026 | Notifikasi WhatsApp di MVP manual, tidak memakai gateway tidak resmi |
| 17 Nov 2026 | Urutan pengerjaan: MVP, lalu Fase 2 (testimoni, artikel, WhatsApp resmi), lalu Fase 3 (AI Deteksi) |
| 17 Nov 2026 | Animasi tombol, hover kartu, dan skeleton shimmer dibuat dengan CSS. Framer Motion hanya untuk animasi masuk dan bar kapasitas |
| 17 Nov 2026 | Teks tegak dipakai sebagai ciri khas di tepi hero, huruf serif biasa (pilihan A). Pilihan kapital renggang ditolak karena terlalu umum |
| 17 Nov 2026 | Keamanan operasional dan daftar cek sebelum rilis ditambahkan (Bagian 14.3 dan 14.4): captcha sejak MVP, batas bayar 15 menit, berat maksimal per pesanan, foto bukti di bucket privat, 2FA di semua akun layanan |

---

## 23. Pertanyaan Terbuka

**Konfirmasi asumsi PRD ini:**
1. Syarat minimum: kloter batal kalau **salah satu** syarat tidak terpenuhi (berat < 3 kg, atau pesanan < 5). Benar begitu?
2. Pengelolaan kloter dan refund hanya oleh `admin_produksi`.
3. Checkout ditutup 15 menit sebelum jam tutup PO, dan batas waktu bayar 15 menit.

**Data operasional:**
4. Ongkir tiap kecamatan (Rp).
5. Kapasitas cool box perjalanan dan freezer di Cikarang (gram), sebagai nilai awal `capacity_gram`.
6. Daftar produk awal: nama, satuan, berat isi, berat setelah dikemas, harga, foto. Apakah kepala, jeroan, dan telur ikan asap masih dijual?
7. Lama perjalanan dari desa ke Cikarang, dan jarak minimum antara jam tutup PO dan tanggal antar.
8. Wilayah layanan: seluruh kecamatan, atau hanya area tertentu?

**Kebijakan:**
9. Gagal antar karena pembeli: di-refund atau tidak?
10. Perubahan jadwal kloter: boleh refund atas permintaan pembeli?
11. Target lama refund (misalnya 3 hari kerja).
12. Masa simpan data pembeli (usulan 12 bulan).

**Legal dan pangan:**
13. Data sertifikat halal: nomor, lembaga, masa berlaku, scan.
14. Izin edar yang berlaku untuk produk ini (PIRT atau BPOM) dan nomornya.
15. Hasil uji masa simpan dan rantai dingin.

**Akun dan perangkat:**
16. QRIS saja, atau ditambah Virtual Account?
17. Pemilik akun Midtrans dan kesiapan dokumen usaha untuk aktivasi produksi.
18. Nama domain.
19. Siapa memegang HP admin, dan siapa cadangannya kalau HP hilang atau rusak.

**Keamanan:**
20. Berat maksimal per pesanan (`max_order_weight_gram`).
21. Pemegang tiap akun layanan dan penanggung jawab insiden kebocoran data (Bagian 14.3).

---

## 24. Roadmap

**Fase 0: Persiapan**
- Kumpulkan pekerjaan yang tercecer ke `main`.
- Kumpulkan data di Bagian 23 nomor 4-8 dan 13-15.
- Aktifkan kembali project Supabase `ikan-asap`, daftar Midtrans sandbox, hubungkan repo ke Netlify.
- Aktifkan 2FA di semua akun layanan dan isi tabel pemegang akun (Bagian 14.3).

**Fase 1: MVP**
1. Skema database, RLS, fungsi `create_order`, aturan status, `pg_cron`, sebagai file migrasi di repo.
2. Katalog dan kartu kloter aktif di web.
3. Keranjang dan checkout dengan peta.
4. Midtrans Snap, webhook, halaman status, Cek Pesanan.
5. APK admin untuk kedua role.
6. Halaman Halal & Keamanan Pangan, Kebijakan Privasi, Syarat Pemesanan, FAQ.
7. Uji dari awal sampai akhir di Midtrans sandbox, jalankan Daftar Cek Sebelum Rilis (Bagian 14.4), lalu buka satu kloter percobaan dengan pembeli terbatas.

**Fase 2:** testimoni, artikel, notifikasi WhatsApp resmi, video hero, notifikasi push APK, kuota per produk bila perlu.

**Fase 3:** AI Deteksi, kalau masih dibutuhkan setelah MVP berjalan.

---

## 25. Konvensi Pengembangan

- TypeScript strict (`strict: true`) di web dan APK.
- Tipe database dibuat dengan `supabase gen types` ke `types/database.ts`, tidak ditulis tangan.
- Perubahan skema database selalu lewat file migrasi di repo.
- Mobile-first untuk semua halaman web.
- Sebelum menulis kode Next.js, baca dokumentasi di `node_modules/next/dist/docs/` (lihat `AGENTS.md`), karena Next.js 16 punya banyak perubahan.
- Pekerjaan UI dan teks mengikuti aturan antislop di `CLAUDE.md`.
- RLS dan validasi harga di server tidak boleh dilewati demi kemudahan testing.
- Setelah setiap migrasi, jalankan Security Advisor Supabase dan tes RLS (Bagian 14.4 nomor 2 dan 3).
- File yang memakai kunci rahasia wajib diberi `import "server-only"`.
- Setiap langkah yang selesai langsung di-commit, supaya pekerjaan tidak tercecer lagi.

---

## 26. Referensi

| Referensi | Dipakai untuk |
|---|---|
| [Midtrans: notifikasi HTTP](https://docs.midtrans.com/docs/https-notification-webhooks) · [custom expiry](https://docs.midtrans.com/reference/custom-expiry-object) · [biaya transaksi](https://midtrans.com/id/biaya) | Webhook, batas waktu bayar, potongan per metode |
| [Supabase: MFA (TOTP)](https://supabase.com/docs/guides/auth/auth-mfa/totp) · [konfigurasi Auth](https://supabase.com/docs/guides/auth/general-configuration) · [harga](https://supabase.com/pricing) · [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing) | 2FA admin, mematikan pendaftaran, batas paket gratis |
| [Netlify: harga](https://www.netlify.com/pricing/) · [cara kredit bekerja](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/) | Hosting dan anggaran kredit |
| [Leaflet](https://leafletjs.com/) · [OpenStreetMap: kebijakan tile](https://operations.osmfoundation.org/policies/tiles/) | Peta checkout dan atribusi |
| [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) | Notifikasi otomatis Fase 2 |
| [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) | Captcha cadangan |
| [BPJPH: cek sertifikat halal](https://bpjph.halal.go.id/read/cek-status-sertifikasi-halal-produk-di-halal-go-id-ini-caranya) | Tombol cek keaslian |
| [Expo: build APK](https://docs.expo.dev/build-reference/apk/) | Aplikasi admin |
| `PRD-Ikan-Asap.md` (v0.3) | Keputusan sebelumnya yang masih berlaku |

---

*Langkah berikutnya: jawab Bagian 23, lalu mulai Fase 0.*
