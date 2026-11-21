#!/usr/bin/env node
/**
 * Cek otomatis dari Daftar Cek Sebelum Rilis (PRD Bagian 14.4).
 * Nomor di depan setiap baris sama dengan nomor di tabel PRD.
 *
 *   node scripts/cek-rilis.mjs --situs http://localhost:3000
 *   node scripts/cek-rilis.mjs --situs https://sealauk.id --tanpa-bundle
 *   node scripts/cek-rilis.mjs --situs http://localhost:3000 --apk /jalur/ke/hasil-expo-export
 *
 * Membaca URL Supabase dan publishable key dari environment atau .env.local. Kunci rahasia hanya
 * dibaca untuk mencari nilainya di bundle browser, dan tidak pernah dicetak atau dikirim ke mana pun.
 * Cek ini tidak menulis apa pun ke database. Cek yang butuh akun, HP, atau pesanan sungguhan
 * (no. 1, 2, 4 bagian login, 7, 8, 10, 12, 13, 14) tetap dijalankan manual sesuai docs/uji-rilis.md.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const argumen = process.argv.slice(2);
const ambilArg = (nama) => {
  const i = argumen.indexOf(nama);
  return i >= 0 ? argumen[i + 1] : undefined;
};
const situs = (ambilArg("--situs") ?? "").replace(/\/+$/, "");
const jalurApk = ambilArg("--apk");
const tanpaBundle = argumen.includes("--tanpa-bundle");

if (!situs) {
  console.error("Pakai: node scripts/cek-rilis.mjs --situs <alamat web> [--tanpa-bundle] [--apk <folder expo export>]");
  process.exit(2);
}

function bacaEnvLokal() {
  if (!existsSync(".env.local")) return {};
  const hasil = {};
  for (const baris of readFileSync(".env.local", "utf8").split("\n")) {
    const cocok = baris.match(/^([A-Z0-9_]+)=(.*)$/);
    if (cocok) hasil[cocok[1]] = cocok[2].trim().replace(/^["']|["']$/g, "");
  }
  return hasil;
}
const env = { ...bacaEnvLokal(), ...process.env };
const urlSupabase = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const kunciPublik = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
if (!urlSupabase || !kunciPublik) {
  console.error("NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum ada di environment atau .env.local.");
  process.exit(2);
}

const hasil = [];
function catat(nomor, judul, lolos, keterangan) {
  hasil.push({ nomor, judul, lolos, keterangan });
}

async function minta(url, opsi = {}) {
  try {
    const respons = await fetch(url, { redirect: "manual", ...opsi });
    const teks = await respons.text();
    return { status: respons.status, header: respons.headers, teks };
  } catch (galat) {
    return { status: 0, header: new Headers(), teks: String(galat) };
  }
}

const headerPublik = { apikey: kunciPublik, "Content-Type": "application/json" };

// Ditolak = 401/403 atau kode izin Postgres 42501. Kosong juga aman. Selain itu dianggap bocor.
function ditolakAtauKosong(r) {
  if (r.status === 401 || r.status === 403 || r.teks.includes('"42501"')) return true;
  return r.status === 200 && r.teks.trim() === "[]";
}

async function cekTabelTertutup() {
  const tabel = ["orders", "order_items", "payments", "refunds", "status_log", "checkout_attempts", "lookup_attempts", "admin_roles"];
  const bocor = [];
  for (const t of tabel) {
    const r = await minta(`${urlSupabase}/rest/v1/${t}?select=*&limit=1`, { headers: headerPublik });
    if (!ditolakAtauKosong(r)) bocor.push(`${t} (HTTP ${r.status})`);
  }
  catat(3, "Tabel pesanan tertutup dari publik", bocor.length === 0, bocor.length ? `terbaca: ${bocor.join(", ")}` : `${tabel.length} tabel ditolak`);
}

async function cekFungsiTertutup() {
  const kontrol = await minta(`${urlSupabase}/rest/v1/rpc/get_open_batch`, { method: "POST", headers: headerPublik, body: "{}" });
  if (kontrol.status !== 200) {
    catat(3, "Fungsi server dan admin tertutup dari publik", false, `kontrol get_open_batch gagal (HTTP ${kontrol.status}), kunci publik mungkin salah`);
    return;
  }
  const nol = "00000000-0000-0000-0000-000000000000";
  // Argumen lengkap supaya PostgREST menemukan fungsinya dan yang menolak adalah izin, bukan tanda tangan fungsi.
  const fungsi = {
    create_order: { p_batch_id: nol, p_items: [], p_area_id: nol, p_buyer_name: "x", p_buyer_phone: "6281", p_address_text: "x", p_lat: 0, p_lng: 0, p_consent: true },
    apply_payment_notification: { p_invoice_number: "x", p_transaction_id: "x", p_transaction_status: "settlement", p_gross_amount: 1, p_transaction_time: new Date().toISOString(), p_raw_payload: {} },
    simpan_tautan_bayar: { p_order_id: nol, p_snap_token: "x", p_redirect_url: "https://x" },
    cari_pesanan: { p_invoice: "x", p_phone: "6281", p_ip_hash: "x" },
    run_scheduled_jobs: {},
    admin_daftar_kloter: {},
    admin_pesanan_kloter: { p_batch_id: nol },
    admin_daftar_antar: { p_batch_id: nol },
    admin_daftar_refund: {},
    batch_depart: { p_batch_id: nol },
    order_cancel: { p_order_id: nol, p_reason: "admin" },
    refund_complete: { p_refund_id: nol, p_proof_path: "x" },
  };
  const bocor = [];
  for (const [nama, isi] of Object.entries(fungsi)) {
    const r = await minta(`${urlSupabase}/rest/v1/rpc/${nama}`, { method: "POST", headers: headerPublik, body: JSON.stringify(isi) });
    if (!(r.status === 401 || r.status === 403 || r.teks.includes('"42501"'))) bocor.push(`${nama} (HTTP ${r.status})`);
  }
  catat(3, "Fungsi server dan admin tertutup dari publik", bocor.length === 0, bocor.length ? `tidak ditolak: ${bocor.join(", ")}` : `${Object.keys(fungsi).length} fungsi ditolak`);
}

async function cekPendaftaranMati() {
  const r = await minta(`${urlSupabase}/auth/v1/settings`, { headers: { apikey: kunciPublik } });
  let mati = false;
  try {
    mati = JSON.parse(r.teks).disable_signup === true;
  } catch {
    // Respons bukan JSON berarti setelannya tidak terbaca, dan dianggap belum lolos.
  }
  catat(4, "Pendaftaran akun Supabase dimatikan", mati, mati ? "disable_signup aktif" : "pendaftaran masih terbuka: matikan di Authentication, Sign In / Providers");
}

async function cekBucketPrivat() {
  const terbuka = [];
  for (const bucket of ["delivery-proofs", "refund-proofs"]) {
    const r = await minta(`${urlSupabase}/storage/v1/object/public/${bucket}/cek-rilis.webp`);
    if (r.status === 200) terbuka.push(bucket);
    const daftar = await minta(`${urlSupabase}/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { ...headerPublik, Authorization: `Bearer ${kunciPublik}` },
      body: JSON.stringify({ prefix: "", limit: 1 }),
    });
    if (daftar.status === 200 && daftar.teks.trim() !== "[]") terbuka.push(`${bucket} (daftar file)`);
  }
  catat(6, "Bucket bukti antar dan refund privat", terbuka.length === 0, terbuka.length ? `terbuka: ${terbuka.join(", ")}` : "URL publik dan daftar file ditolak");
}

function semuaFile(folder) {
  const daftar = [];
  for (const nama of readdirSync(folder)) {
    const jalur = join(folder, nama);
    if (statSync(jalur).isDirectory()) daftar.push(...semuaFile(jalur));
    else daftar.push(jalur);
  }
  return daftar;
}

function cekBundle(folder, label) {
  if (!existsSync(folder)) {
    catat(5, `Kunci rahasia tidak ada di ${label}`, false, `${folder} tidak ada. Jalankan build dulu, atau pakai --tanpa-bundle`);
    return;
  }
  const namaRahasia = ["SUPABASE_SECRET_KEY", "TURNSTILE_SECRET_KEY", "IP_HASH_SALT", "MIDTRANS_SERVER_KEY"];
  const nilaiRahasia = namaRahasia.map((n) => env[n]).filter((v) => typeof v === "string" && v.length >= 8);
  const temuan = new Set();
  for (const file of semuaFile(folder)) {
    const isi = readFileSync(file);
    const teks = isi.toString("latin1");
    for (const n of namaRahasia) if (teks.includes(n)) temuan.add(`nama ${n}`);
    for (const v of nilaiRahasia) if (isi.includes(Buffer.from(v))) temuan.add("nilai salah satu kunci rahasia");
    // Bundle Hermes menyambung string berurutan, jadi literal "sb_secret_" milik supabase-js bisa
    // tertempel dengan string berikutnya ("sb_secret__es..."). Yang dicari adalah kunci utuh.
    if (/sb_secret_[A-Za-z0-9_-]{8,}/.test(teks.replace(/sb_secret__/g, ""))) temuan.add("pola sb_secret_");
  }
  catat(
    5,
    `Kunci rahasia tidak ada di ${label}`,
    temuan.size === 0,
    temuan.size ? `ditemukan: ${[...temuan].join(", ")}` : `nama dan ${nilaiRahasia.length} nilai kunci yang terisi tidak ditemukan`,
  );
}

async function cekWebhook() {
  const r = await minta(`${situs}/api/webhooks/midtrans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: "SLK-000000-0000", status_code: "200", gross_amount: "10000.00", signature_key: "a".repeat(128) }),
  });
  const keterangan =
    r.status === 401
      ? "signature palsu dibalas 401"
      : r.status === 500
        ? "dibalas 500: MIDTRANS_SERVER_KEY kemungkinan belum diisi di server"
        : `dibalas HTTP ${r.status}`;
  catat(9, "Webhook dengan signature palsu ditolak", r.status === 401, keterangan);
}

async function cekHalamanStatus() {
  const token = randomBytes(16).toString("hex");
  const r = await minta(`${situs}/pesanan/${token}`);
  const referrer = r.header.get("referrer-policy") ?? "";
  const robots = r.header.get("x-robots-tag") ?? "";
  const lolos = referrer.includes("no-referrer") && robots.includes("noindex");
  catat(11, "Halaman status: no-referrer dan noindex", lolos, `Referrer-Policy "${referrer}", X-Robots-Tag "${robots}"`);
}

async function cekSegarkanTanpaSesi() {
  const r = await minta(`${situs}/api/admin/segarkan`, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"tag":"katalog"}' });
  catat(3, "Pembaruan cache web menolak permintaan tanpa sesi admin", r.status === 401, `dibalas HTTP ${r.status}`);
}

async function cekDataContoh() {
  const halaman = ["/", "/produk", "/halal", "/privasi", "/syarat", "/cek-pesanan", "/keranjang", "/checkout"];
  const masalah = [];
  for (const jalur of halaman) {
    const r = await minta(`${situs}${jalur}`);
    if (r.status >= 400 || r.status === 0) {
      masalah.push(`${jalur} gagal dibuka (HTTP ${r.status})`);
      continue;
    }
    if (r.teks.includes("Catatan untuk pemilik")) masalah.push(`${jalur} masih berisi catatan untuk pemilik`);
    if (r.teks.includes("6280000000000") || r.teks.includes("0800 0000 0000")) masalah.push(`${jalur} masih memakai nomor WhatsApp contoh`);
  }
  catat(15, "Tidak ada data contoh yang tayang", masalah.length === 0, masalah.length ? masalah.join("; ") : `${halaman.length} halaman bersih`);
}

await cekTabelTertutup();
await cekFungsiTertutup();
await cekSegarkanTanpaSesi();
await cekPendaftaranMati();
if (!tanpaBundle) cekBundle(".next/static", "bundle browser");
if (jalurApk) cekBundle(jalurApk, "bundle APK");
await cekBucketPrivat();
await cekWebhook();
await cekHalamanStatus();
await cekDataContoh();

hasil.sort((a, b) => a.nomor - b.nomor);
for (const h of hasil) {
  console.log(`${h.lolos ? "LOLOS" : "GAGAL"}  [${String(h.nomor).padStart(2)}] ${h.judul}: ${h.keterangan}`);
}
const gagal = hasil.filter((h) => !h.lolos).length;
console.log(`\n${hasil.length - gagal} lolos, ${gagal} gagal. Cek no. 1, 2, 4 (login tanpa 2FA), 7, 8, 10, 12, 13, 14 dijalankan manual (docs/uji-rilis.md).`);
process.exit(gagal ? 1 : 0);
