"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  Lokasi,
  LokasiId,
  Product,
  RincianZona,
  Zona,
} from "@/types/product";
import {
  LOKASI,
  ZONA,
  kalimatHargaZona,
  kalimatStokZona,
} from "@/data/locations";

/**
 * Keadaan pembelian satu produk: titik ambil mana yang sedang dipilih,
 * lalu harga dan stok yang berlaku untuk zona titik ambil itu.
 *
 * Pembagian perannya sengaja tegas:
 *   - LOKASI menentukan alamat & jam buka (yang memang berbeda-beda),
 *   - ZONA menentukan harga & stok.
 * Pembeli hanya memilih lokasi; zonanya ikut dengan sendirinya. Ia tidak
 * perlu tahu kata "zona" sama sekali — itu istilah internal.
 *
 * Kenapa pakai context, bukan satu komponen besar:
 * pemilih lokasi ada di ATAS halaman, sementara indikator stok dan tombol
 * "Tambah ke Keranjang" ada di BAWAH — dipisahkan bagian manfaat dan
 * keamanan yang panjang. Semuanya butuh nilai yang sama. Context membuat
 * bagian-bagian itu berbagi keadaan TANPA memaksa isi di antaranya ikut
 * jadi komponen klien: bagian manfaat & keamanan tetap dirender di server
 * dan masuk ke sini lewat `children`, jadi tidak menambah JavaScript yang
 * diunduh pengunjung.
 */

type IsiKonteks = {
  product: Product;
  /** Titik ambil yang sedang dipilih. */
  lokasi: Lokasi;
  pilihLokasi: (id: LokasiId) => void;
  /** Zona harga & stok milik lokasi terpilih. */
  zona: Zona;
  /** Harga, stok, dan alasan selisih untuk zona terpilih. */
  rincian: RincianZona;
  /** Kalimat penjelas harga zona ini, mis. "Harga ini sama untuk Pasar dan Rumah Produksi." */
  kalimatHarga: string;
  /** Kalimat penjelas stok zona ini, supaya pembeli tidak mengira ada dua tumpukan. */
  kalimatStok: string;
  /** Daftar semua titik ambil beserta harganya, mengikuti urutan di `LOKASI`. */
  pilihan: PilihanLokasi[];
};

export type PilihanLokasi = {
  lokasi: Lokasi;
  /** Harga di lokasi ini = harga zona lokasi ini. */
  harga: number;
};

const Konteks = createContext<IsiKonteks | null>(null);

export function PembelianProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const [lokasiId, setLokasiId] = useState<LokasiId>(LOKASI[0].id);

  /* Kalau id di state tidak dikenali (mis. daftar lokasi berubah setelah
     halaman terbuka), jatuh ke lokasi pertama daripada membuat halaman
     kosong. */
  const lokasi = LOKASI.find((item) => item.id === lokasiId) ?? LOKASI[0];

  /* Inilah satu-satunya tempat lokasi diterjemahkan jadi harga & stok.
     Tidak ada komponen tampilan yang boleh melakukan pencarian ini
     sendiri — kalau boleh, aturan "Pasar & Produksi selalu sama" akan
     kembali jadi sesuatu yang harus diingat manusia. */
  const zona = ZONA[lokasi.zonaId];
  const rincian = product.zona[lokasi.zonaId];

  const pilihan: PilihanLokasi[] = LOKASI.map((item) => ({
    lokasi: item,
    harga: product.zona[item.zonaId].harga,
  }));

  return (
    <Konteks.Provider
      value={{
        product,
        lokasi,
        pilihLokasi: setLokasiId,
        zona,
        rincian,
        kalimatHarga: kalimatHargaZona(lokasi.zonaId),
        kalimatStok: kalimatStokZona(lokasi.zonaId),
        pilihan,
      }}
    >
      {children}
    </Konteks.Provider>
  );
}

export function usePembelian(): IsiKonteks {
  const isi = useContext(Konteks);
  if (!isi) {
    throw new Error("usePembelian harus dipakai di dalam <PembelianProvider>.");
  }
  return isi;
}

/** Status stok yang bisa dibaca manusia, dihitung dari angka stok satu zona. */
export function statusStok(
  stok: number,
  ambang: number,
  satuan: string,
): {
  tone: "halal" | "warn" | "danger";
  teks: string;
  bisaBeli: boolean;
} {
  if (stok <= 0) {
    return { tone: "danger", teks: "Stok habis", bisaBeli: false };
  }
  if (stok <= ambang) {
    return {
      tone: "warn",
      teks: `Stok menipis — sisa ${stok} ${satuan}`,
      bisaBeli: true,
    };
  }
  return {
    tone: "halal",
    teks: `Tersedia — ${stok} ${satuan} siap ambil`,
    bisaBeli: true,
  };
}
