import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Catatan "data ini masih karangan".
 *
 * Kenapa ini terlihat di halaman, bukan cuma jadi komentar di kode:
 * komentar di kode tidak akan pernah dilihat pemilik usaha saat meninjau
 * lewat HP. Kalau penanda placeholder tidak kelihatan, cara paling umum
 * data karangan lolos ke produksi adalah karena tidak ada yang ingat.
 *
 * ⚠️ SEBELUM TAYANG: hapus SEMUA pemakaian komponen ini. Cukup cari kata
 * "CatatanPlaceholder" di seluruh proyek — tidak boleh ada yang tersisa.
 */
export function CatatanPlaceholder({
  judul,
  className,
  children,
}: {
  judul: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <aside
      className={cn(
        "border-warn/40 bg-warn/10 rounded-sm border border-dashed p-4",
        className,
      )}
    >
      <p className="text-warn flex items-start gap-2 text-sm font-semibold">
        {/* Segitiga peringatan. Dekoratif — maknanya sudah dibawa teks di sebelahnya. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 size-5 shrink-0"
          aria-hidden
          focusable="false"
        >
          <path d="M12 4 2.5 20h19L12 4Z" />
          <path d="M12 10v4.5M12 17.2v.1" />
        </svg>
        <span>Catatan untuk pemilik — {judul}</span>
      </p>
      <div className="text-content-soft mt-2 space-y-1.5 pl-7 text-sm">
        {children}
      </div>
    </aside>
  );
}
