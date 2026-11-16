import Link from "next/link";

import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/format";
import { statusStok } from "@/lib/stok";
import { labelZona } from "@/data/locations";
import { FotoPlaceholder } from "./FotoPlaceholder";

/**
 * Kartu produk di katalog. Komponen server: nol JavaScript ke HP.
 *
 * DUA BENTUK, BUKAN SATU BENTUK YANG DIKECILKAN
 *
 *   < 640px : baris. Foto kecil di kiri, keterangan di kanan. Di HP,
 *             kartu bertumpuk dengan foto 4:3 selebar layar membuat enam
 *             produk jadi enam layar penuh gulir. Baris membuat pembeli
 *             bisa membandingkan harga beberapa produk sekaligus.
 *   ≥ 640px : kartu tegak. Foto di atas, deskripsi singkat ikut tampil
 *             karena lebarnya cukup untuk dua baris yang enak dibaca.
 *
 * SOAL HARGA. Pembeli belum memilih titik ambil di katalog, jadi dua
 * harga ditulis: harga zona reguler besar, harga Cikarang kecil di
 * bawahnya. Selisih yang baru muncul di halaman berikutnya selalu terasa
 * seperti jebakan.
 *
 * SOAL HALAL. Sengaja tidak ada badge halal di tiap kartu. Semua produk
 * memakai sertifikat yang sama, jadi badge yang diulang di setiap kartu
 * tidak memberi informasi baru. Nomor sertifikatnya ada di halaman
 * detail.
 */
export function KartuProduk({
  produk,
  /* h4 di dalam sub-bagian kategori Ikan, h3 di kategori lain, supaya
     urutan judul tidak pernah melompat bagi pembaca layar. */
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

  /* Stok disimpan per zona. Habis di zona reguler tidak berarti habis di
     Cikarang, dan "Habis" saja akan mengusir pembeli Cikarang dari
     barang yang sebenarnya masih ada untuknya. */
  const masihAdaDiCikarang = !stok.bisaBeli && cikarang.stok > 0;

  const foto = produk.foto[0];

  return (
    <article
      className={[
        "group relative grid h-full rounded-lg border",
        "border-line bg-surface",
        "grid-cols-[5.5rem_minmax(0,1fr)] gap-4 p-3",
        "sm:grid-cols-1 sm:grid-rows-[auto_1fr] sm:gap-0 sm:overflow-hidden sm:p-0",
        /* Satu-satunya elevasi di halaman: muncul saat kartu disorot,
           sebagai tanda bahwa seluruh kartu bisa ditekan. */
        "transition-[border-color,box-shadow,background-color] duration-150",
        "hover:border-line-strong hover:shadow-raised",
        /* Umpan balik sentuhan di HP, tempat hover tidak ada. */
        "has-[a:active]:bg-surface-muted",
        /* Cincin fokus dipindah dari teks judul ke seluruh kartu, supaya
           yang tersorot keyboard sama dengan yang bisa ditekan. */
        "has-[a:focus-visible]:outline-gold-500 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2",
      ].join(" ")}
    >
      {/* Rasio foto dikunci sejak sekarang (1:1 di HP, 4:3 di layar lebar)
          supaya tata letak tidak bergeser saat foto asli menggantikan
          placeholder. */}
      <div className="bg-surface-muted aspect-square overflow-hidden rounded-md sm:aspect-[4/3] sm:rounded-none sm:border-b sm:border-line">
        {foto?.url ? (
          /* Saat foto asli ada: ganti dengan <Image> dari next/image dan
             daftarkan host-nya di images.remotePatterns. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto.url}
            alt={foto.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <FotoPlaceholder
            label="Foto menyusul"
            className="p-2 sm:p-3"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col sm:p-4">
        <Heading className="font-display text-content text-lg leading-snug font-semibold">
          {/* `!` wajib: aturan :focus-visible global di globals.css ada di
              luar layer CSS, jadi tanpa important ia selalu menang dan
              kartu mendapat dua cincin fokus sekaligus. */}
          <Link
            href={`/produk/${produk.slug}`}
            className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none!"
          >
            {produk.nama}
          </Link>
        </Heading>

        <p className="text-content-muted mt-0.5 text-sm">
          {produk.ukuranKemasan}
        </p>

        <p className="text-content-soft mt-2 hidden text-sm sm:line-clamp-2">
          {produk.deskripsiSingkat}
        </p>

        <div className="mt-3 sm:mt-auto sm:pt-4">
          <p className="tabular text-content text-xl leading-tight font-semibold tracking-tight">
            {formatRupiah(reguler.harga)}
            <span className="text-content-muted ml-1 text-sm font-normal tracking-normal">
              / {produk.satuan}
            </span>
          </p>
          <p className="tabular text-content-muted mt-0.5 text-sm">
            {labelZona("cikarang")} {formatRupiah(cikarang.harga)}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Badge tone={stok.tone}>{stok.teksRingkas}</Badge>
            {masihAdaDiCikarang && (
              <span className="text-content-muted text-sm">
                Masih ada di {labelZona("cikarang")}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
