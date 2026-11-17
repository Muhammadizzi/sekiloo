import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** Di Netlify, x-nf-client-connection-ip diisi Netlify sendiri, jadi tidak bisa dipalsukan pengunjung. */
export async function ambilIpKlien(): Promise<string | null> {
  const h = await headers();
  return (
    h.get("x-nf-client-connection-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null
  );
}

/** Database hanya menyimpan hash bergaram, bukan alamat IP asli (PRD Bagian 12). */
export function hashIp(ip: string): string {
  const garam = process.env.IP_HASH_SALT;
  if (!garam) throw new Error("IP_HASH_SALT belum diisi (lihat .env.example).");
  return createHash("sha256").update(`${garam}:${ip}`).digest("hex");
}
