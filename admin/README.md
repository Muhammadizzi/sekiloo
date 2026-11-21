# Sealauk Admin (APK)

Aplikasi Android untuk `admin_produksi` dan `admin_cikarang` (PRD v0.4 Bagian 7). Proyek Expo terpisah dari web: punya `package.json`, `tsconfig`, dan lint sendiri, dan dipasang dengan npm.

## Menjalankan saat pengembangan

```bash
cp .env.example .env.local   # isi URL Supabase, publishable key, dan alamat web
npm install
npm run web                  # pratinjau di browser, hanya untuk pengembangan
npm run typecheck
npx expo lint
```

Versi browser tidak memakai Keystore dan kunci sidik jari, jadi aplikasi menolak jalan di browser versi rilis.

Setelah skema database berubah dan tipe web dibuat ulang, salin tipenya ke sini:

```bash
npm run salin-tipe
```

## Membangun APK

Butuh akun Expo. Nilai env di bawah ikut masuk ke APK dan memang boleh publik. Kunci rahasia (secret key Supabase, server key Midtrans) tidak pernah dipakai di APK.

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest env:set --environment preview --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://<project>.supabase.co --visibility plaintext
npx eas-cli@latest env:set --environment preview --environment production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_... --visibility plaintext
npx eas-cli@latest env:set --environment preview --environment production --name EXPO_PUBLIC_SITE_URL --value https://<domain-web> --visibility plaintext
npx eas-cli@latest build --platform android --profile preview
```

Profil `preview` untuk APK uji, `production` untuk APK yang dipakai admin. File APK dibagikan lewat link privat, dan keystore dari EAS di-backup (PRD 14.2).

## Sebelum admin bisa masuk

Diatur pemilik di dashboard Supabase:

1. Authentication: matikan pendaftaran (Allow new users to sign up) dan nyalakan TOTP di Multi-Factor.
2. Buat akun admin di Authentication > Users.
3. Tambahkan baris di tabel `admin_roles`: `user_id` akun tadi, `role` berisi `admin_produksi` atau `admin_cikarang`, dan `name`.

Saat pertama masuk, aplikasi meminta admin memasang authenticator (2FA). Akun tanpa baris di `admin_roles` ditolak sebelum sampai ke tahap 2FA.

## Keamanan yang ditangani aplikasi

- Sesi disimpan di Keystore Android (SecureStore), bukan penyimpanan biasa.
- Aplikasi terkunci sidik jari atau PIN setiap dibuka dan setelah lebih dari satu menit di latar belakang. HP tanpa kunci layar tidak bisa memakai aplikasi.
- Refund, pembatalan kloter atau pesanan, dan perubahan jadwal kloter yang sudah berisi pesanan lunas meminta sidik jari atau PIN sekali lagi.
- Foto digambar ulang dan disimpan sebagai WebP sebelum diunggah, jadi metadata EXIF (termasuk lokasi GPS) terbuang.
- Semua aksi tetap diperiksa ulang di database: peran di `admin_roles` dan sesi 2FA (`aal2`).
