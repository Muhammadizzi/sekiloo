import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Kartu.
 *
 * Varian `trust` ada untuk satu tujuan khusus: blok info keamanan
 * pangan & halal. Blok itu tidak boleh terlihat seperti dekorasi atau
 * iklan — ia harus terbaca seperti keterangan resmi. Karena itu ia
 * memakai hijau lembut dengan teks kontras tinggi, bukan emas.
 *
 * Varian `dark` hanya untuk kartu yang berdiri DI ATAS zona gelap.
 */
type CardVariant = "default" | "raised" | "trust" | "dark";

const variants: Record<CardVariant, string> = {
  default: "bg-surface border border-line shadow-card",
  raised: "bg-surface border border-line shadow-raised",
  trust: "bg-halal-50 border border-halal-300",
  dark: "bg-ink-800 border border-ink-500 text-on-dark",
};

/* Naik 2px dengan bayangan hanya di perangkat yang punya hover.
   Di HP, latar menggelap saat tautan di dalamnya ditekan. */
const interaktif = cn(
  "relative transition-[translate,box-shadow,border-color,background-color] duration-200 ease-out",
  "hover:border-line-strong hover:shadow-raised hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
  "has-[a:active]:bg-surface-muted",
  "has-[a:focus-visible]:outline-gold-500 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2",
);

/**
 * Kelas untuk satu tautan di dalam kartu `interactive`. Tautan meregang
 * menutupi kartu, dan cincin fokusnya pindah ke kartu supaya tidak dobel.
 */
export const tautanMeregang =
  "after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none!";

export function Card({
  variant = "default",
  interactive = false,
  className,
  children,
}: {
  variant?: CardVariant;
  /** Seluruh kartu bisa ditekan. Wajib berisi satu tautan ber-`tautanMeregang`. */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg",
        variants[variant],
        interactive && interaktif,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-block", className)}>{children}</div>;
}

export function CardTitle({
  as: Tag = "h3",
  className,
  children,
}: {
  as?: "h2" | "h3" | "h4";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn("font-display text-xl font-semibold", className)}>
      {children}
    </Tag>
  );
}

export function CardText({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("text-content-muted mt-2 text-base", className)}>
      {children}
    </p>
  );
}
