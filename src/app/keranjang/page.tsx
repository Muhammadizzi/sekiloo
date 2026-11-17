import type { Metadata } from "next";

import { IsiKeranjang } from "@/components/keranjang/IsiKeranjang";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import { Section } from "@/components/ui/Section";
import { TombolMuatUlang } from "@/components/ui/TombolMuatUlang";
import { ambilKloterBuka, ambilProdukAktif } from "@/data/katalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Keranjang",
  robots: { index: false },
};

export default async function HalamanKeranjang() {
  const [produk, kloter] = await Promise.all([ambilProdukAktif(), ambilKloterBuka()]);

  return (
    <Section tone="sunken" headingLevel="h1" title="Keranjang">
      {produk.ok ? (
        <IsiKeranjang produk={produk.data} kloterAwal={kloter.hasil} waktuRender={kloter.diambilPada} />
      ) : (
        <PesanKeadaan judul="Keranjang belum bisa dimuat" aksi={<TombolMuatUlang />}>
          Data produk tidak bisa diambil karena sambungan ke server bermasalah. Isi keranjangmu tetap tersimpan di
          HP ini.
        </PesanKeadaan>
      )}
    </Section>
  );
}
