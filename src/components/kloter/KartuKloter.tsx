"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { TombolMuatUlang } from "@/components/ui/TombolMuatUlang";
import { formatJamWib, formatTanggalKalender, formatTanggalWib } from "@/lib/format";
import { ambilKloterTerbaru, hitungKapasitas, type HasilKloter, type Kloter } from "@/lib/kloter";

// Batas setTimeout di browser (sekitar 24 hari). Tenggat yang lebih jauh tidak perlu dijadwalkan.
const MAKS_TIMEOUT = 2_147_483_647;
const JEDA_SEGARKAN = 30_000;

/**
 * Halaman berasal dari cache, jadi kartu ini memperbarui dirinya sendiri dari browser:
 * saat dibuka, dan saat pembeli kembali ke tab ini (biasanya setelah pindah dari WhatsApp).
 * Status "tutup" juga dihitung ulang tepat di tenggatnya, bukan menunggu cache kedaluwarsa.
 */
export function KartuKloter({
  awal,
  waktuRender,
  segarkan = true,
}: {
  awal: HasilKloter;
  /** Waktu server saat data diambil. Dipakai sebagai "sekarang" pada render pertama supaya hidrasi cocok. */
  waktuRender: number;
  /** Matikan untuk contoh di /styleguide. */
  segarkan?: boolean;
}) {
  const [hasil, setHasil] = useState(awal);
  const [sekarang, setSekarang] = useState(waktuRender);

  useEffect(() => {
    if (!segarkan) return;
    let aktif = true;
    let terakhir = 0;

    const muat = () => {
      if (Date.now() - terakhir < JEDA_SEGARKAN) return;
      terakhir = Date.now();
      // Gagal menyegarkan tidak menimpa data dari server.
      void ambilKloterTerbaru().then((baru) => {
        if (aktif && baru.ok) setHasil(baru);
      });
    };
    const saatTerlihat = () => {
      if (document.visibilityState === "visible") muat();
    };

    muat();
    document.addEventListener("visibilitychange", saatTerlihat);
    return () => {
      aktif = false;
      document.removeEventListener("visibilitychange", saatTerlihat);
    };
  }, [segarkan]);

  const kloter = hasil.ok ? hasil.data : null;
  const batasCheckout = kloter?.checkout_closes_at;

  useEffect(() => {
    if (!batasCheckout) return;
    const sisa = Date.parse(batasCheckout) - Date.now();
    if (sisa > MAKS_TIMEOUT) return;
    const pewaktu = window.setTimeout(() => setSekarang(Date.now()), Math.max(0, sisa));
    return () => window.clearTimeout(pewaktu);
  }, [batasCheckout]);

  return (
    // Satu-satunya kartu terangkat di beranda: inilah yang menjawab "bisa pesan sekarang atau tidak".
    <Card variant="raised">
      <CardBody>
        {!hasil.ok ? (
          <KeadaanGagal />
        ) : kloter === null ? (
          <KeadaanKosong />
        ) : (
          <KloterBuka kloter={kloter} sekarang={sekarang} />
        )}
      </CardBody>
    </Card>
  );
}

function KloterBuka({ kloter, sekarang }: { kloter: Kloter; sekarang: number }) {
  const kapasitas = hitungKapasitas(kloter);
  const sudahTutup = sekarang >= Date.parse(kloter.checkout_closes_at);
  const batas = `${formatTanggalWib(kloter.checkout_closes_at)}, pukul ${formatJamWib(kloter.checkout_closes_at)} WIB`;

  return (
    <>
      <h3 className="text-content text-2xl font-semibold">{kloter.name}</h3>

      <dl className="mt-block grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-content-muted text-sm">Pesan paling lambat</dt>
          <dd className="text-content mt-0.5 text-lg font-semibold">{batas}</dd>
        </div>
        <div>
          <dt className="text-content-muted text-sm">Diantar</dt>
          <dd className="text-content mt-0.5 text-lg font-semibold">
            {formatTanggalKalender(kloter.delivery_date)}
          </dd>
        </div>
      </dl>

      <div className="mt-block">
        <p className="tabular text-content-soft flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
          <span>Terisi {kapasitas.persenTerisi}%</span>
          <span>{kapasitas.teksSisa}</span>
        </p>
        {/* Angkanya sudah tertulis di atas, jadi bilah ini pelengkap visual saja.
            Bergeser halus kalau angkanya berubah setelah disegarkan. */}
        <div aria-hidden className="bg-surface-muted border-line mt-2 h-3 overflow-hidden rounded-full border">
          <div
            className="bg-gold-700 h-full origin-left transition-[scale] duration-700 ease-out"
            style={{ scale: `${kapasitas.persenTerisi / 100} 1` }}
          />
        </div>
      </div>

      <div className="mt-block">
        {sudahTutup ? (
          <Tertutup label="Pemesanan ditutup">
            Kloter ini berhenti menerima pesanan {batas}. Jadwal kloter berikutnya kami umumkan lewat
            WhatsApp.
          </Tertutup>
        ) : kapasitas.penuh ? (
          <Tertutup label="Kloter penuh">
            Kapasitas kloter ini sudah habis. Tempat dari pesanan yang tidak dibayar dibuka lagi setelah
            batas bayarnya lewat, jadi coba cek lagi nanti.
          </Tertutup>
        ) : (
          <Button href="/produk" size="lg" fullWidth className="sm:w-auto">
            Pilih ikan
          </Button>
        )}
      </div>
    </>
  );
}

function Tertutup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <Button size="lg" fullWidth disabled className="sm:w-auto">
        {label}
      </Button>
      <p className="text-content-soft mt-3 max-w-prose text-sm">{children}</p>
    </>
  );
}

function KeadaanKosong() {
  return (
    <>
      <h3 className="text-content text-2xl font-semibold">Belum ada kloter yang buka</h3>
      <p className="text-content-soft mt-2 max-w-prose">
        Jadwal kloter berikutnya kami umumkan lewat WhatsApp. Sambil menunggu, kamu bisa melihat daftar
        produk dan harganya.
      </p>
      <Button href="/produk" variant="outline" className="mt-block">
        Lihat daftar produk
      </Button>
    </>
  );
}

function KeadaanGagal() {
  return (
    <>
      <h3 className="text-content text-2xl font-semibold">Status kloter belum bisa dimuat</h3>
      <p className="text-content-soft mt-2 max-w-prose">
        Sambungan ke server sedang bermasalah. Coba muat ulang halaman ini sebentar lagi.
      </p>
      <div className="mt-block">
        <TombolMuatUlang />
      </div>
    </>
  );
}
