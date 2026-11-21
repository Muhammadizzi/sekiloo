/**
 * Pemformatan angka.
 *
 * Uang disimpan sebagai bilangan bulat rupiah di data (45000), dan baru
 * diubah jadi teks di sini. Alasannya sederhana: begitu harga disimpan
 * sebagai string "Rp 45.000", ia tidak bisa dijumlahkan lagi — dan
 * keranjang belanja butuh menjumlahkannya.
 *
 * Formatter dibuat sekali di luar fungsi karena membuat objek Intl
 * tergolong mahal, sementara harga dirender berkali-kali di satu halaman.
 */
const formatterAngka = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/** 45000 → "Rp 45.000" */
export function formatRupiah(nilai: number): string {
  return `Rp ${formatterAngka.format(nilai)}`;
}

/** 450 → "450 g", 1200 → "1,2 kg", 2000 → "2 kg" */
export function formatBerat(gram: number): string {
  if (gram < 1000) return `${gram} g`;
  const kg = Math.round(gram / 100) / 10;
  return `${String(kg).replace(".", ",")} kg`;
}

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// WIB tetap UTC+7 tanpa musim panas. Dihitung manual, bukan lewat Intl,
// supaya teks dari server dan browser selalu sama persis saat hidrasi.
const WIB_MS = 7 * 60 * 60 * 1000;

function keWib(iso: string): Date {
  return new Date(Date.parse(iso) + WIB_MS);
}

/** "2026-11-20T10:45:00Z" → "Kamis, 20 November" */
export function formatTanggalWib(iso: string): string {
  const d = keWib(iso);
  return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]}`;
}

/** "2026-11-20T10:45:00Z" → "17.45" */
export function formatJamWib(iso: string): string {
  const d = keWib(iso);
  const jam = String(d.getUTCHours()).padStart(2, "0");
  const menit = String(d.getUTCMinutes()).padStart(2, "0");
  return `${jam}.${menit}`;
}

/** Kolom `date` tanpa zona waktu: "2026-11-22" → "Minggu, 22 November" */
export function formatTanggalKalender(tanggal: string): string {
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  const d = new Date(Date.UTC(tahun, bulan - 1, hari));
  return `${HARI[d.getUTCDay()]}, ${hari} ${BULAN[bulan - 1]}`;
}

/** Nomor WhatsApp format 62 → "0812 3456 7890", supaya mudah dicocokkan pembeli dengan kontak di HP-nya. */
export function formatNomorTampil(nomor: string): string {
  return `0${nomor.slice(2)}`.replace(/(\d{4})(\d{4})(\d+)/, "$1 $2 $3");
}
