import type { Metadata } from "next";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Syarat Pemesanan",
};

/* Halaman lengkapnya dibuat di Fase 1 langkah 6. Wajib selesai sebelum pemesanan dibuka untuk umum. */
export default function HalamanSyarat() {
  return (
    <Section tone="light" headingLevel="h1" title="Syarat Pemesanan">
      <ul className="text-content-soft max-w-prose list-disc space-y-3 pl-5">
        <li>Pesanan dibuat per kloter dan diantar ke alamat di Cikarang pada tanggal antar kloter.</li>
        <li>Setelah pesanan dibuat, pembayaran harus selesai dalam 15 menit. Lewat dari itu, pesanan batal sendiri.</li>
        <li>
          Kalau sampai PO ditutup pesanan belum memenuhi jumlah minimum kloter, kloter dibatalkan dan pembayaranmu
          dikembalikan penuh.
        </li>
        <li>Maksimal 10 unit per produk, dan berat setiap pesanan dibatasi sesuai ketentuan kloter.</li>
      </ul>
      <CatatanPlaceholder judul="syarat pemesanan belum lengkap" className="mt-block max-w-prose">
        <p>
          Lengkapi sebelum tayang: kebijakan gagal antar dan refund-nya (PRD Bagian 23 no. 9), perubahan jadwal
          kloter (no. 10), lama proses refund (no. 11), dan nomor WhatsApp resmi beserta peringatan anti-penipuan
          (Bagian 14.3).
        </p>
      </CatatanPlaceholder>
    </Section>
  );
}
