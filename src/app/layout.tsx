import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PengamatReveal } from "@/components/layout/PengamatReveal";
import "./globals.css";

/**
 * Tidak ada next/font/google di sini — disengaja.
 *
 * Font diambil dari tumpukan font sistem yang didefinisikan di
 * globals.css (--font-display / --font-sans). Konsekuensinya: nol
 * permintaan jaringan saat build maupun saat halaman dibuka, tidak ada
 * kedipan teks (FOIT/FOUT), dan build tidak bisa gagal gara-gara CDN
 * font tak terjangkau.
 */

export const metadata: Metadata = {
  title: {
    default: "sekiloo — Ikan Asap Halal & Higienis",
    template: "%s · sekiloo",
  },
  description:
    "Ikan asap yang diproses higienis, bersertifikat halal, dan bisa diambil di tiga lokasi. Pesan online, bayar aman.",
};

/* Perhatikan yang TIDAK ada di sini: maximumScale dan userScalable.
   Keduanya sengaja dibiarkan kosong supaya pengguna tetap bisa
   memperbesar halaman — membatasi zoom adalah pelanggaran
   aksesibilitas yang umum terjadi. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Satu-satunya nilai warna literal di seluruh proyek. Metadata Next.js
     dibaca di luar CSS, jadi ia tidak bisa memakai var(--color-ink-900).
     Nilainya harus ikut diubah bila --color-ink-900 berubah. */
  themeColor: "#1c1917",
};

/**
 * SAKELAR ANIMASI REVEAL.
 *
 * Skrip sekecil ini ditulis tangan dan disisipkan langsung ke HTML karena
 * ia harus berjalan SEBELUM badan halaman dirender. Itulah satu-satunya
 * cara dua syarat berikut terpenuhi sekaligus:
 *
 *   1. TANPA JS, TIDAK ADA YANG TERSEMBUNYI. Keadaan awal "belum muncul"
 *      di globals.css bersarang di dalam `.js-reveal`, dan kelas itu HANYA
 *      dipasang di sini. JavaScript mati, gagal muat, atau perayap yang
 *      tidak menjalankan skrip → halaman tampil utuh, apa adanya.
 *   2. TIDAK ADA KEDIPAN. Kalau kelasnya baru dipasang setelah hidrasi,
 *      pengunjung sempat melihat konten muncul lalu hilang lagi sebelum
 *      dianimasikan — jauh lebih buruk daripada tidak ada animasi.
 *
 * Pemeriksaan "kurangi gerak" ikut di sini, bukan hanya di CSS: kalau
 * pengguna sudah meminta gerak dikurangi, kelasnya tidak pernah terpasang,
 * jadi tidak ada satu pun elemen yang pernah tersembunyi sejak awal.
 *
 * Timeout di akhir adalah jaring pengaman. Bila bundel JS gagal dan
 * <PengamatReveal /> tidak pernah hidup (ia yang memasang
 * `data-reveal-siap`), kelasnya dilepas sendiri setelah 2,5 detik supaya
 * tidak ada isi halaman yang tertinggal tersembunyi selamanya.
 */
const SKRIP_REVEAL = `(function(){try{
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var e=document.documentElement;e.classList.add('js-reveal');
setTimeout(function(){if(!e.dataset.revealSiap)e.classList.remove('js-reveal')},2500);
}catch(_){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* suppressHydrationWarning: skrip di atas menambah kelas pada <html>
       sebelum React menghidrasi, jadi className di server dan di browser
       memang sengaja berbeda. Hanya untuk elemen ini, bukan isinya. */
    <html lang="id" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {/*
          <script> polos, BUKAN <Script> dari next/script — dan ini sudah
          diperiksa, bukan asumsi.

          `next/script` dengan strategy="beforeInteractive" tidak
          menyisipkan kode ini apa adanya; ia mengantrekannya ke
          `self.__next_s` untuk dijalankan runtime Next.js. Artinya kelas
          `.js-reveal` baru terpasang SETELAH bundel Next dimuat — jauh
          setelah cat pertama. Akibatnya persis yang paling ingin
          dihindari: konten sempat terlihat, lalu menghilang, baru
          dianimasikan.

          Skrip polos di sini dijalankan browser saat mengurai HTML,
          sebelum satu pun elemen ber-`data-reveal` di bawahnya dibaca.
          Karena itu ia harus tetap menjadi anak PERTAMA <body>.
        */}
        <script dangerouslySetInnerHTML={{ __html: SKRIP_REVEAL }} />

        {/* Lompat ke konten — hanya muncul saat difokus lewat keyboard. */}
        <a
          href="#konten"
          className="bg-gold-400 text-ink-900 sr-only rounded-md px-4 py-2 font-semibold focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Lompat ke konten utama
        </a>

        <Header />

        <main id="konten" className="flex-1">
          {children}
        </main>

        <Footer />

        {/* Satu observer untuk seluruh situs. Tidak merender apa pun. */}
        <PengamatReveal />
      </body>
    </html>
  );
}
