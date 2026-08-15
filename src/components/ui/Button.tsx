import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Tombol.
 *
 * Varian sengaja dinamai per ZONA, bukan hanya per tingkat kepentingan.
 * Alasannya: satu warna outline tidak mungkin terbaca di latar terang
 * DAN latar gelap sekaligus. Memaksakannya adalah cara paling umum
 * sebuah desain dua-zona kehilangan kontras.
 *
 *   primary      — emas. Aksi utama. Terbaca di kedua zona.
 *   secondary    — isian gelap. Aksi utama alternatif di ZONA TERANG.
 *   outline      — garis gelap. Aksi sekunder di ZONA TERANG.
 *   outlineGold  — garis emas. Aksi sekunder di ZONA GELAP.
 *   ghost        — tanpa latar. Aksi tersier di ZONA TERANG.
 *   danger       — aksi merusak (mis. kosongkan keranjang).
 */
type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "outlineGold"
  | "ghost"
  | "danger";

type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-400 text-ink-900 hover:bg-gold-200 active:bg-gold-500 shadow-card font-semibold",
  secondary:
    "bg-ink-900 text-on-dark hover:bg-ink-800 active:bg-ink-950 shadow-card font-semibold",
  outline:
    "bg-transparent text-content border border-line-strong hover:bg-surface-muted active:bg-line font-medium",
  outlineGold:
    "bg-transparent text-gold-400 border border-gold-500 hover:bg-gold-400/10 active:bg-gold-400/20 font-medium",
  ghost:
    "bg-transparent text-content-soft hover:bg-surface-muted active:bg-line font-medium",
  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-80 shadow-card font-semibold",
};

/* Tinggi minimum menjaga area sentuh tetap nyaman di HP.
   `sm` = 40px masih di atas ambang WCAG 2.2 AA untuk web (24px),
   tapi jangan dipakai untuk aksi utama di layar sentuh. */
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-3.5 text-sm gap-1.5",
  md: "min-h-11 px-5 text-base gap-2",
  lg: "min-h-13 px-7 text-lg gap-2.5",
};

const shared = cn(
  "inline-flex items-center justify-center rounded-md",
  "cursor-pointer select-none",
  "transition-colors duration-150",
  "touch-manipulation", // hilangkan jeda 300ms di browser HP
  "disabled:pointer-events-none disabled:opacity-50",
);

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    children,
    className,
    ...rest
  } = props;

  const classes = cn(
    shared,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  if (rest.href !== undefined) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a {...anchorProps} className={classes}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...buttonProps}
      /* Nonaktifkan saat memuat supaya tidak terkirim dua kali. */
      disabled={buttonProps.disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
