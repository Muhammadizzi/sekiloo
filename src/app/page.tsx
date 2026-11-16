import Image from "next/image";
import Link from "next/link";

import { PenyediaGerak } from "@/components/gerak/PenyediaGerak";
import { KartuKloter } from "@/components/kloter/KartuKloter";
import { GridProduk } from "@/components/produk/GridProduk";
import { Button } from "@/components/ui/Button";
import { LabelTegak } from "@/components/ui/LabelTegak";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import { Container } from "@/components/ui/Section";
import { TombolMuatUlang } from "@/components/ui/TombolMuatUlang";
import { ambilKloterBuka, ambilProdukAktif, ambilWilayahAktif } from "@/data/katalog";
import { formatRupiah } from "@/lib/format";

// Angka terkecil dari data di halaman ini (kloter, 60 detik) yang menentukan umur cache.
export const revalidate = 60;

const JUMLAH_PRODUK_DI_BERANDA = 4;

const LANGKAH_PESAN = [
  {
    judul: "Pesan dan bayar sebelum PO ditutup",
    isi: "Pilih ikan, isi alamat dan titik peta, lalu bayar lewat QRIS. Tempatmu di kloter disimpan selama 15 menit sambil menunggu pembayaran.",
  },
  {
    judul: "Ikan diasap sesuai pesanan",
    isi: "Setelah PO ditutup, kami mengasap dan memvakum ikan sebanyak pesanan yang sudah lunas. Tidak ada stok yang disiapkan lebih dulu.",
  },
  {
    judul: "Dibawa ke Cikarang",
    isi: "Ikan berangkat dari desa dalam cool box, lalu disimpan di freezer atau kulkas begitu tiba di Cikarang.",
  },
  {
    judul: "Diantar ke rumahmu",
    isi: "Admin kami di Cikarang mengantar pada tanggal antar kloter, dan mengabari lewat WhatsApp sebelum berangkat.",
  },
];

export default async function Beranda() {
  const [kloter, produk, wilayah] = await Promise.all([
    ambilKloterBuka(),
    ambilProdukAktif(),
    ambilWilayahAktif(),
  ]);

  return (
    <PenyediaGerak>
      {/* Hero: zona gelap. Teks tegak di tepi kiri adalah ciri khas yang hanya dipakai di sini. */}
      <div className="bg-ink-950">
        <Container>
          <div className="grid gap-6 py-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-10 md:py-16 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-x-12">
            <LabelTegak>Diasap di desa, diantar ke Cikarang</LabelTegak>

            <div>
              <h1 className="text-on-dark text-4xl font-semibold md:text-5xl lg:text-6xl">
                Pesan dulu, baru kami asap.
              </h1>
              <p className="text-on-dark-soft mt-stack max-w-xl text-lg md:text-xl">
                Ikan diasap sebanyak pesanan yang sudah dibayar, dikemas vakum, lalu diantar ke rumahmu
                di Cikarang pada tanggal antar kloter.
              </p>
              <div className="mt-block flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href="/produk" size="lg">
                  Pilih ikan
                </Button>
                <a
                  href="#cara-pesan"
                  className="text-gold-400 inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline"
                >
                  Cara pesan lewat PO
                </a>
              </div>
            </div>

            <figure className="md:col-span-2 lg:col-span-1">
              {/* Lebih pendek di HP supaya kartu kloter di bawahnya lebih cepat terlihat. */}
              <div className="relative aspect-video overflow-hidden rounded-lg lg:aspect-[4/3]">
                <Image
                  src="/hero-sementara.webp"
                  alt="Ikan asap dalam kemasan vakum di atas daun pisang"
                  fill
                  sizes="(min-width: 1152px) 520px, (min-width: 1024px) 42vw, 100vw"
                  loading="eager"
                  fetchPriority="high"
                  className="object-cover"
                />
              </div>
              {/* Ganti dengan foto proses pengasapan asli (PRD Bagian 6.1), lalu hapus keterangan ini. */}
              <figcaption className="text-on-dark-muted mt-2 text-sm">Foto ilustrasi</figcaption>
            </figure>
          </div>
        </Container>
      </div>

      {/* Kloter: pertanyaan pertama pembeli dari WhatsApp adalah "masih bisa pesan atau tidak". */}
      <section aria-labelledby="judul-kloter" className="bg-surface-sunken py-section md:py-section-lg">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <div>
              <h2 id="judul-kloter" className="text-content text-3xl font-semibold md:text-4xl">
                Kloter saat ini
              </h2>
              <p className="text-content-muted mt-stack text-lg">
                Pesanan dikumpulkan per kloter. Begitu PO ditutup, ikan diasap sebanyak pesanan yang masuk.
              </p>
            </div>
            <KartuKloter awal={kloter.hasil} waktuRender={kloter.diambilPada} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="judul-produk" className="bg-surface py-section md:py-section-lg">
        <Container>
          <div className="mb-block flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="max-w-2xl">
              <h2 id="judul-produk" className="text-content text-3xl font-semibold md:text-4xl">
                Daftar produk
              </h2>
              <p className="text-content-muted mt-stack text-lg">
                Harga sudah termasuk kemasan vakum. Ongkir dihitung per kecamatan saat checkout.
              </p>
            </div>
            {produk.ok && produk.data.length > JUMLAH_PRODUK_DI_BERANDA && (
              <Link
                href="/produk"
                className="text-gold-700 inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
              >
                Lihat semua {produk.data.length} produk
              </Link>
            )}
          </div>

          {!produk.ok ? (
            <PesanKeadaan judul="Daftar produk belum bisa dimuat" aksi={<TombolMuatUlang />}>
              Sambungan ke server sedang bermasalah. Coba muat ulang halaman ini sebentar lagi.
            </PesanKeadaan>
          ) : produk.data.length === 0 ? (
            <PesanKeadaan judul="Daftar produk sedang disiapkan">
              Harga dan berat tiap produk tampil di sini begitu siap dijual.
            </PesanKeadaan>
          ) : (
            <GridProduk produk={produk.data.slice(0, JUMLAH_PRODUK_DI_BERANDA)} />
          )}
        </Container>
      </section>

      <section
        id="cara-pesan"
        aria-labelledby="judul-cara-pesan"
        className="bg-surface-sunken scroll-mt-16 py-section md:py-section-lg"
      >
        <Container>
          <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12">
            <div className="md:sticky md:top-24 md:self-start">
              <h2 id="judul-cara-pesan" className="text-content text-3xl font-semibold md:text-4xl">
                Cara pesan lewat PO
              </h2>
              <p className="text-content-muted mt-stack text-lg">
                PO artinya pre-order: kamu memesan dulu, ikan baru disiapkan setelah PO ditutup.
              </p>
            </div>

            <div>
              {/* Garis emas tegak menyambung tiap langkah, motif yang sama dengan teks tegak di hero. */}
              <ol>
                {LANGKAH_PESAN.map((langkah, urutan) => (
                  <li key={langkah.judul} className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4">
                    <div className="flex flex-col items-center">
                      <span className="font-display tabular text-gold-700 text-3xl leading-none font-semibold">
                        {urutan + 1}
                      </span>
                      <span aria-hidden className="bg-gold-500/60 mt-3 w-px flex-1 group-last:hidden" />
                    </div>
                    <div className="pb-8 group-last:pb-0">
                      <h3 className="text-content text-xl font-semibold">{langkah.judul}</h3>
                      <p className="text-content-soft mt-1.5">{langkah.isi}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="bg-surface border-line text-content-soft mt-block rounded-md border p-4">
                Kalau sampai PO ditutup pesanan belum memenuhi jumlah minimum kloter, kloter dibatalkan dan
                pembayaranmu dikembalikan penuh.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="judul-wilayah" className="bg-surface py-section md:py-section-lg">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            <div>
              <h2 id="judul-wilayah" className="text-content text-3xl font-semibold md:text-4xl">
                Wilayah antar dan ongkir
              </h2>
              <p className="text-content-muted mt-stack text-lg">
                Saat ini kami hanya mengantar ke alamat di Cikarang. Ongkirnya flat per kecamatan dan
                dipilih saat checkout.
              </p>
            </div>

            {!wilayah.ok ? (
              <PesanKeadaan judul="Daftar wilayah belum bisa dimuat" aksi={<TombolMuatUlang />}>
                Sambungan ke server sedang bermasalah. Coba muat ulang halaman ini sebentar lagi.
              </PesanKeadaan>
            ) : wilayah.data.length === 0 ? (
              <PesanKeadaan judul="Daftar kecamatan sedang disiapkan">
                Ongkir tiap kecamatan di Cikarang tampil di sini begitu sudah ditetapkan.
              </PesanKeadaan>
            ) : (
              <ul className="border-line bg-surface divide-line divide-y self-start rounded-lg border">
                {wilayah.data.map((w) => (
                  <li key={w.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
                    <span className="text-content">{w.nama}</span>
                    <span className="tabular text-content font-semibold">{formatRupiah(w.ongkir)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>
    </PenyediaGerak>
  );
}
