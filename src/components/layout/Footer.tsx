import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { PhoneIcon, ShieldCheckIcon } from "@/components/icons";
import { tautanWhatsApp } from "@/data/kontak";
import { NOMOR_SERTIFIKAT_HALAL } from "@/data/halal";
import { Wordmark } from "./Wordmark";

/** Footer global, zona gelap. Dua kolom karena isinya memang hanya dua: siapa kami dan cara menghubungi. */
export function Footer() {
  return (
    <footer className="bg-ink-950 text-on-dark-soft border-ink-700 mt-auto border-t">
      <Container>
        <div className="py-section grid gap-10 md:grid-cols-2 md:gap-8">
          <div>
            <p className="text-on-dark text-2xl">
              <Wordmark />
            </p>
            <p className="mt-stack max-w-sm text-base">
              Ikan asap produksi desa, dipesan per kloter dan diantar ke rumah di Cikarang.
            </p>

            {NOMOR_SERTIFIKAT_HALAL && (
              <div className="mt-block border-halal-400/30 bg-halal-400/10 inline-block rounded-sm border p-3">
                <p className="text-halal-400 flex items-center gap-2 font-semibold">
                  <ShieldCheckIcon className="size-5" />
                  Bersertifikat Halal
                </p>
                <p className="tabular text-on-dark-soft mt-1 text-sm">No. {NOMOR_SERTIFIKAT_HALAL}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-on-dark text-lg font-semibold">Hubungi kami</h2>
            <p className="mt-stack max-w-sm text-base">
              Tanya soal produk, jadwal kloter, atau pesananmu lewat WhatsApp.
            </p>
            <a
              href={tautanWhatsApp("Halo Sealauk, saya mau bertanya.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-stack border-ink-500 text-on-dark hover:bg-on-dark/10 inline-flex min-h-11 items-center gap-2 rounded-md border px-4 font-medium transition-colors"
            >
              <PhoneIcon className="size-5" />
              WhatsApp
            </a>
            {/* Hapus setelah NOMOR_WHATSAPP di data/kontak.ts diganti nomor asli. */}
            <p className="text-on-dark-muted mt-2 text-sm">Nomor WhatsApp masih contoh, belum nomor asli.</p>
          </div>
        </div>

        <div className="border-ink-700 flex flex-col gap-2 border-t py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sealauk</p>
          <nav aria-label="Tautan lain" className="flex flex-wrap gap-x-4">
            <Link href="/cek-pesanan" className="hover:text-on-dark inline-flex min-h-11 items-center underline-offset-4 hover:underline">
              Cek pesanan
            </Link>
            <Link href="/privasi" className="hover:text-on-dark inline-flex min-h-11 items-center underline-offset-4 hover:underline">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat" className="hover:text-on-dark inline-flex min-h-11 items-center underline-offset-4 hover:underline">
              Syarat Pemesanan
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
