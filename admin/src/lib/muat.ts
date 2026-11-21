import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { pesanGalat } from "./galat";

export type Keadaan<T> = { status: "memuat" } | { status: "galat"; pesan: string } | { status: "siap"; data: T };

/** Hasil query Supabase: lempar galatnya supaya ditangkap useMuat, kembalikan datanya kalau berhasil. */
export function wajib<T>(hasil: { data: T | null; error: unknown }): T {
  if (hasil.error) throw hasil.error;
  return hasil.data as T;
}

/**
 * Memuat data saat layar dibuka dan setiap kali layar kembali tampil, karena data admin
 * sering berubah dari layar lain (mis. setelah membatalkan pesanan lalu kembali ke daftar).
 * Saat memuat ulang, data lama tetap tampil supaya layar tidak berkedip kosong.
 */
export function useMuat<T>(ambil: () => Promise<T>) {
  const [keadaan, setKeadaan] = useState<Keadaan<T>>({ status: "memuat" });
  const [menyegarkan, setMenyegarkan] = useState(false);
  const urutan = useRef(0);
  const ambilTerbaru = useRef(ambil);
  useEffect(() => {
    ambilTerbaru.current = ambil;
  });

  const muat = useCallback(async (tarik: boolean) => {
    const nomor = ++urutan.current;
    if (tarik) setMenyegarkan(true);
    try {
      const data = await ambilTerbaru.current();
      if (nomor === urutan.current) setKeadaan({ status: "siap", data });
    } catch (galat) {
      if (nomor === urutan.current) {
        setKeadaan((lama) => (lama.status === "siap" && !tarik ? lama : { status: "galat", pesan: pesanGalat(galat) }));
      }
    } finally {
      if (nomor === urutan.current) setMenyegarkan(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      muat(false);
    }, [muat]),
  );

  const ulangi = useCallback(() => {
    setKeadaan({ status: "memuat" });
    muat(false);
  }, [muat]);

  return { keadaan, menyegarkan, segarkan: () => muat(true), ulangi, muatDiam: () => muat(false) };
}
