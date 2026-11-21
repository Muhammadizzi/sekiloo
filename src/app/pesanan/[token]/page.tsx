import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TampilanPesanan } from "@/components/pesanan/TampilanPesanan";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import { Section } from "@/components/ui/Section";
import { TombolMuatUlang } from "@/components/ui/TombolMuatUlang";
import { ambilPesananLewatToken } from "@/data/pesanan";
import { alamatSitus } from "@/lib/server/situs";

// Status harus selalu segar dan berbeda per pesanan, jadi tidak pernah di-cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status pesanan",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function HalamanStatusPesanan({ params }: PageProps<"/pesanan/[token]">) {
  const { token } = await params;
  const [{ hasil, diambilPada }, situs] = await Promise.all([ambilPesananLewatToken(token), alamatSitus()]);

  if (!hasil.ok) {
    return (
      <Section tone="sunken">
        <PesanKeadaan judul="Status pesanan belum bisa dimuat" aksi={<TombolMuatUlang />}>
          Sambungan ke server sedang bermasalah. Coba muat ulang halaman ini sebentar lagi. Pesananmu tetap aman.
        </PesanKeadaan>
      </Section>
    );
  }
  if (!hasil.data) notFound();

  return (
    <Section tone="sunken">
      <p className="text-content-muted text-sm">Nomor pesanan</p>
      <h1 className="tabular text-content mb-block text-3xl font-semibold md:text-4xl">{hasil.data.invoice}</h1>
      <TampilanPesanan pesanan={hasil.data} token={token} situs={situs} sekarang={diambilPada} />
    </Section>
  );
}
