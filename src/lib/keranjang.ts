import { useSyncExternalStore } from "react";
import type { Kloter } from "@/lib/kloter";
import { MAKS_PER_PRODUK, type ItemPesanan } from "@/lib/pesanan";
import type { Produk } from "@/lib/produk";

/**
 * Keranjang disimpan di HP pembeli (localStorage), satu keranjang untuk satu kloter.
 * Hanya id produk dan jumlah yang disimpan; harga dan berat selalu diambil dari data terbaru.
 */
export type Keranjang = { kloterId: string | null; item: ItemPesanan[] };

const KUNCI = "sealauk:keranjang:v1";
const PERISTIWA = "sealauk:keranjang";
const KOSONG: Keranjang = { kloterId: null, item: [] };

let mentahTerakhir: string | null = null;
let terurai: Keranjang = KOSONG;
// Dipakai kalau localStorage diblokir (mode privat tertentu): keranjang hidup sampai halaman ditutup.
let cadangan: Keranjang = KOSONG;

function urai(mentah: string | null): Keranjang {
  if (!mentah) return KOSONG;
  try {
    const data = JSON.parse(mentah) as Partial<Keranjang>;
    const item = Array.isArray(data.item)
      ? data.item
          .filter((i): i is ItemPesanan => typeof i?.produkId === "string" && Number.isInteger(i?.jumlah))
          .map((i) => ({ produkId: i.produkId, jumlah: Math.min(Math.max(i.jumlah, 1), MAKS_PER_PRODUK) }))
      : [];
    return { kloterId: typeof data.kloterId === "string" ? data.kloterId : null, item };
  } catch {
    return KOSONG;
  }
}

function baca(): Keranjang {
  let mentah: string | null;
  try {
    mentah = window.localStorage.getItem(KUNCI);
  } catch {
    return cadangan;
  }
  // Snapshot harus objek yang sama selama isinya sama, kalau tidak useSyncExternalStore render terus-menerus.
  if (mentah !== mentahTerakhir) {
    mentahTerakhir = mentah;
    terurai = urai(mentah);
  }
  return terurai;
}

function tulis(keranjang: Keranjang) {
  cadangan = keranjang;
  try {
    window.localStorage.setItem(KUNCI, JSON.stringify(keranjang));
  } catch {
    // Tetap jalan dengan cadangan di memori.
  }
  window.dispatchEvent(new Event(PERISTIWA));
}

function langganan(beritahu: () => void) {
  window.addEventListener("storage", beritahu);
  window.addEventListener(PERISTIWA, beritahu);
  return () => {
    window.removeEventListener("storage", beritahu);
    window.removeEventListener(PERISTIWA, beritahu);
  };
}

export function useKeranjang(): Keranjang {
  return useSyncExternalStore(langganan, baca, () => KOSONG);
}

export function jumlahUnit(keranjang: Keranjang): number {
  return keranjang.item.reduce((total, i) => total + i.jumlah, 0);
}

/** Menambah ke keranjang kloter ini. Isi dari kloter lain dibuang, karena kloternya sudah lewat. */
export function tambahKeKeranjang(kloterId: string, produkId: string, jumlah: number) {
  const sekarang = baca();
  const item = sekarang.kloterId === kloterId ? [...sekarang.item] : [];
  const ada = item.findIndex((i) => i.produkId === produkId);
  if (ada >= 0) {
    item[ada] = { produkId, jumlah: Math.min(item[ada].jumlah + jumlah, MAKS_PER_PRODUK) };
  } else {
    item.push({ produkId, jumlah: Math.min(Math.max(jumlah, 1), MAKS_PER_PRODUK) });
  }
  tulis({ kloterId, item });
}

export function aturJumlah(produkId: string, jumlah: number) {
  const sekarang = baca();
  const item =
    jumlah <= 0
      ? sekarang.item.filter((i) => i.produkId !== produkId)
      : sekarang.item.map((i) =>
          i.produkId === produkId ? { produkId, jumlah: Math.min(jumlah, MAKS_PER_PRODUK) } : i,
        );
  tulis({ ...sekarang, item });
}

export function hapusDariKeranjang(produkId: string) {
  aturJumlah(produkId, 0);
}

export type RingkasanKeranjang = {
  baris: { produk: Produk; jumlah: number }[];
  /** Produk di keranjang yang sudah tidak aktif. Harus dihapus dulu sebelum checkout. */
  tidakDijual: string[];
  /** Isi keranjang berasal dari kloter yang sudah lewat, jadi tidak bisa dipesan lagi. */
  dariKloterLain: boolean;
  subtotal: number;
  beratGram: number;
};

/** Harga dan berat diambil dari data produk terbaru, bukan dari yang tersimpan di HP. */
export function hitungKeranjang(keranjang: Keranjang, produk: Produk[], kloter: Kloter | null): RingkasanKeranjang {
  const peta = new Map(produk.map((p) => [p.id, p]));
  const dariKloterLain =
    kloter !== null && keranjang.kloterId !== null && keranjang.kloterId !== kloter.id && keranjang.item.length > 0;
  const item = dariKloterLain ? [] : keranjang.item;

  const baris = item.flatMap((i) => {
    const p = peta.get(i.produkId);
    return p ? [{ produk: p, jumlah: i.jumlah }] : [];
  });

  return {
    baris,
    tidakDijual: item.filter((i) => !peta.has(i.produkId)).map((i) => i.produkId),
    dariKloterLain,
    subtotal: baris.reduce((total, b) => total + b.produk.harga * b.jumlah, 0),
    beratGram: baris.reduce((total, b) => total + b.produk.beratKirimGram * b.jumlah, 0),
  };
}

/** Alasan keranjang belum bisa lanjut ke checkout, atau `null` kalau sudah bisa. */
export function alasanBelumBisaCheckout(r: RingkasanKeranjang, kloter: Kloter): string | null {
  if (r.dariKloterLain) return "Isi keranjang ini dari kloter sebelumnya. Kosongkan dulu, lalu pilih ikan lagi.";
  if (r.tidakDijual.length > 0) return "Hapus dulu produk yang sudah tidak dijual.";
  if (r.baris.length === 0) return "Keranjang masih kosong.";
  if (r.beratGram > kloter.max_order_weight_gram) {
    return `Berat pesanan melebihi batas ${kloter.max_order_weight_gram / 1000} kg per pesanan. Kurangi jumlahnya.`;
  }
  if (r.beratGram > kloter.remaining_gram) return "Berat pesanan melebihi sisa kapasitas kloter. Kurangi jumlahnya.";
  return null;
}

export function kosongkanKeranjang() {
  tulis(KOSONG);
}
