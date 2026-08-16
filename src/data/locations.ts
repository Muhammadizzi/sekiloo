import type { Lokasi, LokasiId, Zona, ZonaId } from "@/types/product";

/**
 * ZONA HARGA & STOK + LOKASI PENGAMBILAN.
 *
 * Ini satu-satunya tempat pemetaan lokasi → zona ditulis. Kalau nanti
 * ada titik ambil baru, cukup tambahkan di `LOKASI` dan tentukan
 * zonanya di situ — tidak ada tempat lain yang perlu disentuh, dan
 * harga produk tidak perlu diubah sama sekali.
 *
 * ⚠️ Ingat: "zona" di sini urusan BISNIS (harga & stok), bukan zona
 * warna gelap/terang yang dipakai di CSS dan komponen tampilan.
 */

/* ==========================================================================
   ZONA
   ========================================================================== */
export const ZONA: Record<ZonaId, Zona> = {
  reguler: { id: "reguler", nama: "Reguler" },
  cikarang: { id: "cikarang", nama: "Cikarang" },
};

export function getZona(id: ZonaId): Zona {
  return ZONA[id];
}

/* ==========================================================================
   LOKASI
   ==========================================================================

   ⚠️ DATA PLACEHOLDER — WAJIB DIGANTI SEBELUM TAYANG.

   Alamat dan jam operasional di bawah ini KARANGAN. Ganti dengan data
   asli sebelum situs dibuka untuk umum: pembeli yang datang ke alamat
   salah akan kehilangan kepercayaan, dan kepercayaan itulah satu-satunya
   alasan web ini dibuat (PRD bagian 1).

   Yang BUKAN placeholder adalah kolom `zonaId` — itu keputusan bisnis
   yang sudah final, bukan tebakan.

   URUTAN ARRAY INI PENTING: urutan tampilnya di pemilih lokasi mengikuti
   urutan di sini, dan lokasi pertama jadi pilihan awal.
   ========================================================================== */
export const LOKASI: Lokasi[] = [
  {
    id: "pasar",
    nama: "Pasar",
    alamat: "Nama & alamat pasar menyusul",
    jamOperasional: "06.00 – 14.00",
    keterangan: "Lapak harian, paling ramai pagi hari.",
    zonaId: "reguler",
  },
  {
    id: "rumah-produksi",
    nama: "Rumah Produksi",
    alamat: "Alamat rumah produksi menyusul",
    jamOperasional: "08.00 – 17.00",
    keterangan: "Ambil langsung dari dapur pengasapan.",
    zonaId: "reguler",
  },
  {
    id: "cikarang",
    nama: "Cikarang",
    alamat: "Titik ambil di Cikarang menyusul",
    jamOperasional: "09.00 – 17.00",
    keterangan: "Titik ambil terjauh, jadwal kirim terbatas.",
    zonaId: "cikarang",
  },
];

/** Cari satu lokasi berdasarkan id. */
export function getLokasi(id: LokasiId): Lokasi | undefined {
  return LOKASI.find((lokasi) => lokasi.id === id);
}

/** Semua lokasi yang memakai zona tertentu. */
export function lokasiDalamZona(zonaId: ZonaId): Lokasi[] {
  return LOKASI.filter((lokasi) => lokasi.zonaId === zonaId);
}

/* ==========================================================================
   KALIMAT PENJELAS — DITURUNKAN DARI DATA, BUKAN DITULIS TANGAN
   ==========================================================================

   Pembeli perlu diberi tahu bahwa Pasar & Rumah Produksi berbagi harga
   dan stok. Kalimat itu bisa saja ditulis tetap di satu tempat, tapi
   begitu ada titik ambil baru masuk zona reguler, kalimatnya jadi salah
   tanpa ada yang menyadari — dan salahnya justru di bagian yang membuat
   pembeli percaya angka yang ia lihat.

   Karena itu kalimatnya disusun dari daftar lokasi. Tambah atau pindahkan
   lokasi, kalimatnya ikut benar dengan sendirinya.
   ========================================================================== */

/** ["Pasar", "Rumah Produksi"] → "Pasar dan Rumah Produksi" */
function gabungNama(nama: string[]): string {
  if (nama.length <= 1) return nama[0] ?? "";
  return `${nama.slice(0, -1).join(", ")} dan ${nama[nama.length - 1]}`;
}

/** Penjelasan kenapa harga zona ini seperti itu. */
export function kalimatHargaZona(zonaId: ZonaId): string {
  const nama = lokasiDalamZona(zonaId).map((lokasi) => lokasi.nama);
  return nama.length > 1
    ? `Harga ini sama untuk ${gabungNama(nama)}.`
    : `Harga khusus titik ambil ${gabungNama(nama)}.`;
}

/** Penjelasan angka stok zona ini: dipakai bersama, atau berdiri sendiri. */
export function kalimatStokZona(zonaId: ZonaId): string {
  const nama = lokasiDalamZona(zonaId).map((lokasi) => lokasi.nama);
  return nama.length > 1
    ? `Stok ini dipakai bersama ${gabungNama(nama)} — bukan tumpukan terpisah di tiap titik.`
    : `Stok khusus titik ambil ${gabungNama(nama)}, terpisah dari titik ambil lain.`;
}
