/**
 * Link halaman status bisa saja diteruskan ke orang lain, jadi nomor dan alamat hanya tampil sebagian (PRD 6.4).
 */

/** "6281234567890" → "0812****7890" */
export function samarkanNomor(nomor: string): string {
  const lokal = nomor.startsWith("62") ? `0${nomor.slice(2)}` : nomor;
  if (lokal.length <= 8) return "****";
  return `${lokal.slice(0, 4)}****${lokal.slice(-4)}`;
}

/** Hanya tiga kata pertama alamat, maksimal 24 huruf. Nomor rumah dan RT/RW tidak ikut tampil. */
export function samarkanAlamat(alamat: string): string {
  const awal = alamat.trim().split(/\s+/).slice(0, 3).join(" ").replace(/[,.;]+$/, "");
  return `${awal.length > 24 ? awal.slice(0, 24) : awal}…`;
}

/** Nama depan saja. */
export function namaDepan(nama: string): string {
  return nama.trim().split(/\s+/)[0] ?? "";
}
