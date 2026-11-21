// Sama dengan src/lib/format.ts di web, supaya angka dan tanggal di APK dan web selalu tertulis sama.
const formatterAngka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export function formatRupiah(nilai: number): string {
  return `Rp ${formatterAngka.format(nilai)}`;
}

/** 450 → "450 g", 1200 → "1,2 kg" */
export function formatBerat(gram: number): string {
  if (gram < 1000) return `${gram} g`;
  const kg = Math.round(gram / 100) / 10;
  return `${String(kg).replace(".", ",")} kg`;
}

export const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const HARI_PENDEK = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// WIB tetap UTC+7 tanpa musim panas. Dihitung manual supaya tidak bergantung pada zona waktu HP admin.
export const WIB_MS = 7 * 60 * 60 * 1000;

export function keWib(iso: string): Date {
  return new Date(Date.parse(iso) + WIB_MS);
}

export function formatTanggalWib(iso: string): string {
  const d = keWib(iso);
  return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]}`;
}

export function formatJamWib(iso: string): string {
  const d = keWib(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}.${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function formatWaktuWib(iso: string): string {
  return `${formatTanggalWib(iso)}, ${formatJamWib(iso)} WIB`;
}

/** Kolom `date`: "2026-11-22" → "Minggu, 22 November" */
export function formatTanggalKalender(tanggal: string): string {
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  const d = new Date(Date.UTC(tahun, bulan - 1, hari));
  return `${HARI[d.getUTCDay()]}, ${hari} ${BULAN[bulan - 1]}`;
}

/** "6281234567890" → "0812 3456 7890" */
export function formatNomorWa(nomor: string): string {
  return `0${nomor.slice(2)}`.replace(/(\d{4})(\d{4})(\d+)/, "$1 $2 $3");
}

/** Angka dari isian: "45.000" → 45000, "2,5" (desimal) → 2.5. Kosong atau rusak → null. */
export function bacaAngka(teks: string, desimal = false): number | null {
  const bersih = teks.trim().replace(/\s/g, "");
  if (bersih === "") return null;
  const normal = desimal ? bersih.replace(/\./g, "").replace(",", ".") : bersih.replace(/[.,]/g, "");
  if (!/^\d+(\.\d+)?$/.test(normal)) return null;
  return Number(normal);
}

/** Gram ke teks isian kg: 2500 → "2,5" */
export function gramKeKgTeks(gram: number): string {
  return String(gram / 1000).replace(".", ",");
}
