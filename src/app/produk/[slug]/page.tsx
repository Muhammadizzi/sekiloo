import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { FotoProduk } from "@/components/produk/FotoProduk";
import { teksBerat } from "@/components/produk/KartuProduk";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import { Container, Section } from "@/components/ui/Section";
import { TombolMuatUlang } from "@/components/ui/TombolMuatUlang";
import { ambilKloterBuka, ambilProduk, ambilProdukAktif } from "@/data/katalog";
import { AksiKeranjang } from "@/components/keranjang/AksiKeranjang";
import { formatRupiah } from "@/lib/format";
import { labelSatuan } from "@/lib/produk";

// Ikut umur cache kloter (60 detik), karena tombol keranjang bergantung pada kloter yang buka.
export const revalidate = 60;

// Produk yang baru diaktifkan setelah build tetap bisa dibuka; dirender saat pertama diminta.
export async function generateStaticParams() {
  const produk = await ambilProdukAktif();
  return produk.ok ? produk.data.map((p) => ({ slug: p.slug })) : [];
}

export async function generateMetadata({ params }: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const hasil = await ambilProduk(slug);
  if (!hasil.ok || !hasil.data) return { title: "Produk" };

  const p = hasil.data;
  return {
    title: p.nama,
    description: p.deskripsi || `${p.nama}, ${labelSatuan(p.satuan)}, ${formatRupiah(p.harga)}.`,
  };
}

export default async function HalamanProduk({ params }: PageProps<"/produk/[slug]">) {
  const { slug } = await params;
  const [hasil, kloter] = await Promise.all([ambilProduk(slug), ambilKloterBuka()]);

  if (!hasil.ok) {
    return (
      <Section tone="sunken">
        <PesanKeadaan judul="Produk belum bisa dimuat" aksi={<TombolMuatUlang />}>
          Sambungan ke server sedang bermasalah. Coba muat ulang halaman ini sebentar lagi.
        </PesanKeadaan>
      </Section>
    );
  }
  if (!hasil.data) notFound();

  const produk = hasil.data;

  return (
    <>
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
              <li>
                <Link href="/produk" className="hover:text-on-dark transition-colors">
                  Produk
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-on-dark-soft" aria-current="page">
                {produk.nama}
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      <Section tone="light">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
          <div className="border-line bg-surface-muted relative aspect-[4/3] overflow-hidden rounded-lg border md:sticky md:top-24 md:self-start">
            <FotoProduk url={produk.fotoUrl} alt={produk.nama} sizes="(min-width: 768px) 50vw, 100vw" utama />
          </div>

          <div>
            <h1 className="text-content text-3xl font-semibold md:text-4xl">{produk.nama}</h1>
            <p className="tabular text-content mt-stack text-3xl font-semibold">
              {formatRupiah(produk.harga)}
            </p>
            <p className="text-content-muted mt-1">
              {labelSatuan(produk.satuan)}, berat isi {teksBerat(produk)}
            </p>

            {produk.deskripsi && (
              <p className="text-content-soft mt-block max-w-prose text-lg">{produk.deskripsi}</p>
            )}

            <div className="mt-block">
              <AksiKeranjang
                produk={{ id: produk.id, nama: produk.nama }}
                kloterAwal={kloter.hasil}
                waktuRender={kloter.diambilPada}
              />
            </div>

            <div className="border-line mt-block border-t pt-block">
              <h2 className="text-content text-xl font-semibold">Cara simpan</h2>
              <p className="text-content-soft mt-2 max-w-prose">
                Ikan dikemas vakum dan dibawa ke Cikarang dalam cool box. Begitu diterima, langsung simpan
                di freezer atau kulkas.
              </p>
              <CatatanPlaceholder judul="suhu dan masa simpan belum diisi" className="mt-stack">
                <p>
                  Tambahkan suhu dan masa simpan di suhu ruang, kulkas, freezer, dan setelah kemasan dibuka.
                  Angkanya harus dari hasil uji ketahanan produk (PRD Bagian 15), bukan perkiraan.
                </p>
              </CatatanPlaceholder>
            </div>

            <Link
              href="/produk"
              className="text-gold-700 mt-block inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
            >
              Kembali ke daftar produk
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
