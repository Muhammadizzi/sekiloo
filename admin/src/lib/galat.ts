/**
 * Fungsi database menolak aksi dengan kode singkat (mis. `kloter_sudah_tutup`). Di sini kode itu
 * diubah jadi kalimat yang bisa langsung dipahami admin, termasuk apa yang perlu dilakukan.
 */
const PESAN: Record<string, string> = {
  bukan_admin_yang_berwenang: "Akun ini tidak berwenang untuk aksi ini, atau sesi 2FA sudah berakhir. Coba keluar lalu masuk lagi.",
  kloter_belum_tiba: "Alamat baru bisa dilihat setelah kloter ditandai tiba di Cikarang.",
  kapasitas_di_bawah_berat_terpakai: "Kapasitas tidak boleh lebih kecil dari berat pesanan yang sudah masuk.",
  kloter_sudah_tutup: "Jam tutup, kapasitas, dan berat maksimal tidak bisa diubah setelah PO tutup.",
  alasan_perubahan_jadwal_wajib: "Kloter ini sudah punya pesanan lunas. Tulis alasan perubahan jadwal yang baru (tidak boleh sama dengan alasan sebelumnya).",
  kloter_belum_siap_berangkat: "Kloter hanya bisa diberangkatkan setelah PO tutup.",
  kloter_belum_berangkat: "Kloter ini belum diberangkatkan dari desa.",
  alasan_wajib: "Alasan wajib diisi.",
  kloter_tidak_bisa_dibatalkan: "Kloter yang sudah berangkat tidak bisa dibatalkan. Batalkan per pesanan kalau barangnya rusak.",
  pesanan_tidak_ditemukan: "Pesanan tidak ditemukan.",
  pembatalan_tidak_diizinkan: "Pesanan dengan status ini tidak bisa dibatalkan dengan alasan itu.",
  refund_wajib: "Pembatalan dengan alasan ini wajib disertai refund.",
  pesanan_belum_diantar: "Pesanan ini belum berstatus sedang diantar.",
  alasan_gagal_antar_tidak_valid: "Pilih alasan gagal antar.",
  pesanan_tidak_bisa_diantar: "Pesanan ini tidak bisa diantar lagi. Antar ulang hanya boleh satu kali.",
  bukti_transfer_wajib: "Unggah foto bukti transfer dulu.",
  refund_tidak_ditemukan: "Refund ini tidak ditemukan atau sudah selesai.",
  po_batches_delivery_after_close: "Tanggal antar harus setelah tanggal tutup PO.",
  po_batches_max_order_check: "Berat maksimal per pesanan tidak boleh melebihi kapasitas kloter.",
  po_batches_one_open: "Masih ada kloter yang buka. Hanya boleh satu kloter buka dalam satu waktu.",
  po_batches_name_check: "Nama kloter 2 sampai 80 huruf.",
  products_active_requires_data: "Produk aktif wajib punya harga, berat isi, dan berat kemas.",
  products_ship_weight_check: "Berat kemas tidak boleh lebih kecil dari berat isi.",
  products_slug_key: "Slug ini sudah dipakai produk lain.",
  products_slug_check: "Slug hanya huruf kecil, angka, dan tanda hubung, mis. bandeng-asap.",
  products_name_check: "Nama produk 2 sampai 120 huruf.",
  service_areas_active_requires_fee: "Kecamatan aktif wajib punya ongkir.",
  service_areas_name_key: "Kecamatan dengan nama ini sudah ada.",
  service_areas_name_check: "Nama kecamatan 2 sampai 80 huruf.",
};

type GalatMentah = { message?: string; code?: string; details?: string | null } | null | undefined;

export function pesanGalat(galat: unknown): string {
  const g = (galat && typeof galat === "object" ? galat : { message: String(galat) }) as NonNullable<GalatMentah>;
  const teks = `${g.message ?? ""} ${g.details ?? ""}`;

  for (const [kode, pesan] of Object.entries(PESAN)) {
    if (teks.includes(kode)) return pesan;
  }
  if (/network request failed|failed to fetch|load failed|networkerror/i.test(teks)) {
    return "Tidak tersambung ke internet. Periksa sinyal lalu coba lagi.";
  }
  if (/jwt expired|invalid jwt|refresh token/i.test(teks)) {
    return "Sesi sudah berakhir. Keluar lalu masuk lagi.";
  }
  if (g.code === "42501" || /permission denied|row-level security/i.test(teks)) {
    return "Akun ini tidak berwenang untuk aksi ini.";
  }
  return "Terjadi kesalahan. Coba lagi sebentar lagi.";
}
