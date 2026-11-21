"use server";

import { redirect } from "next/navigation";
import { ambilPesananUntukBayar } from "@/data/pesanan";
import { siapkanTautanBayar } from "@/lib/server/pembayaran";

export type HasilTautanBayar = { galat: string | null };

/** Untuk pesanan yang tautan bayarnya gagal dibuat saat checkout. Token pesanan menjadi kuncinya. */
export async function buatUlangTautanBayar(token: string): Promise<HasilTautanBayar> {
  const hasil = await ambilPesananUntukBayar(token);
  if (!hasil.ok) return { galat: "Status pesanan belum bisa diperiksa. Coba lagi sebentar lagi." };
  const pesanan = hasil.data;
  if (!pesanan || pesanan.statusPesanan !== "waiting_payment") {
    return { galat: "Pesanan ini sudah tidak menunggu pembayaran." };
  }
  if (Date.parse(pesanan.batasBayar) <= Date.now()) {
    return { galat: "Batas bayar pesanan ini sudah lewat." };
  }

  const urlBayar =
    pesanan.urlBayar ??
    (await siapkanTautanBayar({
      orderId: pesanan.orderId,
      invoice: pesanan.invoice,
      total: pesanan.total,
      batasBayar: pesanan.batasBayar,
      statusToken: token,
    }));
  if (!urlBayar) {
    return { galat: "Tautan pembayaran belum bisa dibuat. Coba lagi sebentar lagi, atau hubungi admin." };
  }
  redirect(urlBayar);
}
