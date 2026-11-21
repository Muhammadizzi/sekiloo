import "server-only";
import { konfigurasiSupabase } from "@/lib/supabase/rest";

export type GalatRpc = { kode: string; detail: string | null };

function headerAdmin(): Record<string, string> {
  const kunci = process.env.SUPABASE_SECRET_KEY;
  if (!kunci) throw new Error("SUPABASE_SECRET_KEY belum diisi (lihat .env.example).");
  const header: Record<string, string> = { apikey: kunci, Accept: "application/json" };
  // Legacy service_role key berupa JWT dan perlu header Authorization; secret key baru cukup apikey.
  if (kunci.startsWith("eyJ")) header.Authorization = `Bearer ${kunci}`;
  return header;
}

/** Baca tabel dengan secret key. Hanya untuk data yang memang tertutup RLS, seperti pesanan. */
export async function bacaAdmin<T>(jalur: string): Promise<{ ok: true; data: T } | { ok: false }> {
  const { url } = konfigurasiSupabase();
  try {
    const respons = await fetch(`${url}/rest/v1/${jalur}`, { headers: headerAdmin(), cache: "no-store" });
    if (!respons.ok) {
      console.error(`[supabase-admin] baca gagal: HTTP ${respons.status}`);
      return { ok: false };
    }
    return { ok: true, data: (await respons.json()) as T };
  } catch (galat) {
    console.error("[supabase-admin] baca gagal:", galat instanceof Error ? galat.message : galat);
    return { ok: false };
  }
}

/**
 * Memanggil fungsi database dengan secret key, yang menembus RLS. Hanya untuk fungsi yang memang
 * dikunci untuk server, seperti create_order. Galat dari `raise exception` dikembalikan sebagai kode.
 */
export async function panggilRpcAdmin<T>(
  fungsi: string,
  argumen: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { ok: false; galat: GalatRpc }> {
  const { url } = konfigurasiSupabase();

  const respons = await fetch(`${url}/rest/v1/rpc/${fungsi}`, {
    method: "POST",
    headers: { ...headerAdmin(), "Content-Type": "application/json" },
    body: JSON.stringify(argumen),
    cache: "no-store",
  });

  if (respons.ok) return { ok: true, data: (await respons.json()) as T };

  let isi: { message?: string; details?: string | null } = {};
  try {
    isi = await respons.json();
  } catch {
    // Respons bukan JSON; cukup pakai kode HTTP.
  }
  return { ok: false, galat: { kode: isi.message ?? `http_${respons.status}`, detail: isi.details ?? null } };
}
