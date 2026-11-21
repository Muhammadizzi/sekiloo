"use client";

import { useActionState } from "react";
import { buatUlangTautanBayar, type HasilTautanBayar } from "@/app/pesanan/[token]/aksi";
import { Button } from "@/components/ui/Button";

const AWAL: HasilTautanBayar = { galat: null };

/** Muncul kalau tautan bayar gagal dibuat saat checkout. Berhasil berarti langsung pindah ke halaman bayar. */
export function TombolBuatTautan({ token }: { token: string }) {
  const [hasil, kirim, menunggu] = useActionState(buatUlangTautanBayar.bind(null, token), AWAL);

  return (
    <form action={kirim}>
      <Button type="submit" size="lg" fullWidth loading={menunggu}>
        {menunggu ? "Menyiapkan pembayaran…" : "Bayar dengan QRIS"}
      </Button>
      {hasil.galat && (
        <p role="alert" className="text-danger mt-2 text-sm font-medium">
          {hasil.galat}
        </p>
      )}
    </form>
  );
}
