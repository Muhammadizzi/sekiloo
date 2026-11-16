import type {
  InfoHalal,
  InfoPengasapan,
  InfoPenyimpanan,
  Kategori,
  InfoCaraJual,
  Manfaat,
  Product,
  ProdukIkan,
} from "@/types/product";
import {
  CARA_JUAL,
  KATEGORI,
  URUTAN_CARA_JUAL,
  URUTAN_KATEGORI,
  periksaUrutanKategori,
} from "./kategori";

/* ==========================================================================
   ⚠️⚠️  DATA PLACEHOLDER — SELURUH ISI FILE INI KARANGAN.  ⚠️⚠️
   ==========================================================================

   File ini ada supaya katalog dan halaman detail bisa dibangun dan
   ditinjau sebelum data asli siap. JANGAN tayang dengan isi seperti ini.

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
   5. NAMA & JUMLAH PRODUK. Enam produk di bawah adalah contoh untuk
      menguji tampilan keempat kategori, bukan daftar jualan sungguhan.
   6. FOTO. `url` masih kosong, jadi galeri & kartu menampilkan placeholder.

   Saat data pindah ke Supabase, file ini diganti pemanggilan query —
   fungsi getter di bagian bawah adalah satu-satunya pintu yang dipakai
   halaman, jadi cukup isi ulang bagian dalamnya.
   ========================================================================== */

/* ==========================================================================
   BLOK YANG DIPAKAI BERSAMA
   ==========================================================================

   Sertifikat, proses pengasapan, dan aturan penyimpanan sama untuk
   semua produk karena semuanya keluar dari satu dapur pengasapan.
   Ditulis sekali di sini, bukan disalin enam kali.

   ⚠️ Saat data asli masuk, periksa asumsi itu lagi. Masa simpan jeroan
   dan telur ikan sangat mungkin BERBEDA dari ikan utuh. Kalau ternyata
   berbeda, pindahkan blok penyimpanan ke masing-masing produk — jangan
   dipaksa seragam hanya karena di sini kebetulan sudah seragam.
   ========================================================================== */

/* ⚠️ NOMOR KARANGAN. Ganti dengan nomor pada sertifikat asli. */
const HALAL_PLACEHOLDER: InfoHalal = {
  nomorSertifikat: "ID00000000000000000",
  lembagaPenerbit: "BPJPH (menunggu data asli)",
  berlakuHingga: "menunggu data asli",
  // urlSertifikat: isi dengan scan sertifikat setelah tersedia.
};

const PENGASAPAN_PLACEHOLDER: InfoPengasapan = {
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
};

/* ⚠️ Angka masa simpan di bawah PERKIRAAN, belum diuji. */
const PENYIMPANAN_PLACEHOLDER: InfoPenyimpanan = {
  suhuKulkas: "0 – 4 °C",
  suhuFreezer: "−18 °C",
  masaSimpanSuhuRuang: "maks. 8 jam",
  masaSimpanKulkas: "3 – 4 hari",
  masaSimpanFreezer: "1 – 2 bulan",
  catatan: [
    "Setelah kemasan vakum dibuka, simpan di kulkas dan habiskan dalam 2 hari.",
    "Ikan beku sebaiknya dicairkan di kulkas, bukan direndam air hangat.",
    "Jangan dibekukan ulang setelah sempat mencair sepenuhnya.",
  ],
};

/* MANFAAT — perhatikan cara penulisannya.

   Setiap poin di bawah adalah salah satu dari dua jenis:
   (a) keterangan PROSES yang bisa dibuktikan sendiri oleh produsen, atau
   (b) pernyataan gizi umum yang DITULIS BERHATI-HATI dan jujur
       menyebut bahwa angkanya belum diuji untuk produk ini.

   Yang sengaja TIDAK ditulis: "menyehatkan jantung", "mencerdaskan otak",
   "meningkatkan imun", "cocok untuk program diet". Semua itu klaim
   kesehatan/medis. Untuk produk pangan, klaim seperti itu tanpa dasar
   bisa menyesatkan pembeli dan berisiko melanggar aturan label pangan. */

/** Poin proses — bisa dibuktikan sendiri, jadi boleh punya `sumber`. */
const MANFAAT_PROSES: Manfaat[] = [
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
      "Keawetan datang dari pengasapan, penggaraman, dan penyimpanan dingin, " +
      "bukan dari bahan pengawet yang ditambahkan.",
    sumber: "Proses produksi sendiri",
  },
];

/** Poin gizi umum — TANPA angka, dan jujur menyebut belum diuji. */
const MANFAAT_GIZI_UMUM: Manfaat[] = [
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
];

const MANFAAT_IKAN = [...MANFAAT_GIZI_UMUM, ...MANFAAT_PROSES];

/* ==========================================================================
   KATEGORI: IKAN — cara jual 'potongan'
   ========================================================================== */

const PATIN_ASAP: Product = {
  id: "prd-0001",
  slug: "ikan-patin-asap",
  nama: "Ikan Patin Asap",
  kategori: "ikan",
  caraJual: "potongan",
  satuan: "pack",
  ukuranKemasan: "500 g (± 2 potong), kemasan vakum",

  deskripsiSingkat:
    "Patin segar yang diasap perlahan dengan kayu, lalu dikemas vakum hari itu juga.",

  deskripsi:
    "Ikan patin dipilih dalam kondisi segar, dibersihkan pada hari yang sama, " +
    "lalu diasap perlahan sampai dagingnya padat dan aromanya masuk sampai ke dalam. " +
    "Tidak digoreng dan tidak diberi pengawet tambahan: rasa asap dan garamlah yang " +
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

  manfaat: MANFAAT_IKAN,
  halal: HALAL_PLACEHOLDER,

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

  ambangStokMenipis: 5,

  pengasapan: PENGASAPAN_PLACEHOLDER,
  penyimpanan: PENYIMPANAN_PLACEHOLDER,
};

const LELE_ASAP: Product = {
  id: "prd-0002",
  slug: "ikan-lele-asap",
  nama: "Ikan Lele Asap",
  kategori: "ikan",
  caraJual: "potongan",
  satuan: "pack",
  ukuranKemasan: "400 g (± 3 potong), kemasan vakum",

  deskripsiSingkat:
    "Potongan lele asap dengan daging yang lebih padat, cocok untuk dimasak berbumbu.",

  deskripsi:
    "Lele dibersihkan menyeluruh lalu diasap sampai kadar airnya turun, sehingga " +
    "dagingnya terasa lebih padat dan tidak mudah hancur saat dimasak berbumbu. " +
    "Dipotong dulu sebelum dikemas supaya langsung bisa masuk wajan tanpa perlu " +
    "dipotong lagi di rumah.",

  foto: [
    {
      url: "",
      alt: "Satu kemasan Ikan Lele Asap dilihat dari depan",
      keterangan: "Tampak keseluruhan",
    },
    {
      url: "",
      alt: "Tiga potong Ikan Lele Asap ditata berjajar di atas piring",
      keterangan: "Isi satu pack",
    },
    {
      url: "",
      alt: "Potongan Ikan Lele Asap di dalam kemasan vakum bening berlabel",
      keterangan: "Kemasan vakum",
    },
  ],

  manfaat: MANFAAT_IKAN,
  halal: HALAL_PLACEHOLDER,

  zona: {
    reguler: { harga: 32000, stok: 18 },
    cikarang: {
      harga: 39000,
      stok: 6,
      alasan: "Termasuk biaya angkut ke titik ambil Cikarang.",
    },
  },

  ambangStokMenipis: 5,

  pengasapan: PENGASAPAN_PLACEHOLDER,
  penyimpanan: PENYIMPANAN_PLACEHOLDER,
};

/* ==========================================================================
   KATEGORI: IKAN — cara jual 'satuan' (utuh, per ekor)
   ========================================================================== */

const BANDENG_ASAP_UTUH: Product = {
  id: "prd-0003",
  slug: "ikan-bandeng-asap-utuh",
  nama: "Ikan Bandeng Asap Utuh",
  kategori: "ikan",
  caraJual: "satuan",
  /* Karena `caraJual` di sini 'satuan', TypeScript hanya mengizinkan
     satu nilai untuk `satuan`: "ekor". Mencoba menulis "pack" di baris
     ini gagal kompilasi — dan memang seharusnya begitu, karena pembeli
     jadi tidak tahu ia dapat berapa ekor. */
  satuan: "ekor",
  ukuranKemasan: "1 ekor (± 450 g), kemasan vakum",

  deskripsiSingkat:
    "Bandeng utuh yang sudah dibersihkan, diasap utuh supaya bentuknya tetap rapi saat disajikan.",

  deskripsi:
    "Bandeng dipilih berukuran seragam, dibersihkan isi perutnya, lalu diasap dalam " +
    "keadaan utuh. Diasap utuh membuat dagingnya tetap menempel rapi di tulang, jadi " +
    "enak disajikan apa adanya di atas piring tanpa perlu dipotong-potong. " +
    "Harganya dihitung per ekor, bukan per kilo, jadi tidak ada selisih timbangan " +
    "saat pengambilan.",

  foto: [
    {
      url: "",
      alt: "Satu ekor Ikan Bandeng Asap utuh dilihat dari samping",
      keterangan: "Satu ekor utuh",
    },
    {
      url: "",
      alt: "Ikan Bandeng Asap utuh disajikan di atas piring saji",
      keterangan: "Saat disajikan",
    },
    {
      url: "",
      alt: "Ikan Bandeng Asap utuh di dalam kemasan vakum bening berlabel",
      keterangan: "Kemasan vakum",
    },
  ],

  manfaat: MANFAAT_IKAN,
  halal: HALAL_PLACEHOLDER,

  /* Stok reguler sengaja di bawah ambang menipis. Bersama Telur Ikan Asap
     yang habis di zona reguler, ini membuat KETIGA keadaan stok terlihat
     sekaligus di halaman katalog saat ditinjau: tersedia, menipis, habis.
     Tanpa itu, dua dari tiga keadaan itu tidak pernah benar-benar dilihat
     sebelum tayang. */
  zona: {
    reguler: { harga: 46000, stok: 3 },
    cikarang: {
      harga: 54000,
      stok: 6,
      alasan: "Termasuk biaya angkut ke titik ambil Cikarang.",
    },
  },

  ambangStokMenipis: 4,

  pengasapan: PENGASAPAN_PLACEHOLDER,
  penyimpanan: PENYIMPANAN_PLACEHOLDER,
};

/* ==========================================================================
   KATEGORI: KEPALA
   ========================================================================== */

const KEPALA_IKAN_ASAP: Product = {
  id: "prd-0004",
  slug: "kepala-ikan-asap",
  nama: "Kepala Ikan Asap",
  kategori: "kepala",
  /* Perhatikan: tidak ada `caraJual` di sini, dan memang tidak bisa ada.
     Kategori selain 'ikan' menolak field itu di tingkat kompilasi. */
  satuan: "pack",
  ukuranKemasan: "600 g (± 2 kepala), kemasan vakum",

  deskripsiSingkat:
    "Bagian kepala yang paling dicari untuk gulai dan sup, sudah diasap dan siap dimasak.",

  deskripsi:
    "Kepala ikan dibelah dan dibersihkan menyeluruh (insang dan sisa darah dibuang " +
    "lebih dulu), lalu diasap bersama batch yang sama dengan ikan utuh. Dijual " +
    "terpisah karena bagian ini justru yang paling dicari untuk gulai dan sup, " +
    "sekaligus supaya tidak ada bagian ikan yang terbuang.",

  foto: [
    {
      url: "",
      alt: "Dua kepala ikan asap ditata berdampingan di atas nampan",
      keterangan: "Isi satu pack",
    },
    {
      url: "",
      alt: "Kepala ikan asap dalam kemasan vakum bening berlabel",
      keterangan: "Kemasan vakum",
    },
  ],

  manfaat: [
    {
      judul: "Bagian yang biasanya terbuang",
      keterangan:
        "Menjual kepala secara terpisah membuat lebih sedikit bagian ikan yang " +
        "berakhir jadi sampah dapur.",
      sumber: "Proses produksi sendiri",
    },
    {
      judul: "Dibersihkan sebelum diasap",
      keterangan:
        "Insang dan sisa darah dibuang lebih dulu, karena bagian itulah yang " +
        "paling cepat membuat bau menyimpang.",
      sumber: "Proses produksi sendiri",
    },
    ...MANFAAT_PROSES,
  ],
  halal: HALAL_PLACEHOLDER,

  zona: {
    reguler: { harga: 28000, stok: 7 },
    cikarang: {
      harga: 34000,
      stok: 2,
      alasan: "Termasuk biaya angkut ke titik ambil Cikarang.",
    },
  },

  ambangStokMenipis: 4,

  pengasapan: PENGASAPAN_PLACEHOLDER,
  penyimpanan: PENYIMPANAN_PLACEHOLDER,
};

/* ==========================================================================
   KATEGORI: JEROAN
   ========================================================================== */

const JEROAN_IKAN_ASAP: Product = {
  id: "prd-0005",
  slug: "jeroan-ikan-asap",
  nama: "Jeroan Ikan Asap",
  kategori: "jeroan",
  satuan: "pack",
  ukuranKemasan: "250 g, kemasan vakum",

  deskripsiSingkat:
    "Porsi kecil, dibersihkan menyeluruh sebelum diasap. Cocok dicoba dulu sebelum beli banyak.",

  deskripsi:
    "Jeroan dipisahkan dan dibersihkan menyeluruh pada hari yang sama dengan ikannya " +
    "datang, lalu diasap dalam batch terpisah supaya aromanya tidak bercampur. " +
    "Dikemas dalam porsi kecil karena ini bagian yang biasanya dibeli sedikit-sedikit " +
    "untuk campuran masakan berbumbu.",

  foto: [
    {
      url: "",
      alt: "Jeroan ikan asap dalam porsi kecil di atas piring",
      keterangan: "Isi satu pack",
    },
    {
      url: "",
      alt: "Jeroan ikan asap dalam kemasan vakum bening berlabel",
      keterangan: "Kemasan vakum",
    },
  ],

  manfaat: [
    {
      judul: "Dibersihkan pada hari yang sama",
      keterangan:
        "Jeroan dipisahkan dan dibersihkan di hari ikannya datang, bukan ditunda " +
        "ke hari berikutnya.",
      sumber: "Proses produksi sendiri",
    },
    {
      judul: "Diasap dalam batch terpisah",
      keterangan:
        "Tidak dicampur dengan batch ikan utuh, supaya aromanya tidak berpindah " +
        "antar produk.",
      sumber: "Proses produksi sendiri",
    },
    ...MANFAAT_PROSES,
  ],
  halal: HALAL_PLACEHOLDER,

  zona: {
    reguler: { harga: 22000, stok: 14 },
    cikarang: {
      harga: 27000,
      stok: 5,
      alasan: "Termasuk biaya angkut ke titik ambil Cikarang.",
    },
  },

  ambangStokMenipis: 5,

  pengasapan: PENGASAPAN_PLACEHOLDER,
  penyimpanan: PENYIMPANAN_PLACEHOLDER,
};

/* ==========================================================================
   KATEGORI: TELUR
   ========================================================================== */

const TELUR_IKAN_ASAP: Product = {
  id: "prd-0006",
  slug: "telur-ikan-asap",
  nama: "Telur Ikan Asap",
  kategori: "telur",
  satuan: "pack",
  ukuranKemasan: "200 g, kemasan vakum",

  deskripsiSingkat:
    "Musiman, jumlahnya terbatas. Diasap lebih singkat supaya teksturnya tidak mengeras.",

  deskripsi:
    "Telur ikan hanya ada saat musim bertelur, jadi jumlahnya mengikuti musim dan " +
    "tidak selalu tersedia. Diasap lebih singkat dibanding daging ikan karena " +
    "teksturnya cepat mengeras kalau kelamaan kena asap.",

  foto: [
    {
      url: "",
      alt: "Telur ikan asap ditata di atas piring kecil",
      keterangan: "Isi satu pack",
    },
    {
      url: "",
      alt: "Telur ikan asap dalam kemasan vakum bening berlabel",
      keterangan: "Kemasan vakum",
    },
  ],

  manfaat: [
    {
      judul: "Mengikuti musim, bukan stok tetap",
      keterangan:
        "Telur ikan hanya diproduksi saat musim bertelur. Kalau stok kosong, itu " +
        "karena bahannya memang sedang tidak ada, bukan sedang ditahan.",
      sumber: "Proses produksi sendiri",
    },
    {
      judul: "Diasap lebih singkat",
      keterangan:
        "Durasi pengasapannya sengaja lebih pendek karena teksturnya cepat " +
        "mengeras kalau kelamaan.",
      sumber: "Proses produksi sendiri",
    },
    ...MANFAAT_PROSES,
  ],
  halal: HALAL_PLACEHOLDER,

  /* Sengaja HABIS di zona reguler tapi masih ada di Cikarang. Kondisi ini
     dipasang supaya saat ditinjau terlihat bahwa katalog tidak pernah
     menulis "habis" begitu saja: kartu produk ikut menyebut bahwa
     barangnya masih ada di titik ambil lain. Stok memang per zona —
     habis di satu tumpukan tidak berarti habis di tumpukan lain. */
  zona: {
    reguler: { harga: 35000, stok: 0 },
    cikarang: {
      harga: 42000,
      stok: 2,
      alasan: "Termasuk biaya angkut ke titik ambil Cikarang.",
    },
  },

  ambangStokMenipis: 4,

  pengasapan: PENGASAPAN_PLACEHOLDER,
  penyimpanan: PENYIMPANAN_PLACEHOLDER,
};

/**
 * Semua produk.
 *
 * Urutan di dalam array ini menentukan urutan kartu DI DALAM satu
 * bagian katalog. Urutan BAGIAN-nya sendiri ditentukan oleh
 * `URUTAN_KATEGORI` di src/data/kategori.ts.
 */
export const PRODUK: Product[] = [
  PATIN_ASAP,
  LELE_ASAP,
  BANDENG_ASAP_UTUH,
  KEPALA_IKAN_ASAP,
  JEROAN_IKAN_ASAP,
  TELUR_IKAN_ASAP,
];

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
 * Periksa hal-hal yang baru bisa ketahuan saat produk dilihat BERSAMA-SAMA.
 *
 * Slug ganda adalah contohnya: tiap produknya sendiri sah, tapi begitu
 * dua produk memakai slug yang sama, `/produk/{slug}` diam-diam hanya
 * pernah menampilkan yang pertama — dan produk kedua jadi tidak bisa
 * dibuka sama sekali tanpa satu pun pesan error.
 */
function periksaKumpulanProduk(daftar: Product[]): string[] {
  const masalah: string[] = [...periksaUrutanKategori()];
  const slugTerlihat = new Set<string>();
  const idTerlihat = new Set<string>();

  for (const produk of daftar) {
    if (slugTerlihat.has(produk.slug)) {
      masalah.push(
        `Slug "${produk.slug}" dipakai lebih dari satu produk. Hanya yang pertama yang bisa dibuka di /produk/${produk.slug}.`,
      );
    }
    slugTerlihat.add(produk.slug);

    if (idTerlihat.has(produk.id)) {
      masalah.push(`Id "${produk.id}" dipakai lebih dari satu produk.`);
    }
    idTerlihat.add(produk.id);
  }

  return masalah;
}

/** Catat pelanggaran aturan ke konsol — hanya saat pengembangan. */
function laporkan(konteks: string, masalah: string[]): void {
  /* Di produksi pemeriksaan ini cuma jadi beban tanpa ada yang membaca
     hasilnya. */
  if (process.env.NODE_ENV === "production") return;

  for (const satu of masalah) {
    console.warn(`[sekiloo] ${konteks}: ${satu}`);
  }
}

/* ==========================================================================
   GETTER — SATU-SATUNYA PINTU YANG DIPAKAI HALAMAN
   ==========================================================================

   Semuanya async sejak awal walaupun sekarang datanya dari memori,
   supaya saat sumbernya berganti jadi query Supabase, tanda tangan
   fungsinya tidak berubah dan halaman tidak perlu disentuh.
   ========================================================================== */

/** Semua produk, apa adanya, dalam urutan `PRODUK`. */
export async function getSemuaProduk(): Promise<Product[]> {
  laporkan("Kumpulan produk", periksaKumpulanProduk(PRODUK));
  return PRODUK;
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const produk = PRODUK.find((item) => item.slug === slug);

  if (produk) {
    laporkan(
      `Aturan zona dilanggar pada "${produk.slug}"`,
      periksaAturanZona(produk),
    );
  }

  return produk;
}

/** Dipakai `generateStaticParams` untuk pra-render halaman detail. */
export async function getAllProductSlugs(): Promise<string[]> {
  return PRODUK.map((produk) => produk.slug);
}

/* --------------------------------------------------------------------------
   KATALOG — PRODUK YANG SUDAH DIKELOMPOKKAN
   --------------------------------------------------------------------------

   Pengelompokan dikerjakan DI SINI, bukan di halaman. Halaman katalog
   tinggal merender apa yang diterimanya, dan sama sekali tidak tahu
   bahwa 'ikan' punya pembagian cara jual sementara kategori lain tidak.

   Kenapa itu penting: kalau aturan pengelompokan tinggal di JSX, ia
   akan disalin ke tempat lain begitu ada halaman kedua yang butuh
   daftar produk (mis. panel admin, atau hasil pencarian). Di sini, ia
   cuma ada satu.

   Di Supabase nanti ini jadi satu query `select` yang diurutkan menurut
   kategori, dan pengelompokannya tetap terjadi persis di fungsi ini.
   -------------------------------------------------------------------------- */

export type SubKelompokIkan = {
  info: InfoCaraJual;
  produk: ProdukIkan[];
};

export type KelompokKatalog = {
  kategori: Kategori;
  /** Semua produk kategori ini, sudah terurut. */
  produk: Product[];
  /**
   * Pembagian potongan/satuan. HANYA terisi untuk kategori 'ikan';
   * `undefined` untuk kategori lain — itulah tanda bagi tampilan bahwa
   * kategori ini tidak punya sub-bagian, bukan "kebetulan kosong".
   */
  subKelompok?: SubKelompokIkan[];
};

/**
 * Katalog lengkap: kategori berurutan, kategori kosong dibuang.
 *
 * Kategori tanpa produk sengaja TIDAK ditampilkan sebagai bagian
 * kosong. Bagian berjudul "Telur Ikan" yang isinya nihil terbaca
 * seperti halaman rusak, bukan seperti "sedang tidak ada stok".
 */
export async function getKatalog(): Promise<KelompokKatalog[]> {
  const semua = await getSemuaProduk();

  const kelompok = URUTAN_KATEGORI.map<KelompokKatalog>((id) => {
    if (id === "ikan") {
      /* Predikat tipe di sini bukan formalitas: ia yang membuat
         `produk.caraJual` di bawah terbaca sebagai field yang PASTI ada,
         karena hanya varian ikan yang punya field itu. */
      const ikan = semua.filter(
        (produk): produk is ProdukIkan => produk.kategori === "ikan",
      );

      return {
        kategori: KATEGORI.ikan,
        produk: ikan,
        subKelompok: URUTAN_CARA_JUAL.map((cara) => ({
          info: CARA_JUAL[cara],
          produk: ikan.filter((produk) => produk.caraJual === cara),
        })).filter((sub) => sub.produk.length > 0),
      };
    }

    return {
      kategori: KATEGORI[id],
      produk: semua.filter((produk) => produk.kategori === id),
    };
  });

  return kelompok.filter((satu) => satu.produk.length > 0);
}

/** Nama kategori satu produk — dipakai penanda di halaman detail. */
export function kategoriProduk(product: Product): Kategori {
  return KATEGORI[product.kategori];
}
