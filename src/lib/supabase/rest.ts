/**
 * Akses baca publik ke Supabase lewat REST (PostgREST), dengan publishable key.
 * Yang terbaca dibatasi RLS: produk dan wilayah aktif, plus fungsi get_open_batch.
 * Sengaja memakai fetch biasa supaya cache Next.js (revalidate dan tag) bisa diatur per data.
 */

export type Hasil<T> = { ok: true; data: T } | { ok: false };

export function konfigurasiSupabase() {
  // Ditulis lengkap, bukan lewat process.env[nama], supaya Next.js bisa menyisipkan nilainya ke bundle browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kunci = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !kunci) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diisi (lihat .env.example).",
    );
  }
  return { url, kunci };
}

type OpsiCache =
  | { revalidate: number; tags: string[] }
  | "tanpa-cache";

/**
 * Gagal jaringan atau respons bukan 2xx dikembalikan sebagai `{ ok: false }`,
 * supaya halaman menampilkan keadaan gagal, bukan error 500.
 */
export async function bacaPublik<T>(jalur: string, cache: OpsiCache): Promise<Hasil<T>> {
  const { url, kunci } = konfigurasiSupabase();

  try {
    const respons = await fetch(`${url}/rest/v1/${jalur}`, {
      headers: { apikey: kunci, Accept: "application/json" },
      ...(cache === "tanpa-cache" ? { cache: "no-store" as const } : { next: cache }),
    });
    if (!respons.ok) {
      console.error(`[supabase] ${jalur} gagal: HTTP ${respons.status}`);
      return { ok: false };
    }
    return { ok: true, data: (await respons.json()) as T };
  } catch (galat) {
    console.error(`[supabase] ${jalur} gagal:`, galat);
    return { ok: false };
  }
}

/** URL publik foto di bucket `product-images`. `image_path` berisi path di dalam bucket. */
export function urlFotoProduk(path: string | null): string | null {
  if (!path) return null;
  const { url } = konfigurasiSupabase();
  return `${url}/storage/v1/object/public/product-images/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
