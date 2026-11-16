"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import {
  CartIcon,
  ChevronRightIcon,
  CloseIcon,
  MapPinIcon,
  MenuIcon,
  ShieldCheckIcon,
} from "@/components/icons";

/**
 * MENU HP — hamburger + panel.
 *
 * Satu-satunya bagian header yang berupa komponen KLIEN. Sisanya tetap
 * server, jadi yang dikirim ke HP hanya kode buka-tutup panel ini, bukan
 * seluruh header.
 *
 * Tanpa pustaka apa pun: state React + ikon SVG yang sudah ada. Yang
 * biasanya "gratis" kalau memakai pustaka dialog, di sini dikerjakan
 * sendiri dan sengaja tidak ada yang dilewat:
 *
 * - `aria-expanded` & `aria-controls` pada pemicu, supaya pembaca layar
 *   tahu tombol ini membuka sesuatu dan tahu statusnya.
 * - `role="dialog"` + `aria-modal`, supaya isi halaman di belakangnya
 *   tidak ikut terbaca saat panel terbuka.
 * - Esc menutup, klik latar gelap menutup, dan ada tombol tutup yang
 *   terlihat — tiga jalan keluar, bukan cuma satu.
 * - Fokus keyboard PINDAH ke tombol tutup saat panel dibuka, TERKURUNG
 *   di dalam panel selama terbuka, dan KEMBALI ke hamburger saat
 *   ditutup. Tanpa ini, menekan Tab akan berjalan ke tautan di balik
 *   panel yang tidak terlihat — cacat aksesibilitas yang paling sering
 *   luput pada menu buatan sendiri.
 * - Gulir badan halaman dikunci selama panel terbuka.
 * - Panel ikut tertutup kalau layar melebar ke ukuran desktop (mis.
 *   layar diputar), supaya tidak ada panel tak terlihat yang diam-diam
 *   masih mengunci gulir.
 */

/* Elemen yang bisa menerima fokus keyboard di dalam panel. Daftar pendek
   ini cukup karena isi panel hanya tautan dan tombol — tidak ada input. */
const FOKUSABEL = "a[href], button:not([disabled])";

export function MenuMobile({ cartCount = 0 }: { cartCount?: number }) {
  const [terbuka, setTerbuka] = useState(false);
  const pemicuRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tutupRef = useRef<HTMLButtonElement>(null);
  const idPanel = useId();

  useEffect(() => {
    if (!terbuka) return;

    const panel = panelRef.current;
    if (!panel) return;

    /* Disalin ke variabel lokal: saat fungsi pembersih di bawah berjalan,
       `pemicuRef.current` belum tentu menunjuk simpul yang sama lagi. */
    const pemicu = pemicuRef.current;
    const gulirSemula = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* Fokus masuk ke panel. Tanpa ini fokus tertinggal di hamburger yang
       kini tertutup panel, dan Tab pertama melompat ke tempat acak. */
    tutupRef.current?.focus();

    const saatTekanTombol = (peristiwa: KeyboardEvent) => {
      if (peristiwa.key === "Escape") {
        peristiwa.preventDefault();
        setTerbuka(false);
        return;
      }

      if (peristiwa.key !== "Tab") return;

      const isi = Array.from(panel.querySelectorAll<HTMLElement>(FOKUSABEL));
      if (isi.length === 0) return;

      const pertama = isi[0];
      const terakhir = isi[isi.length - 1];
      const aktif = document.activeElement;

      /* Lingkaran fokus: dari elemen terakhir maju kembali ke yang
         pertama, dan sebaliknya untuk Shift+Tab. */
      if (peristiwa.shiftKey && (aktif === pertama || !panel.contains(aktif))) {
        peristiwa.preventDefault();
        terakhir.focus();
      } else if (!peristiwa.shiftKey && aktif === terakhir) {
        peristiwa.preventDefault();
        pertama.focus();
      }
    };

    const layarLebar = window.matchMedia("(min-width: 768px)");
    const saatLebarBerubah = (peristiwa: MediaQueryListEvent) => {
      if (peristiwa.matches) setTerbuka(false);
    };

    document.addEventListener("keydown", saatTekanTombol);
    layarLebar.addEventListener("change", saatLebarBerubah);

    return () => {
      document.removeEventListener("keydown", saatTekanTombol);
      layarLebar.removeEventListener("change", saatLebarBerubah);
      document.body.style.overflow = gulirSemula;
      /* Fokus dikembalikan ke tombol yang membuka panel — pengguna
         keyboard melanjutkan dari tempat ia berhenti, bukan dari awal
         halaman. */
      pemicu?.focus();
    };
  }, [terbuka]);

  return (
    <div className="md:hidden">
      <button
        ref={pemicuRef}
        type="button"
        onClick={() => setTerbuka(true)}
        aria-expanded={terbuka}
        aria-controls={idPanel}
        aria-label={
          cartCount > 0
            ? `Buka menu, ${cartCount} item di keranjang`
            : "Buka menu"
        }
        className="text-on-dark hover:bg-on-dark/10 active:bg-on-dark/20 relative inline-flex size-11 cursor-pointer items-center justify-center rounded-md transition-colors"
      >
        <MenuIcon className="size-6" />
        {cartCount > 0 && (
          <span
            className="bg-gold-400 ring-ink-900 absolute top-1.5 right-1.5 size-2.5 rounded-full ring-2"
            aria-hidden
          />
        )}
      </button>

      {terbuka && (
        <div className="fixed inset-0 z-50">
          {/* Latar gelap. Klik di mana pun di sini menutup panel — jalan
              keluar yang paling dicari orang di HP. Ditandai aria-hidden
              karena tombol tutup di dalam panel sudah mewakili aksi yang
              sama untuk pembaca layar. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => setTerbuka(false)}
            className="animasi-scrim bg-ink-950/70 absolute inset-0 w-full cursor-default backdrop-blur-sm"
          />

          <div
            ref={panelRef}
            id={idPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="animasi-panel border-ink-700 shadow-panel absolute inset-x-0 top-0 max-h-dvh overflow-y-auto border-b"
          >
            {/* Lapisan cahaya yang sama dengan hero, supaya panel terbaca
                sebagai bagian dari zona bingkai, bukan kotak asing. */}
            <div className="lapis-cahaya relative">
              <div className="px-gutter flex h-14 items-center justify-between">
                <p className="font-display text-on-dark text-2xl leading-none font-semibold tracking-tight">
                  sekiloo
                  <span className="text-gold-400" aria-hidden>
                    .
                  </span>
                </p>
                <button
                  ref={tutupRef}
                  type="button"
                  onClick={() => setTerbuka(false)}
                  aria-label="Tutup menu"
                  className="text-on-dark hover:bg-on-dark/10 active:bg-on-dark/20 -mr-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-md transition-colors"
                >
                  <CloseIcon className="size-6" />
                </button>
              </div>

              <div aria-hidden className="garis-emas h-px opacity-60" />

              {/* Label berbeda dari navigasi desktop ("Navigasi utama")
                  supaya dua penanda navigasi tidak pernah bernama sama
                  bagi pembaca layar. */}
              <nav aria-label="Navigasi menu" className="px-gutter py-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/produk"
                      onClick={() => setTerbuka(false)}
                      className="border-ink-700 hover:bg-on-dark/5 active:bg-on-dark/10 flex min-h-14 items-center gap-3 rounded-md border px-4 transition-colors"
                    >
                      <span className="flex-1">
                        <span className="text-on-dark block font-medium">
                          Produk
                        </span>
                        <span className="text-on-dark-muted block text-sm">
                          Katalog lengkap, empat kategori
                        </span>
                      </span>
                      <ChevronRightIcon className="text-on-dark-muted size-5 shrink-0" />
                    </Link>
                  </li>

                  <li>
                    {/* Keranjang belum terhubung ke state apa pun —
                        tombolnya sudah ada supaya tempatnya tidak
                        berpindah saat nanti dihidupkan. */}
                    <button
                      type="button"
                      className="border-ink-700 hover:bg-on-dark/5 active:bg-on-dark/10 flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-md border px-4 text-left transition-colors"
                    >
                      <CartIcon className="text-gold-400 size-6 shrink-0" />
                      <span className="flex-1">
                        <span className="text-on-dark block font-medium">
                          Keranjang
                        </span>
                        <span className="text-on-dark-muted block text-sm">
                          {cartCount > 0
                            ? `${cartCount} item siap dipesan`
                            : "Belum ada item"}
                        </span>
                      </span>
                      {cartCount > 0 && (
                        <span className="bg-gold-400 text-ink-900 tabular min-w-6 rounded-full px-2 text-center text-sm leading-6 font-bold">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </li>
                </ul>

                {/* Penanda kepercayaan. Bukan tautan, jadi bukan bagian
                    dari daftar navigasi — ia keterangan, dan bentuknya
                    memang harus beda supaya tidak disangka bisa ditekan. */}
                <div className="border-halal-400/30 bg-halal-400/10 mt-4 rounded-md border p-3">
                  <p className="text-halal-400 flex items-center gap-2 font-semibold">
                    <ShieldCheckIcon className="size-5 shrink-0" />
                    Bersertifikat Halal
                  </p>
                  <p className="text-on-dark-soft mt-1 text-sm">
                    Nomor sertifikat ditulis terbuka di tiap halaman produk.
                  </p>
                </div>

                <p className="text-on-dark-muted mt-4 flex items-center gap-2 text-sm">
                  <MapPinIcon className="size-4 shrink-0" />
                  Semua pesanan diambil sendiri di 3 titik ambil.
                </p>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
