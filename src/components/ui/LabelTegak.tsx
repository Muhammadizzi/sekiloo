import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Label tegak di tepi hero, untuk zona gelap. Dibaca dari bawah ke atas,
 * searah asap yang naik. Di bawah `md` jadi mendatar karena teks tegak
 * memakan lebar layar HP. Bukan untuk harga, nama produk, tombol, atau status.
 */
export function LabelTegak({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-gold-400 flex items-center gap-3 md:flex-col md:self-stretch",
        className,
      )}
    >
      <span
        aria-hidden
        className="bg-gold-500/60 h-px w-6 shrink-0 md:h-auto md:min-h-12 md:w-px md:flex-1"
      />
      <span className="font-display text-sm tracking-[0.02em] md:rotate-180 md:text-[0.95rem] md:whitespace-nowrap md:[writing-mode:vertical-rl]">
        {children}
      </span>
    </p>
  );
}
