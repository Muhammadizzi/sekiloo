/**
 * Validasi data checkout. Dipakai browser untuk memberi tahu lebih awal, dan server sebagai pemeriksaan
 * yang sebenarnya. Batasnya sama dengan constraint tabel `orders` dan fungsi `create_order`.
 */

export const MAKS_PER_PRODUK = 10;
const MAKS_JENIS_PRODUK = 20;
const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sama dengan _in_service_area di database. Kotak perkiraan, ikut diganti kalau batas di database diganti.
const BATAS_CIKARANG = { latMin: -6.43, latMaks: -6.2, lngMin: 107.03, lngMaks: 107.28 };

export function dalamWilayahCikarang(lat: number, lng: number): boolean {
  return (
    lat >= BATAS_CIKARANG.latMin &&
    lat <= BATAS_CIKARANG.latMaks &&
    lng >= BATAS_CIKARANG.lngMin &&
    lng <= BATAS_CIKARANG.lngMaks
  );
}

/** "0812-3456-7890", "+62 812...", "812..." → "6281234567890". `null` kalau bukan nomor HP Indonesia. */
export function normalisasiNomorWa(masukan: string): string | null {
  let angka = masukan.replace(/\D/g, "");
  if (angka.startsWith("0")) angka = `62${angka.slice(1)}`;
  else if (angka.startsWith("8")) angka = `62${angka}`;
  return /^628[0-9]{8,11}$/.test(angka) ? angka : null;
}

export type ItemPesanan = { produkId: string; jumlah: number };

export type MasukanPesanan = {
  kloterId: string;
  item: ItemPesanan[];
  wilayahId: string;
  nama: string;
  wa: string;
  alamat: string;
  patokan: string;
  lat: number | null;
  lng: number | null;
  penerimaBeda: boolean;
  namaPenerima: string;
  waPenerima: string;
  setuju: boolean;
};

export type Kolom =
  | "keranjang"
  | "nama"
  | "wa"
  | "wilayah"
  | "alamat"
  | "patokan"
  | "lokasi"
  | "namaPenerima"
  | "waPenerima"
  | "setuju";

export type GalatKolom = Partial<Record<Kolom, string>>;

export type DataPesanan = {
  kloterId: string;
  item: ItemPesanan[];
  wilayahId: string;
  nama: string;
  wa: string;
  alamat: string;
  patokan: string | null;
  lat: number;
  lng: number;
  namaPenerima: string | null;
  waPenerima: string | null;
};

export function periksaDataPesanan(
  m: MasukanPesanan,
): { ok: true; data: DataPesanan } | { ok: false; galat: GalatKolom } {
  const galat: GalatKolom = {};

  const id = new Set<string>();
  const keranjangSah =
    POLA_UUID.test(m.kloterId) &&
    m.item.length >= 1 &&
    m.item.length <= MAKS_JENIS_PRODUK &&
    m.item.every((i) => {
      const sah =
        POLA_UUID.test(i.produkId) &&
        !id.has(i.produkId) &&
        Number.isInteger(i.jumlah) &&
        i.jumlah >= 1 &&
        i.jumlah <= MAKS_PER_PRODUK;
      id.add(i.produkId);
      return sah;
    });
  if (!keranjangSah) galat.keranjang = "Isi keranjang tidak valid. Buka lagi halaman keranjang.";

  const nama = m.nama.trim();
  if (nama.length < 2 || nama.length > 100) galat.nama = "Isi nama pemesan, 2 sampai 100 huruf.";

  const wa = normalisasiNomorWa(m.wa);
  if (!wa) galat.wa = "Nomor WhatsApp belum benar. Contoh: 0812 3456 7890.";

  if (!POLA_UUID.test(m.wilayahId)) galat.wilayah = "Pilih kecamatan tempat ikan diantar.";

  const alamat = m.alamat.trim();
  if (alamat.length < 10 || alamat.length > 500) {
    galat.alamat = "Tulis alamat lengkap: jalan, nomor rumah, RT/RW, perumahan atau cluster.";
  }

  const patokan = m.patokan.trim();
  if (patokan.length > 300) galat.patokan = "Patokan paling banyak 300 huruf.";

  if (m.lat === null || m.lng === null || !Number.isFinite(m.lat) || !Number.isFinite(m.lng)) {
    galat.lokasi = "Taruh pin di lokasi rumahmu pada peta.";
  } else if (!dalamWilayahCikarang(m.lat, m.lng)) {
    galat.lokasi = "Pin berada di luar wilayah antar Cikarang. Geser pin ke alamatmu.";
  }

  let namaPenerima: string | null = null;
  let waPenerima: string | null = null;
  if (m.penerimaBeda) {
    namaPenerima = m.namaPenerima.trim();
    if (namaPenerima.length < 2 || namaPenerima.length > 100) {
      galat.namaPenerima = "Isi nama penerima, 2 sampai 100 huruf.";
    }
    waPenerima = normalisasiNomorWa(m.waPenerima);
    if (!waPenerima) galat.waPenerima = "Nomor WhatsApp penerima belum benar.";
  }

  if (!m.setuju) galat.setuju = "Centang persetujuan dulu sebelum membuat pesanan.";

  if (Object.keys(galat).length > 0 || !wa || m.lat === null || m.lng === null) return { ok: false, galat };

  return {
    ok: true,
    data: {
      kloterId: m.kloterId,
      item: m.item,
      wilayahId: m.wilayahId,
      nama,
      wa,
      alamat,
      patokan: patokan || null,
      lat: m.lat,
      lng: m.lng,
      namaPenerima,
      waPenerima,
    },
  };
}

/** Kode galat dari `create_order` diterjemahkan ke kalimat untuk pembeli. */
export function terjemahkanGalatPesanan(kode: string, detail: string | null): { pesan: string; kolom?: Kolom } {
  const angka = (kunci: string) => {
    try {
      const nilai = detail ? (JSON.parse(detail) as Record<string, unknown>)[kunci] : undefined;
      return typeof nilai === "number" ? nilai : null;
    } catch {
      return null;
    }
  };

  switch (kode) {
    case "persetujuan_wajib":
      return { pesan: "Centang persetujuan dulu sebelum membuat pesanan.", kolom: "setuju" };
    case "kloter_tutup":
      return { pesan: "Kloter ini sudah tidak menerima pesanan. Jadwal berikutnya kami umumkan lewat WhatsApp." };
    case "wilayah_tidak_dilayani":
      return { pesan: "Kecamatan ini belum kami layani. Pilih kecamatan lain.", kolom: "wilayah" };
    case "lokasi_di_luar_cikarang":
      return { pesan: "Pin berada di luar wilayah antar Cikarang. Geser pin ke alamatmu.", kolom: "lokasi" };
    case "keranjang_tidak_valid":
      return { pesan: "Isi keranjang tidak valid. Buka lagi halaman keranjang.", kolom: "keranjang" };
    case "produk_tidak_tersedia":
      return { pesan: "Ada produk di keranjang yang sudah tidak dijual. Cek lagi keranjangmu.", kolom: "keranjang" };
    case "melebihi_berat_maksimal": {
      const maks = angka("maks_gram");
      return {
        pesan: `Berat pesanan melebihi batas per pesanan${maks ? ` (${maks / 1000} kg)` : ""}. Kurangi isi keranjang.`,
        kolom: "keranjang",
      };
    }
    case "kapasitas_penuh": {
      const sisa = angka("sisa_gram");
      return {
        pesan:
          sisa && sisa >= 1000
            ? `Sisa kapasitas kloter tinggal ±${Math.floor(sisa / 1000)} kg. Kurangi isi keranjang.`
            : "Kapasitas kloter ini sudah tidak cukup untuk pesananmu.",
        kolom: "keranjang",
      };
    }
    case "terlalu_banyak_pesanan_belum_dibayar":
      return {
        pesan:
          "Nomor WhatsApp ini masih punya 2 pesanan yang belum dibayar. Bayar salah satunya, atau tunggu sampai batas bayarnya lewat.",
        kolom: "wa",
      };
    case "terlalu_banyak_percobaan":
      return { pesan: "Terlalu banyak pesanan dari jaringan ini dalam satu jam. Coba lagi nanti." };
    case "data_pembeli_tidak_valid":
      return { pesan: "Data pemesan belum sesuai. Periksa lagi nama, nomor WhatsApp, dan alamat." };
    default:
      return { pesan: "Pesanan belum bisa dibuat. Coba lagi sebentar lagi." };
  }
}
