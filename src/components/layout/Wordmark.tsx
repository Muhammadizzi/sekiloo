import { cn } from "@/lib/cn";

/**
 * Nama merek berupa teks sampai logo asli dari pemilik siap.
 * Logo cukup dipasang di sini; header dan footer ikut berubah.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display leading-none font-semibold tracking-tight", className)}>
      sealauk
      <span className="text-gold-400" aria-hidden>
        .
      </span>
    </span>
  );
}
