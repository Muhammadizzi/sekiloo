import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ShieldCheckIcon } from "@/components/icons";

/**
 * Badge / label status.
 *
 * Aturan yang dipegang di sini: WARNA TIDAK PERNAH JADI SATU-SATUNYA
 * PEMBAWA MAKNA. Setiap badge selalu punya teks, dan badge penting
 * juga punya ikon. Ini penting untuk pengguna buta warna, dan juga
 * untuk badge halal yang tidak boleh ambigu.
 */
type BadgeTone =
  | "halal"
  | "neutral"
  | "gold"
  | "info"
  | "warn"
  | "danger"
  | "onDark";

const tones: Record<BadgeTone, string> = {
  halal: "bg-halal-50 text-halal-800 border-halal-300",
  neutral: "bg-surface-muted text-content-soft border-line-strong",
  gold: "bg-gold-200/40 text-gold-700 border-gold-500/50",
  info: "bg-info/10 text-info border-info/30",
  warn: "bg-warn/10 text-warn border-warn/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  /* Untuk dipakai DI ATAS zona gelap. */
  onDark: "bg-on-dark/10 text-on-dark-soft border-ink-500",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border",
        "px-2.5 py-1 text-sm font-medium leading-tight",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * Badge Halal — komponen tersendiri, bukan sekadar `<Badge tone="halal">`.
 *
 * Dibedakan karena inilah elemen yang paling menentukan apakah pengunjung
 * jadi membeli atau tidak (lihat PRD bagian 5.2). Konsekuensinya:
 *
 * - Hijau, bukan emas. Emas berarti "mewah"; halal harus terbaca sebagai
 *   "terverifikasi". Mencampur keduanya melemahkan keduanya.
 * - Nomor sertifikat bisa ditampilkan langsung di badge. Klaim halal tanpa
 *   nomor yang bisa dicek adalah klaim kosong, dan pembeli yang ragu
 *   justru yang paling teliti membacanya.
 * - Ikon perisai + teks, jadi maknanya tetap sampai tanpa warna.
 */
export function HalalBadge({
  certificateNumber,
  size = "md",
  className,
}: {
  certificateNumber?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const isSmall = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border",
        "border-halal-300 bg-halal-50 text-halal-800",
        isSmall ? "px-2.5 py-1" : "px-3 py-1.5",
        className,
      )}
    >
      <ShieldCheckIcon className={isSmall ? "size-4" : "size-5"} />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-semibold",
            isSmall ? "text-sm" : "text-base",
          )}
        >
          Halal
        </span>
        {certificateNumber && (
          <span className="tabular block text-xs font-normal text-halal-600">
            No. {certificateNumber}
          </span>
        )}
      </span>
    </span>
  );
}
