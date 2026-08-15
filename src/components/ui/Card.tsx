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

export function Card({
  variant = "default",
  className,
  children,
}: {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-lg", variants[variant], className)}>
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
