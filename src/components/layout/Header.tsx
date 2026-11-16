import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { ShieldCheckIcon } from "@/components/icons";

/**
 * Header global — zona gelap.
 *
 * Catatan mobile-first: header sengaja dibuat ringkas (56px di HP) karena
 * ruang vertikal di layar 375px sangat mahal. Navigasi lengkap sebaiknya
 * nanti pindah ke bottom nav atau menu, bukan menumpuk di sini.
 *
 * Satu-satunya tautan navigasi adalah Produk, karena itulah satu-satunya
 * halaman tujuan yang sudah ada. Tautan lain ditambahkan begitu
 * halamannya dibuat, bukan sebelumnya.
 */
export function Header() {
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
            <span className="sr-only"> (beranda)</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Penanda kepercayaan yang selalu terlihat. Disembunyikan di
                layar sangat sempit supaya tidak menabrak wordmark. */}
            <span className="border-ink-500 text-halal-400 hidden items-center gap-1.5 rounded-xs border px-2.5 py-1 text-sm font-medium sm:inline-flex">
              <ShieldCheckIcon className="size-4" />
              Bersertifikat Halal
            </span>

            <nav aria-label="Navigasi utama">
              {/* Area sentuh 44px penuh. */}
              <Link
                href="/produk"
                className="text-on-dark-soft hover:bg-on-dark/10 hover:text-on-dark active:bg-on-dark/20 inline-flex min-h-11 items-center rounded-md px-3 font-medium transition-colors"
              >
                Produk
              </Link>
            </nav>

            {/* TODO: tombol keranjang kembali ke sini begitu keranjang
                benar-benar bisa dipakai. Tombol yang terlihat bisa ditekan
                tapi tidak melakukan apa-apa lebih buruk daripada tidak ada. */}
          </div>
        </div>
      </Container>
    </header>
  );
}
