import { ENV } from "./env";
import { supabase } from "./supabase";

export type TagWeb = "katalog" | "kloter";

/**
 * Meminta web pembeli memperbarui cache setelah produk, wilayah, atau kloter diubah. Tanpa ini,
 * katalog di web baru berganti setelah cache habis (5 menit). Web memeriksa token sesi admin ini
 * ke Supabase, jadi APK tidak perlu menyimpan kunci rahasia apa pun.
 *
 * Gagal di sini tidak membatalkan perubahan: data di database sudah benar, web hanya terlambat menampilkannya.
 */
export async function segarkanWeb(tag: TagWeb): Promise<boolean> {
  if (!ENV.situs) return false;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return false;
    const respons = await fetch(`${ENV.situs}/api/admin/segarkan`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });
    return respons.ok;
  } catch {
    return false;
  }
}
