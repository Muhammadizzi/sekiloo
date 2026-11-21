import { BULAN, HARI_PENDEK, keWib, WIB_MS } from "./format";

/** Tanggal kalender WIB dalam bentuk "YYYY-MM-DD", sama dengan kolom `date` di database. */
export type Tanggal = string;

function duaAngka(n: number): string {
  return String(n).padStart(2, "0");
}

export function hariIniWib(sekarang = Date.now()): Tanggal {
  return new Date(sekarang + WIB_MS).toISOString().slice(0, 10);
}

export function tambahHari(tanggal: Tanggal, hari: number): Tanggal {
  const [t, b, h] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(t, b - 1, h + hari)).toISOString().slice(0, 10);
}

export function deretTanggal(mulai: Tanggal, jumlah: number): Tanggal[] {
  return Array.from({ length: jumlah }, (_, i) => tambahHari(mulai, i));
}

/** "2026-11-26" → "Kam 26 Nov" */
export function labelTanggalPendek(tanggal: Tanggal): string {
  const [t, b, h] = tanggal.split("-").map(Number);
  const d = new Date(Date.UTC(t, b - 1, h));
  return `${HARI_PENDEK[d.getUTCDay()]} ${h} ${BULAN[b - 1].slice(0, 3)}`;
}

/** Tanggal dan jam WIB ("2026-11-26", "20:00") → ISO UTC untuk kolom timestamptz. */
export function keIsoWib(tanggal: Tanggal, jam: string): string {
  const [t, b, h] = tanggal.split("-").map(Number);
  const [j, m] = jam.split(":").map(Number);
  return new Date(Date.UTC(t, b - 1, h, j, m) - WIB_MS).toISOString();
}

export function dariIsoWib(iso: string): { tanggal: Tanggal; jam: string } {
  const d = keWib(iso);
  return {
    tanggal: `${d.getUTCFullYear()}-${duaAngka(d.getUTCMonth() + 1)}-${duaAngka(d.getUTCDate())}`,
    jam: `${duaAngka(d.getUTCHours())}:${duaAngka(d.getUTCMinutes())}`,
  };
}

/** Jam bulat 06.00 sampai 23.00, cukup untuk jam tutup PO. */
export const JAM_BULAT = Array.from({ length: 18 }, (_, i) => `${duaAngka(i + 6)}:00`);

export function labelJam(jam: string): string {
  return jam.replace(":", ".");
}
