import "server-only";
import { namaDepan, samarkanAlamat, samarkanNomor } from "@/lib/samaran";
import { bacaAdmin } from "@/lib/server/supabase-admin";
import type { Hasil } from "@/lib/supabase/rest";

/** Data halaman status, sudah disamarkan. Nomor HP dan alamat lengkap tidak pernah keluar dari server. */
export type PesananTampil = {
  invoice: string;
  statusPesanan: string;
  statusBayar: string;
  subtotal: number;
  ongkir: number;
  total: number;
  batasBayar: string;
  untuk: string;
  nomor: string;
  alamat: string;
  kecamatan: string;
  namaKloter: string | null;
  tanggalAntar: string | null;
  percobaanAntar: number;
  alasanBatal: string | null;
  urlBayar: string | null;
  item: { nama: string; satuan: string; jumlah: number; harga: number }[];
};

/** Bahan untuk membuat ulang tautan bayar. Hanya dipakai di server. */
export type PesananUntukBayar = {
  orderId: string;
  invoice: string;
  total: number;
  batasBayar: string;
  statusPesanan: string;
  urlBayar: string | null;
};

type Baris = {
  id: string;
  invoice_number: string;
  order_status: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  expires_at: string;
  buyer_name: string;
  buyer_phone: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  address_text: string;
  delivery_attempts: number;
  cancel_reason: string | null;
  snap_redirect_url: string | null;
  service_areas: { name: string } | null;
  po_batches: { name: string; delivery_date: string } | null;
  order_items: { quantity: number; price_at_purchase: number; products: { name: string; unit_type: string } | null }[];
};

const KOLOM = [
  "id,invoice_number,order_status,payment_status,subtotal,delivery_fee,total_amount,expires_at",
  "buyer_name,buyer_phone,recipient_name,recipient_phone,address_text,delivery_attempts,cancel_reason,snap_redirect_url",
  "service_areas(name),po_batches(name,delivery_date),order_items(quantity,price_at_purchase,products(name,unit_type))",
].join(",");

// 128 bit acak dalam heksadesimal, dibuat database. Bentuk lain ditolak sebelum query.
export const POLA_TOKEN = /^[0-9a-f]{32}$/;

async function bacaBaris(token: string): Promise<Hasil<Baris | null>> {
  if (!POLA_TOKEN.test(token)) return { ok: true, data: null };
  const hasil = await bacaAdmin<Baris[]>(`orders?select=${KOLOM}&status_token=eq.${token}&limit=1`);
  return hasil.ok ? { ok: true, data: hasil.data[0] ?? null } : hasil;
}

/** `diambilPada` dipakai halaman sebagai "sekarang" untuk menentukan apakah batas bayar sudah lewat. */
export async function ambilPesananLewatToken(
  token: string,
): Promise<{ hasil: Hasil<PesananTampil | null>; diambilPada: number }> {
  const baris = await bacaBaris(token);
  const diambilPada = Date.now();
  if (!baris.ok) return { hasil: baris, diambilPada };
  if (!baris.data) return { hasil: { ok: true, data: null }, diambilPada };
  const b = baris.data;

  return {
    diambilPada,
    hasil: {
      ok: true,
      data: {
      invoice: b.invoice_number,
      statusPesanan: b.order_status,
      statusBayar: b.payment_status,
      subtotal: b.subtotal,
      ongkir: b.delivery_fee,
      total: b.total_amount,
      batasBayar: b.expires_at,
      untuk: namaDepan(b.recipient_name ?? b.buyer_name),
      nomor: samarkanNomor(b.recipient_phone ?? b.buyer_phone),
      alamat: samarkanAlamat(b.address_text),
      kecamatan: b.service_areas?.name ?? "-",
      namaKloter: b.po_batches?.name ?? null,
      tanggalAntar: b.po_batches?.delivery_date ?? null,
      percobaanAntar: b.delivery_attempts,
      alasanBatal: b.cancel_reason,
      urlBayar: b.snap_redirect_url,
      item: b.order_items.map((i) => ({
        nama: i.products?.name ?? "Produk",
        satuan: i.products?.unit_type ?? "bungkus",
        jumlah: i.quantity,
        harga: i.price_at_purchase,
      })),
      },
    },
  };
}

export async function ambilPesananUntukBayar(token: string): Promise<Hasil<PesananUntukBayar | null>> {
  const hasil = await bacaBaris(token);
  if (!hasil.ok || !hasil.data) return hasil.ok ? { ok: true, data: null } : hasil;
  const b = hasil.data;
  return {
    ok: true,
    data: {
      orderId: b.id,
      invoice: b.invoice_number,
      total: b.total_amount,
      batasBayar: b.expires_at,
      statusPesanan: b.order_status,
      urlBayar: b.snap_redirect_url,
    },
  };
}
