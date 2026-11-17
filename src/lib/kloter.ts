import type { Database } from "@/types/database";
import { bacaPublik, type Hasil } from "@/lib/supabase/rest";

export type Kloter = Database["public"]["Functions"]["get_open_batch"]["Returns"][number];

/** Hasil `get_open_batch`: `null` berarti tidak ada kloter yang sedang buka. */
export type HasilKloter = Hasil<Kloter | null>;

export const JALUR_KLOTER = "rpc/get_open_batch";

export function ambilKloterPertama(hasil: Hasil<Kloter[]>): HasilKloter {
  return hasil.ok ? { ok: true, data: hasil.data[0] ?? null } : hasil;
}

/** Dipanggil dari browser supaya sisa kapasitas tetap segar walau halamannya dari cache. */
export async function ambilKloterTerbaru(): Promise<HasilKloter> {
  return ambilKloterPertama(await bacaPublik<Kloter[]>(JALUR_KLOTER, "tanpa-cache"));
}

export type AlasanTidakBisaPesan = "gagal" | "tidak-ada" | "tutup" | "penuh";

export type StatusPemesanan =
  | { bisa: true; kloter: Kloter }
  | { bisa: false; alasan: AlasanTidakBisaPesan; kloter: Kloter | null };

export const PESAN_TIDAK_BISA_PESAN: Record<AlasanTidakBisaPesan, string> = {
  gagal: "Status kloter belum bisa dimuat. Muat ulang halaman ini sebentar lagi.",
  "tidak-ada": "Belum ada kloter yang buka. Jadwal berikutnya kami umumkan lewat WhatsApp.",
  tutup: "Pemesanan kloter ini sudah ditutup.",
  penuh: "Kapasitas kloter ini sudah habis.",
};

/** `sekarang` dari useKloterSegar, supaya status berganti tepat di jam tutup checkout. */
export function statusPemesanan(hasil: HasilKloter, sekarang: number): StatusPemesanan {
  if (!hasil.ok) return { bisa: false, alasan: "gagal", kloter: null };
  const kloter = hasil.data;
  if (!kloter) return { bisa: false, alasan: "tidak-ada", kloter: null };
  if (sekarang >= Date.parse(kloter.checkout_closes_at)) return { bisa: false, alasan: "tutup", kloter };
  if (kloter.remaining_gram <= 0) return { bisa: false, alasan: "penuh", kloter };
  return { bisa: true, kloter };
}

export type Kapasitas = {
  persenTerisi: number;
  teksSisa: string;
  penuh: boolean;
};

export function hitungKapasitas(kloter: Kloter): Kapasitas {
  const sisa = Math.max(0, kloter.remaining_gram);
  const terisi = kloter.capacity_gram > 0 ? kloter.used_gram / kloter.capacity_gram : 1;
  // Dibulatkan ke bawah dan ditahan di 99 selama masih ada sisa, supaya tidak tampil 100% padahal belum penuh.
  const persen = sisa > 0 ? Math.min(99, Math.floor(terisi * 100)) : 100;

  let teksSisa: string;
  if (sisa <= 0) teksSisa = "kapasitas habis";
  else if (sisa < 1000) teksSisa = "sisa kurang dari 1 kg";
  else teksSisa = `sisa ±${Math.floor(sisa / 1000)} kg`;

  return { persenTerisi: persen, teksSisa, penuh: sisa <= 0 };
}
