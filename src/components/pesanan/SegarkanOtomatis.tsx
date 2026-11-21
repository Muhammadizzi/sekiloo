"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const JEDA = 6_000;

/**
 * Notifikasi Midtrans biasanya masuk beberapa detik setelah pembeli kembali dari halaman bayar.
 * Selama menunggu, halaman diminta ulang dari server tiap 6 detik, hanya saat tab terlihat, sampai `sampai`.
 */
export function SegarkanOtomatis({ sampai }: { sampai: number }) {
  const router = useRouter();

  useEffect(() => {
    const pewaktu = window.setInterval(() => {
      if (Date.now() > sampai) {
        window.clearInterval(pewaktu);
        return;
      }
      if (document.visibilityState === "visible") router.refresh();
    }, JEDA);
    return () => window.clearInterval(pewaktu);
  }, [router, sampai]);

  return null;
}
