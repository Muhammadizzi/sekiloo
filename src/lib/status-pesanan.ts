/** Urutan status pesanan dalam bahasa pembeli (PRD 9.1). `delivery_failed` ditampilkan di langkah antar. */
export const LANGKAH_PESANAN = [
  { kode: "waiting_payment", judul: "Menunggu pembayaran" },
  { kode: "processing_vacuum", judul: "Lunas, ikan disiapkan", keterangan: "Ikan diasap dan divakum setelah PO ditutup." },
  { kode: "shipped_to_cikarang", judul: "Dalam perjalanan ke Cikarang", keterangan: "Dibawa dalam cool box." },
  { kode: "arrived_in_cikarang", judul: "Tiba di Cikarang", keterangan: "Disimpan di freezer atau kulkas sampai diantar." },
  { kode: "out_for_delivery", judul: "Sedang diantar" },
  { kode: "completed", judul: "Selesai" },
] as const;

export function urutanLangkah(statusPesanan: string): number {
  const kode = statusPesanan === "delivery_failed" ? "out_for_delivery" : statusPesanan;
  return LANGKAH_PESANAN.findIndex((l) => l.kode === kode);
}

export const ALASAN_BATAL: Record<string, string> = {
  expired: "Pembayaran tidak selesai sebelum batas waktunya.",
  payment_failed: "Pembayaran ditolak atau gagal.",
  batch_min_not_met: "Sampai PO ditutup, pesanan di kloter ini belum memenuhi jumlah minimum, jadi kloter dibatalkan.",
  batch_cancelled: "Kloter ini dibatalkan oleh admin.",
  production_failed: "Ikan gagal diproduksi untuk kloter ini.",
  damaged_in_transit: "Barang rusak dalam perjalanan ke Cikarang.",
  delivery_failed: "Pengantaran gagal dua kali.",
  paid_after_cancel: "Pembayaran masuk setelah pesanan dibatalkan.",
  admin: "Pesanan dibatalkan oleh admin.",
};
