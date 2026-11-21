import "server-only";
import { buatTransaksiSnap } from "./midtrans";
import { alamatSitus } from "./situs";
import { panggilRpcAdmin } from "./supabase-admin";

/**
 * Membuat transaksi QRIS di Midtrans lalu menyimpan tautannya di pesanan.
 * `null` kalau gagal; pesanannya tetap ada, dan halaman status menyediakan tombol untuk mencoba lagi.
 */
export async function siapkanTautanBayar(p: {
  orderId: string;
  invoice: string;
  total: number;
  batasBayar: string;
  statusToken: string;
}): Promise<string | null> {
  try {
    const situs = await alamatSitus();
    const snap = await buatTransaksiSnap({
      invoice: p.invoice,
      total: p.total,
      batasBayar: p.batasBayar,
      urlSelesai: `${situs}/pesanan/${p.statusToken}`,
    });
    const simpan = await panggilRpcAdmin<boolean>("simpan_tautan_bayar", {
      p_order_id: p.orderId,
      p_snap_token: snap.token,
      p_redirect_url: snap.urlBayar,
    });
    if (!simpan.ok || simpan.data !== true) {
      console.error(`[pembayaran] tautan bayar ${p.invoice} tidak tersimpan`);
      return null;
    }
    return snap.urlBayar;
  } catch (galat) {
    console.error(`[pembayaran] tautan bayar ${p.invoice} gagal:`, galat instanceof Error ? galat.message : galat);
    return null;
  }
}
