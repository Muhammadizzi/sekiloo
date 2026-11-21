import type { ReactNode } from "react";
import { Container } from "@/components/ui/Section";

export type IsiDokumen = { id: string; judul: string };

/**
 * Kerangka halaman teks panjang (Kebijakan Privasi, Syarat Pemesanan, Halal & Keamanan Pangan).
 * Daftar isi di atas pada HP, dan menempel di kiri pada layar lebar, supaya pembeli yang datang
 * dengan satu pertanyaan bisa langsung lompat ke bagiannya.
 */
export function Dokumen({
  judul,
  ringkasan,
  diperbarui,
  isi,
  children,
}: {
  judul: string;
  ringkasan: ReactNode;
  diperbarui?: string;
  isi: IsiDokumen[];
  children: ReactNode;
}) {
  return (
    <div className="bg-surface">
      <Container>
        <div className="py-section md:py-section-lg">
          <header className="max-w-prose">
            <h1 className="text-content text-3xl font-semibold md:text-4xl">{judul}</h1>
            <div className="text-content-soft mt-stack text-lg">{ringkasan}</div>
            {diperbarui && <p className="text-content-muted mt-3 text-sm">Terakhir diperbarui {diperbarui}.</p>}
          </header>

          <div className="mt-block grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
            <nav aria-label="Daftar isi" className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-content-muted text-sm font-semibold">Daftar isi</p>
              {/* Garis emas tegak di sisi daftar isi, motif yang sama dengan alur cara pesan di beranda. */}
              <ol className="border-gold-500/60 mt-2 border-l">
                {isi.map((bagian) => (
                  <li key={bagian.id}>
                    <a
                      href={`#${bagian.id}`}
                      className="text-content-soft hover:text-content -ml-px flex min-h-11 items-center border-l-2 border-transparent pl-4 underline-offset-4 hover:border-gold-700 hover:underline"
                    >
                      {bagian.judul}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="max-w-prose space-y-12">{children}</div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export function BagianDokumen({ id, judul, children }: { id: string; judul: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`judul-${id}`} className="scroll-mt-20">
      <h2 id={`judul-${id}`} className="text-content text-2xl font-semibold">
        {judul}
      </h2>
      <div className="text-content-soft mt-stack space-y-4 [&_li]:pl-1 [&_strong]:text-content [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
