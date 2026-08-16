"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CartIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { formatRupiah } from "@/lib/format";
import { tautanWhatsApp } from "@/data/kontak";
import { statusStok, usePembelian } from "./PembelianContext";

/**
 * Indikator stok + dua aksi penutup halaman.
 *
 * Blok ini mengulang lokasi, harga, dan stok terpilih. Alasannya:
 * pemilih lokasi berada jauh di atas, dipisahkan bagian manfaat dan
 * keamanan yang panjang. Tanpa pengulangan, pengunjung yang sampai ke
 * sini harus menggulir balik hanya untuk memastikan ia menekan tombol
 * untuk lokasi yang benar.
 *
 * Semua angka di sini datang dari `usePembelian()`, sumber yang sama
 * dengan pemilih lokasi — jadi keduanya tidak mungkin menampilkan harga
 * atau stok yang berbeda.
 */
export function AksiPembelian() {
  const { product, lokasi, rincian, kalimatStok } = usePembelian();

  const stok = statusStok(
    rincian.stok,
    product.ambangStokMenipis,
    product.satuanStok,
  );

  /* Stok dihitung per zona: memilih Cikarang berarti membaca tumpukan
     Cikarang, bukan tumpukan Pasar/Rumah Produksi. Habis di satu zona
     tidak berarti habis di zona lain. */
  const keteranganStok =
    stok.bisaBeli
      ? `${kalimatStok} Stok berkurang saat pembayaran masuk, bukan saat dipesan.`
      : `${kalimatStok} Coba titik ambil lain, atau tanyakan jadwal batch berikutnya lewat WhatsApp.`;

  const bisaBeli = stok.bisaBeli;

  const pesanWhatsApp =
    `Halo sekiloo, saya mau tanya soal ${product.nama} ` +
    `(${product.ukuranKemasan}) untuk diambil di ${lokasi.nama}.`;

  return (
    <Card variant="raised">
      <CardBody>
        {/* --- Indikator stok --- */}
        <div>
          {/* Warna badge tidak pernah jadi satu-satunya penanda: statusnya
              selalu tertulis di dalam badge itu sendiri. */}
          <Badge tone={stok.tone}>{stok.teks}</Badge>
          <p className="text-content-muted mt-2 text-sm">{keteranganStok}</p>
        </div>

        {/* --- Ringkasan pesanan --- */}
        <div className="border-line mt-block border-t pt-4">
          <p className="text-content-soft flex items-center gap-2 text-sm">
            <MapPinIcon className="text-gold-700 size-5 shrink-0" />
            Ambil di <span className="font-semibold">{lokasi.nama}</span>
          </p>
          {/* Harga dan ukuran kemasan ditumpuk, bukan disejajarkan.
              Di layar 375px, harga berukuran 3xl menyisakan ruang terlalu
              sempit untuk teks ukuran kemasan — hasilnya teks itu pecah
              jadi tiga baris pendek yang sulit dibaca. */}
          <p className="tabular text-content mt-1.5 text-3xl font-semibold">
            {formatRupiah(rincian.harga)}
          </p>
          <p className="text-content-muted mt-0.5 text-sm">
            {product.ukuranKemasan}
          </p>
        </div>

        {/* --- Aksi --- */}
        <div className="mt-block space-y-2.5">
          <Button
            size="lg"
            fullWidth
            disabled={!bisaBeli}
            /* TODO(keranjang): masih kosong, sesuai tahap ini.
               Nanti fungsi ini menambahkan { productId, lokasiId, zonaId,
               jumlah, harga } ke state keranjang.

               `lokasiId` DAN `zonaId` sama-sama perlu disimpan, dan itu
               bukan duplikasi: lokasi menentukan ke mana pembeli datang
               mengambil, zona menentukan dari tumpukan stok mana pesanan
               dipotong. Harga ikut disimpan supaya total tidak berubah
               sendiri kalau admin memperbarui harga setelah pesanan
               dibuat. */
            onClick={() => {}}
          >
            <CartIcon className="size-5" />
            Tambah ke Keranjang
          </Button>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            href={tautanWhatsApp(pesanWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PhoneIcon className="size-5" />
            Tanya lewat WhatsApp
            <span className="sr-only">(membuka di tab baru)</span>
          </Button>
        </div>

        <p className="text-content-muted mt-stack text-sm">
          Pembayaran dilakukan di muka lewat gateway resmi. Pesanan baru
          disiapkan setelah pembayaran terkonfirmasi.
        </p>
      </CardBody>
    </Card>
  );
}
