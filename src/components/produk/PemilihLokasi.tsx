"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPinIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { statusStok, usePembelian } from "./PembelianContext";

/**
 * Pemilih lokasi pengambilan — bagian pembeda halaman ini.
 *
 * Yang dipilih pembeli adalah TITIK AMBIL, bukan zona. Kata "zona" tidak
 * pernah muncul di layar: itu istilah internal. Yang dilihat pembeli
 * cuma akibatnya — harga dan stok yang ikut menyesuaikan.
 *
 * Keputusan yang diambil di sini, dan alasannya:
 *
 * 1. HARGA KETIGA TITIK DITAMPILKAN SEKALIGUS, bukan cuma yang terpilih.
 *    Kalau harga Cikarang baru muncul setelah dipilih, selisihnya terasa
 *    seperti kejutan di menit terakhir. Ditampilkan berdampingan, selisih
 *    itu jadi informasi yang membantu memilih — bukan jebakan.
 *
 * 2. PASAR & RUMAH PRODUKSI SENGAJA TETAP DITAMPILKAN TERPISAH walau
 *    harganya sama persis. Alamat dan jam bukanya berbeda, dan itu yang
 *    dibutuhkan pembeli untuk memutuskan. Bahwa keduanya berbagi harga
 *    dan stok dijelaskan dengan kalimat, bukan dengan menggabungkan
 *    keduanya jadi satu pilihan yang membingungkan.
 *
 * 3. RADIO BAWAAN BROWSER, BUKAN TOMBOL BUATAN. Radio asli sudah membawa
 *    semantik grup, bisa dipakai lewat panah kiri/kanan di keyboard, dan
 *    dibacakan pembaca layar sebagai "1 dari 3". Meniru semua itu dengan
 *    <div> adalah cara paling umum sebuah pemilih jadi tidak bisa dipakai.
 *    Seluruh kartu adalah <label>, jadi area sentuhnya tetap selebar kartu.
 */
export function PemilihLokasi() {
  const { product, pilihan, lokasi, rincian, kalimatHarga, kalimatStok, pilihLokasi } =
    usePembelian();

  const stok = statusStok(
    rincian.stok,
    product.ambangStokMenipis,
    product.satuanStok,
  );

  return (
    <Card variant="raised">
      <CardBody>
        <fieldset>
          <legend className="font-display text-content flex items-center gap-2 text-xl font-semibold">
            <MapPinIcon className="text-gold-700 size-5" />
            Pilih lokasi pengambilan
          </legend>

          {/* Teks bantu permanen, bukan placeholder di dalam kontrol.
              Kalimat kedua menjelaskan lebih dulu kenapa dua titik pertama
              berharga sama — kalau tidak, harga kembar itu terlihat seperti
              kesalahan. */}
          <p className="text-content-muted mt-2 text-sm">
            Semua pesanan diambil sendiri. Pasar dan Rumah Produksi memakai
            harga dan stok yang sama; Cikarang punya harga dan stok sendiri.
          </p>

          <div className="mt-stack space-y-2.5">
            {pilihan.map(({ lokasi: opsi, harga }) => {
              const terpilih = opsi.id === lokasi.id;

              return (
                <label
                  key={opsi.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-md border p-3",
                    "transition-colors duration-150",
                    terpilih
                      ? "border-gold-500 bg-gold-200/25 shadow-gold"
                      : "border-line-strong bg-surface hover:bg-surface-muted",
                  )}
                >
                  <input
                    type="radio"
                    name="lokasi-pengambilan"
                    value={opsi.id}
                    checked={terpilih}
                    onChange={() => pilihLokasi(opsi.id)}
                    className="accent-gold-700 mt-0.5 size-5 shrink-0"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-content font-semibold">
                        {opsi.nama}
                      </span>
                      <span className="tabular text-content shrink-0 font-semibold">
                        {formatRupiah(harga)}
                      </span>
                    </span>
                    <span className="text-content-muted mt-0.5 block text-sm">
                      {opsi.alamat}
                    </span>
                    <span className="text-content-muted tabular block text-sm">
                      Buka {opsi.jamOperasional}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="border-line mt-block border-t pt-4">
          {/*
            Ringkasan akibat dari pilihan tadi.

            `aria-live="polite"` membungkus NAMA LOKASI, HARGA, dan STATUS
            STOK sekaligus, supaya pembaca layar mendengar kalimat utuh
            ("Harga di Cikarang, Rp 52.000, stok menipis — sisa 4 pack")
            setelah pilihan berubah, bukan angka telanjang yang tidak jelas
            milik lokasi mana. Fokus keyboard tetap tinggal di radio.

            Dua kalimat penjelas di bawahnya sengaja DI LUAR live region:
            isinya memang ikut berubah, tapi mengulanginya tiap kali
            pilihan berpindah membuat pengumumannya jadi bertele-tele.
          */}
          <div aria-live="polite">
            <p className="text-content-muted text-sm">Harga di {lokasi.nama}</p>
            <p className="tabular text-content mt-1 text-3xl font-semibold">
              {formatRupiah(rincian.harga)}
            </p>
            <p className="mt-2.5">
              <Badge tone={stok.tone}>{stok.teks}</Badge>
            </p>
          </div>

          <p className="text-content-muted mt-2 text-sm">
            {rincian.alasan ?? kalimatHarga}
          </p>
          <p className="text-content-muted mt-1 text-sm">{kalimatStok}</p>
        </div>
      </CardBody>
    </Card>
  );
}
