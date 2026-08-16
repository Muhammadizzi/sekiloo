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
