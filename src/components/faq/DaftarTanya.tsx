import type { ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";

export type Tanya = { tanya: string; jawab: ReactNode };

/**
 * Tanya jawab memakai <details>, jadi bisa dibuka dan ditutup tanpa JavaScript dan langsung
 * bisa dipakai dengan keyboard. Isi jawaban tetap ada di HTML, jadi ikut terbaca mesin pencari.
 */
export function DaftarTanya({ daftar }: { daftar: Tanya[] }) {
  return (
    <div className="border-line bg-surface divide-line divide-y rounded-lg border">
      {daftar.map((t) => (
        <details key={t.tanya} className="group">
          <summary className="text-content hover:bg-surface-muted flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
            {t.tanya}
            <ChevronDownIcon className="text-content-muted size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="text-content-soft space-y-3 px-4 pb-4">{t.jawab}</div>
        </details>
      ))}
    </div>
  );
}
