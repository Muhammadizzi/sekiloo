export type Nada = "netral" | "emas" | "hijau" | "merah" | "kuning" | "biru";

export const STATUS_KLOTER: Record<string, { teks: string; nada: Nada }> = {
  open: { teks: "Buka", nada: "hijau" },
  closed: { teks: "PO tutup, produksi", nada: "emas" },
  in_transit: { teks: "Dalam perjalanan", nada: "biru" },
  arrived_in_cikarang: { teks: "Tiba di Cikarang", nada: "biru" },
  completed: { teks: "Selesai", nada: "netral" },
  cancelled: { teks: "Batal", nada: "merah" },
};

export const STATUS_PESANAN: Record<string, { teks: string; nada: Nada }> = {
  waiting_payment: { teks: "Menunggu bayar", nada: "kuning" },
  processing_vacuum: { teks: "Lunas, diproduksi", nada: "emas" },
  shipped_to_cikarang: { teks: "Dalam perjalanan", nada: "biru" },
  arrived_in_cikarang: { teks: "Siap diantar", nada: "biru" },
  out_for_delivery: { teks: "Sedang diantar", nada: "emas" },
  delivery_failed: { teks: "Gagal antar", nada: "merah" },
  completed: { teks: "Diterima", nada: "hijau" },
  cancelled: { teks: "Batal", nada: "merah" },
};

export const STATUS_BAYAR: Record<string, string> = {
  pending: "Belum dibayar",
  paid: "Lunas",
  expired: "Kedaluwarsa",
  failed: "Gagal",
  refund_pending: "Menunggu refund",
  refunded: "Sudah direfund",
};

/** Alasan batal dan alasan refund memakai kode yang sama di database. */
export const ALASAN_BATAL: Record<string, string> = {
  expired: "Tidak dibayar sampai batas waktu",
  payment_failed: "Pembayaran gagal",
  batch_min_not_met: "Kloter di bawah minimum",
  batch_cancelled: "Kloter dibatalkan admin",
  production_failed: "Gagal produksi",
  damaged_in_transit: "Rusak di perjalanan",
  delivery_failed: "Gagal antar dua kali",
  paid_after_cancel: "Dibayar setelah pesanan batal",
  admin: "Dibatalkan admin",
};

export const ALASAN_GAGAL_ANTAR = [
  { kode: "tidak_di_tempat", teks: "Tidak ada di tempat" },
  { kode: "tidak_bisa_dihubungi", teks: "Tidak bisa dihubungi" },
  { kode: "alamat_tidak_ditemukan", teks: "Alamat tidak ditemukan" },
  { kode: "ditolak", teks: "Ditolak penerima" },
] as const;

export const KATEGORI = [
  { kode: "ikan", teks: "Ikan" },
  { kode: "kepala", teks: "Kepala" },
  { kode: "jeroan", teks: "Jeroan" },
  { kode: "telur", teks: "Telur" },
  { kode: "pendamping", teks: "Pendamping" },
] as const;

export const SATUAN = [
  { kode: "ekor", teks: "Ekor" },
  { kode: "pack_irisan", teks: "Pack irisan" },
  { kode: "bungkus", teks: "Bungkus" },
] as const;

export function teksSatuan(kode: string): string {
  return SATUAN.find((s) => s.kode === kode)?.teks.toLowerCase() ?? kode;
}

export type ItemPesanan = { nama: string; satuan: string; jumlah: number };

/** Kolom `item` dari fungsi admin berupa jsonb. Bentuk lain diabaikan, bukan dibiarkan merusak layar. */
export function bacaItem(nilai: unknown): ItemPesanan[] {
  if (!Array.isArray(nilai)) return [];
  return nilai.flatMap((i) =>
    i && typeof i === "object" && typeof i.nama === "string" && typeof i.jumlah === "number"
      ? [{ nama: i.nama, satuan: typeof i.satuan === "string" ? i.satuan : "", jumlah: i.jumlah }]
      : [],
  );
}

export function ringkasItem(item: ItemPesanan[]): string {
  return item.map((i) => `${i.nama} ${i.jumlah} ${teksSatuan(i.satuan)}`).join(", ");
}
