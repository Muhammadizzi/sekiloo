import type { Metadata } from "next";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
};

/* Halaman lengkapnya dibuat di Fase 1 langkah 6 (PRD Bagian 16). Wajib selesai sebelum pemesanan dibuka untuk umum. */
export default function HalamanPrivasi() {
  return (
    <Section tone="light" headingLevel="h1" title="Kebijakan Privasi">
      <div className="text-content-soft max-w-prose space-y-4">
        <p>
          Saat memesan, kami meminta nama, nomor WhatsApp, alamat, patokan, dan titik lokasi rumahmu. Data itu hanya
          dipakai untuk membuat label kemasan, mengantar pesanan, dan menghubungimu soal pengantaran atau refund.
        </p>
        <p>
          Pembayaran diproses Midtrans. Kami tidak pernah menyimpan nomor kartu atau rekeningmu. Untuk mencegah spam,
          checkout memakai pemeriksaan keamanan Cloudflare Turnstile.
        </p>
      </div>
      <CatatanPlaceholder judul="kebijakan privasi belum lengkap" className="mt-block max-w-prose">
        <p>
          Lengkapi sesuai PRD Bagian 16: siapa yang bisa melihat tiap data, masa simpan (usulan 12 bulan, belum
          diputuskan), cara meminta penghapusan lewat WhatsApp, dan pemberitahuan kalau terjadi kebocoran data.
        </p>
      </CatatanPlaceholder>
    </Section>
  );
}
