/**
 * Isi setelah data sertifikat halal asli ada (PRD Bagian 23 no. 13).
 * Selama `null`, header, footer, beranda, dan FAQ tidak menampilkan klaim halal sama sekali:
 * klaim tanpa nomor yang bisa dicek pembeli lebih merugikan daripada tidak ada klaim.
 */
export type SertifikatHalal = {
  nomor: string;
  /** Lembaga penerbit, mis. "BPJPH". */
  lembaga: string;
  /** Tanggal terbit, ditulis seperti di sertifikat. */
  terbit: string;
  /** Masa berlaku seperti tertulis di sertifikat. Kosongkan kalau sertifikat tidak mencantumkannya. */
  berlaku: string | null;
  /** Foto atau scan sertifikat di folder public/, mis. "/halal/sertifikat.webp". */
  scan: string | null;
};

export const SERTIFIKAT_HALAL: SertifikatHalal | null = null;

// Lewat fungsi karena TypeScript mempersempit konstanta `null` di file yang sama menjadi tipe `never`.
function nomorDari(s: SertifikatHalal | null): string | null {
  return s?.nomor ?? null;
}

export const NOMOR_SERTIFIKAT_HALAL = nomorDari(SERTIFIKAT_HALAL);

/** Halaman pencarian sertifikat resmi BPJPH. Pembeli memasukkan nomor sertifikat di sana. */
export const URL_CEK_HALAL = "https://bpjph.halal.go.id/cari/sertifikat";
