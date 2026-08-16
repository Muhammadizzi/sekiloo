"use client";

import { useState } from "react";
import type { FotoProduk } from "@/types/product";
import { cn } from "@/lib/cn";
import { FotoPlaceholder } from "./FotoPlaceholder";

/**
 * Galeri foto produk.
 *
 * Catatan tata letak: kotak foto utama punya aspect-ratio tetap (4:3).
 * Ini bukan soal estetika — tanpa rasio tetap, halaman akan melompat saat
 * foto asli selesai dimuat, dan lompatan itu persis terjadi di detik
 * pengunjung mulai membaca. Rasio dikunci sekarang, jadi saat foto asli
 * masuk nanti, tidak ada yang bergeser.
 *
 * Thumbnail memakai <button> biasa dengan `aria-pressed`, bukan <div>
 * yang bisa diklik: dengan begitu ia bisa dijangkau keyboard, punya nama
 * yang terbaca, dan status terpilihnya ikut dibacakan pembaca layar.
 */
export function GaleriProduk({
  foto,
  namaProduk,
}: {
  foto: FotoProduk[];
  namaProduk: string;
}) {
  const [aktif, setAktif] = useState(0);
  const fotoAktif = foto[aktif];

  return (
    <div>
      <div className="border-line bg-surface-muted aspect-[4/3] overflow-hidden rounded-lg border">
        {fotoAktif.url ? (
          /* Saat foto asli sudah ada, ganti bagian ini dengan <Image> dari
             next/image dan daftarkan host-nya di images.remotePatterns
             pada next.config.ts. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoAktif.url}
            alt={fotoAktif.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <FotoPlaceholder label="Foto produk menyusul" />
        )}
      </div>

      {fotoAktif.keterangan && (
        <p className="text-content-muted mt-2 text-sm">
          {fotoAktif.keterangan}
        </p>
      )}

      {foto.length > 1 && (
        <div className="mt-stack grid grid-cols-4 gap-2">
          {foto.map((item, index) => {
            const terpilih = index === aktif;
            return (
              <button
                key={item.alt}
                type="button"
                onClick={() => setAktif(index)}
                aria-pressed={terpilih}
                aria-label={`Lihat foto ${index + 1} dari ${foto.length}${
                  item.keterangan ? `: ${item.keterangan}` : ""
                }`}
                className={cn(
                  "aspect-square cursor-pointer overflow-hidden rounded-sm border",
                  "transition-colors duration-150",
                  terpilih
                    ? "border-gold-500 ring-gold-500/40 ring-2"
                    : "border-line hover:border-line-strong",
                )}
              >
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FotoPlaceholder />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Nama produk ikut dibawa ke alt foto utama lewat teks tersembunyi,
          supaya konteksnya tetap jelas saat dibacakan di luar urutan. */}
      <span className="sr-only">Galeri foto {namaProduk}</span>
    </div>
  );
}
