/**
 * BENTUK DATA PRODUK
 * ==================
 *
 * Tipe di sini sengaja dibuat mendekati struktur tabel yang nanti dipakai
 * di Supabase, supaya saat data pindah ke sana, yang berubah cuma SUMBER
 * datanya — bukan bentuknya, dan bukan komponennya.
 *
 * Aturan yang dipegang di file ini:
 *
 * 1. Harga & stok disimpan per ZONA, bukan per lokasi. Lihat penjelasan
 *    panjang di bagian ZONA di bawah — inilah keputusan struktural
 *    terpenting di file ini.
 * 2. Uang disimpan sebagai bilangan bulat rupiah (45000), bukan string dan
 *    bukan pecahan. Pemformatan "Rp 45.000" urusan tampilan, bukan data.
 * 3. Semua yang berhubungan dengan klaim (gizi, halal, masa simpan) punya
 *    tempat khusus untuk sumber/rujukan. Klaim tanpa sumber adalah utang
 *    yang ditagih tepat saat pembeli paling teliti membaca.
 * 4. Aturan yang bisa dijamin kompilator, dijamin kompilator — bukan
 *    diserahkan ke kedisiplinan orang yang mengisi data. Lihat bagian
 *    KATEGORI & CARA JUAL di bawah untuk contoh terjelasnya.
 */

/* ==========================================================================
   ZONA HARGA & STOK
   ==========================================================================

   ⚠️ Jangan tertukar: kata "zona" di seluruh CSS dan komponen tampilan
   mengacu pada zona warna (gelap/terang). "Zona" di file ini adalah
   konsep BISNIS yang sama sekali berbeda — zona harga & stok.

   Keputusan bisnisnya:

     zona `reguler`  → Pasar + Rumah Produksi.
                       Harga SAMA di keduanya, dan keduanya mengambil dari
                       SATU tumpukan stok yang sama.
     zona `cikarang` → Titik ambil Cikarang.
                       Harga sendiri (selalu lebih tinggi), stok sendiri
                       yang terpisah.

   KENAPA HARGA DIKUNCI KE ZONA, BUKAN KE LOKASI:

   Kalau harga disimpan per lokasi (satu baris untuk Pasar, satu untuk
   Rumah Produksi), maka "harga Pasar dan Rumah Produksi selalu sama"
   cuma jadi kesepakatan lisan yang harus diingat manusia setiap kali
   memperbarui harga. Cepat atau lambat salah satunya lupa diperbarui,
   dan pembeli menemukan dua harga berbeda untuk barang yang sama.

   Dengan menyimpannya per zona, keduanya membaca angka yang PERSIS SAMA —
   melenceng bukan cuma tidak akan terjadi, tapi tidak mungkin terjadi.
   Hal yang sama berlaku untuk stok: satu tumpukan, satu angka.
   ========================================================================== */
export type ZonaId = "reguler" | "cikarang";

export interface Zona {
  id: ZonaId;
  /** Nama internal. TIDAK ditampilkan ke pembeli — ia hanya kenal nama titik ambil. */
  nama: string;
}

/* ---------------------------------------------------------------
   LOKASI PENGAMBILAN
   Tiga titik sesuai PRD. Lokasi tetap ada sebagai entitas sendiri
   karena alamat dan jam bukanya memang berbeda-beda — yang dibagi
   bersama hanya harga dan stok, lewat `zonaId`.
   --------------------------------------------------------------- */
export type LokasiId = "pasar" | "rumah-produksi" | "cikarang";

export interface Lokasi {
  id: LokasiId;
  nama: string;
  alamat: string;
  jamOperasional: string;
  /** Keterangan singkat yang membantu pembeli memilih, mis. "titik ambil mingguan". */
  keterangan?: string;
  /** Zona harga & stok yang dipakai lokasi ini. Inilah satu-satunya penghubungnya. */
  zonaId: ZonaId;
}

/* ---------------------------------------------------------------
   HARGA & STOK SATU PRODUK DI SATU ZONA
   Cerminan satu baris tabel `product_zones` (product_id, zona_id,
   harga, alasan, stok) — atau hasil join `product_prices` +
   `inventory` bila nanti dipisah dua tabel di Supabase.
   --------------------------------------------------------------- */
export interface RincianZona {
  /** Rupiah, bilangan bulat. Contoh: 45000 berarti Rp 45.000. */
  harga: number;
  /** Jumlah stok di zona ini. Zona reguler & Cikarang punya tumpukan terpisah. */
  stok: number;
  /**
   * Alasan harga zona ini berbeda dari zona reguler, mis. "termasuk biaya
   * angkut". Ditampilkan ke pembeli supaya selisihnya masuk akal, bukan
   * terasa sewenang-wenang.
   *
   * WAJIB diisi untuk zona `cikarang`, yang menurut aturan bisnis selalu
   * lebih mahal. Aturan itu diperiksa saat berkembang di
   * `periksaAturanZona()` pada src/data/products.ts.
   */
  alasan?: string;
}

/**
 * Harga & stok satu produk untuk SETIAP zona.
 *
 * Sengaja `Record<ZonaId, …>`, bukan array. Bedanya besar:
 * dengan array, satu zona bisa lupa diisi atau terisi dua kali, dan
 * kesalahan itu baru ketahuan saat halaman dibuka. Dengan Record,
 * TypeScript menolak produk yang zonanya tidak lengkap — dan kalau nanti
 * ada zona baru ditambahkan ke `ZonaId`, kompilator langsung menunjuk
 * setiap produk yang belum diberi harga untuk zona itu.
 */
export type ZonaProduk = Record<ZonaId, RincianZona>;

/* ---------------------------------------------------------------
   FOTO
   --------------------------------------------------------------- */
export interface FotoProduk {
  /**
   * Kosongkan selama foto asli belum ada — galeri akan menampilkan
   * placeholder. Setelah foto asli masuk (kemungkinan besar dari Supabase
   * Storage), isi dengan URL-nya, ganti render galeri ke <Image> dari
   * next/image, dan daftarkan host-nya di `images.remotePatterns`
   * pada next.config.ts.
   */
  url: string;
  /** Alt text. Wajib deskriptif — ini yang dibaca pengguna tunanetra. */
  alt: string;
  /** Keterangan yang tampil di bawah foto. */
  keterangan?: string;
}

/* ---------------------------------------------------------------
   MANFAAT GIZI
   Dipisah judul & keterangan supaya tampilannya bisa dipindai cepat
   di HP, bukan jadi satu paragraf panjang.
   --------------------------------------------------------------- */
export interface Manfaat {
  judul: string;
  keterangan: string;
  /**
   * Sumber angka gizi (hasil uji lab, tabel komposisi pangan, dsb).
   * Selama ini `undefined`, poin tersebut HARUS diperlakukan sebagai
   * belum terverifikasi dan tidak boleh ditulis seolah fakta pasti.
   */
  sumber?: string;
}

/* ---------------------------------------------------------------
   HALAL
   --------------------------------------------------------------- */
export interface InfoHalal {
  nomorSertifikat: string;
  lembagaPenerbit: string;
  berlakuHingga?: string;
  /** URL gambar/scan sertifikat, bila sudah ada. */
  urlSertifikat?: string;
}

/* ---------------------------------------------------------------
   PROSES PENGASAPAN & PENYIMPANAN
   Dua blok ini adalah isi bagian "Keamanan & Kualitas".
   --------------------------------------------------------------- */
export interface InfoPengasapan {
  jenisKayu: string;
  suhu: string;
  durasi: string;
  /** Urutan langkah, dari ikan datang sampai dikemas. */
  langkah: string[];
}

export interface InfoPenyimpanan {
  suhuKulkas: string;
  suhuFreezer: string;
  masaSimpanKulkas: string;
  masaSimpanFreezer: string;
  masaSimpanSuhuRuang: string;
  /** Hal-hal yang perlu diperhatikan pembeli setelah kemasan dibuka. */
  catatan: string[];
}

/* ==========================================================================
   KATEGORI & CARA JUAL
   ==========================================================================

   Empat kategori, dan SATU pengecualian yang perlu dipahami sebelum
   membaca tipe `Product` di bawah:

     ikan    → punya pembagian CARA JUAL: 'potongan' atau 'satuan' (utuh).
     kepala  ┐
     jeroan  ├→ TIDAK punya pembagian cara jual sama sekali.
     telur   ┘

   Semua produk — tanpa kecuali — dihargai TETAP PER UNIT (per pack, per
   potong, per ekor), bukan per berat. Karena itu model harga integer per
   zona di atas tetap berlaku apa adanya: satu angka, satu unit.
   ========================================================================== */
export type KategoriId = "ikan" | "kepala" | "jeroan" | "telur";

/**
 * Pembagian cara jual. HANYA berlaku untuk kategori 'ikan'.
 *
 *   potongan → dijual sebagai potongan/fillet, biasanya per pack.
 *   satuan   → dijual utuh, per ekor.
 */
export type CaraJual = "potongan" | "satuan";

/**
 * Satuan yang tampil di belakang harga: "Rp 44.000 / ekor".
 *
 * Ini juga satuan STOK ("sisa 4 ekor") — sengaja satu field, bukan dua.
 * Kalau satuan harga dan satuan stok disimpan terpisah, cepat atau lambat
 * salah satunya diperbarui sendirian dan halaman menampilkan
 * "Rp 46.000 / ekor … sisa 4 pack" untuk barang yang sama.
 */
export type SatuanJual = "ekor" | "potong" | "pack";

export interface Kategori {
  id: KategoriId;
  /** Judul bagian di katalog, mis. "Kepala Ikan Asap". */
  nama: string;
  /** Versi pendek untuk pintasan/chip navigasi, mis. "Kepala". */
  namaSingkat: string;
  /** Satu kalimat di bawah judul bagian. */
  keterangan: string;
}

export interface InfoCaraJual {
  id: CaraJual;
  /** Sub-judul di dalam bagian Ikan, mis. "Dijual utuh — per ekor". */
  nama: string;
  /** Penanda ringkas di kartu produk, mis. "Utuh / per ekor". */
  penanda: string;
  keterangan: string;
}

/* ==========================================================================
   PRODUK
   ==========================================================================

   Bentuknya union, bukan satu interface dengan field opsional, dan itu
   disengaja.

   Kalau `caraJual` ditulis sebagai field opsional biasa pada satu
   interface, tidak ada yang mencegah seseorang menulis:

       { kategori: "telur", caraJual: "potongan" }   ← tidak ada artinya

   dan TypeScript akan diam saja. Dengan union berdiskriminan di bawah,
   baris itu GAGAL KOMPILASI: `caraJual?: never` pada varian non-ikan
   membuat field itu mustahil diisi di luar kategori 'ikan'. Sebaliknya,
   produk berkategori 'ikan' WAJIB menyebut cara jualnya — tidak bisa
   lupa.

   Satuannya ikut dikunci ke cara jual, karena keduanya memang tidak
   bebas satu sama lain: ikan yang dijual utuh dihargai per ekor, titik.
   Menuliskan "Rp 46.000 / pack" untuk seekor bandeng utuh bukan cuma
   janggal — pembeli jadi tidak tahu ia dapat berapa ekor.

   Untuk menambah kategori baru nanti: tambahkan ke `KategoriId`, lalu
   kompilator akan menunjuk sendiri setiap tempat yang perlu disesuaikan.
   ========================================================================== */

/** Bagian yang sama untuk SEMUA kategori. */
interface ProdukDasar {
  id: string;
  /** Dipakai sebagai URL: /produk/{slug}. Huruf kecil, tanpa spasi. */
  slug: string;
  nama: string;
  /** Satu–dua kalimat, tampil tepat di bawah nama. */
  deskripsiSingkat: string;
  /** Paragraf lengkap. */
  deskripsi: string;
  /** Isi kemasan, mis. "500 g (± 2 potong)". Wajib jelas — harga tanpa takaran tidak bisa dibandingkan. */
  ukuranKemasan: string;

  foto: FotoProduk[];
  manfaat: Manfaat[];
  halal: InfoHalal;

  /**
   * Harga & stok untuk tiap zona.
   *
   * Catatan: pertanyaan terbuka PRD bagian 12 no. 1 & 2 (apakah harga dan
   * stok dibedakan per lokasi) SUDAH DIJAWAB, dan jawabannya bukan
   * "per lokasi" melainkan "per zona": Pasar & Rumah Produksi berbagi
   * satu harga dan satu tumpukan stok, Cikarang berdiri sendiri.
   */
  zona: ZonaProduk;

  /** Di bawah atau sama dengan angka ini, stok ditandai "menipis". Berlaku per zona. */
  ambangStokMenipis: number;

  pengasapan: InfoPengasapan;
  penyimpanan: InfoPenyimpanan;
}

/** Ikan yang dijual utuh. Selalu dihargai per ekor. */
export interface ProdukIkanUtuh extends ProdukDasar {
  kategori: "ikan";
  caraJual: "satuan";
  satuan: "ekor";
}

/** Ikan yang dijual sebagai potongan — per potong, atau per pack berisi beberapa potong. */
export interface ProdukIkanPotongan extends ProdukDasar {
  kategori: "ikan";
  caraJual: "potongan";
  satuan: "potong" | "pack";
}

export type ProdukIkan = ProdukIkanUtuh | ProdukIkanPotongan;

/**
 * Kepala, jeroan, dan telur ikan.
 *
 * `caraJual?: never` bukan gaya penulisan — itulah yang membuat
 * pembagian potongan/satuan MUSTAHIL bocor ke kategori ini.
 */
export interface ProdukTurunanIkan extends ProdukDasar {
  kategori: Exclude<KategoriId, "ikan">;
  caraJual?: never;
  satuan: SatuanJual;
}

export type Product = ProdukIkan | ProdukTurunanIkan;
