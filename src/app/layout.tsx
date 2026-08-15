import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col">
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
      </body>
    </html>
  );
}
