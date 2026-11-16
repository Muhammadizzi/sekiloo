import { cn } from "@/lib/cn";

/**
 * Pengganti foto produk selama foto asli belum ada.
 *
 * Sengaja berupa SVG inline, bukan berkas gambar dummy:
 * - tidak ada berkas biner menumpuk di repo yang nanti lupa dihapus,
 * - jelas terbaca sebagai "belum ada foto", bukan disangka foto asli,
 * - tidak menambah unduhan jaringan.
 *
 * Bingkai putus-putus di dalamnya bukan hiasan: itulah yang membuat
 * kotak ini terbaca sebagai TEMPAT YANG MENUNGGU DIISI, bukan sebagai
 * kotak abu-abu yang memang bagian dari desain. Bedanya penting saat
 * halaman ini ditunjukkan ke orang lain.
 *
 * Ukurannya mengikuti kotak pembungkus yang sudah punya aspect-ratio
 * tetap, jadi tata letak tidak bergeser saat nanti diganti foto asli.
 */

/* Dua zona warna, dua pasang warna. Placeholder di zona gelap yang
   memakai warna zona terang akan menyala seperti lubang di halaman. */
const nada = {
  light: {
    latar: "bg-surface-muted",
    bingkai: "border-line-strong",
    label: "text-content-soft",
    catatan: "text-content-muted",
    ikon: "text-content-muted",
  },
  dark: {
    latar: "bg-ink-800",
    bingkai: "border-ink-500",
    label: "text-on-dark-soft",
    catatan: "text-on-dark-muted",
    ikon: "text-on-dark-muted",
  },
} as const;

export function FotoPlaceholder({
  label,
  catatan,
  tone = "light",
  className,
}: {
  /** Teks di bawah ikon. Kosongkan untuk versi kecil (thumbnail). */
  label?: string;
  /** Baris kedua, mis. rasio yang diharapkan. Hanya tampil bila ada label. */
  catatan?: string;
  /** Zona warna tempat placeholder ini berdiri. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const warna = nada[tone];

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center p-2",
        warna.latar,
        className,
      )}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-3 text-center",
          warna.bingkai,
        )}
      >
        <svg
          viewBox="0 0 160 100"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("w-2/5 max-w-20 opacity-40", warna.ikon)}
          aria-hidden
          focusable="false"
        >
          <path d="M20 50c16-28 76-28 100 0-24 28-84 28-100 0Z" />
          <path d="M120 50l26-19-5 19 5 19-26-19Z" />
          <path d="M56 28c8 13 8 31 0 44" />
          <circle cx="42" cy="43" r="3.5" fill="currentColor" stroke="none" />
        </svg>

        {label && (
          <p className={cn("text-xs leading-snug font-medium", warna.label)}>
            {label}
          </p>
        )}
        {label && catatan && (
          <p className={cn("text-xs leading-snug", warna.catatan)}>{catatan}</p>
        )}
      </div>
    </div>
  );
}
