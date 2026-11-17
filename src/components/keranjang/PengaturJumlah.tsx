"use client";

import { cn } from "@/lib/cn";

const tombol =
  "text-content hover:bg-surface-muted active:bg-line inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-xl leading-none transition-colors touch-manipulation disabled:cursor-not-allowed disabled:opacity-40";

/** Tombol kurang dan tambah 44px. Angkanya diumumkan pembaca layar saat berubah. */
export function PengaturJumlah({
  nilai,
  min = 1,
  maks,
  label,
  onUbah,
  className,
}: {
  nilai: number;
  min?: number;
  maks: number;
  /** Nama produknya, untuk pembaca layar. */
  label: string;
  onUbah: (nilai: number) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={`Jumlah ${label}`}
      className={cn("border-line-strong bg-surface inline-flex items-center rounded-md border", className)}
    >
      <button
        type="button"
        className={cn(tombol, "rounded-l-md")}
        onClick={() => onUbah(nilai - 1)}
        disabled={nilai <= min}
        aria-label={`Kurangi ${label}`}
      >
        −
      </button>
      <output aria-live="polite" className="tabular text-content min-w-8 text-center font-semibold">
        {nilai}
      </output>
      <button
        type="button"
        className={cn(tombol, "rounded-r-md")}
        onClick={() => onUbah(nilai + 1)}
        disabled={nilai >= maks}
        aria-label={`Tambah ${label}`}
      >
        +
      </button>
    </div>
  );
}
