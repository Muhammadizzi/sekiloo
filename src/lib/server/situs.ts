import "server-only";
import { headers } from "next/headers";

/** Alamat situs untuk tautan absolut. Di produksi isi SITE_URL; tanpa itu, diambil dari header permintaan. */
export async function alamatSitus(): Promise<string> {
  const tetap = process.env.SITE_URL;
  if (tetap) return tetap.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protokol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protokol}://${host}`;
}
