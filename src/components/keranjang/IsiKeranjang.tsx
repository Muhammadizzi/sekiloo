"use client";

import Link from "next/link";
import { useKloterSegar } from "@/components/kloter/useKloterSegar";
import { teksBerat } from "@/components/produk/KartuProduk";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import { formatBerat, formatRupiah } from "@/lib/format";
import {
  alasanBelumBisaCheckout,
  aturJumlah,
  hapusDariKeranjang,
  hitungKeranjang,
  kosongkanKeranjang,
  useKeranjang,
} from "@/lib/keranjang";
import { hitungKapasitas, PESAN_TIDAK_BISA_PESAN, statusPemesanan, type HasilKloter } from "@/lib/kloter";
import { MAKS_PER_PRODUK } from "@/lib/pesanan";
import { labelSatuan, type Produk } from "@/lib/produk";
import { PengaturJumlah } from "./PengaturJumlah";

export function IsiKeranjang({
  produk,
  kloterAwal,
  waktuRender,
  segarkanKloter = true,
}: {
  produk: Produk[];
  kloterAwal: HasilKloter;
  waktuRender: number;
  /** Matikan untuk contoh dengan data karangan. */
  segarkanKloter?: boolean;
}) {
  const { hasil, sekarang } = useKloterSegar(kloterAwal, waktuRender, segarkanKloter);
  const status = statusPemesanan(hasil, sekarang);
  const keranjang = useKeranjang();
  const ringkasan = hitungKeranjang(keranjang, produk, status.kloter);

  if (ringkasan.dariKloterLain) {
    return (
      <PesanKeadaan
        judul="Keranjang ini dari kloter sebelumnya"
        aksi={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => kosongkanKeranjang()}>
              Kosongkan keranjang
            </Button>
            <Button href="/produk">Pilih ikan lagi</Button>
          </div>
        }
      >
        Kloter itu sudah tidak menerima pesanan, jadi isinya tidak bisa dipesan lagi.
      </PesanKeadaan>
    );
  }

  if (ringkasan.baris.length === 0 && ringkasan.tidakDijual.length === 0) {
    return (
      <PesanKeadaan judul="Keranjangmu masih kosong" aksi={<Button href="/produk">Lihat daftar produk</Button>}>
        Pilih ikan dari daftar produk, lalu tekan &ldquo;Tambah ke keranjang&rdquo;.
      </PesanKeadaan>
    );
  }

  const alasan = status.bisa ? alasanBelumBisaCheckout(ringkasan, status.kloter) : PESAN_TIDAK_BISA_PESAN[status.alasan];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10">
      <div>
        <ul className="border-line bg-surface divide-line divide-y rounded-lg border">
          {ringkasan.baris.map(({ produk: p, jumlah }) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4">
              <div className="min-w-0 flex-1 basis-48">
                <Link href={`/produk/${p.slug}`} className="text-content font-semibold underline-offset-4 hover:underline">
                  {p.nama}
                </Link>
                <p className="text-content-muted mt-0.5 text-sm">
                  {formatRupiah(p.harga)} {labelSatuan(p.satuan)} · {teksBerat(p)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <PengaturJumlah
                  nilai={jumlah}
                  maks={MAKS_PER_PRODUK}
                  label={p.nama}
                  onUbah={(n) => aturJumlah(p.id, n)}
                />
                <p className="tabular text-content w-24 text-right font-semibold">
                  {formatRupiah(p.harga * jumlah)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => hapusDariKeranjang(p.id)}
                className="text-danger min-h-11 cursor-pointer text-sm font-medium underline-offset-4 hover:underline"
              >
                Hapus<span className="sr-only"> {p.nama}</span>
              </button>
            </li>
          ))}

          {ringkasan.tidakDijual.map((id) => (
            <li key={id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-content-soft">Satu produk di keranjang sudah tidak dijual.</p>
              <Button variant="outline" size="sm" onClick={() => hapusDariKeranjang(id)}>
                Hapus
              </Button>
            </li>
          ))}
        </ul>
        <p className="text-content-muted mt-3 text-sm">Maksimal {MAKS_PER_PRODUK} per produk.</p>
      </div>

      <Card variant="raised" className="self-start lg:sticky lg:top-24">
        <CardBody>
          <h2 className="text-content text-xl font-semibold">Ringkasan</h2>
          <dl className="mt-stack space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-content-soft">Subtotal</dt>
              <dd className="tabular text-content font-semibold">{formatRupiah(ringkasan.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-content-soft">Berat setelah dikemas</dt>
              <dd className="tabular text-content font-semibold">{formatBerat(ringkasan.beratGram)}</dd>
            </div>
          </dl>
          {status.kloter && (
            <p className="text-content-muted mt-3 text-sm">
              Batas {formatBerat(status.kloter.max_order_weight_gram)} per pesanan. Kloter{" "}
              {hitungKapasitas(status.kloter).teksSisa}.
            </p>
          )}
          <p className="text-content-muted mt-2 text-sm">Ongkir dihitung setelah kamu memilih kecamatan di checkout.</p>

          <div className="mt-block">
            {alasan ? (
              <>
                <Button size="lg" fullWidth disabled>
                  Lanjut ke checkout
                </Button>
                <p className="text-content-soft mt-3 text-sm">{alasan}</p>
              </>
            ) : (
              <Button href="/checkout" size="lg" fullWidth>
                Lanjut ke checkout
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
