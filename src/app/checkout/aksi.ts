"use server";

import { updateTag } from "next/cache";
import { formatJamWib, formatTanggalWib } from "@/lib/format";
import {
  periksaDataPesanan,
  terjemahkanGalatPesanan,
  type GalatKolom,
  type ItemPesanan,
  type MasukanPesanan,
} from "@/lib/pesanan";
import { ambilIpKlien, hashIp } from "@/lib/server/ip";
import { panggilRpcAdmin } from "@/lib/server/supabase-admin";
import { verifikasiTurnstile } from "@/lib/server/turnstile";
import type { Database } from "@/types/database";

export type HasilCheckout =
  | { status: "awal" }
  | { status: "galat"; pesan: string; kolom: GalatKolom }
  | { status: "berhasil"; invoice: string; total: number; batasBayar: string };

type PesananBaru = Database["public"]["Functions"]["create_order"]["Returns"][number];

function teks(form: FormData, nama: string): string {
  const nilai = form.get(nama);
  return typeof nilai === "string" ? nilai : "";
}

function angka(form: FormData, nama: string): number | null {
  const nilai = teks(form, nama);
  return nilai === "" ? null : Number(nilai);
}

function bacaItem(form: FormData): ItemPesanan[] {
  try {
    const data: unknown = JSON.parse(teks(form, "item"));
    if (!Array.isArray(data)) return [];
    return data.map((i: { produkId?: unknown; jumlah?: unknown }) => ({
      produkId: String(i?.produkId ?? ""),
      jumlah: Number(i?.jumlah),
    }));
  } catch {
    return [];
  }
}

/**
 * Server Action bisa dipanggil siapa saja, jadi semua isian diperiksa ulang di sini.
 * Harga, ongkir, total, dan berat tidak dikirim browser; semuanya dihitung create_order dari database.
 */
export async function buatPesanan(_sebelumnya: HasilCheckout, form: FormData): Promise<HasilCheckout> {
  const masukan: MasukanPesanan = {
    kloterId: teks(form, "kloter_id"),
    item: bacaItem(form),
    wilayahId: teks(form, "wilayah_id"),
    nama: teks(form, "nama"),
    wa: teks(form, "wa"),
    alamat: teks(form, "alamat"),
    patokan: teks(form, "patokan"),
    lat: angka(form, "lat"),
    lng: angka(form, "lng"),
    penerimaBeda: teks(form, "penerima_beda") === "ya",
    namaPenerima: teks(form, "nama_penerima"),
    waPenerima: teks(form, "wa_penerima"),
    setuju: teks(form, "setuju") === "ya",
  };

  const periksa = periksaDataPesanan(masukan);
  if (!periksa.ok) {
    return { status: "galat", pesan: "Ada isian yang belum benar. Periksa tanda merah di form.", kolom: periksa.galat };
  }

  try {
    const ip = await ambilIpKlien();
    const token = teks(form, "cf-turnstile-response");
    if (!token || !(await verifikasiTurnstile(token, ip))) {
      return { status: "galat", pesan: "Pemeriksaan keamanan belum lolos. Tunggu sebentar, lalu kirim lagi.", kolom: {} };
    }

    const d = periksa.data;
    const hasil = await panggilRpcAdmin<PesananBaru[]>("create_order", {
      p_batch_id: d.kloterId,
      p_items: d.item.map((i) => ({ product_id: i.produkId, quantity: i.jumlah })),
      p_area_id: d.wilayahId,
      p_buyer_name: d.nama,
      p_buyer_phone: d.wa,
      p_address_text: d.alamat,
      p_lat: d.lat,
      p_lng: d.lng,
      p_consent: true,
      p_address_note: d.patokan,
      p_recipient_name: d.namaPenerima,
      p_recipient_phone: d.waPenerima,
      p_ip_hash: ip ? hashIp(ip) : null,
    });

    if (!hasil.ok) {
      // Hanya kode galat yang dicatat, tanpa data pembeli.
      console.warn(`[checkout] create_order ditolak: ${hasil.galat.kode}`);
      const { pesan, kolom } = terjemahkanGalatPesanan(hasil.galat.kode, hasil.galat.detail);
      return { status: "galat", pesan, kolom: kolom ? { [kolom]: pesan } : {} };
    }

    const pesanan = hasil.data[0];
    // Sisa kapasitas di kartu kloter langsung memperhitungkan pesanan ini.
    updateTag("kloter");

    return {
      status: "berhasil",
      invoice: pesanan.invoice_number,
      total: pesanan.total_amount,
      batasBayar: `${formatTanggalWib(pesanan.expires_at)}, pukul ${formatJamWib(pesanan.expires_at)} WIB`,
    };
  } catch (galat) {
    console.error("[checkout] gagal:", galat instanceof Error ? galat.message : galat);
    return {
      status: "galat",
      pesan: "Pesanan belum bisa dibuat karena gangguan di server. Coba lagi sebentar lagi.",
      kolom: {},
    };
  }
}
