import { Linking } from "react-native";
import { ENV } from "./env";
import { formatRupiah, formatTanggalKalender } from "./format";

/**
 * Pesan WhatsApp manual (PRD 7.4): tombol membuka WhatsApp dengan teks terisi, admin tinggal menekan kirim.
 * Kalimat tentang OTP dan biaya refund wajib ada di pesan refund (PRD 14.3).
 */
export function tautanStatus(token: string): string | null {
  return ENV.situs ? `${ENV.situs}/pesanan/${token}` : null;
}

function baris(...isi: (string | null | false | undefined)[]): string {
  return isi.filter(Boolean).join("\n\n");
}

function linkStatus(token: string): string | null {
  const url = tautanStatus(token);
  return url ? `Status pesanan: ${url}` : null;
}

export function bukaWhatsApp(nomor: string, teks: string): Promise<void> {
  return Linking.openURL(`https://wa.me/${nomor}?text=${encodeURIComponent(teks)}`);
}

export function pesanDiantarHariIni(p: { nama: string; invoice: string; token: string; perkiraanJam: string }): string {
  const jam = p.perkiraanJam.trim();
  return baris(
    `Halo Kak ${p.nama}, pesanan Sealauk ${p.invoice} kami antar hari ini${jam ? `, perkiraan pukul ${jam}` : ""}.`,
    "Ikan asap perlu segera disimpan dingin, jadi mohon ada yang menerima di alamat. Kalau tidak ada orang di rumah, balas pesan ini supaya kami atur.",
    linkStatus(p.token),
  );
}

const SEBAB_GAGAL: Record<string, string> = {
  tidak_di_tempat: "tidak ada yang menerima di alamat",
  tidak_bisa_dihubungi: "nomor Kakak tidak bisa kami hubungi",
  alamat_tidak_ditemukan: "alamatnya belum kami temukan",
  ditolak: "pesanannya tidak diterima di alamat",
};

export function pesanGagalAntar(p: { nama: string; invoice: string; token: string; alasan: string | null }): string {
  const sebab = (p.alasan && SEBAB_GAGAL[p.alasan]) || "pesanannya belum bisa kami serahkan";
  return baris(
    `Halo Kak ${p.nama}, kami sudah mencoba mengantar pesanan Sealauk ${p.invoice}, tapi ${sebab}.`,
    "Ikannya kami simpan lagi di freezer. Kapan Kakak bisa menerima? Balas pesan ini supaya kami atur antar ulang.",
    linkStatus(p.token),
  );
}

const SEBAB_REFUND: Record<string, string> = {
  batch_min_not_met: "Kloter pesanan Kakak batal karena sampai PO ditutup jumlah pesanannya belum memenuhi minimum.",
  batch_cancelled: "Kloter pesanan Kakak dibatalkan.",
  production_failed: "Ikan untuk pesanan Kakak gagal diproduksi.",
  damaged_in_transit: "Pesanan Kakak rusak dalam perjalanan ke Cikarang.",
  paid_after_cancel: "Pembayaran Kakak masuk setelah pesanannya batal.",
  delivery_failed: "Pesanan Kakak tidak berhasil diantar.",
  admin: "Pesanan Kakak kami batalkan.",
};

export function pesanRefund(p: { nama: string; invoice: string; token: string; alasan: string; jumlah: number }): string {
  return baris(
    `Halo Kak ${p.nama}, ini admin Sealauk soal pesanan ${p.invoice}.`,
    `${SEBAB_REFUND[p.alasan] ?? "Pesanan Kakak dibatalkan."} Mohon maaf. Pembayaran Kakak sebesar ${formatRupiah(p.jumlah)} akan kami kembalikan penuh.`,
    "Mohon balas dengan nomor rekening atau e-wallet tujuan, beserta nama pemiliknya.",
    "Admin Sealauk tidak pernah meminta kode OTP, PIN, password, atau biaya apa pun untuk refund.",
    linkStatus(p.token),
  );
}

export function pesanKloterBerangkat(p: { nama: string; invoice: string; token: string; tanggalAntar: string }): string {
  return baris(
    `Halo Kak ${p.nama}, pesanan Sealauk ${p.invoice} sudah berangkat ke Cikarang dalam cool box.`,
    `Jadwal antar: ${formatTanggalKalender(p.tanggalAntar)}.`,
    linkStatus(p.token),
  );
}

export function pesanJadwalBerubah(p: { nama: string; invoice: string; token: string; tanggalAntar: string; alasan: string }): string {
  return baris(
    `Halo Kak ${p.nama}, jadwal kloter pesanan Sealauk ${p.invoice} berubah. Jadwal antar sekarang ${formatTanggalKalender(p.tanggalAntar)}.`,
    `Alasannya: ${p.alasan}.`,
    "Kalau ada pertanyaan, balas pesan ini.",
    linkStatus(p.token),
  );
}

export function namaPanggilan(nama: string): string {
  return nama.trim().split(/\s+/)[0] ?? nama;
}
