/**
 * Penerjemah angka stok jadi status yang bisa dibaca manusia.
 *
 * Kenapa file ini berdiri sendiri, bukan tetap di dalam
 * `PembelianContext.tsx`: file itu bertanda `"use client"`. Semua yang
 * diekspor dari berkas ber-"use client" diperlakukan Next.js sebagai
 * referensi klien — mengimpornya ke komponen server (kartu di halaman
 * katalog adalah komponen server) akan gagal saat dijalankan, walaupun
 * isinya cuma fungsi murni tanpa hook sama sekali.
 *
 * Ditaruh di sini, satu fungsi yang sama dipakai oleh halaman katalog
 * DAN halaman detail. Itu yang penting: kalau ambang "menipis" pernah
 * diterjemahkan dua kali dengan kode berbeda, suatu saat kartu katalog
 * akan bilang "tersedia" sementara halaman detailnya bilang "menipis".
 */

export type NadaStok = "halal" | "warn" | "danger";

export type StatusStok = {
  /** Nada badge. Warna TIDAK PERNAH jadi satu-satunya penanda — teksnya ikut. */
  tone: NadaStok;
  /** Kalimat penuh untuk halaman detail, mis. "Stok menipis — sisa 4 pack". */
  teks: string;
  /** Versi pendek untuk kartu katalog yang sempit, mis. "Sisa 4 pack". */
  teksRingkas: string;
  bisaBeli: boolean;
};

/**
 * Hitung status stok SATU ZONA.
 *
 * `stok` selalu angka satu zona, bukan jumlah seluruh zona. Habis di
 * Pasar tidak berarti habis di Cikarang, dan menjumlahkan keduanya
 * akan menjanjikan barang yang tidak ada di titik ambil yang dipilih
 * pembeli.
 */
export function statusStok(
  stok: number,
  ambang: number,
  satuan: string,
): StatusStok {
  if (stok <= 0) {
    return {
      tone: "danger",
      teks: "Stok habis",
      teksRingkas: "Habis",
      bisaBeli: false,
    };
  }

  if (stok <= ambang) {
    return {
      tone: "warn",
      teks: `Stok menipis — sisa ${stok} ${satuan}`,
      teksRingkas: `Sisa ${stok} ${satuan}`,
      bisaBeli: true,
    };
  }

  return {
    tone: "halal",
    teks: `Tersedia — ${stok} ${satuan} siap ambil`,
    teksRingkas: "Tersedia",
    bisaBeli: true,
  };
}
