import { cn } from "@/lib/cn";

/**
 * Pengganti foto produk selama foto asli belum ada.
 *
 * Sengaja berupa SVG inline, bukan berkas gambar dummy:
 * - tidak ada berkas biner menumpuk di repo yang nanti lupa dihapus,
 * - jelas terbaca sebagai "belum ada foto", bukan disangka foto asli,
 * - tidak menambah unduhan jaringan.
 *
 * Ukurannya mengikuti kotak pembungkus yang sudah punya aspect-ratio
 * tetap, jadi tata letak tidak bergeser saat nanti diganti foto asli.
 */
export function FotoPlaceholder({
  label,
  className,
}: {
  /** Teks di bawah ikon. Kosongkan untuk versi kecil (thumbnail). */
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface-muted flex h-full w-full flex-col items-center justify-center gap-2 p-3",
        className,
      )}
    >
      <svg
        viewBox="0 0 160 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-content-muted w-2/5 max-w-24 opacity-30"
        aria-hidden
        focusable="false"
      >
        <path d="M20 50c16-28 76-28 100 0-24 28-84 28-100 0Z" />
        <path d="M120 50l26-19-5 19 5 19-26-19Z" />
        <path d="M56 28c8 13 8 31 0 44" />
        <circle cx="42" cy="43" r="3.5" fill="currentColor" stroke="none" />
      </svg>
      {label && (
        <p className="text-content-muted text-center text-xs leading-snug">
          {label}
        </p>
      )}
    </div>
  );
}
