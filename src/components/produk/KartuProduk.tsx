import Link from "next/link";
import { Card, tautanMeregang } from "@/components/ui/Card";
import { formatBerat, formatRupiah } from "@/lib/format";
import { labelSatuan, type Produk } from "@/lib/produk";
import { FotoProduk } from "./FotoProduk";

/** Ikan utuh beratnya berbeda-beda per ekor, jadi diberi tanda kira-kira. Bungkus dan pack beratnya tetap. */
export function teksBerat(produk: Pick<Produk, "satuan" | "beratIsiGram">): string {
  return `${produk.satuan === "ekor" ? "±" : ""}${formatBerat(produk.beratIsiGram)}`;
}

export function KartuProduk({ produk }: { produk: Produk }) {
  return (
    <Card interactive className="flex h-full flex-col">
      <div className="border-line bg-surface-muted relative aspect-[4/3] overflow-hidden rounded-t-lg border-b">
        <FotoProduk
          url={produk.fotoUrl}
          alt={produk.nama}
          sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="text-content text-base leading-snug font-semibold sm:text-lg">
          <Link href={`/produk/${produk.slug}`} className={tautanMeregang}>
            {produk.nama}
          </Link>
        </h3>
        <p className="text-content-muted mt-1 text-sm">
          {labelSatuan(produk.satuan)} · {teksBerat(produk)}
        </p>
        <p className="tabular text-content mt-auto pt-3 text-lg font-semibold">
          {formatRupiah(produk.harga)}
        </p>
      </div>
    </Card>
  );
}
