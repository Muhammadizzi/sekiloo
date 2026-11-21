import { Platform } from "react-native";

/**
 * Warna Dapur Asap, disalin dari src/app/globals.css di web supaya kedua aplikasi terasa satu merek.
 * Angka kontras di komentar dihitung terhadap latar yang disebut, sama seperti di web.
 */
export const warna = {
  tinta950: "#0c0a09",
  tinta900: "#1c1917", // header
  tinta800: "#292524",
  tinta700: "#44403c",
  emas700: "#a16207", // teks emas di latar terang (4.92:1 pada putih)
  emas500: "#c9a227", // garis motif
  emas400: "#e3b341", // tombol utama, teks emas di header (8.99:1 pada tinta900)
  emas200: "#f0dfa8",
  permukaan: "#ffffff",
  latar: "#fafaf9",
  redup: "#f5f5f4",
  garis: "#e7e5e4",
  garisTegas: "#d6d3d1",
  isi: "#0c0a09",
  isiLembut: "#44403c", // 10.27:1 pada putih
  isiRedup: "#57534e", // 7.63:1 pada putih
  // Teks contoh di isian: lebih muda supaya tidak dikira sudah terisi, tetap di atas 4.5:1 (4.8:1 pada putih).
  isiContoh: "#78716c",
  diAtasGelap: "#fafaf9",
  diAtasGelapRedup: "#a8a29e", // 6.93:1 pada tinta900
  halal600: "#15803d",
  halal50: "#f0fdf4",
  bahaya: "#b91c1c", // 6.47:1 pada putih
  bahaya50: "#fef2f2",
  waspada: "#92400e", // 7.09:1 pada putih
  waspada50: "#fffbeb",
  info: "#1d4ed8",
  info50: "#eff6ff",
} as const;

export const jarak = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const radius = { kecil: 6, sedang: 10 } as const;

// Serif dipakai untuk judul layar saja, sama seperti font display di web. Android memetakannya ke Noto Serif.
export const hurufJudul = Platform.select({ ios: "Georgia", default: "serif" });

/** Target sentuh minimum (PRD 19.3). */
export const TINGGI_SENTUH = 48;
