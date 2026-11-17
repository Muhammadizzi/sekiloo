"use client";

import { useEffect, useState } from "react";
import { ambilKloterTerbaru, type HasilKloter } from "@/lib/kloter";

// Batas setTimeout di browser (sekitar 24 hari). Tenggat yang lebih jauh tidak perlu dijadwalkan.
const MAKS_TIMEOUT = 2_147_483_647;
const JEDA_SEGARKAN = 30_000;

/**
 * Data kloter dari server, disegarkan dari browser saat halaman dibuka dan saat pembeli kembali ke tab
 * (biasanya setelah pindah dari WhatsApp), karena halamannya berasal dari cache.
 * `sekarang` diperbarui tepat di jam tutup checkout, jadi status ikut berganti tanpa menunggu cache.
 */
export function useKloterSegar(awal: HasilKloter, waktuRender: number, segarkan = true) {
  const [hasil, setHasil] = useState(awal);
  const [sekarang, setSekarang] = useState(waktuRender);

  useEffect(() => {
    if (!segarkan) return;
    let aktif = true;
    let terakhir = 0;

    const muat = () => {
      if (Date.now() - terakhir < JEDA_SEGARKAN) return;
      terakhir = Date.now();
      // Gagal menyegarkan tidak menimpa data dari server.
      void ambilKloterTerbaru().then((baru) => {
        if (aktif && baru.ok) setHasil(baru);
      });
    };
    const saatTerlihat = () => {
      if (document.visibilityState === "visible") muat();
    };

    muat();
    document.addEventListener("visibilitychange", saatTerlihat);
    return () => {
      aktif = false;
      document.removeEventListener("visibilitychange", saatTerlihat);
    };
  }, [segarkan]);

  const batasCheckout = hasil.ok ? hasil.data?.checkout_closes_at : undefined;

  useEffect(() => {
    if (!batasCheckout) return;
    const sisa = Date.parse(batasCheckout) - Date.now();
    if (sisa > MAKS_TIMEOUT) return;
    const pewaktu = window.setTimeout(() => setSekarang(Date.now()), Math.max(0, sisa));
    return () => window.clearTimeout(pewaktu);
  }, [batasCheckout]);

  return { hasil, sekarang };
}
