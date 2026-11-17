"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { buatPesanan, type HasilCheckout } from "@/app/checkout/aksi";
import { useKloterSegar } from "@/components/kloter/useKloterSegar";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PesanKeadaan } from "@/components/ui/PesanKeadaan";
import type { Wilayah } from "@/data/katalog";
import { cn } from "@/lib/cn";
import { formatBerat, formatRupiah } from "@/lib/format";
import { alasanBelumBisaCheckout, hitungKeranjang, kosongkanKeranjang, useKeranjang } from "@/lib/keranjang";
import { PESAN_TIDAK_BISA_PESAN, statusPemesanan, type HasilKloter } from "@/lib/kloter";
import { periksaDataPesanan, type GalatKolom, type Kolom } from "@/lib/pesanan";
import type { Produk } from "@/lib/produk";
import { Turnstile } from "./Turnstile";

const PetaPin = dynamic(() => import("./PetaPin"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="border-line bg-surface-muted text-content-muted flex h-72 items-center justify-center rounded-lg border text-sm md:h-80"
    >
      Memuat peta…
    </div>
  ),
});

const AWAL: HasilCheckout = { status: "awal" };
// Titik tengah perkiraan lima kecamatan, dipakai sebelum kecamatan dipilih.
const PUSAT_CIKARANG: [number, number] = [-6.31, 107.15];
const URUTAN_KOLOM: Kolom[] = ["nama", "wa", "wilayah", "alamat", "patokan", "lokasi", "namaPenerima", "waPenerima", "setuju"];

const gayaIsian =
  "border-line-strong bg-surface text-content placeholder:text-content-muted aria-[invalid=true]:border-danger w-full rounded-sm border px-3 py-2.5 text-base";

export function FormCheckout({
  produk,
  wilayah,
  kloterAwal,
  waktuRender,
  siteKey,
  segarkanKloter = true,
}: {
  produk: Produk[];
  wilayah: Wilayah[];
  kloterAwal: HasilKloter;
  waktuRender: number;
  siteKey: string;
  /** Matikan untuk contoh dengan data karangan. */
  segarkanKloter?: boolean;
}) {
  const { hasil, sekarang } = useKloterSegar(kloterAwal, waktuRender, segarkanKloter);
  const status = statusPemesanan(hasil, sekarang);
  const keranjang = useKeranjang();
  const ringkasan = hitungKeranjang(keranjang, produk, status.kloter);
  const [galatKlien, setGalatKlien] = useState<GalatKolom>({});
  const [pesanUmum, setPesanUmum] = useState<string | null>(null);
  // Galat dari server digabung ke galat form, supaya hilang begitu kolomnya diperbaiki.
  const [hasilKirim, kirim, menunggu] = useActionState(async (sebelumnya: HasilCheckout, data: FormData) => {
    const hasil = await buatPesanan(sebelumnya, data);
    if (hasil.status === "galat") {
      setGalatKlien(hasil.kolom);
      setPesanUmum(hasil.pesan);
    }
    return hasil;
  }, AWAL);

  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");
  const [wilayahId, setWilayahId] = useState("");
  const [alamat, setAlamat] = useState("");
  const [patokan, setPatokan] = useState("");
  const [titik, setTitik] = useState<[number, number] | null>(null);
  const [penerimaBeda, setPenerimaBeda] = useState(false);
  const [namaPenerima, setNamaPenerima] = useState("");
  const [waPenerima, setWaPenerima] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [captchaSiap, setCaptchaSiap] = useState(false);
  const [captchaGagal, setCaptchaGagal] = useState(false);
  const ringkasanGalat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasilKirim.status === "berhasil") kosongkanKeranjang();
    if (hasilKirim.status === "galat") ringkasanGalat.current?.focus();
  }, [hasilKirim]);

  const bersihkan = useCallback((kolom: Kolom) => {
    setGalatKlien((g) => {
      if (!g[kolom]) return g;
      const salinan = { ...g };
      delete salinan[kolom];
      return salinan;
    });
  }, []);
  const pilihTitik = useCallback(
    (lat: number, lng: number) => {
      setTitik([lat, lng]);
      bersihkan("lokasi");
    },
    [bersihkan],
  );
  const saatCaptchaGagal = useCallback(() => setCaptchaGagal(true), []);
  const saatCaptchaSiap = useCallback((siap: boolean) => {
    setCaptchaSiap(siap);
    if (siap) setCaptchaGagal(false);
  }, []);

  if (hasilKirim.status === "berhasil") return <KonfirmasiPesanan hasil={hasilKirim} />;

  if (!status.bisa) {
    return (
      <PesanKeadaan judul="Checkout belum bisa dipakai" aksi={<Button href="/">Ke beranda</Button>}>
        {PESAN_TIDAK_BISA_PESAN[status.alasan]}
      </PesanKeadaan>
    );
  }

  const alasan = alasanBelumBisaCheckout(ringkasan, status.kloter);
  if (alasan) {
    return (
      <PesanKeadaan judul="Keranjang belum siap untuk checkout" aksi={<Button href="/keranjang">Buka keranjang</Button>}>
        {alasan}
      </PesanKeadaan>
    );
  }

  const kloter = status.kloter;
  const wilayahDipilih = wilayah.find((w) => w.id === wilayahId) ?? null;
  const item = ringkasan.baris.map((b) => ({ produkId: b.produk.id, jumlah: b.jumlah }));
  const galat = galatKlien;

  function saatKirim(e: FormEvent<HTMLFormElement>) {
    const periksa = periksaDataPesanan({
      kloterId: kloter.id,
      item,
      wilayahId,
      nama,
      wa,
      alamat,
      patokan,
      lat: titik?.[0] ?? null,
      lng: titik?.[1] ?? null,
      penerimaBeda,
      namaPenerima,
      waPenerima,
      setuju,
    });
    if (!periksa.ok) {
      e.preventDefault();
      setGalatKlien(periksa.galat);
      setPesanUmum("Ada isian yang belum benar. Periksa pesan merah di form.");
      const pertama = URUTAN_KOLOM.find((k) => periksa.galat[k]);
      if (pertama) document.getElementById(`isian-${pertama}`)?.focus();
      return;
    }
    setGalatKlien({});
    setPesanUmum(null);
  }

  return (
    <form action={kirim} onSubmit={saatKirim} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <input type="hidden" name="kloter_id" value={kloter.id} />
      <input type="hidden" name="item" value={JSON.stringify(item)} />
      <input type="hidden" name="lat" value={titik?.[0] ?? ""} />
      <input type="hidden" name="lng" value={titik?.[1] ?? ""} />

      <div className="space-y-10">
        <Bagian judul="Data pemesan">
          <Isian id="nama" label="Nama pemesan" galat={galat.nama}>
            <input
              id="isian-nama"
              name="nama"
              autoComplete="name"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                bersihkan("nama");
              }}
              aria-invalid={Boolean(galat.nama)}
              aria-describedby={galat.nama ? "galat-nama" : undefined}
              className={gayaIsian}
            />
          </Isian>
          <Isian id="wa" label="Nomor WhatsApp" petunjuk="Untuk kabar pengantaran. Boleh diawali 08 atau 62." galat={galat.wa}>
            <input
              id="isian-wa"
              name="wa"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0812 3456 7890"
              value={wa}
              onChange={(e) => {
                setWa(e.target.value);
                bersihkan("wa");
              }}
              aria-invalid={Boolean(galat.wa)}
              aria-describedby={cn("petunjuk-wa", galat.wa && "galat-wa")}
              className={gayaIsian}
            />
          </Isian>
        </Bagian>

        <Bagian judul="Alamat antar">
          <Isian id="wilayah" label="Kecamatan" galat={galat.wilayah}>
            <select
              id="isian-wilayah"
              name="wilayah_id"
              value={wilayahId}
              onChange={(e) => {
                setWilayahId(e.target.value);
                bersihkan("wilayah");
              }}
              aria-invalid={Boolean(galat.wilayah)}
              aria-describedby={galat.wilayah ? "galat-wilayah" : undefined}
              className={cn(gayaIsian, "min-h-11")}
            >
              <option value="" disabled>
                Pilih kecamatan
              </option>
              {wilayah.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama}, ongkir {formatRupiah(w.ongkir)}
                </option>
              ))}
            </select>
          </Isian>
          <Isian
            id="alamat"
            label="Alamat lengkap"
            petunjuk="Jalan, nomor rumah, RT/RW, perumahan atau cluster."
            galat={galat.alamat}
          >
            <textarea
              id="isian-alamat"
              name="alamat"
              rows={3}
              autoComplete="street-address"
              value={alamat}
              onChange={(e) => {
                setAlamat(e.target.value);
                bersihkan("alamat");
              }}
              aria-invalid={Boolean(galat.alamat)}
              aria-describedby={cn("petunjuk-alamat", galat.alamat && "galat-alamat")}
              className={gayaIsian}
            />
          </Isian>
          <Isian id="patokan" label="Patokan atau catatan (tidak wajib)" petunjuk="Misalnya pagar hijau, dekat masjid." galat={galat.patokan}>
            <input
              id="isian-patokan"
              name="patokan"
              value={patokan}
              onChange={(e) => {
                setPatokan(e.target.value);
                bersihkan("patokan");
              }}
              aria-invalid={Boolean(galat.patokan)}
              aria-describedby={cn("petunjuk-patokan", galat.patokan && "galat-patokan")}
              className={gayaIsian}
            />
          </Isian>

          <div>
            <p id="isian-lokasi" tabIndex={-1} className="text-content font-medium">
              Titik lokasi rumah
            </p>
            <p id="petunjuk-lokasi" className="text-content-muted mb-3 text-sm">
              Admin kami memakai titik ini untuk mengantar. Geser pin sampai tepat di rumahmu.
            </p>
            <PetaPin pusat={wilayahDipilih?.pusat ?? PUSAT_CIKARANG} titik={titik} onPilih={pilihTitik} idDeskripsi="petunjuk-lokasi" />
            {titik && (
              <p className="tabular text-content-muted mt-2 text-sm">
                Pin terpasang di {titik[0].toFixed(5)}, {titik[1].toFixed(5)}
              </p>
            )}
            {galat.lokasi && <PesanGalat id="galat-lokasi">{galat.lokasi}</PesanGalat>}
          </div>
        </Bagian>

        <Bagian judul="Penerima">
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="penerima_beda"
              value="ya"
              checked={penerimaBeda}
              onChange={(e) => {
                setPenerimaBeda(e.target.checked);
                bersihkan("namaPenerima");
                bersihkan("waPenerima");
              }}
              className="accent-gold-700 size-5"
            />
            <span className="text-content">Penerima berbeda dari pemesan</span>
          </label>
          {penerimaBeda && (
            <>
              <Isian id="namaPenerima" label="Nama penerima" galat={galat.namaPenerima}>
                <input
                  id="isian-namaPenerima"
                  name="nama_penerima"
                  value={namaPenerima}
                  onChange={(e) => {
                    setNamaPenerima(e.target.value);
                    bersihkan("namaPenerima");
                  }}
                  aria-invalid={Boolean(galat.namaPenerima)}
                  aria-describedby={galat.namaPenerima ? "galat-namaPenerima" : undefined}
                  className={gayaIsian}
                />
              </Isian>
              <Isian id="waPenerima" label="Nomor WhatsApp penerima" galat={galat.waPenerima}>
                <input
                  id="isian-waPenerima"
                  name="wa_penerima"
                  type="tel"
                  inputMode="tel"
                  value={waPenerima}
                  onChange={(e) => {
                    setWaPenerima(e.target.value);
                    bersihkan("waPenerima");
                  }}
                  aria-invalid={Boolean(galat.waPenerima)}
                  aria-describedby={galat.waPenerima ? "galat-waPenerima" : undefined}
                  className={gayaIsian}
                />
              </Isian>
            </>
          )}
        </Bagian>
      </div>

      <Card variant="raised" className="self-start lg:sticky lg:top-24">
        <CardBody>
          <h2 className="text-content text-xl font-semibold">Ringkasan pesanan</h2>
          <ul className="divide-line mt-stack divide-y">
            {ringkasan.baris.map(({ produk: p, jumlah }) => (
              <li key={p.id} className="flex justify-between gap-4 py-2">
                <span className="text-content-soft">
                  {p.nama} <span className="tabular">× {jumlah}</span>
                </span>
                <span className="tabular text-content">{formatRupiah(p.harga * jumlah)}</span>
              </li>
            ))}
          </ul>
          <dl className="border-line mt-2 space-y-2 border-t pt-3">
            <BarisBiaya label="Subtotal" nilai={formatRupiah(ringkasan.subtotal)} />
            <BarisBiaya
              label="Ongkir"
              nilai={wilayahDipilih ? formatRupiah(wilayahDipilih.ongkir) : "pilih kecamatan"}
            />
            <BarisBiaya
              label="Total"
              nilai={wilayahDipilih ? formatRupiah(ringkasan.subtotal + wilayahDipilih.ongkir) : formatRupiah(ringkasan.subtotal)}
              tebal
            />
          </dl>
          <p className="text-content-muted mt-2 text-sm">
            Berat setelah dikemas {formatBerat(ringkasan.beratGram)}. Total akhir dihitung ulang di server.
          </p>
          {galat.keranjang && <PesanGalat id="galat-keranjang">{galat.keranjang}</PesanGalat>}

          <label className="mt-block flex cursor-pointer items-start gap-3">
            <input
              id="isian-setuju"
              type="checkbox"
              name="setuju"
              value="ya"
              checked={setuju}
              onChange={(e) => {
                setSetuju(e.target.checked);
                bersihkan("setuju");
              }}
              aria-invalid={Boolean(galat.setuju)}
              aria-describedby={galat.setuju ? "galat-setuju" : undefined}
              className="accent-gold-700 mt-1 size-5 shrink-0"
            />
            <span className="text-content-soft text-sm">
              Saya setuju dengan{" "}
              <Link href="/privasi" target="_blank" className="text-gold-700 font-semibold underline underline-offset-4">
                Kebijakan Privasi
              </Link>{" "}
              dan{" "}
              <Link href="/syarat" target="_blank" className="text-gold-700 font-semibold underline underline-offset-4">
                Syarat Pemesanan
              </Link>
              , termasuk penggunaan nama, nomor, dan alamat saya untuk pengantaran.
            </span>
          </label>
          {galat.setuju && <PesanGalat id="galat-setuju">{galat.setuju}</PesanGalat>}

          {pesanUmum && (
            <div ref={ringkasanGalat} tabIndex={-1} role="alert" className="border-danger/30 bg-danger/10 text-danger mt-block rounded-sm border p-3 text-sm">
              {pesanUmum}
            </div>
          )}

          <Turnstile siteKey={siteKey} ulangi={hasilKirim} onSiap={saatCaptchaSiap} onGagal={saatCaptchaGagal} />

          <Button type="submit" size="lg" fullWidth loading={menunggu} disabled={!captchaSiap} className="mt-block">
            {menunggu ? "Membuat pesanan…" : captchaSiap ? "Buat pesanan" : "Memeriksa keamanan…"}
          </Button>
          {captchaGagal && (
            <p role="alert" className="text-danger mt-2 text-sm">
              Pemeriksaan keamanan gagal dimuat. Matikan pemblokir iklan atau muat ulang halaman ini.
            </p>
          )}
          <p className="text-content-muted mt-3 text-sm">
            Setelah pesanan dibuat, tempatmu di kloter disimpan selama 15 menit sambil menunggu pembayaran.
          </p>
        </CardBody>
      </Card>
    </form>
  );
}

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5">
      <legend className="font-display text-content mb-5 text-2xl font-semibold">{judul}</legend>
      {children}
    </fieldset>
  );
}

function Isian({
  id,
  label,
  petunjuk,
  galat,
  children,
}: {
  id: Kolom;
  label: string;
  petunjuk?: string;
  galat?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`isian-${id}`} className="text-content block font-medium">
        {label}
      </label>
      {petunjuk && (
        <p id={`petunjuk-${id}`} className="text-content-muted text-sm">
          {petunjuk}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
      {galat && <PesanGalat id={`galat-${id}`}>{galat}</PesanGalat>}
    </div>
  );
}

function PesanGalat({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-danger mt-1.5 text-sm font-medium">
      {children}
    </p>
  );
}

function BarisBiaya({ label, nilai, tebal = false }: { label: string; nilai: string; tebal?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", tebal && "text-lg")}>
      <dt className={tebal ? "text-content font-semibold" : "text-content-soft"}>{label}</dt>
      <dd className={cn("tabular text-content", tebal ? "font-semibold" : "font-medium")}>{nilai}</dd>
    </div>
  );
}

function KonfirmasiPesanan({ hasil }: { hasil: Extract<HasilCheckout, { status: "berhasil" }> }) {
  const judul = useRef<HTMLHeadingElement>(null);
  useEffect(() => judul.current?.focus(), []);

  return (
    <Card variant="raised" className="mx-auto max-w-xl">
      <CardBody>
        <h2 ref={judul} tabIndex={-1} className="text-content text-2xl font-semibold">
          Pesanan dibuat
        </h2>
        <dl className="mt-block space-y-3">
          <BarisBiaya label="Nomor pesanan" nilai={hasil.invoice} />
          <BarisBiaya label="Total" nilai={formatRupiah(hasil.total)} tebal />
          <div>
            <dt className="text-content-soft">Bayar sebelum</dt>
            <dd className="text-content mt-0.5 text-lg font-semibold">{hasil.batasBayar}</dd>
          </div>
        </dl>
        <CatatanPlaceholder judul="tombol bayar QRIS menyusul" className="mt-block">
          <p>
            Pembayaran Midtrans dan halaman status pesanan dibuat di langkah 4. Sampai itu siap, pesanan ini batal
            sendiri setelah batas bayarnya lewat.
          </p>
        </CatatanPlaceholder>
        <Button href="/" variant="outline" className="mt-block">
          Ke beranda
        </Button>
      </CardBody>
    </Card>
  );
}
