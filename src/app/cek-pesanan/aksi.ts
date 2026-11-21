"use server";

import { redirect } from "next/navigation";
import { normalisasiNomorWa } from "@/lib/pesanan";
import { ambilIpKlien, hashIp } from "@/lib/server/ip";
import { panggilRpcAdmin } from "@/lib/server/supabase-admin";

/** Isian ikut dikembalikan, karena React mengosongkan form setelah Server Action selesai. */
export type HasilCekPesanan = { galat: string | null; kolom?: "invoice" | "wa"; invoice?: string; wa?: string };

const POLA_INVOICE = /^SLK-\d{6}-\d{4,}$/;

/** Nomor pesanan dan nomor WhatsApp harus cocok; percobaan dibatasi per IP di database (PRD 6.5). */
export async function cariPesanan(_sebelumnya: HasilCekPesanan, data: FormData): Promise<HasilCekPesanan> {
  const isian = { invoice: String(data.get("invoice") ?? ""), wa: String(data.get("wa") ?? "") };
  const invoice = isian.invoice.trim().toUpperCase();
  const wa = normalisasiNomorWa(isian.wa);

  if (!POLA_INVOICE.test(invoice)) {
    return { ...isian, galat: "Nomor pesanan diawali SLK-, contohnya SLK-261121-0001.", kolom: "invoice" };
  }
  if (!wa) return { ...isian, galat: "Nomor WhatsApp belum benar. Contoh: 0812 3456 7890.", kolom: "wa" };

  let token: string | null;
  try {
    const ip = await ambilIpKlien();
    const hasil = await panggilRpcAdmin<string | null>("cari_pesanan", {
      p_invoice: invoice,
      p_phone: wa,
      p_ip_hash: hashIp(ip ?? "tidak-diketahui"),
    });
    if (!hasil.ok) {
      return {
        ...isian,
        galat:
          hasil.galat.kode === "terlalu_banyak_percobaan"
            ? "Terlalu banyak percobaan dari jaringan ini. Coba lagi satu jam lagi."
            : "Pencarian sedang bermasalah. Coba lagi sebentar lagi.",
      };
    }
    token = hasil.data;
  } catch (galat) {
    console.error("[cek-pesanan] gagal:", galat instanceof Error ? galat.message : galat);
    return { ...isian, galat: "Pencarian sedang bermasalah. Coba lagi sebentar lagi." };
  }

  if (!token) {
    return {
      ...isian,
      galat: "Pesanan tidak ditemukan. Periksa lagi nomor pesanan dan nomor WhatsApp yang dipakai saat memesan.",
    };
  }
  redirect(`/pesanan/${token}`);
}
