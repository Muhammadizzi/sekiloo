/**
 * ⚠️ DATA PLACEHOLDER — WAJIB DIGANTI SEBELUM TAYANG.
 *
 * Nomor di bawah bukan nomor asli. Selama masih seperti ini, tombol
 * WhatsApp akan membuka percakapan ke nomor yang tidak ada.
 *
 * Format wa.me: kode negara tanpa "+" dan tanpa "0" di depan.
 * Contoh: 0812-3456-7890 ditulis "6281234567890".
 */
export const NOMOR_WHATSAPP = "6280000000000";

/** Susun tautan WhatsApp beserta pesan yang sudah terisi. */
export function tautanWhatsApp(pesan: string): string {
  return `https://wa.me/${NOMOR_WHATSAPP}?text=${encodeURIComponent(pesan)}`;
}
