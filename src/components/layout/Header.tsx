import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { CartIcon, ShieldCheckIcon } from "@/components/icons";
import { MenuMobile } from "./MenuMobile";

/**
 * Header global — zona gelap.
 *
 * Dua bentuk, satu sumber:
 *
 *   < 768px : wordmark + hamburger. Isi navigasinya pindah ke panel
 *             (lihat MenuMobile). Ruang vertikal di layar 375px terlalu
 *             mahal untuk menumpuk tautan di bar.
 *   >= 768px: bar horizontal biasa — tautan katalog, penanda halal,
 *             keranjang.
 *
 * LENGKET & TIDAK MENYATU DENGAN HERO. Header lengket di atas latar
 * gelap punya satu masalah khas: begitu digulir di atas hero yang juga
 * gelap, batas antara keduanya hilang dan bar terasa mengambang tanpa
 * bentuk. Dua hal menahannya: garis bawah ink-700 + rambut emas, dan
 * latar yang sedikit tembus + blur sehingga konten yang lewat di
 * belakangnya terlihat samar — cukup untuk memberi tahu mata bahwa ini
 * lapisan terpisah.
 *
 * Latar tembus itu hanya dipakai kalau browser mendukung backdrop-filter.
 * Bila tidak, latarnya tetap ink-900 pekat. Alasannya kontras: tanpa blur,
 * latar tembus membuat teks putih di header bisa jatuh di atas konten
 * terang yang lewat. Pada 85% pun pasangan warna paling tipis di header
 * masih di ~5,6:1 (aman AA), tapi tanpa blur hasilnya tidak bisa dijamin.
 *
 * Keranjang sudah disiapkan sebagai tombol dengan slot jumlah item,
 * tapi belum terhubung ke state apa pun — itu pekerjaan tahap berikutnya.
 */
export function Header({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="bg-ink-900 border-ink-700 supports-[backdrop-filter]:bg-ink-900/85 sticky top-0 z-40 border-b supports-[backdrop-filter]:backdrop-blur-md">
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

          {/* ---------- Desktop ---------- */}
          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-1 md:flex"
          >
            <Link
              href="/produk"
              className="text-on-dark-soft hover:bg-on-dark/10 hover:text-on-dark inline-flex min-h-11 items-center rounded-md px-3 font-medium transition-colors"
            >
              Produk
            </Link>

            {/* Pemisah halus supaya penanda halal terbaca sebagai
                keterangan, bukan sebagai tautan ketiga. */}
            <span className="bg-ink-700 mx-2 h-6 w-px" aria-hidden />

            <span className="border-ink-500 text-halal-400 inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1 text-sm font-medium">
              <ShieldCheckIcon className="size-4" />
              Bersertifikat Halal
            </span>

            {/* Area sentuh 44px penuh, walau ikonnya kecil. */}
            <button
              type="button"
              className="text-on-dark hover:bg-on-dark/10 active:bg-on-dark/20 relative ml-1 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-3 transition-colors"
              aria-label={
                cartCount > 0
                  ? `Keranjang, ${cartCount} item`
                  : "Keranjang, kosong"
              }
            >
              <CartIcon className="size-6" />
              <span aria-hidden>Keranjang</span>
              {cartCount > 0 && (
                <span className="bg-gold-400 text-ink-900 tabular absolute top-0.5 right-0.5 min-w-5 rounded-full px-1.5 text-xs leading-5 font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          {/* ---------- HP ---------- */}
          <MenuMobile cartCount={cartCount} />
        </div>
      </Container>

      {/* Rambut emas tepat di atas garis bawah. Satu piksel, dan itulah
          yang membedakan "bar gelap" dari "bar gelap milik merek ini". */}
      <div
        aria-hidden
        className="garis-emas pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-60"
      />
    </header>
  );
}
