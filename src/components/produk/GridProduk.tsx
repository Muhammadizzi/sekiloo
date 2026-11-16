import type { Produk } from "@/lib/produk";
import { KartuMuncul } from "./KartuMuncul";
import { KartuProduk } from "./KartuProduk";

/**
 * Dua kolom sejak layar HP: pembeli membandingkan harga antarproduk, dan satu kolom
 * membuat 10 produk jadi gulungan panjang. Kartunya seragam karena produknya setara.
 * Wajib berada di dalam PenyediaGerak.
 */
export function GridProduk({ produk }: { produk: Produk[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      {produk.map((item, urutan) => (
        <li key={item.id}>
          <KartuMuncul urutan={urutan} className="h-full">
            <KartuProduk produk={item} />
          </KartuMuncul>
        </li>
      ))}
    </ul>
  );
}
