import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
};

export default function TidakDitemukan() {
  return (
    <Section
      tone="sunken"
      headingLevel="h1"
      title="Halaman tidak ditemukan"
      description="Produk yang kamu cari mungkin sudah tidak dijual, atau tautannya salah ketik."
    >
      <Button href="/produk">Lihat daftar produk</Button>
    </Section>
  );
}
