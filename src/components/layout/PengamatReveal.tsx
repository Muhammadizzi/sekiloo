"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * PENGAMAT REVEAL — satu IntersectionObserver untuk seluruh situs.
 *
 * Dipasang sekali di root layout. Tidak merender apa pun (return null);
 * yang dikirim ke HP hanya fungsi kecil ini, tanpa pustaka animasi.
 *
 * Cara kerjanya:
 *
 *   1. Skrip kecil di root layout memasang kelas `.js-reveal` pada <html>
 *      SEBELUM badan halaman dirender — itulah yang membuat elemen
 *      bertanda `data-reveal` berangkat dari opacity 0 tanpa kedipan.
 *   2. Komponen ini mengumpulkan semua elemen `[data-reveal]` dan
 *      mengamatinya dengan SATU observer.
 *   3. Begitu sebuah elemen masuk layar, ia diberi `data-tampil` (CSS yang
 *      mengurus fade + naiknya), lalu LANGSUNG BERHENTI DIAMATI.
 *
 * Berhenti mengamati itu dua-duanya penting: hemat kerja, dan menjamin
 * elemen tidak pernah menghilang lagi saat digulir balik ke atas. Gerak
 * yang berulang setiap kali elemen lewat adalah ciri khas animasi yang
 * terasa murah — sekali muncul, urusannya selesai.
 */
export function PengamatReveal() {
  /* Halaman baru = kumpulan elemen baru. Navigasi di App Router tidak
     memuat ulang dokumen, jadi tanpa kebergantungan ini elemen di halaman
     kedua tidak akan pernah diamati — dan akan tinggal tersembunyi. */
  const pathname = usePathname();

  useEffect(() => {
    const akar = document.documentElement;

    /* Kalau perangkat tidak mendukung IntersectionObserver, tidak ada yang
       akan pernah memberi `data-tampil`. Lepas kelasnya supaya semua isi
       halaman tampil apa adanya — situs tanpa animasi jauh lebih baik
       daripada situs yang kosong. */
    if (!("IntersectionObserver" in window)) {
      akar.classList.remove("js-reveal");
      return;
    }

    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* Pengguna yang minta "kurangi gerak" tidak mendapat gerak sama
       sekali: kelasnya dilepas, jadi tidak ada keadaan awal tersembunyi,
       tidak ada geser, dan observer di bawah tidak perlu dibuat. */
    if (kurangiGerak.matches) {
      akar.classList.remove("js-reveal");
      return;
    }

    /* Penanda untuk jaring pengaman di root layout: pengamat sudah hidup,
       jadi timeout di sana tidak perlu membuka paksa semuanya. */
    akar.dataset.revealSiap = "1";

    const pengamat = new IntersectionObserver(
      (entri) => {
        for (const satu of entri) {
          if (!satu.isIntersecting) continue;
          (satu.target as HTMLElement).dataset.tampil = "";
          pengamat.unobserve(satu.target);
        }
      },
      {
        /* Ambang kecil supaya blok tinggi (yang tidak pernah terlihat 50%
           sekaligus di layar HP) tetap terpicu. */
        threshold: 0.08,
        /* Tepi bawah ditarik ke dalam sedikit: elemen baru dianggap masuk
           setelah benar-benar naik ke layar, bukan saat piksel pertamanya
           menyentuh tepi. Ini yang membuat geraknya terbaca sebagai
           sambutan, bukan sebagai sesuatu yang ketinggalan. */
        rootMargin: "0px 0px -8% 0px",
      },
    );

    const elemen = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-tampil])",
    );
    elemen.forEach((satu) => pengamat.observe(satu));

    /* Setelan "kurangi gerak" bisa diubah saat halaman sedang terbuka.
       Kalau itu terjadi, hentikan semuanya dan tampilkan apa adanya. */
    const saatGerakBerubah = (peristiwa: MediaQueryListEvent) => {
      if (!peristiwa.matches) return;
      pengamat.disconnect();
      akar.classList.remove("js-reveal");
    };
    kurangiGerak.addEventListener("change", saatGerakBerubah);

    return () => {
      pengamat.disconnect();
      kurangiGerak.removeEventListener("change", saatGerakBerubah);
    };
  }, [pathname]);

  return null;
}
