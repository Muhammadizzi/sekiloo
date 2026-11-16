import { cn } from "@/lib/cn";

/**
 * Kerangka saat memuat. Bentuknya harus meniru konten asli supaya halaman
 * tidak melompat, dan selalu dipasangkan dengan teks `role="status"`.
 * Ukuran dan radius diberikan lewat `className` oleh pemakainya.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-surface-muted relative block overflow-hidden",
        className,
      )}
    >
      {/* Kilau dihilangkan sepenuhnya, bukan dipercepat, saat "kurangi gerak" aktif. */}
      <span className="animate-kilau absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden" />
    </span>
  );
}
