import type {
  CaraJual,
  InfoCaraJual,
  Kategori,
  KategoriId,
} from "@/types/product";

/**
 * KATEGORI PRODUK & PEMBAGIAN CARA JUAL.
 *
 * Nama kategori dan kalimat penjelasnya ditulis SEKALI di sini, lalu
 * dipakai oleh judul bagian di katalog, chip pintasan, dan penanda di
 * halaman detail. Alasannya sama dengan alasan daftar lokasi tidak
 * ditulis ulang di footer: begitu satu nama ditulis di dua tempat,
 * cepat atau lambat keduanya berbeda.
 *
 * Nanti di Supabase ini jadi tabel `categories` (id, nama, urutan).
 * Sampai saat itu, bentuknya sudah sengaja mirip: satu baris per
 * kategori, plus urutan tampil yang eksplisit.
 */

/* ==========================================================================
   KATEGORI
   ==========================================================================

   Sengaja `Record<KategoriId, …>`, bukan array — sama persis dengan
   alasan `ZonaProduk` berupa Record: kalau nanti ada kategori baru
   ditambahkan ke `KategoriId`, kompilator langsung menolak file ini
   sampai kategori itu diberi nama dan keterangan. Kategori tanpa judul
   tidak akan pernah diam-diam muncul sebagai bagian kosong di katalog.
   ========================================================================== */
export const KATEGORI: Record<KategoriId, Kategori> = {
  ikan: {
    id: "ikan",
    nama: "Ikan Asap",
    namaSingkat: "Ikan",
    keterangan:
      "Ikan utuh maupun potongan, semuanya diasap dan dikemas pada hari yang sama.",
  },
  kepala: {
    id: "kepala",
    nama: "Kepala Ikan Asap",
    namaSingkat: "Kepala",
    keterangan:
      "Bagian kepala yang paling dicari untuk gulai dan sup. Dijual terpisah supaya tidak terbuang.",
  },
  jeroan: {
    id: "jeroan",
    nama: "Jeroan Ikan Asap",
    namaSingkat: "Jeroan",
    keterangan:
      "Dibersihkan menyeluruh sebelum diasap. Porsi kecil, jadi bisa dicoba dulu sebelum beli banyak.",
  },
  telur: {
    id: "telur",
    nama: "Telur Ikan Asap",
    namaSingkat: "Telur",
    keterangan:
      "Jumlahnya mengikuti musim bertelur, jadi tidak selalu tersedia sepanjang tahun.",
  },
};

/**
 * URUTAN TAMPIL kategori di katalog.
 *
 * Ditulis terpisah dari `KATEGORI` karena urutan objek di JavaScript
 * bukan sesuatu yang pantas diandalkan sebagai keputusan produk —
 * urutan di sini adalah keputusan produk: 'ikan' duluan karena itu
 * yang dicari orang, tiga turunannya menyusul.
 *
 * Kelengkapannya diperiksa oleh `periksaUrutanKategori()` di bawah.
 */
export const URUTAN_KATEGORI: KategoriId[] = [
  "ikan",
  "kepala",
  "jeroan",
  "telur",
];

/* ==========================================================================
   CARA JUAL — KHUSUS KATEGORI 'IKAN'
   ==========================================================================

   Tipe `Product` sudah menjamin pembagian ini tidak bisa dipakai di
   kategori lain (lihat src/types/product.ts). Yang ada di sini murni
   kata-katanya: bagaimana pembagian itu dijelaskan ke pembeli.

   Kalimatnya sengaja menyebut AKIBATNYA bagi pembeli ("dapat berapa"),
   bukan cuma istilahnya. "Potongan" dan "satuan" adalah bahasa penjual;
   yang ingin diketahui pembeli adalah ia membawa pulang apa.
   ========================================================================== */
export const CARA_JUAL: Record<CaraJual, InfoCaraJual> = {
  potongan: {
    id: "potongan",
    nama: "Dijual per potongan",
    penanda: "Potongan",
    keterangan:
      "Sudah dipotong dan dikemas per pack, tinggal masak. Harganya per pack, bukan per kilo.",
  },
  satuan: {
    id: "satuan",
    nama: "Dijual utuh, per ekor",
    penanda: "Utuh / per ekor",
    keterangan:
      "Satu ikan utuh sudah dibersihkan. Harganya per ekor, bukan per kilo, jadi tidak ada selisih timbangan saat mengambil.",
  },
};

/** Urutan sub-bagian di dalam kategori Ikan. */
export const URUTAN_CARA_JUAL: CaraJual[] = ["potongan", "satuan"];

/* ==========================================================================
   PENJAGA
   ========================================================================== */

/**
 * Pastikan `URUTAN_KATEGORI` memuat setiap kategori tepat satu kali.
 *
 * TypeScript menjamin `KATEGORI` lengkap, tapi tidak bisa menjamin isi
 * sebuah array biasa. Yang terjadi kalau ini luput: satu kategori punya
 * produk, punya nama, tapi bagiannya tidak pernah muncul di katalog —
 * dan tidak ada pesan error apa pun yang menandainya.
 *
 * Mengembalikan daftar masalah, bukan melempar error, mengikuti pola
 * `periksaAturanZona`: satu salah ketik tidak boleh mematikan seluruh
 * halaman katalog.
 */
export function periksaUrutanKategori(): string[] {
  const masalah: string[] = [];
  const semuaId = Object.keys(KATEGORI) as KategoriId[];

  for (const id of semuaId) {
    const jumlah = URUTAN_KATEGORI.filter((item) => item === id).length;
    if (jumlah === 0) {
      masalah.push(
        `Kategori "${id}" tidak ada di URUTAN_KATEGORI, jadi bagiannya tidak akan pernah tampil di katalog.`,
      );
    } else if (jumlah > 1) {
      masalah.push(
        `Kategori "${id}" ditulis ${jumlah} kali di URUTAN_KATEGORI, jadi bagiannya akan tampil berulang.`,
      );
    }
  }

  return masalah;
}
