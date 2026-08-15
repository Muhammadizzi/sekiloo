/**
 * Ikon SVG inline.
 *
 * Kenapa inline dan bukan paket ikon:
 * - Nol dependensi & nol unduhan jaringan saat build.
 * - Hanya ikon yang benar-benar dipakai yang ikut terkirim.
 *
 * Konsistensi visual: semua ikon memakai grid 24, gaya garis (outline),
 * dan stroke 1.5. Jangan campur dengan ikon isian (filled) di level
 * hierarki yang sama.
 *
 * Aksesibilitas: ikon di sini selalu dekoratif (aria-hidden), karena
 * setiap pemakaian sudah didampingi teks yang terbaca. Kalau nanti ada
 * tombol ikon-saja, tombolnya yang wajib diberi aria-label.
 */

type IconProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

/** Perisai bercentang — dipakai untuk halal & jaminan keamanan pangan. */
export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Keranjang belanja. */
export function CartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.55L20.5 8H6" />
      <circle cx="10" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </svg>
  );
}

/** Penanda lokasi — untuk 3 titik pengambilan. */
export function MapPinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/** Telepon / WhatsApp. */
export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3h1Z" />
    </svg>
  );
}

/** Daun — untuk manfaat gizi / bahan alami. */
export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20c0-8 5-13 16-13 0 9-4.5 14-11 14a5 5 0 0 1-5-1Z" />
      <path d="M9.5 14.5 18 8" />
    </svg>
  );
}

/** Termometer — untuk info suhu penyimpanan / proses pengasapan. */
export function ThermometerIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0Z" />
      <path d="M8 8H4M8 12H5" />
    </svg>
  );
}

/** Centang polos — daftar poin terverifikasi. */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

/** Menu hamburger — navigasi HP. */
export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
