import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Section";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { KartuProduk } from "@/components/produk/KartuProduk";
import { KartuMuncul } from "@/components/produk/KartuMuncul";
import { PenyediaGerak } from "@/components/gerak/PenyediaGerak";
import { getKatalog, type KelompokKatalog } from "@/data/products";
import { LOKASI, labelZona } from "@/data/locations";
import type { Product } from "@/types/product";

/* "Pasar, Rumah Produksi, atau Cikarang". Disusun dari data lokasi,
   supaya titik ambil baru otomatis ikut tersebut di sini. */
const DAFTAR_LOKASI = (() => {
  const nama = LOKASI.map((lokasi) => lokasi.nama);
  if (nama.length <= 1) return nama[0] ?? "";
  return `${nama.slice(0, -1).join(", ")}, atau ${nama[nama.length - 1]}`;
})();

export const metadata: Metadata = {
  title: "Katalog",
  description: `Ikan asap, kepala, jeroan, dan telur ikan asap. Harga per unit, diambil sendiri di ${DAFTAR_LOKASI}.`,
};

/* Kategori dengan sedikit produk dan tanpa sub-bagian ditampilkan
   berdampingan, bukan sebagai bagian penuh masing-masing. Tiga bagian
   panjang yang tiap isinya satu kartu terbaca seperti halaman yang
   belum selesai. Batasnya ikut data: begitu satu kategori punya lebih
   dari dua produk, ia otomatis dapat bagian penuh. */
const BATAS_KATEGORI_RINGKAS = 2;

function idKategori(kelompok: KelompokKatalog) {
  return `kategori-${kelompok.kategori.id}`;
}

/* 1 kolom (baris) di HP, lalu 2, 3, dan 4 kolom mengikuti lebar yang
   tersedia. Trek minimal 15.5rem: di bawah itu kartu tegak jadi terlalu
   sempit untuk harga dan badge stok dalam satu baris. `min(…, 100%)`
   menjaga trek tidak pernah lebih lebar dari wadahnya. auto-fill (bukan
   auto-fit) supaya lebar kartu sama di semua kategori, walau isinya
   cuma dua.

   Definisi yang sama dipakai blok kategori ringkas, jadi kolomnya selalu
   segaris dengan kartu Ikan di atasnya di lebar berapa pun. */
const KOLOM_KARTU =
  "sm:grid-cols-[repeat(auto-fill,minmax(min(15.5rem,100%),1fr))] sm:gap-x-5";

function DaftarKartu({
  produk,
  headingLevel,
}: {
  produk: Product[];
  headingLevel: "h3" | "h4";
}) {
  return (
    <ul
      role="list"
      className={`grid grid-cols-1 gap-3 sm:gap-y-5 ${KOLOM_KARTU}`}
    >
      {produk.map((satu, urutan) => (
        <li key={satu.id} className="min-w-0">
          <KartuMuncul urutan={urutan} className="h-full">
            <KartuProduk produk={satu} headingLevel={headingLevel} />
          </KartuMuncul>
        </li>
      ))}
    </ul>
  );
}

function JudulKategori({
  kelompok,
  ukuran,
}: {
  kelompok: KelompokKatalog;
  ukuran: "besar" | "ringkas";
}) {
  return (
    <>
      <h2
        id={`${idKategori(kelompok)}-judul`}
        className={
          ukuran === "besar"
            ? "font-display text-content text-2xl font-semibold md:text-3xl"
            : "font-display text-content text-xl font-semibold md:text-2xl"
        }
      >
        {kelompok.kategori.nama}
      </h2>
      <p className="text-content-muted mt-1 max-w-2xl text-base">
        {kelompok.kategori.keterangan}
      </p>
    </>
  );
}

function KategoriPenuh({ kelompok }: { kelompok: KelompokKatalog }) {
  return (
    <section
      id={idKategori(kelompok)}
      aria-labelledby={`${idKategori(kelompok)}-judul`}
      className="scroll-mt-20"
    >
      <JudulKategori kelompok={kelompok} ukuran="besar" />

      {kelompok.subKelompok ? (
        kelompok.subKelompok.map((sub, posisi) => (
          <div key={sub.info.id} className={posisi === 0 ? "mt-6" : "mt-10"}>
            <h3 className="text-content text-lg font-semibold">
              {sub.info.nama}
            </h3>
            <p className="text-content-muted mt-0.5 max-w-2xl text-sm">
              {sub.info.keterangan}
            </p>
            <div className="mt-4">
              <DaftarKartu produk={sub.produk} headingLevel="h4" />
            </div>
          </div>
        ))
      ) : (
        <div className="mt-5">
          <DaftarKartu produk={kelompok.produk} headingLevel="h3" />
        </div>
      )}
    </section>
  );
}

/* Subgrid tiga baris (judul, keterangan, kartu) yang dibagi dengan
   kategori di sebelahnya: keterangan yang lebih panjang satu baris tidak
   lagi mendorong kartunya lebih rendah dari kartu tetangga. */
function KategoriRingkas({ kelompok }: { kelompok: KelompokKatalog }) {
  return (
    <section
      id={idKategori(kelompok)}
      aria-labelledby={`${idKategori(kelompok)}-judul`}
      className="row-span-3 grid min-w-0 scroll-mt-20 grid-rows-subgrid gap-y-0"
    >
      <JudulKategori kelompok={kelompok} ukuran="ringkas" />
      <div className="mt-4">
        <DaftarKartu produk={kelompok.produk} headingLevel="h3" />
      </div>
    </section>
  );
}

function KatalogKosong() {
  return (
    <Container className="py-section md:py-section-lg">
      <div className="max-w-xl">
        <h2 className="font-display text-content text-2xl font-semibold">
          Belum ada produk yang dijual
        </h2>
        <p className="text-content-muted mt-3">
          Daftar produk sedang kosong. Stok diisi ulang oleh pemilik usaha,
          jadi coba buka halaman ini lagi nanti.
        </p>
        <Link
          href="/"
          className="border-line-strong text-content hover:bg-surface-muted active:bg-line mt-6 inline-flex min-h-11 items-center rounded-md border px-5 font-medium transition-colors"
        >
          Kembali ke beranda
        </Link>
      </div>
    </Container>
  );
}

export default async function HalamanKatalog() {
  const katalog = await getKatalog();

  const penuh = katalog.filter(
    (kelompok) =>
      kelompok.subKelompok || kelompok.produk.length > BATAS_KATEGORI_RINGKAS,
  );
  const ringkas = katalog.filter((kelompok) => !penuh.includes(kelompok));

  return (
    <>
      {/* Zona bingkai: menyambung dari header gelap, berisi tiga hal yang
          perlu diketahui sebelum melihat harga mana pun. Sengaja ringkas,
          bukan hero: tugas halaman ini menampilkan produk, jadi produk
          pertama harus terlihat di layar pertama HP. */}
      <section className="bg-ink-900 text-on-dark relative">
        <Container className="pt-6 pb-7 md:pt-12 md:pb-12">
          <h1 className="font-display text-on-dark text-3xl font-semibold md:text-4xl">
            Katalog ikan asap
          </h1>
          <p className="text-on-dark-soft mt-3 max-w-2xl text-base md:text-lg">
            Harga per pack, potong, atau ekor, bukan per kilo. Semua pesanan
            diambil sendiri di {DAFTAR_LOKASI}.
          </p>
          <p className="text-on-dark-muted mt-2 max-w-2xl text-sm md:text-base">
            Angka besar di tiap kartu adalah harga di {labelZona("reguler")}.
            Harga {labelZona("cikarang")} tertulis di bawahnya.
          </p>

          {katalog.length > 0 && (
            <nav aria-label="Lompat ke kategori" className="mt-5 md:mt-6">
              {/* Di HP chip dibagi rata dalam satu baris (grid), karena
                  sebagai deretan bebas empat chip tidak muat di 375px dan
                  chip terakhir turun sendirian ke baris kedua. */}
              <ul
                role="list"
                className="grid grid-cols-[repeat(auto-fit,minmax(4.5rem,1fr))] gap-2 sm:flex sm:flex-wrap"
              >
                {katalog.map((kelompok) => (
                  <li key={kelompok.kategori.id} className="min-w-0">
                    {/* <Link>, bukan <a> biasa. Lompatan lewat <a href="#…">
                        dicatat browser tanpa status router Next.js, dan
                        router Next 16 mengabaikan entri seperti itu saat
                        tombol kembali ditekan: buka kartu dari sini lalu
                        tekan kembali, URL-nya katalog tapi layarnya masih
                        halaman detail. */}
                    <Link
                      href={`#${idKategori(kelompok)}`}
                      className="border-ink-500 text-on-dark hover:bg-on-dark/10 active:bg-on-dark/20 flex min-h-11 items-center justify-center gap-1.5 rounded-sm border px-2 text-sm font-medium transition-colors sm:inline-flex sm:justify-start sm:gap-2 sm:px-3.5"
                    >
                      {kelompok.kategori.namaSingkat}
                      <span className="tabular text-gold-400">
                        {kelompok.produk.length}
                        <span className="sr-only"> produk</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>

        {/* Rambut emas penutup zona bingkai: motif yang sama dengan
            wordmark, jadi halaman ini terbaca sebagai milik sekiloo. */}
        <div
          aria-hidden
          className="via-gold-500 absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent to-transparent opacity-70"
        />
      </section>

      <div className="bg-surface-sunken">
        <Container className="pt-6">
          <CatatanPlaceholder judul="data contoh">
            <p>
              Nama produk, harga, stok, dan foto di halaman ini masih karangan
              untuk pengembangan. Ganti dengan data asli sebelum situs dibuka
              untuk umum.
            </p>
          </CatatanPlaceholder>
        </Container>

        {katalog.length === 0 ? (
          <KatalogKosong />
        ) : (
          <PenyediaGerak>
            <Container className="pt-8 pb-section md:pt-12 md:pb-section-lg">
              <div className="space-y-12 md:space-y-16">
                {penuh.map((kelompok) => (
                  <KategoriPenuh
                    key={kelompok.kategori.id}
                    kelompok={kelompok}
                  />
                ))}

                {ringkas.length > 0 && (
                  <div
                    className={`border-line grid grid-cols-1 gap-y-10 border-t pt-10 md:pt-12 ${KOLOM_KARTU}`}
                  >
                    {ringkas.map((kelompok) => (
                      <KategoriRingkas
                        key={kelompok.kategori.id}
                        kelompok={kelompok}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Container>
          </PenyediaGerak>
        )}
      </div>
    </>
  );
}
