import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Container — lebar konten yang konsisten di seluruh situs.
 *
 * Gutter melebar di layar besar supaya teks tidak menempel ke tepi,
 * dan max-width menahan baris agar tetap enak dibaca (bukan
 * membentang penuh di monitor lebar).
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl",
        "px-gutter md:px-gutter-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Section — pembungkus satu blok halaman.
 *
 * `tone` menentukan zona:
 *   light   — zona konten. Default, dan sengaja jadi default:
 *             sebagian besar halaman harus terang & terbaca.
 *   sunken  — zona konten dengan latar sedikit lebih redup, untuk
 *             memisahkan dua blok terang yang berdampingan.
 *   dark    — zona bingkai. Untuk hero dan penutup saja. Dipakai
 *             terlalu sering, keterbacaan halaman akan jatuh.
 */
type SectionTone = "light" | "sunken" | "dark";

const tones: Record<SectionTone, string> = {
  light: "bg-surface text-content",
  sunken: "bg-surface-sunken text-content",
  dark: "bg-ink-900 text-on-dark",
};

export function Section({
  tone = "light",
  title,
  description,
  headingLevel: Heading = "h2",
  id,
  className,
  children,
}: {
  tone?: SectionTone;
  title?: string;
  description?: string;
  /* Bisa diatur agar urutan h1→h2→h3 tidak pernah melompat. */
  headingLevel?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const isDark = tone === "dark";

  return (
    <section
      id={id}
      className={cn("py-section md:py-section-lg", tones[tone], className)}
    >
      <Container>
        {(title || description) && (
          <div className="mb-block max-w-2xl">
            {title && (
              <Heading
                className={cn(
                  "text-3xl font-semibold md:text-4xl",
                  isDark ? "text-on-dark" : "text-content",
                )}
              >
                {title}
              </Heading>
            )}
            {description && (
              <p
                className={cn(
                  "mt-stack text-lg",
                  isDark ? "text-on-dark-soft" : "text-content-muted",
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
