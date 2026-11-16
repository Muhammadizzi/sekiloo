import type { Metadata } from "next";

import { PenyediaGerak } from "@/components/gerak/PenyediaGerak";
import { GridProduk } from "@/components/produk/GridProduk";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import { Section } from "@/components/ui/Section";
import { TombolMuatUlang } from "@/components/ui/TombolMuatUlang";
import { ambilProdukAktif } from "@/data/katalog";
import { KELOMPOK_KATALOG } from "@/lib/produk";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Daftar produk",
  description: "Ikan asap per ekor, pack irisan, dan bungkus. Harga sudah termasuk kemasan vakum.",
};

export default async function HalamanKatalog() {
  const produk = await ambilProdukAktif();

  const kelompok = produk.ok
    ? KELOMPOK_KATALOG.map((k) => ({
        judul: k.judul,
        produk: produk.data.filter((p) => k.kategori.includes(p.kategori)),
      })).filter((k) => k.produk.length > 0)
    : [];

  return (
    <PenyediaGerak>
      <Section
        tone="sunken"
        headingLevel="h1"
        title="Daftar produk"
        description="Harga sudah termasuk kemasan vakum. Ongkir dihitung per kecamatan saat checkout."
      >
        {!produk.ok ? (
          <PesanKeadaan judul="Daftar produk belum bisa dimuat" aksi={<TombolMuatUlang />}>
            Sambungan ke server sedang bermasalah. Coba muat ulang halaman ini sebentar lagi.
          </PesanKeadaan>
        ) : kelompok.length === 0 ? (
          <PesanKeadaan judul="Daftar produk sedang disiapkan">
            Harga dan berat tiap produk tampil di sini begitu siap dijual.
          </PesanKeadaan>
        ) : (
          <div className="space-y-12">
            {kelompok.map((k) => (
              <section key={k.judul} aria-label={k.judul}>
                {/* Judul kelompok hanya perlu kalau ada lebih dari satu kelompok. */}
                {kelompok.length > 1 && (
                  <h2 className="text-content mb-stack text-2xl font-semibold">{k.judul}</h2>
                )}
                <GridProduk produk={k.produk} />
              </section>
            ))}
          </div>
        )}
      </Section>
    </PenyediaGerak>
  );
}
