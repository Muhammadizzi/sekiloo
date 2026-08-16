import type { Product } from "@/types/product";

/* ==========================================================================
   ⚠️⚠️  DATA PLACEHOLDER — SELURUH ISI FILE INI KARANGAN.  ⚠️⚠️
   ==========================================================================

   File ini ada supaya halaman detail produk bisa dibangun dan ditinjau
   sebelum data asli siap. JANGAN tayang dengan isi seperti ini.

   Yang WAJIB diganti sebelum situs dibuka untuk umum:

   1. NOMOR SERTIFIKAT HALAL. Nomor di bawah bukan nomor asli. Menampilkan
      nomor sertifikat karangan bukan sekadar salah — ia justru merusak
      hal yang paling ingin dibangun web ini, karena pembeli yang paling
      ragu adalah pembeli yang paling rajin mengecek nomornya.
   2. ANGKA GIZI / MANFAAT. Poin manfaat di bawah sengaja ditulis hati-hati:
      tidak ada satu pun klaim medis, klaim penyembuhan, atau angka gizi
      pasti. Kalau nanti mau mencantumkan angka (protein X g, omega-3 Y mg),
      angka itu harus datang dari HASIL UJI LAB produk ini sendiri, lalu
      diisikan ke field `sumber` pada tiap poin manfaat.
      Jangan menyalin angka dari internet.
   3. MASA SIMPAN & SUHU. Angka masa simpan harus berasal dari uji
      ketahanan produk, bukan perkiraan. Ini informasi keamanan pangan;
      salah menulisnya bisa membuat orang sakit.
   4. HARGA & STOK per zona. Ganti dengan angka jual sebenarnya.
   5. FOTO. `url` masih kosong, jadi galeri menampilkan placeholder.

   Saat data pindah ke Supabase, file ini diganti pemanggilan query —
   fungsi `getProductBySlug` di bawah adalah satu-satunya pintu yang
   dipakai halaman, jadi cukup isi ulang bagian dalamnya.
   ========================================================================== */

const PATIN_ASAP: Product = {
  id: "prd-0001",
  slug: "ikan-patin-asap",
  nama: "Ikan Patin Asap",
  ukuranKemasan: "500 g (± 2 potong) — kemasan vakum",

  deskripsiSingkat:
    "Patin segar yang diasap perlahan dengan kayu, lalu dikemas vakum hari itu juga.",

  deskripsi:
    "Ikan patin dipilih dalam kondisi segar, dibersihkan pada hari yang sama, " +
    "lalu diasap perlahan sampai dagingnya padat dan aromanya masuk sampai ke dalam. " +
    "Tidak digoreng dan tidak diberi pengawet tambahan — rasa asap dan garamlah yang " +
    "bekerja. Setelah dingin, ikan langsung dikemas vakum supaya kondisinya terjaga " +
    "sampai diambil.",

  /* Foto masih kosong → galeri otomatis memakai placeholder.
     `alt` sudah ditulis lengkap sekarang supaya saat foto asli masuk,
     yang perlu diisi tinggal `url`-nya saja. */
  foto: [
    {
      url: "",
      alt: "Satu kemasan Ikan Patin Asap dilihat dari depan",
      keterangan: "Tampak keseluruhan",
    },
    {
      url: "",
      alt: "Potongan Ikan Patin Asap yang dibelah memperlihatkan serat dagingnya",
      keterangan: "Tekstur daging",
    },
    {
      url: "",
      alt: "Ikan Patin Asap di dalam kemasan vakum bening berlabel",
      keterangan: "Kemasan vakum",
    },
    {
      url: "",
      alt: "Ikan sedang diasap di atas rak dalam ruang pengasapan",
      keterangan: "Proses pengasapan",
    },
  ],

  /* MANFAAT — perhatikan cara penulisannya.

     Setiap poin di bawah adalah salah satu dari dua jenis:
     (a) keterangan PROSES yang bisa dibuktikan sendiri oleh produsen, atau
     (b) pernyataan gizi umum yang DITULIS BERHATI-HATI dan jujur
         menyebut bahwa angkanya belum diuji untuk produk ini.

     Yang sengaja TIDAK ditulis: "menyehatkan jantung", "mencerdaskan otak",
     "meningkatkan imun", "cocok untuk program diet". Semua itu klaim
     kesehatan/medis. Untuk produk pangan, klaim seperti itu tanpa dasar
     bisa menyesatkan pembeli dan berisiko melanggar aturan label pangan. */
  manfaat: [
    {
      judul: "Sumber protein hewani",
      keterangan:
        "Ikan termasuk bahan pangan sumber protein hewani. Kandungan protein per " +
        "takaran saji untuk produk ini belum diuji, jadi angkanya belum bisa " +
        "dicantumkan.",
      // sumber: diisi setelah ada hasil uji lab produk ini.
    },
    {
      judul: "Mengandung lemak omega-3",
      keterangan:
        "Ikan berlemak secara umum mengandung asam lemak omega-3. Kadar untuk " +
        "batch produk ini belum diuji laboratorium.",
      // sumber: diisi setelah ada hasil uji lab produk ini.
    },
    {
      judul: "Diasap, bukan digoreng",
      keterangan:
        "Proses pengasapan tidak menambahkan minyak goreng. Ini keterangan cara " +
        "olah, dan bisa kami buktikan sendiri.",
      sumber: "Proses produksi sendiri",
    },
    {
      judul: "Tanpa pengawet tambahan",
      keterangan:
        "Keawetan datang dari pengasapan, penggaraman, dan penyimpanan dingin — " +
        "bukan dari bahan pengawet yang ditambahkan.",
      sumber: "Proses produksi sendiri",
    },
  ],

  halal: {
    /* ⚠️ NOMOR KARANGAN. Ganti dengan nomor pada sertifikat asli. */
    nomorSertifikat: "ID00000000000000000",
    lembagaPenerbit: "BPJPH (menunggu data asli)",
    berlakuHingga: "menunggu data asli",
    // urlSertifikat: isi dengan scan sertifikat setelah tersedia.
  },

  /* HARGA & STOK PER ZONA.

     Cukup dua baris untuk tiga titik ambil, dan itu memang inti
     keputusannya: Pasar dan Rumah Produksi TIDAK punya angka sendiri —
     keduanya membaca baris `reguler` yang sama, jadi harganya tidak
     mungkin melenceng satu sama lain, dan stoknya tidak mungkin
     terhitung dua kali.

     Cikarang berdiri sendiri: harganya selalu lebih tinggi (aturan
     bisnis, diperiksa oleh `periksaAturanZona` di bawah) dan stoknya
     tumpukan terpisah. */
  zona: {
    reguler: {
      harga: 44000,
      stok: 12,
    },
    cikarang: {
      harga: 52000,
      /* Sengaja dibuat di bawah ambang stok menipis, supaya saat ditinjau
         terlihat jelas bahwa indikator stok ikut berubah — bukan cuma
         angkanya, tapi juga statusnya — begitu lokasi Cikarang dipilih. */
      stok: 4,
      alasan: "Termasuk biaya angkut ke titik ambil Cikarang.",
    },
  },

  satuanStok: "pack",
  ambangStokMenipis: 5,

  pengasapan: {
    jenisKayu: "Kayu (jenis menyusul)",
    suhu: "Suhu terkendali (angka menyusul)",
    durasi: "Durasi menyusul",
    langkah: [
      "Ikan diterima segar dan langsung dibersihkan pada hari yang sama.",
      "Direndam larutan garam dengan takaran tetap untuk tiap batch.",
      "Diasap pada suhu terkendali sampai matang merata sampai ke bagian dalam.",
      "Didinginkan lebih dulu sebelum dikemas, supaya tidak ada uap terperangkap.",
      "Dikemas vakum dan dicatat tanggal produksinya per batch.",
    ],
  },

  penyimpanan: {
    suhuKulkas: "0 – 4 °C",
    suhuFreezer: "−18 °C",
    /* ⚠️ Angka masa simpan di bawah PERKIRAAN, belum diuji. */
    masaSimpanSuhuRuang: "maks. 8 jam",
    masaSimpanKulkas: "3 – 4 hari",
    masaSimpanFreezer: "1 – 2 bulan",
    catatan: [
      "Setelah kemasan vakum dibuka, simpan di kulkas dan habiskan dalam 2 hari.",
      "Ikan beku sebaiknya dicairkan di kulkas, bukan direndam air hangat.",
      "Jangan dibekukan ulang setelah sempat mencair sepenuhnya.",
    ],
  },
};

/** Semua produk. Untuk sekarang baru satu — sesuai permintaan. */
export const PRODUK: Product[] = [PATIN_ASAP];

/* ==========================================================================
   PENJAGA ATURAN BISNIS
   ========================================================================== */

/**
 * Periksa aturan zona yang tidak bisa dijamin oleh TypeScript.
 *
 * TypeScript sudah menjamin tiap produk PUNYA harga & stok untuk kedua
 * zona (lihat `ZonaProduk` yang berupa Record, bukan array). Yang tidak
 * bisa dijaminnya adalah aturan tentang NILAI:
 *
 *   - harga Cikarang selalu LEBIH TINGGI dari harga reguler, dan
 *   - selisih itu selalu punya alasan yang bisa dibaca pembeli.
 *
 * Fungsi ini mengembalikan daftar pelanggaran, bukan melempar error.
 * Alasannya: nanti angka-angka ini datang dari input admin lewat
 * Supabase, dan satu salah ketik tidak boleh membuat seluruh halaman
 * produk mati. Cukup dicatat keras di log agar cepat ketahuan.
 */
export function periksaAturanZona(product: Product): string[] {
  const masalah: string[] = [];
  const { reguler, cikarang } = product.zona;

  if (cikarang.harga <= reguler.harga) {
    masalah.push(
      `Harga Cikarang (${cikarang.harga}) harus lebih tinggi dari harga reguler (${reguler.harga}).`,
    );
  }

  if (!cikarang.alasan?.trim()) {
    masalah.push(
      "Harga Cikarang berbeda tapi belum ada `alasan`. Selisih harga tanpa penjelasan terbaca sewenang-wenang oleh pembeli.",
    );
  }

  return masalah;
}

/**
 * Satu-satunya pintu pengambilan produk yang dipakai halaman.
 *
 * Dibuat async sejak awal walaupun sekarang datanya dari memori, supaya
 * saat sumbernya berganti jadi query Supabase, tanda tangan fungsinya
 * tidak berubah dan halaman tidak perlu disentuh.
 */
export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const produk = PRODUK.find((item) => item.slug === slug);

  /* Pemeriksaan hanya saat pengembangan: di produksi ia cuma jadi beban
     tanpa ada yang membaca hasilnya. */
  if (produk && process.env.NODE_ENV !== "production") {
    for (const masalah of periksaAturanZona(produk)) {
      console.warn(`[sekiloo] Aturan zona dilanggar pada "${produk.slug}": ${masalah}`);
    }
  }

  return produk;
}

/** Dipakai `generateStaticParams` untuk pra-render halaman detail. */
export async function getAllProductSlugs(): Promise<string[]> {
  return PRODUK.map((produk) => produk.slug);
}
