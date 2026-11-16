import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Pengganti isi saat datanya kosong atau gagal dimuat.
 * Garis putus-putus menandai "tempat yang belum terisi", beda dari kartu berisi data.
 */
export function PesanKeadaan({
  judul,
  aksi,
  className,
  children,
}: {
  judul: string;
  aksi?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("border-line-strong bg-surface rounded-lg border border-dashed p-block", className)}>
      <p className="font-display text-content text-xl font-semibold">{judul}</p>
      <div className="text-content-soft mt-2 max-w-prose">{children}</div>
      {aksi && <div className="mt-block">{aksi}</div>}
    </div>
  );
}
