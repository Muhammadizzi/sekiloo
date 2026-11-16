import Link from "next/link";

import type { Product } from "@/types/product";
import { Card } from "@/components/ui/Card";
import { Badge, HalalBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { statusStok } from "@/lib/stok";
import { CARA_JUAL, KATEGORI } from "@/data/kategori";
import { labelZona } from "@/data/locations";
import { FotoPlaceholder } from "./FotoPlaceholder";

/**
 * KARTU PRODUK DI KATALOG
 * =======================
 *
 * Komponen SERVER — tidak ada satu byte JavaScript pun yang dikirim ke HP
 * untuk kartu ini, dan di katalog ada enam sekaligus.
 *
 * SOAL HARGA — ini keputusan paling berhati-hati di komponen ini.
 *
 * Di katalog, pembeli BELUM memilih titik ambil. Menampilkan satu angka
 * telanjang berarti menjanjikan harga yang belum tentu berlaku untuknya:
 * pembeli Cikarang akan melihat "Rp 44.000" di sini lalu "Rp 52.000" di
 * halaman berikutnya, dan selisih yang muncul belakangan selalu terasa
 * seperti jebakan — persis kebalikan dari tujuan situs ini.
 *
 * Jalan keluarnya bukan menyembunyikan harga (pembeli butuh angka untuk
 * memutuskan apakah layak dibuka), melainkan menulis KEDUANYA:
 *
 *     Rp 44.000 / pack        ← besar: harga zona reguler
 *     Pasar & Rumah Produksi · Cikarang Rp 52.000
 *
 * Baris kedua kecil, tapi ada sebelum diklik. Dengan begitu tidak ada
 * angka yang baru muncul belakangan, dan harga besar itu punya alamat
 * yang jelas — bukan "harga pasti" yang menggantung tanpa keterangan.
 *
 * SOAL STOK — sinyal stok mengikuti zona reguler, sama seperti harganya.
 * Kalau zona reguler habis TAPI Cikarang masih ada, itu ikut ditulis:
 * "Habis" saja akan mengusir pembeli Cikarang dari barang yang sebenarnya
 * tersedia untuknya.
 */
export function KartuProduk({
  produk,
  /**
   * Tingkat judul nama produk.
   *
   * Bisa diatur karena kedalamannya tidak sama di semua bagian katalog:
   * di kategori Ikan ada sub-judul cara jual (h3) di atas kartu, di
   * kategori lain tidak. Dikunci di satu nilai, salah satu dari keduanya
   * pasti melompati satu tingkat — dan urutan judul yang melompat adalah
   * salah satu hal pertama yang membuat pembaca layar sulit dipakai
   * untuk menjelajah halaman.
   */
  headingLevel: Heading = "h3",
}: {
  produk: Product;
  headingLevel?: "h3" | "h4";
}) {
  const reguler = produk.zona.reguler;
  const cikarang = produk.zona.cikarang;

  const stok = statusStok(
    reguler.stok,
    produk.ambangStokMenipis,
    produk.satuan,
  );

  /* Habis di reguler tapi masih ada di Cikarang. Stok memang disimpan per
     zona — satu tumpukan kosong tidak berarti tumpukan lain ikut kosong. */
  const adaDiCikarang = !stok.bisaBeli && cikarang.stok > 0;

  const foto = produk.foto[0];

  return (
    <Card
      /* `relative` menopang tautan melebar di bawah, dan `has-[:focus-visible]`
         memindahkan cincin fokus dari teks judul ke seluruh kartu — supaya
         yang tersorot keyboard sama dengan yang bisa diklik. */
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        /* Hover sengaja cuma naik satu tingkat bayangan + garis yang
           sedikit menegas. Kartu yang membesar atau terangkat jauh saat
           disentuh terasa gaduh di grid berisi enam kartu. */
        "transition-[box-shadow,border-color] duration-150",
        "hover:border-line-strong hover:shadow-raised",
        "has-[:focus-visible]:outline-gold-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
      )}
    >
      {/* --- Foto ---
          Rasio dikunci 4:3 sejak sekarang supaya barisan kartu tidak
          melompat saat foto asli menggantikan placeholder nanti. */}
      <div className="border-line bg-surface-muted relative aspect-[4/3] border-b">
        {foto?.url ? (
          /* Saat foto asli sudah ada, ganti dengan <Image> dari next/image
             dan daftarkan host-nya di images.remotePatterns. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto.url}
            alt={foto.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <FotoPlaceholder label="Belum ada foto" catatan="Rasio 4:3" />
        )}

        {/* Chip kategori. Ditaruh di atas foto, bukan di badan kartu,
            karena di badan ia akan berebut perhatian dengan penanda cara
            jual dan stok — padahal kategori adalah keterangan paling
            ringan dari ketiganya. Di halaman katalog ia memang mengulang
            judul bagian, tapi kartu ini juga dipakai di luar katalog
            (mis. produk terkait), dan di sana kategorinya tidak punya
            judul di atasnya. */}
        <span className="absolute top-2 left-2">
          <Badge tone="overlay">{KATEGORI[produk.kategori].namaSingkat}</Badge>
        </span>
      </div>

      <div className="p-block flex flex-1 flex-col">
        {/* Penanda cara jual. Hanya ada pada kategori 'ikan' — kategori
            lain tidak punya field ini sama sekali, jadi kondisi di bawah
            tidak pernah benar untuk mereka. */}
        {produk.caraJual && (
          <p className="mb-2">
            <Badge tone="neutral">{CARA_JUAL[produk.caraJual].penanda}</Badge>
          </p>
        )}

        <Heading className="font-display text-content text-lg font-semibold">
          {/* Tautan melebar ke seluruh kartu lewat ::after, bukan dengan
              membungkus semuanya di dalam <a>. Hasilnya: satu perhentian
              tab saja, nama tautannya tetap nama produk (bukan seluruh isi
              kartu yang dibacakan sekaligus), dan area sentuhnya tetap
              selebar kartu di HP. */}
          <Link
            href={`/produk/${produk.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {produk.nama}
          </Link>
        </Heading>

        <p className="text-content-muted mt-0.5 text-sm">
          {produk.ukuranKemasan}
        </p>
        <p className="text-content-soft mt-2 line-clamp-2 text-sm">
          {produk.deskripsiSingkat}
        </p>

        {/* BLOK HARGA — dibuat sebagai kaki kartu yang berlatar sendiri,
            bukan sekadar teks di bawah garis.

            `mt-auto` mendorongnya ke dasar kartu, jadi harga tetap sejajar
            antar kartu walau panjang deskripsinya berbeda. Margin negatif
            membatalkan `p-block` induknya supaya latarnya menyentuh tepi
            kartu — inilah yang membuat harga terbaca sebagai kesimpulan
            kartu, bukan sebagai baris terakhir deskripsi. */}
        <div className="border-line bg-surface-muted/60 -mx-block -mb-block px-block mt-auto border-t pt-3 pb-4">
          <p className="tabular text-content text-2xl font-semibold tracking-tight">
            {formatRupiah(reguler.harga)}
            <span className="text-content-muted ml-1 text-sm font-normal tracking-normal">
              / {produk.satuan}
            </span>
          </p>
          <p className="text-content-muted tabular mt-0.5 text-xs">
            {labelZona("reguler")} · Cikarang {formatRupiah(cikarang.harga)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={stok.tone}>{stok.teksRingkas}</Badge>
            <HalalBadge size="sm" />
          </div>

          {adaDiCikarang && (
            <p className="text-content-muted mt-2 text-xs">
              Masih ada {cikarang.stok} {produk.satuan} di titik ambil Cikarang.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
