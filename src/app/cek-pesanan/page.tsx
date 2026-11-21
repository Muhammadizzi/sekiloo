import type { Metadata } from "next";
import { FormCekPesanan } from "@/components/pesanan/FormCekPesanan";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Cek pesanan",
  description: "Buka lagi halaman status pesananmu dengan nomor pesanan dan nomor WhatsApp.",
};

export default function HalamanCekPesanan() {
  return (
    <Section
      tone="sunken"
      headingLevel="h1"
      title="Cek pesanan"
      description="Kehilangan link status pesanan? Masukkan nomor pesanan dan nomor WhatsApp yang kamu pakai saat memesan."
    >
      <FormCekPesanan />
    </Section>
  );
}
