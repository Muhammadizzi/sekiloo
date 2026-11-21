import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

function konfigurasi() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum diisi (lihat .env.example).");
  const produksi = process.env.MIDTRANS_IS_PRODUCTION === "true";
  return {
    serverKey,
    urlSnap: produksi
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions",
    urlApi: produksi ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com",
    otorisasi: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
  };
}

const WIB_MS = 7 * 60 * 60 * 1000;

/** Format waktu yang diminta Midtrans: "2026-11-21 10:00:00 +0700". */
function waktuMidtrans(ms: number): string {
  const d = new Date(ms + WIB_MS);
  const dua = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${dua(d.getUTCMonth() + 1)}-${dua(d.getUTCDate())} ${dua(d.getUTCHours())}:${dua(d.getUTCMinutes())}:${dua(d.getUTCSeconds())} +0700`;
}

/** "2026-11-21 10:15:30" dari Midtrans (WIB) → ISO dengan zona waktu. */
export function waktuMidtransKeIso(waktu: string): string {
  return `${waktu.trim().replace(" ", "T")}+07:00`;
}

/**
 * Membuat transaksi Snap mode redirect, hanya QRIS (PRD 10.1).
 * Masa berlakunya dibulatkan ke bawah supaya tidak pernah melewati batas bayar pesanan.
 * Data pembeli sengaja tidak dikirim; Midtrans cukup tahu nomor pesanan dan totalnya.
 */
export async function buatTransaksiSnap(p: {
  invoice: string;
  total: number;
  batasBayar: string;
  urlSelesai: string;
}): Promise<{ token: string; urlBayar: string }> {
  const k = konfigurasi();
  const sekarang = Date.now();
  const menit = Math.floor((Date.parse(p.batasBayar) - sekarang) / 60_000);
  if (menit < 1) throw new Error("Batas bayar kurang dari satu menit, transaksi tidak dibuat.");

  const respons = await fetch(k.urlSnap, {
    method: "POST",
    headers: { Authorization: k.otorisasi, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      transaction_details: { order_id: p.invoice, gross_amount: p.total },
      enabled_payments: ["other_qris"],
      expiry: { start_time: waktuMidtrans(sekarang), unit: "minutes", duration: menit },
      page_expiry: { duration: menit, unit: "minutes" },
      callbacks: { finish: p.urlSelesai },
    }),
    cache: "no-store",
  });

  const isi = (await respons.json().catch(() => ({}))) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  };
  if (!respons.ok || !isi.token || !isi.redirect_url) {
    throw new Error(`Snap menolak: HTTP ${respons.status} ${(isi.error_messages ?? []).join("; ")}`);
  }
  return { token: isi.token, urlBayar: isi.redirect_url };
}

/** SHA512(order_id + status_code + gross_amount + Server Key), dibandingkan dengan waktu konstan (PRD 10.2 no. 1). */
export function signatureCocok(n: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const { serverKey } = konfigurasi();
  const harapan = Buffer.from(
    createHash("sha512").update(n.order_id + n.status_code + n.gross_amount + serverKey).digest("hex"),
  );
  const diterima = Buffer.from(n.signature_key);
  return harapan.length === diterima.length && timingSafeEqual(harapan, diterima);
}

export type StatusTransaksi = {
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  status_code: string;
  gross_amount: string;
  transaction_time?: string;
  fraud_status?: string;
  payment_type?: string;
};

/** Status langsung dari API Midtrans, dipakai sebagai sumber kebenaran sebelum data diubah (PRD 10.2 no. 2). */
export async function cekStatusTransaksi(orderId: string): Promise<StatusTransaksi> {
  const k = konfigurasi();
  const respons = await fetch(`${k.urlApi}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Authorization: k.otorisasi, Accept: "application/json" },
    cache: "no-store",
  });
  const isi = (await respons.json().catch(() => ({}))) as Partial<StatusTransaksi>;
  // Midtrans membalas HTTP 200 dengan status_code "404" kalau transaksinya tidak ada.
  if (!respons.ok || !isi.transaction_id || !isi.transaction_status || !isi.order_id || !isi.gross_amount) {
    throw new Error(`Cek status Midtrans gagal: HTTP ${respons.status}, status_code ${isi.status_code ?? "-"}`);
  }
  return isi as StatusTransaksi;
}
