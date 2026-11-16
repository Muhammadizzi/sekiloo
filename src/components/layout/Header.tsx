import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { ShieldCheckIcon } from "@/components/icons";
import { NOMOR_SERTIFIKAT_HALAL } from "@/data/halal";
import { Wordmark } from "./Wordmark";

/**
 * Header global, zona gelap. Ringkas (56px di HP) karena ruang vertikal di layar kecil mahal.
 * Tombol keranjang kembali di langkah keranjang; tombol yang belum bisa apa-apa tidak ditampilkan.
 */
export function Header() {
  return (
    <header className="bg-ink-900 border-ink-700 sticky top-0 z-40 border-b">
      <Container>
        <div className="flex h-14 items-center justify-between gap-3 md:h-16">
          <Link href="/" className="text-on-dark text-2xl md:text-3xl">
            <Wordmark />
            <span className="sr-only">, ke beranda</span>
          </Link>

          <nav aria-label="Utama" className="flex items-center gap-2">
            {NOMOR_SERTIFIKAT_HALAL && (
              <span className="border-ink-500 text-halal-400 hidden items-center gap-1.5 rounded-xs border px-2.5 py-1 text-sm font-medium sm:inline-flex">
                <ShieldCheckIcon className="size-4" />
                Bersertifikat Halal
              </span>
            )}
            <Link
              href="/produk"
              className="text-on-dark hover:bg-on-dark/10 active:bg-on-dark/20 inline-flex min-h-11 items-center rounded-md px-3 font-medium transition-colors"
            >
              Produk
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
