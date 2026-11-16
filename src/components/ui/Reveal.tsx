import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * REVEAL — pembungkus "muncul saat masuk layar".
 *
 * Perhatikan yang TIDAK ada di file ini: `"use client"`, useState, useRef,
 * dan IntersectionObserver. Komponen ini tetap komponen SERVER — tugasnya
 * cuma menempelkan penanda `data-reveal` (dan jeda opsional) pada sebuah
 * elemen. Nol JavaScript tambahan per pemakaian, walau dipakai 20 kali di
 * satu halaman.
 *
 * Tiga bagian yang bekerja sama:
 *
 *   1. <Reveal>            — file ini. Menandai APA yang ikut muncul.
 *   2. globals.css         — gaya awal & transisinya.
 *   3. <PengamatReveal />  — SATU IntersectionObserver untuk seluruh
 *                            halaman, dipasang sekali di root layout.
 *
 * Pemisahan ini disengaja: kalau tiap Reveal punya observer sendiri,
 * halaman katalog dengan 12 kartu akan membuat 12 observer sekaligus.
 * Satu observer yang mengamati 12 elemen jauh lebih murah.
 *
 * KAPAN DIPAKAI: untuk BLOK — seksi, kartu, kelompok daftar. Jangan
 * dibungkuskan ke tiap teks kecil. Halaman yang setiap elemennya bergerak
 * tidak terasa halus, tapi gelisah.
 *
 * KAPAN TIDAK DIPAKAI: judul & paragraf pembuka hero. Elemen itu hampir
 * pasti jadi LCP halaman, dan browser tidak menghitung teks ber-opacity 0
 * sebagai "sudah tampil" — membungkusnya berarti menunda LCP tepat pada
 * elemen yang paling menentukan angkanya (target PRD: < 3 detik di 4G).
 */
export function Reveal({
  as: Tag = "div",
  jeda = 0,
  className,
  children,
}: {
  /** Tag pembungkus. Pakai `li` bila induknya `ul`/`ol`. */
  as?: "div" | "li" | "section" | "article";
  /** Jeda mulai dalam milidetik — untuk efek bergiliran dalam satu grup. */
  jeda?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      data-reveal
      /* Dikirim sebagai custom property, bukan `transitionDelay` langsung,
         supaya durasi & easing-nya tetap satu sumber di globals.css dan
         tidak tersebar sebagai gaya sebaris di belasan berkas. */
      style={
        jeda > 0
          ? ({ "--reveal-jeda": `${jeda}ms` } as CSSProperties)
          : undefined
      }
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}

/**
 * Jeda bertahap untuk anggota ke-`urutan` dalam satu grup.
 *
 * Dibatasi (`maks`) dengan sengaja: tanpa batas, kartu ke-12 di katalog
 * baru mulai muncul 0,84 detik setelah kartu pertama — dan pada saat itu
 * pengguna sudah menggulir melewatinya. Efek bergiliran gunanya memberi
 * kesan berurutan, bukan membuat orang menunggu.
 */
export function jedaBertahap(urutan: number, langkah = 70, maks = 5): number {
  return Math.min(urutan, maks) * langkah;
}
