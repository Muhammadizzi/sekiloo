import type { Metadata } from "next";

import { FormCheckout } from "@/components/checkout/FormCheckout";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import { Section } from "@/components/ui/Section";
import { TombolMuatUlang } from "@/components/ui/TombolMuatUlang";
import { ambilKloterBuka, ambilProdukAktif, ambilWilayahAktif } from "@/data/katalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function HalamanCheckout() {
  const [produk, wilayah, kloter] = await Promise.all([ambilProdukAktif(), ambilWilayahAktif(), ambilKloterBuka()]);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <Section tone="sunken" headingLevel="h1" title="Checkout">
      {!produk.ok || !wilayah.ok ? (
        <PesanKeadaan judul="Checkout belum bisa dimuat" aksi={<TombolMuatUlang />}>
          Data produk atau wilayah tidak bisa diambil karena sambungan ke server bermasalah. Isi keranjangmu tetap
          tersimpan di HP ini.
        </PesanKeadaan>
      ) : !siteKey ? (
        // Tanpa site key, captcha tidak bisa berjalan dan server pasti menolak pesanan.
        <PesanKeadaan judul="Checkout belum siap">
          Pemesanan online sedang disiapkan. Silakan coba lagi nanti.
        </PesanKeadaan>
      ) : wilayah.data.length === 0 ? (
        <PesanKeadaan judul="Wilayah antar belum ditetapkan">
          Ongkir tiap kecamatan di Cikarang sedang disiapkan, jadi checkout belum bisa dipakai.
        </PesanKeadaan>
      ) : (
        <FormCheckout
          produk={produk.data}
          wilayah={wilayah.data}
          kloterAwal={kloter.hasil}
          waktuRender={kloter.diambilPada}
          siteKey={siteKey}
        />
      )}
    </Section>
  );
}
