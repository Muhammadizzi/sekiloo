import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { CartIcon, ShieldCheckIcon } from "@/components/icons";

/**
 * Header global — zona gelap.
 *
 * Catatan mobile-first: header sengaja dibuat ringkas (56px di HP) karena
 * ruang vertikal di layar 375px sangat mahal. Navigasi lengkap sebaiknya
 * nanti pindah ke bottom nav atau menu, bukan menumpuk di sini.
 *
 * Keranjang sudah disiapkan sebagai tombol dengan slot jumlah item,
 * tapi belum terhubung ke state apa pun — itu pekerjaan tahap berikutnya.
 */
export function Header({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="bg-ink-900 border-b border-ink-700 sticky top-0 z-40">
      <Container>
        <div className="flex h-14 items-center justify-between gap-3 md:h-16">
          {/* Wordmark. Serif + huruf kecil semua memberi kesan tenang dan
              berkelas; dua "o" di akhir nama jadi ciri visual yang mudah
              diingat tanpa perlu logo gambar. */}
          <Link
            href="/"
            className="font-display text-on-dark text-2xl leading-none font-semibold tracking-tight md:text-3xl"
          >
            sekiloo
            <span className="text-gold-400" aria-hidden>
              .
            </span>
            <span className="sr-only">— beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Penanda kepercayaan yang selalu terlihat. Disembunyikan di
                layar sangat sempit supaya tidak menabrak wordmark. */}
            <span className="border-ink-500 text-halal-400 hidden items-center gap-1.5 rounded-xs border px-2.5 py-1 text-sm font-medium sm:inline-flex">
              <ShieldCheckIcon className="size-4" />
              Bersertifikat Halal
            </span>

            {/* Area sentuh 44px penuh, walau ikonnya kecil. */}
            <button
              type="button"
              className="text-on-dark hover:bg-on-dark/10 active:bg-on-dark/20 relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-md px-3 transition-colors"
              aria-label={
                cartCount > 0
                  ? `Keranjang, ${cartCount} item`
                  : "Keranjang, kosong"
              }
            >
              <CartIcon className="size-6" />
              <span className="sr-only sm:not-sr-only sm:text-base">
                Keranjang
              </span>
              {cartCount > 0 && (
                <span className="bg-gold-400 text-ink-900 tabular absolute top-0.5 right-0.5 min-w-5 rounded-full px-1.5 text-xs leading-5 font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
