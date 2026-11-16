import { bacaPublik, type Hasil } from "@/lib/supabase/rest";
import { KOLOM_PRODUK, keProduk, type Produk } from "@/lib/produk";
import { ambilKloterPertama, JALUR_KLOTER, type HasilKloter, type Kloter } from "@/lib/kloter";
import type { Database } from "@/types/database";

/*
 * Produk dan wilayah jarang berubah, jadi cache 5 menit cukup.
 * Kloter 1 menit, dan kartunya juga menyegarkan diri dari browser (lihat KartuKloter).
 * Tag dipakai langkah checkout dan webhook untuk revalidateTag saat pesanan berubah.
 */
export const CACHE_KATALOG = { revalidate: 300, tags: ["katalog"] };
export const CACHE_KLOTER = { revalidate: 60, tags: ["kloter"] };

type BarisProduk = Parameters<typeof keProduk>[0];

export async function ambilProdukAktif(): Promise<Hasil<Produk[]>> {
  const hasil = await bacaPublik<BarisProduk[]>(
    `products?select=${KOLOM_PRODUK}&is_active=eq.true&order=sort_order.asc,name.asc`,
    CACHE_KATALOG,
  );
  if (!hasil.ok) return hasil;
  return { ok: true, data: hasil.data.map(keProduk).filter((p): p is Produk => p !== null) };
}

const POLA_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `null` kalau slug tidak ada atau produknya nonaktif. */
export async function ambilProduk(slug: string): Promise<Hasil<Produk | null>> {
  // Slug masuk ke filter PostgREST, jadi yang bentuknya tidak sah ditolak sebelum query.
  if (!POLA_SLUG.test(slug)) return { ok: true, data: null };

  const hasil = await bacaPublik<BarisProduk[]>(
    `products?select=${KOLOM_PRODUK}&slug=eq.${slug}&is_active=eq.true&limit=1`,
    CACHE_KATALOG,
  );
  if (!hasil.ok) return hasil;
  return { ok: true, data: hasil.data[0] ? keProduk(hasil.data[0]) : null };
}

export type Wilayah = { id: string; nama: string; ongkir: number };

type BarisWilayah = Pick<
  Database["public"]["Tables"]["service_areas"]["Row"],
  "id" | "name" | "delivery_fee"
>;

export async function ambilWilayahAktif(): Promise<Hasil<Wilayah[]>> {
  const hasil = await bacaPublik<BarisWilayah[]>(
    "service_areas?select=id,name,delivery_fee&is_active=eq.true&order=sort_order.asc,name.asc",
    CACHE_KATALOG,
  );
  if (!hasil.ok) return hasil;
  return {
    ok: true,
    data: hasil.data.flatMap((w) =>
      w.delivery_fee === null ? [] : [{ id: w.id, nama: w.name, ongkir: w.delivery_fee }],
    ),
  };
}

/** `diambilPada` dipakai kartu kloter sebagai "waktu sekarang" saat render, supaya hidrasi cocok. */
export async function ambilKloterBuka(): Promise<{ hasil: HasilKloter; diambilPada: number }> {
  const hasil = ambilKloterPertama(await bacaPublik<Kloter[]>(JALUR_KLOTER, CACHE_KLOTER));
  return { hasil, diambilPada: Date.now() };
}
