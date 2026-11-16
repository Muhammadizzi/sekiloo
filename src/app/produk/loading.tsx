import { Container } from "@/components/ui/Section";

/**
 * Tampilan saat katalog sedang diambil.
 *
 * Sekarang data masih statis, jadi ini jarang terlihat. Begitu produk
 * dibaca dari Supabase, inilah yang muncul selama menunggu.
 *
 * Kerangka kartu meniru bentuk kartu asli di HP (baris, foto kecil di
 * kiri) supaya halaman tidak melompat saat isinya datang. Sengaja diam,
 * tanpa denyut: teks status di atas sudah memberi tahu bahwa sesuatu
 * sedang dimuat.
 */
export default function MemuatKatalog() {
  return (
    <>
      <section className="bg-ink-900">
        <Container className="pt-8 pb-9 md:pt-12 md:pb-12">
          <h1 className="font-display text-on-dark text-3xl font-semibold md:text-4xl">
            Katalog ikan asap
          </h1>
          <p role="status" className="text-on-dark-soft mt-3 text-base">
            Memuat daftar produk dan stok terbaru…
          </p>
        </Container>
      </section>

      <div className="bg-surface-sunken">
        <Container className="pt-8 pb-section">
          <ul
            aria-hidden
            className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(min(15.5rem,100%),1fr))] sm:gap-5"
          >
            {[0, 1, 2].map((urutan) => (
              <li
                key={urutan}
                className="border-line bg-surface grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 rounded-lg border p-3 sm:grid-cols-1 sm:p-0"
              >
                <div className="bg-surface-muted aspect-square rounded-md sm:aspect-[4/3] sm:rounded-b-none" />
                <div className="space-y-2 py-1 sm:p-4">
                  <div className="bg-surface-muted h-5 w-3/4 rounded-xs" />
                  <div className="bg-surface-muted h-4 w-1/2 rounded-xs" />
                  <div className="bg-surface-muted mt-4 h-6 w-2/5 rounded-xs" />
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  );
}
