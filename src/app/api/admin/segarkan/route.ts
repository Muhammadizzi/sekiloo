import { revalidateTag } from "next/cache";
import { konfigurasiSupabase } from "@/lib/supabase/rest";

const TAG_DIIZINKAN = new Set(["katalog", "kloter"]);

/**
 * Dipanggil APK admin setelah produk, wilayah, atau kloter diubah, supaya web tidak menunggu cache habis.
 * Pengenalnya token sesi admin, bukan kunci rahasia bersama, karena APK tidak boleh membawa rahasia (PRD 14.2).
 */
export async function POST(permintaan: Request) {
  const token = permintaan.headers.get("authorization")?.match(/^Bearer ([\w.-]{20,4096})$/)?.[1];
  if (!token) return Response.json({ pesan: "token tidak ada" }, { status: 401 });

  let tag: unknown;
  try {
    tag = ((await permintaan.json()) as { tag?: unknown }).tag;
  } catch {
    return Response.json({ pesan: "isi bukan JSON" }, { status: 400 });
  }
  if (typeof tag !== "string" || !TAG_DIIZINKAN.has(tag)) {
    return Response.json({ pesan: "tag tidak dikenal" }, { status: 400 });
  }

  const { url, kunci } = konfigurasiSupabase();
  try {
    // admin_role() hanya mengembalikan peran untuk sesi admin yang sudah lolos 2FA (aal2).
    const respons = await fetch(`${url}/rest/v1/rpc/admin_role`, {
      method: "POST",
      headers: { apikey: kunci, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    if (!respons.ok) return Response.json({ pesan: "sesi tidak sah" }, { status: 401 });
    const peran: unknown = await respons.json();
    if (typeof peran !== "string") return Response.json({ pesan: "bukan admin" }, { status: 403 });
  } catch (galat) {
    console.error("[segarkan] gagal memeriksa sesi admin:", galat);
    return Response.json({ pesan: "gangguan" }, { status: 502 });
  }

  // Kedaluwarsa langsung, bukan stale-while-revalidate: harga dan ongkir lama tidak boleh tampil lagi.
  revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true });
}
