/**
 * Data halaman Halal & Keamanan Pangan (PRD Bagian 11.3 dan 15).
 *
 * Semua yang bernilai `null` belum ada datanya, dan halaman menampilkan catatan untuk pemilik
 * sebagai gantinya. Angka suhu dan masa simpan hanya boleh diisi dari hasil uji ketahanan produk,
 * bukan perkiraan: salah menulisnya bisa membuat orang sakit.
 */

/** PIRT atau izin edar BPOM (PRD 23 no. 14). */
export const IZIN_EDAR: { jenis: string; nomor: string } | null = null;

/** Detail pengasapan dari dapur (PRD 15, "proses produksi"). */
export const PROSES_ASAP: {
  jenisKayu: string | null;
  suhu: string | null;
  durasi: string | null;
} = {
  jenisKayu: null,
  suhu: null,
  durasi: null,
};

export type CaraSimpan = {
  tempat: string;
  /** Mis. "di bawah 5°C". */
  suhu: string | null;
  /** Mis. "3 hari". */
  tahan: string | null;
};

/** Hasil uji ketahanan produk (PRD 23 no. 15). */
export const CARA_SIMPAN: CaraSimpan[] = [
  { tempat: "Freezer", suhu: null, tahan: null },
  { tempat: "Kulkas", suhu: null, tahan: null },
  { tempat: "Suhu ruang", suhu: null, tahan: null },
  { tempat: "Setelah kemasan dibuka", suhu: null, tahan: null },
];

/** Rantai dingin (PRD 11.3). */
export const RANTAI_DINGIN: {
  /** Durasi maksimum perjalanan desa ke Cikarang dalam cool box. */
  lamaPerjalanan: string | null;
  /** Batas maksimum di luar pendingin saat diantar. */
  batasLuarPendingin: string | null;
} = {
  lamaPerjalanan: null,
  batasLuarPendingin: null,
};

export const caraSimpanLengkap = CARA_SIMPAN.every((c) => c.suhu !== null && c.tahan !== null);
