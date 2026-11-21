import type { ReactNode } from "react";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { NOMOR_WHATSAPP, tautanWhatsApp } from "@/data/kontak";
import type { PesananTampil } from "@/data/pesanan";
import { cn } from "@/lib/cn";
import { formatJamWib, formatRupiah, formatTanggalKalender, formatTanggalWib } from "@/lib/format";
import { labelSatuan, SATUAN, type Satuan } from "@/lib/produk";
import { ALASAN_BATAL, LANGKAH_PESANAN, urutanLangkah } from "@/lib/status-pesanan";
import { SegarkanOtomatis } from "./SegarkanOtomatis";
import { TombolBuatTautan } from "./TombolBuatTautan";

// Notifikasi lunas yang terlambat masih diterima 10 menit setelah batas bayar (PRD Bagian 22).
const MASA_TENGGANG_MS = 10 * 60 * 1000;

function nomorTampil(nomor: string): string {
  const lokal = `0${nomor.slice(2)}`;
  return lokal.replace(/(\d{4})(\d{4})(\d+)/, "$1 $2 $3");
}

export function TampilanPesanan({
  pesanan: p,
  token,
  situs,
  sekarang,
}: {
  pesanan: PesananTampil;
  token: string;
  situs: string;
  sekarang: number;
}) {
  const batas = Date.parse(p.batasBayar);
  const menungguBayar = p.statusPesanan === "waiting_payment";
  const masihBisaBayar = menungguBayar && sekarang < batas;
  const batal = p.statusPesanan === "cancelled";
  const batasTeks = `${formatTanggalWib(p.batasBayar)}, pukul ${formatJamWib(p.batasBayar)} WIB`;
  const tautanSimpan = `https://wa.me/?text=${encodeURIComponent(`Link pesanan Sealauk ${p.invoice}: ${situs}/pesanan/${token}`)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <div className="space-y-10">
        {masihBisaBayar && (
          <Card variant="raised">
            <CardBody>
              <h2 className="text-content text-2xl font-semibold">Selesaikan pembayaran</h2>
              <p className="text-content-soft mt-2">
                Bayar sebelum <span className="text-content font-semibold">{batasTeks}</span>. Lewat dari itu,
                pesanan batal sendiri dan tempatmu di kloter dilepas.
              </p>
              <p className="tabular text-content mt-block text-3xl font-semibold">{formatRupiah(p.total)}</p>
              <div className="mt-block">
                {p.urlBayar ? (
                  <Button href={p.urlBayar} size="lg" fullWidth>
                    Bayar dengan QRIS
                  </Button>
                ) : (
                  <TombolBuatTautan token={token} />
                )}
              </div>
              <p className="text-content-muted mt-3 text-sm">
                Setelah membayar, status di halaman ini berubah sendiri dalam beberapa detik.
              </p>
              <SegarkanOtomatis sampai={batas + MASA_TENGGANG_MS} />
            </CardBody>
          </Card>
        )}

        {menungguBayar && !masihBisaBayar && (
          <Card variant="raised">
            <CardBody>
              <h2 className="text-content text-2xl font-semibold">Batas bayar sudah lewat</h2>
              <p className="text-content-soft mt-2">
                Kalau kamu sudah membayar sebelum {batasTeks}, status akan berubah dalam beberapa menit. Kalau
                belum, pesanan ini batal sendiri dan kamu bisa memesan lagi selama kloternya masih buka.
              </p>
              <SegarkanOtomatis sampai={batas + MASA_TENGGANG_MS} />
            </CardBody>
          </Card>
        )}

        {batal && (
          <Card variant="raised">
            <CardBody>
              <h2 className="text-content text-2xl font-semibold">Pesanan dibatalkan</h2>
              <p className="text-content-soft mt-2">
                {(p.alasanBatal && ALASAN_BATAL[p.alasanBatal]) ?? "Pesanan ini dibatalkan."}
              </p>
              <p className="text-content mt-stack">
                {p.statusBayar === "refund_pending" &&
                  `Pembayaranmu akan dikembalikan penuh. Admin Sealauk akan menghubungi lewat WhatsApp di nomor ${p.nomor} untuk menanyakan rekening tujuan.`}
                {p.statusBayar === "refunded" && "Pembayaranmu sudah dikembalikan."}
                {(p.statusBayar === "expired" || p.statusBayar === "failed") &&
                  "Tidak ada pembayaran yang perlu dikembalikan."}
                {p.statusBayar === "paid" && "Pesanan ini tidak mendapat pengembalian dana sesuai Syarat Pemesanan."}
              </p>
            </CardBody>
          </Card>
        )}

        {!batal && <UrutanStatus status={p.statusPesanan} percobaanAntar={p.percobaanAntar} />}

        <section aria-labelledby="judul-rincian">
          <h2 id="judul-rincian" className="text-content text-2xl font-semibold">
            Rincian pesanan
          </h2>
          <ul className="border-line bg-surface divide-line mt-stack divide-y rounded-lg border">
            {p.item.map((i) => (
              <li key={i.nama} className="flex justify-between gap-4 px-4 py-3">
                <span className="text-content-soft">
                  {i.nama}{" "}
                  <span className="text-content-muted text-sm">
                    {formatRupiah(i.harga)} {labelSatuan(satuanAman(i.satuan))} × {i.jumlah}
                  </span>
                </span>
                <span className="tabular text-content shrink-0 whitespace-nowrap">{formatRupiah(i.harga * i.jumlah)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-stack space-y-2 px-4">
            <Baris label="Subtotal" nilai={formatRupiah(p.subtotal)} />
            <Baris label={`Ongkir ${p.kecamatan}`} nilai={formatRupiah(p.ongkir)} />
            <Baris label="Total" nilai={formatRupiah(p.total)} tebal />
          </dl>
        </section>
      </div>

      <div className="space-y-6 self-start lg:sticky lg:top-24">
        <Card>
          <CardBody>
            <h2 className="text-content text-xl font-semibold">Pengantaran</h2>
            <dl className="mt-stack space-y-3">
              {p.namaKloter && <BarisTumpuk label="Kloter" nilai={p.namaKloter} />}
              {p.tanggalAntar && <BarisTumpuk label="Diantar" nilai={formatTanggalKalender(p.tanggalAntar)} />}
              <BarisTumpuk label="Alamat" nilai={`${p.alamat} (${p.kecamatan})`} />
              <BarisTumpuk label="Penerima" nilai={`${p.untuk}, ${p.nomor}`} />
            </dl>
            <p className="text-content-muted mt-3 text-sm">
              Nomor dan alamat sengaja ditampilkan sebagian, karena link ini bisa diteruskan ke orang lain.
            </p>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-3">
          <Button href={tautanSimpan} variant="outline" target="_blank" rel="noopener noreferrer">
            Simpan link ini ke WhatsApp
          </Button>
          <Button
            href={tautanWhatsApp(`Halo Sealauk, saya mau tanya soal pesanan ${p.invoice}.`)}
            variant="ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hubungi admin lewat WhatsApp
          </Button>
        </div>

        <Card variant="trust">
          <CardBody>
            <p className="text-halal-800 font-semibold">Waspada penipuan</p>
            <p className="text-halal-800 mt-1 text-sm">
              Admin Sealauk tidak pernah meminta kode OTP, PIN, password, atau biaya apa pun untuk refund. Nomor
              WhatsApp resmi kami hanya <span className="tabular font-semibold">{nomorTampil(NOMOR_WHATSAPP)}</span>.
            </p>
          </CardBody>
        </Card>
        {NOMOR_WHATSAPP === "6280000000000" && (
          <CatatanPlaceholder judul="nomor WhatsApp resmi masih contoh">
            <p>Ganti NOMOR_WHATSAPP di src/data/kontak.ts dengan nomor asli sebelum tayang.</p>
          </CatatanPlaceholder>
        )}
      </div>
    </div>
  );
}

function satuanAman(satuan: string): Satuan {
  return (SATUAN as readonly string[]).includes(satuan) ? (satuan as Satuan) : "bungkus";
}

/** Garis emas tegak menyambung tiap langkah, motif yang sama dengan alur cara pesan di beranda. */
function UrutanStatus({ status, percobaanAntar }: { status: string; percobaanAntar: number }) {
  const sekarang = urutanLangkah(status);

  return (
    <section aria-labelledby="judul-status">
      <h2 id="judul-status" className="text-content text-2xl font-semibold">
        Status pesanan
      </h2>
      <ol className="mt-stack">
        {LANGKAH_PESANAN.map((langkah, i) => {
          const selesai = i < sekarang;
          const aktif = i === sekarang;
          return (
            <li
              key={langkah.kode}
              aria-current={aktif ? "step" : undefined}
              className="group grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3"
            >
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 flex size-5 items-center justify-center rounded-full border-2",
                    selesai && "border-gold-700 bg-gold-700",
                    aktif && "border-gold-700 bg-surface",
                    !selesai && !aktif && "border-line-strong bg-surface",
                  )}
                >
                  {aktif && <span className="bg-gold-700 size-2 rounded-full" />}
                </span>
                <span
                  aria-hidden
                  className={cn("mt-1 w-px flex-1 group-last:hidden", selesai ? "bg-gold-500/60" : "bg-line-strong")}
                />
              </div>
              <div className="pb-6 group-last:pb-0">
                <p className={cn(aktif ? "text-content font-semibold" : selesai ? "text-content-soft" : "text-content-muted")}>
                  {langkah.judul}
                  {aktif && <span className="sr-only"> (status saat ini)</span>}
                  {selesai && <span className="sr-only"> (sudah lewat)</span>}
                </p>
                {aktif && "keterangan" in langkah && (
                  <p className="text-content-muted mt-0.5 text-sm">{langkah.keterangan}</p>
                )}
                {aktif && status === "delivery_failed" && (
                  <p className="text-warn mt-0.5 text-sm font-medium">
                    {percobaanAntar >= 2
                      ? "Pengantaran kedua juga gagal. Admin akan menghubungimu lewat WhatsApp."
                      : "Pengantaran pertama gagal. Admin akan menghubungimu untuk antar ulang."}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Baris({ label, nilai, tebal = false }: { label: string; nilai: ReactNode; tebal?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", tebal && "text-lg")}>
      <dt className={tebal ? "text-content font-semibold" : "text-content-soft"}>{label}</dt>
      <dd className={cn("tabular text-content", tebal ? "font-semibold" : "font-medium")}>{nilai}</dd>
    </div>
  );
}

function BarisTumpuk({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <dt className="text-content-muted text-sm">{label}</dt>
      <dd className="text-content">{nilai}</dd>
    </div>
  );
}
