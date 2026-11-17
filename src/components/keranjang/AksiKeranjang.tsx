"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useKloterSegar } from "@/components/kloter/useKloterSegar";
import { tambahKeKeranjang, useKeranjang } from "@/lib/keranjang";
import { PESAN_TIDAK_BISA_PESAN, statusPemesanan, type HasilKloter } from "@/lib/kloter";
import { MAKS_PER_PRODUK } from "@/lib/pesanan";
import { PengaturJumlah } from "./PengaturJumlah";

/** Blok tambah ke keranjang di halaman detail produk. Nonaktif dengan alasan kalau kloter tidak bisa dipesan. */
export function AksiKeranjang({
  produk,
  kloterAwal,
  waktuRender,
  segarkanKloter = true,
}: {
  produk: { id: string; nama: string };
  kloterAwal: HasilKloter;
  waktuRender: number;
  /** Matikan untuk contoh dengan data karangan. */
  segarkanKloter?: boolean;
}) {
  const { hasil, sekarang } = useKloterSegar(kloterAwal, waktuRender, segarkanKloter);
  const status = statusPemesanan(hasil, sekarang);
  const keranjang = useKeranjang();
  const [jumlah, setJumlah] = useState(1);
  const [ditambahkan, setDitambahkan] = useState(false);

  if (!status.bisa) {
    return (
      <div>
        <Button size="lg" disabled fullWidth className="sm:w-auto">
          Tambah ke keranjang
        </Button>
        <p className="text-content-soft mt-3 text-sm">{PESAN_TIDAK_BISA_PESAN[status.alasan]}</p>
      </div>
    );
  }

  const kloterId = status.kloter.id;
  const diKeranjang =
    keranjang.kloterId === kloterId ? (keranjang.item.find((i) => i.produkId === produk.id)?.jumlah ?? 0) : 0;
  const sisaJatah = MAKS_PER_PRODUK - diKeranjang;
  const jumlahAman = Math.min(jumlah, Math.max(sisaJatah, 1));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <PengaturJumlah
          nilai={jumlahAman}
          maks={Math.max(sisaJatah, 1)}
          label={produk.nama}
          onUbah={(n) => {
            setJumlah(n);
            setDitambahkan(false);
          }}
        />
        <Button
          size="lg"
          disabled={sisaJatah <= 0}
          onClick={() => {
            tambahKeKeranjang(kloterId, produk.id, jumlahAman);
            setJumlah(1);
            setDitambahkan(true);
          }}
        >
          Tambah ke keranjang
        </Button>
      </div>

      <p role="status" className="text-content-soft mt-3 min-h-6 text-sm">
        {sisaJatah <= 0 ? (
          <>Sudah {MAKS_PER_PRODUK} di keranjang, batas per produk. </>
        ) : ditambahkan ? (
          <>Ditambahkan. Sekarang {diKeranjang} di keranjang. </>
        ) : diKeranjang > 0 ? (
          <>{diKeranjang} sudah di keranjang. </>
        ) : null}
        {diKeranjang > 0 && (
          <Link href="/keranjang" className="text-gold-700 font-semibold underline underline-offset-4">
            Lihat keranjang
          </Link>
        )}
      </p>
    </div>
  );
}
