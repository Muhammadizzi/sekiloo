import type { Metadata } from "next";
import Link from "next/link";

import { Section, Container } from "@/components/ui/Section";
import { Reveal, jedaBertahap } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { MapPinIcon, ShieldCheckIcon } from "@/components/icons";
import { KartuProduk } from "@/components/produk/KartuProduk";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { getKatalog, type KelompokKatalog } from "@/data/products";
import { labelZona } from "@/data/locations";

/**
 * HALAMAN KATALOG
 * ===============
 *
 * Seluruh halaman ini komponen SERVER: nol JavaScript dikirim ke HP.
 * Itu bukan kebetulan — katalog adalah halaman pertama yang dibuka orang
 * (PRD 6.1 langkah 1), dan target "muat < 3 detik di 4G" paling murah
 * dicapai dengan tidak mengirim apa-apa yang tidak perlu. Interaktivitas
 * baru masuk di halaman detail, tempat pembeli memilih titik ambil.
 *
 * URUTAN & PENGELOMPOKAN tidak diputuskan di sini. Halaman ini menerima
 * `getKatalog()` yang sudah terkelompok dan tinggal merendernya — lihat
 * alasannya di src/data/products.ts. Yang jadi urusan file ini murni
 * tampilan.
 *
 * ZONA WARNA: satu strip gelap di atas sebagai sambungan dari header,
 * lalu seluruh daftar produk di zona terang. Kartu produk berisi harga,
 * stok, dan penanda halal — tiga hal yang harus terbaca tanpa usaha.
 * Menaruhnya di atas latar gelap akan menukar keterbacaan dengan gaya,
 * dan di halaman ini keterbacaan menang.
 *
 * BAGIAN kategori berselang-seling `light` / `sunken` supaya batas antar
 * kategori terlihat tanpa perlu garis pemisah tambahan.
 */

export const metadata: Metadata = {
  title: "Produk",
  description:
    "Daftar ikan asap, kepala, jeroan, dan telur ikan asap. Semua bersertifikat halal, diambil sendiri di Pasar, Rumah Produksi, atau Cikarang.",
};

/* ---------- pembantu tampilan, khusus halaman ini ---------- */

/** Id anchor satu bagian kategori. Dipakai chip pintasan di strip atas. */
function idBagian(kategoriId: string): string {
  return `kategori-${kategoriId}`;
}

/**
 * Barisan kartu. Satu kolom di HP, melebar bertahap ke layar besar.
 *
 * `headingLevel` ikut dioper karena kedalaman judulnya beda: di bagian
 * yang punya sub-judul cara jual (h3), nama produk turun ke h4; di
 * bagian tanpa sub-judul ia tetap h3. Dengan begitu urutan judul tidak
 * pernah melompat di halaman ini.
 */
function GridProduk({
  kelompok,
  headingLevel,
}: {
  kelompok: KelompokKatalog["produk"];
  headingLevel: "h3" | "h4";
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {kelompok.map((produk, urutan) => (
        /* Jeda dihitung dari urutan di dalam grid, jadi kartu muncul
           bergiliran mengikuti arah baca. `jedaBertahap` membatasi
           tumpukannya supaya kartu terakhir tidak menunggu lama. */
        <Reveal key={produk.id} jeda={jedaBertahap(urutan)}>
          <KartuProduk produk={produk} headingLevel={headingLevel} />
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- halaman ---------- */

export default async function HalamanKatalog() {
  const katalog = await getKatalog();
  const labelReguler = labelZona("reguler");

  return (
    <>
      {/* ============ STRIP ATAS — zona gelap ============ */}
      <div className="bg-ink-950 border-ink-700 border-b">
        <Container>
          <nav aria-label="Remah roti" className="py-3">
            <ol className="text-on-dark-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <li>
                <Link href="/" className="hover:text-on-dark transition-colors">
                  Beranda
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-on-dark-soft" aria-current="page">
                Produk
              </li>
            </ol>
          </nav>

          <div className="pb-section max-w-2xl">
            <h1 className="text-on-dark text-3xl font-semibold md:text-4xl">
              Semua Produk
            </h1>
            <p className="text-on-dark-soft mt-stack text-lg">
              Ikan asap dan turunannya, semua dari satu dapur pengasapan yang
              sama. Pesanan diambil sendiri di titik ambil pilihanmu.
            </p>

            {/*
              CATATAN HARGA & STOK — diletakkan SEBELUM daftar, bukan
              sesudahnya.

              Angka besar di tiap kartu adalah harga zona reguler. Kalau
              keterangan itu baru muncul di bawah daftar, pembeli Cikarang
              sudah terlanjur membaca enam harga yang tidak berlaku
              untuknya. Diletakkan di sini, ia membaca semua angka dengan
              konteks yang benar sejak kartu pertama.
            */}
            <div className="border-ink-500 mt-block rounded-sm border p-4">
              <p className="text-on-dark flex items-start gap-2.5 font-medium">
                <MapPinIcon className="text-gold-400 mt-0.5 size-5 shrink-0" />
                Harga & stok yang tampil di daftar ini untuk {labelReguler}.
              </p>
              {/* pl-7.5 = lebar ikon (size-5) + gap-2.5, jadi baris kedua
                  sejajar dengan awal teks baris pertama. */}
              <p className="text-on-dark-soft mt-2 pl-7.5 text-sm">
                Titik ambil Cikarang punya harga dan stoknya sendiri — harga
                Cikarang ikut ditulis kecil di tiap kartu, dan bisa dipilih
                lengkap dengan stoknya di halaman masing-masing produk.
              </p>
            </div>

            {/* Pintasan kategori. Tautan anchor biasa, jadi tetap bekerja
                tanpa JavaScript dan tetap bisa dijangkau keyboard. */}
            <nav aria-label="Pintasan kategori" className="mt-block">
              <ul className="flex flex-wrap gap-2">
                {katalog.map(({ kategori, produk }) => (
                  <li key={kategori.id}>
                    <a
                      href={`#${idBagian(kategori.id)}`}
                      className="border-ink-500 text-on-dark-soft hover:bg-on-dark/10 hover:text-on-dark inline-flex min-h-10 items-center gap-1.5 rounded-sm border px-3 text-sm font-medium transition-colors"
                    >
                      {kategori.namaSingkat}
                      <span className="tabular text-on-dark-muted">
                        ({produk.length})
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
      </div>

      {/* ============ BAGIAN PER KATEGORI ============ */}
      {katalog.map(({ kategori, produk, subKelompok }, urutan) => (
        <Section
          key={kategori.id}
          /* Berselang-seling supaya batas antar kategori terbaca tanpa
             garis pemisah tambahan. */
          tone={urutan % 2 === 0 ? "light" : "sunken"}
          title={kategori.nama}
          description={kategori.keterangan}
          id={idBagian(kategori.id)}
          reveal
          /* Header lengket setinggi 56–64px; tanpa ini judul bagian
             tersembunyi di baliknya setiap kali chip pintasan ditekan. */
          className="scroll-mt-16 md:scroll-mt-20"
        >
          {subKelompok ? (
            /* Kategori 'ikan' — dibagi dulu menurut cara jualnya.
               Sub-bagiannya diberi judul sendiri, bukan cuma penanda di
               kartu: "beli utuh atau beli potongan" adalah keputusan yang
               diambil pembeli SEBELUM ia memilih ikannya. */
            <div className="space-y-10">
              {subKelompok.map(({ info, produk: produkSub }) => (
                <div key={info.id}>
                  <Reveal>
                    <h3 className="text-content text-xl font-semibold md:text-2xl">
                      {info.nama}
                    </h3>
                    <p className="text-content-muted mt-1 max-w-2xl">
                      {info.keterangan}
                    </p>
                  </Reveal>
                  <div className="mt-block">
                    <GridProduk kelompok={produkSub} headingLevel="h4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <GridProduk kelompok={produk} headingLevel="h3" />
          )}
        </Section>
      ))}

      {/* ============ PENUTUP ============ */}
      <Section tone="dark">
        <div className="max-w-2xl">
          <p className="text-on-dark flex items-center gap-2 text-lg font-semibold">
            <ShieldCheckIcon className="text-halal-400 size-6 shrink-0" />
            Semua produk di atas bersertifikat halal
          </p>
          <p className="text-on-dark-soft mt-stack">
            Nomor sertifikat, proses pengasapan, aturan penyimpanan, dan masa
            simpan ditulis lengkap di halaman masing-masing produk — supaya bisa
            dicek sendiri, bukan sekadar dipercaya.
          </p>
          <p className="mt-block">
            <Badge tone="onDark">Semua pesanan diambil sendiri</Badge>
          </p>
        </div>
      </Section>

      <Section tone="sunken">
        <CatatanPlaceholder judul="seluruh isi katalog ini masih karangan">
          <p>
            Nama produk, harga, stok, dan ukuran kemasan di halaman ini contoh
            untuk menguji tampilan keempat kategori — bukan daftar jualan
            sungguhan. Foto belum ada, jadi tiap kartu menampilkan placeholder.
          </p>
          <p>
            Ganti isinya di <code>src/data/products.ts</code>. Nama dan kalimat
            penjelas tiap kategori ada terpisah di{" "}
            <code>src/data/kategori.ts</code>, jadi mengubah judul bagian tidak
            perlu menyentuh data produk sama sekali.
          </p>
        </CatatanPlaceholder>
      </Section>
    </>
  );
}
