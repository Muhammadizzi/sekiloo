import Link from "next/link";
import { cn } from "@/lib/cn";

export type ItemMenuTegak = {
  nomor: string;
  label: string;
  href: string;
};

/**
 * Menu kolom tegak untuk zona gelap, ciri khas hero beranda.
 * Huruf latin diputar dan dibaca dari bawah ke atas karena tidak bisa ditumpuk per huruf
 * seperti kanji. Tiap kata mulai tepat di atas nomornya, jadi ujung atasnya tidak rata
 * seperti asap yang naik. Seluruh kolom bisa ditekan.
 */
export function MenuTegak({
  item,
  label,
  className,
}: {
  item: ItemMenuTegak[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("border-gold-500/40 border-x", className)}>
      <ul className="grid grid-cols-4">
        {item.map((i) => (
          <li key={i.href} className="border-gold-500/40 border-l first:border-l-0">
            <Link
              href={i.href}
              className="group hover:bg-on-dark/5 active:bg-on-dark/10 flex h-56 flex-col items-center justify-end gap-4 px-1 pt-4 pb-3 transition-colors md:h-80 md:gap-5 md:pb-4 lg:h-[26rem]"
            >
              <span className="font-display text-on-dark group-hover:text-gold-400 rotate-180 text-3xl leading-none font-semibold whitespace-nowrap transition-colors [writing-mode:vertical-rl] md:text-4xl lg:text-5xl">
                {i.label}
              </span>
              <span
                aria-hidden
                className="font-angka text-on-dark-soft group-hover:text-gold-400 text-3xl leading-none tabular-nums lining-nums transition-colors md:text-4xl"
              >
                {i.nomor}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
