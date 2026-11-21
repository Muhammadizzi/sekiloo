"use client";

import { useActionState } from "react";
import { cariPesanan, type HasilCekPesanan } from "@/app/cek-pesanan/aksi";
import { Button } from "@/components/ui/Button";

const AWAL: HasilCekPesanan = { galat: null };

const gayaIsian =
  "border-line-strong bg-surface text-content placeholder:text-content-muted aria-[invalid=true]:border-danger w-full rounded-sm border px-3 py-2.5 text-base";

export function FormCekPesanan() {
  const [hasil, kirim, menunggu] = useActionState(cariPesanan, AWAL);

  return (
    <form action={kirim} className="max-w-md space-y-5">
      <div>
        <label htmlFor="cek-invoice" className="text-content block font-medium">
          Nomor pesanan
        </label>
        <p id="petunjuk-invoice" className="text-content-muted text-sm">
          Diawali SLK-, ada di halaman status atau pesan WhatsApp dari kami.
        </p>
        <input
          id="cek-invoice"
          name="invoice"
          required
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="SLK-261121-0001"
          defaultValue={hasil.invoice}
          aria-invalid={hasil.kolom === "invoice"}
          aria-describedby="petunjuk-invoice"
          className={`${gayaIsian} mt-1.5`}
        />
      </div>
      <div>
        <label htmlFor="cek-wa" className="text-content block font-medium">
          Nomor WhatsApp pemesan
        </label>
        <input
          id="cek-wa"
          name="wa"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="0812 3456 7890"
          defaultValue={hasil.wa}
          aria-invalid={hasil.kolom === "wa"}
          className={`${gayaIsian} mt-1.5`}
        />
      </div>
      {hasil.galat && (
        <p role="alert" className="border-danger/30 bg-danger/10 text-danger rounded-sm border p-3 text-sm">
          {hasil.galat}
        </p>
      )}
      <Button type="submit" size="lg" loading={menunggu}>
        {menunggu ? "Mencari…" : "Cari pesanan"}
      </Button>
    </form>
  );
}
