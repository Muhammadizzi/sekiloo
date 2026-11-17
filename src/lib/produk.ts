import type { Database } from "@/types/database";
import { urlFotoProduk } from "@/lib/supabase/rest";

type BarisProduk = Database["public"]["Tables"]["products"]["Row"];

export const KATEGORI = ["ikan", "kepala", "jeroan", "telur", "pendamping"] as const;
export type Kategori = (typeof KATEGORI)[number];

export const SATUAN = ["ekor", "pack_irisan", "bungkus"] as const;
export type Satuan = (typeof SATUAN)[number];

export type Produk = {
  id: string;
  slug: string;
  nama: string;
  kategori: Kategori;
  satuan: Satuan;
  deskripsi: string;
  beratIsiGram: number;
  /** Berat setelah dikemas. Kapasitas kloter dan batas berat per pesanan dihitung dari angka ini. */
  beratKirimGram: number;
  harga: number;
  fotoUrl: string | null;
};

export const KOLOM_PRODUK =
  "id,slug,name,category,unit_type,description,net_weight_gram,ship_weight_gram,price,image_path";

const LABEL_SATUAN: Record<Satuan, string> = {
  ekor: "per ekor",
  pack_irisan: "per pack irisan",
  bungkus: "per bungkus",
};

export function labelSatuan(satuan: Satuan): string {
  return LABEL_SATUAN[satuan];
}

/** Urutan dan judul kelompok di halaman katalog. Kelompok tanpa produk tidak ditampilkan. */
export const KELOMPOK_KATALOG: { judul: string; kategori: Kategori[] }[] = [
  { judul: "Ikan utuh dan irisan", kategori: ["ikan"] },
  { judul: "Kepala, jeroan, dan telur", kategori: ["kepala", "jeroan", "telur"] },
  { judul: "Pendamping", kategori: ["pendamping"] },
];

/**
 * Database sudah menolak produk aktif tanpa harga atau berat, jadi baris yang
 * datanya belum lengkap di sini berarti ada yang janggal dan dilewati, bukan ditampilkan setengah.
 */
export function keProduk(
  baris: Pick<
    BarisProduk,
    "id" | "slug" | "name" | "category" | "unit_type" | "description" | "net_weight_gram" | "ship_weight_gram" | "price" | "image_path"
  >,
): Produk | null {
  if (baris.price === null || baris.net_weight_gram === null || baris.ship_weight_gram === null) return null;

  return {
    id: baris.id,
    slug: baris.slug,
    nama: baris.name,
    kategori: (KATEGORI as readonly string[]).includes(baris.category)
      ? (baris.category as Kategori)
      : "ikan",
    satuan: (SATUAN as readonly string[]).includes(baris.unit_type)
      ? (baris.unit_type as Satuan)
      : "bungkus",
    deskripsi: baris.description,
    beratIsiGram: baris.net_weight_gram,
    beratKirimGram: baris.ship_weight_gram,
    harga: baris.price,
    fotoUrl: urlFotoProduk(baris.image_path),
  };
}
