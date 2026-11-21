import { revalidateTag } from "next/cache";
import { cekStatusTransaksi, signatureCocok, waktuMidtransKeIso } from "@/lib/server/midtrans";
import { panggilRpcAdmin } from "@/lib/server/supabase-admin";

/**
 * Notifikasi pembayaran dari Midtrans (PRD 10.2).
 * Balasan 5xx membuat Midtrans mengirim ulang, jadi hanya dipakai untuk gangguan di pihak kita.
 */
export async function POST(permintaan: Request) {
  let notifikasi: Record<string, unknown>;
  try {
    notifikasi = (await permintaan.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ pesan: "isi bukan JSON" }, { status: 400 });
  }

  const orderId = String(notifikasi.order_id ?? "");
  const signature = String(notifikasi.signature_key ?? "");
  if (!orderId || !signature) return Response.json({ pesan: "data tidak lengkap" }, { status: 400 });

  try {
    const cocok = signatureCocok({
      order_id: orderId,
      status_code: String(notifikasi.status_code ?? ""),
      gross_amount: String(notifikasi.gross_amount ?? ""),
      signature_key: signature,
    });
    if (!cocok) {
      console.warn(`[midtrans] signature tidak cocok untuk ${orderId}`);
      return Response.json({ pesan: "signature tidak cocok" }, { status: 401 });
    }

    // Status diambil ulang dari API Midtrans dan dipakai sebagai sumber kebenaran, bukan isi notifikasi.
    const status = await cekStatusTransaksi(orderId);
    const hasil = await panggilRpcAdmin<string>("apply_payment_notification", {
      p_invoice_number: status.order_id,
      p_transaction_id: status.transaction_id,
      p_transaction_status: status.transaction_status,
      p_gross_amount: Number(status.gross_amount),
      p_transaction_time: status.transaction_time
        ? waktuMidtransKeIso(status.transaction_time)
        : new Date().toISOString(),
      p_raw_payload: { notifikasi, status },
      p_fraud_status: status.fraud_status ?? null,
      p_payment_type: status.payment_type ?? null,
    });

    if (!hasil.ok) {
      console.error(`[midtrans] ${orderId} gagal diproses: ${hasil.galat.kode}`);
      return Response.json({ pesan: "gagal diproses" }, { status: 500 });
    }

    console.info(`[midtrans] ${orderId} ${status.transaction_status}: ${hasil.data}`);
    // Pesanan yang batal melepas kapasitas, jadi kartu kloter perlu data baru (PRD 10.2 no. 7).
    if (hasil.data !== "duplikat") revalidateTag("kloter", { expire: 0 });
    return Response.json({ pesan: hasil.data });
  } catch (galat) {
    console.error(`[midtrans] ${orderId} gagal:`, galat instanceof Error ? galat.message : galat);
    return Response.json({ pesan: "gangguan server" }, { status: 500 });
  }
}
