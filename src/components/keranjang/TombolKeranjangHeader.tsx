"use client";

import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { jumlahUnit, useKeranjang } from "@/lib/keranjang";

export function TombolKeranjangHeader() {
  const jumlah = jumlahUnit(useKeranjang());

  return (
    <Link
      href="/keranjang"
      aria-label={jumlah > 0 ? `Keranjang, ${jumlah} item` : "Keranjang, kosong"}
      className="text-on-dark hover:bg-on-dark/10 active:bg-on-dark/20 relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 transition-colors"
    >
      {/* Badge menempel di ikon, bukan di tombol, supaya tidak menimpa tulisan Keranjang di layar lebar. */}
      <span className="relative">
        <CartIcon className="size-6" />
        {jumlah > 0 && (
          <span
            aria-hidden
            className="bg-gold-400 text-ink-900 tabular absolute -top-2 -right-2.5 min-w-5 rounded-full px-1.5 text-center text-xs leading-5 font-bold"
          >
            {jumlah}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">Keranjang</span>
    </Link>
  );
}
