import type { Database } from "@/types/database";

type Fungsi = Database["public"]["Functions"];
type Tabel = Database["public"]["Tables"];

export type KloterAdmin = Fungsi["admin_daftar_kloter"]["Returns"][number];
export type RekapProduk = Fungsi["admin_rekap_produksi"]["Returns"][number];
export type PesananKloter = Fungsi["admin_pesanan_kloter"]["Returns"][number];
export type PesananAntar = Fungsi["admin_daftar_antar"]["Returns"][number];
export type RefundAdmin = Fungsi["admin_daftar_refund"]["Returns"][number];
export type BarisKloter = Tabel["po_batches"]["Row"];
export type BarisProduk = Tabel["products"]["Row"];
export type BarisWilayah = Tabel["service_areas"]["Row"];

/** Pesanan yang ikut diproduksi dan dikirim: sudah lunas dan tidak batal. */
export function ikutKloter(p: Pick<PesananKloter, "payment_status" | "order_status">): boolean {
  return p.payment_status === "paid" && p.order_status !== "cancelled" && p.order_status !== "waiting_payment";
}
