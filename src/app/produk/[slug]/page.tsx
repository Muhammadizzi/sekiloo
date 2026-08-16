import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section, Container } from "@/components/ui/Section";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge, HalalBadge } from "@/components/ui/Badge";
import {
  CheckIcon,
  LeafIcon,
  ShieldCheckIcon,
  ThermometerIcon,
} from "@/components/icons";

import { getAllProductSlugs, getProductBySlug } from "@/data/products";
import { PembelianProvider } from "@/components/produk/PembelianContext";
import { PemilihLokasi } from "@/components/produk/PemilihLokasi";
import { AksiPembelian } from "@/components/produk/AksiPembelian";
import { GaleriProduk } from "@/components/produk/GaleriProduk";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";

/**
 * HALAMAN DETAIL PRODUK
 * =====================
 *
 * Halaman ini adalah komponen SERVER. Yang dikirim sebagai JavaScript ke
 * HP pengunjung hanya tiga bagian kecil: galeri, pemilih lokasi, dan blok
 * aksi. Seluruh isi lain — manfaat, keamanan, penyimpanan — dirender di
 * server dan masuk ke `PembelianProvider` lewat `children`. Ini menjaga
 * target PRD "muat < 3 detik di 4G" tanpa mengorbankan interaktivitas
 * pemilih lokasi.
 *
 * Urutan blok di HP disusun mengikuti urutan keputusan pembeli:
 * lihat barangnya → tahu apa ini → tahu harganya di mana ia ambil →
 * yakin halal → yakin bergizi → yakin aman → baru memutuskan beli.
 *
 * Soal zona: halaman ini nyaris seluruhnya ZONA TERANG. Zona gelap cuma
 * dipakai pada strip remah roti di atas, sebagai sambungan ke header —
 * karena begitu masuk area informasi produk, keterbacaan menang atas gaya.
 */

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const produk = await getProductBySlug(slug);

  if (!produk) {
    return { title: "Produk tidak ditemukan" };
  }

  return {
    title: produk.nama,
    description: produk.deskripsiSingkat,
  };
}

/* ---------- pembantu tampilan, khusus halaman ini ---------- */

/** Baris "label — nilai" untuk data teknis (suhu, durasi, masa simpan). */
function BarisData({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="border-line flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t py-2.5 first:border-t-0 first:pt-0">
      <dt className="text-content-muted text-sm">{label}</dt>
      <dd className="tabular text-content font-medium">{nilai}</dd>
    </div>
  );
}

/** Butir daftar bercentang. */
function Butir({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <CheckIcon className="text-halal-600 mt-0.5 size-5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

/* ---------- halaman ---------- */

export default async function HalamanDetailProduk({
  params,
}: PageProps<"/produk/[slug]">) {
  const { slug } = await params;
  const produk = await getProductBySlug(slug);

  if (!produk) {
    notFound();
  }

  return (
    <PembelianProvider product={produk}>
      {/* ============ REMAH ROTI — satu-satunya zona gelap di halaman ini ============ */}
      <div className="bg-ink-950 border-ink-700 border-b">
        <Container>
          <nav aria-label="Remah roti" className="py-3">
            <ol className="text-on-dark-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <li>
                <Link href="/" className="hover:text-on-dark transition-colors">
                  Beranda
                </Link>
              </li>
              <li aria-hidden>/</li>
              {/* Halaman katalog belum ada, jadi ini sengaja BUKAN tautan.
                  Tautan yang menuju 404 lebih merugikan daripada teks biasa. */}
              <li>Produk</li>
              <li aria-hidden>/</li>
              <li className="text-on-dark-soft" aria-current="page">
                {produk.nama}
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      {/* ============ 1–4. GALERI, IDENTITAS, PEMILIH LOKASI, HALAL ============ */}
      <Section tone="light">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Di layar lebar galeri ikut menggulir sampai batas atas, supaya
              fotonya tetap terlihat saat pembeli membaca kolom kanan. */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <GaleriProduk foto={produk.foto} namaProduk={produk.nama} />
          </div>

          <div>
            {/* --- Nama & deskripsi --- */}
            <h1 className="text-content text-3xl font-semibold md:text-4xl">
              {produk.nama}
            </h1>
            <p className="text-content-muted mt-2 text-sm">
              {produk.ukuranKemasan}
            </p>
            <p className="text-content-soft mt-stack text-lg">
              {produk.deskripsiSingkat}
            </p>
            <p className="text-content-soft mt-stack max-w-prose">
              {produk.deskripsi}
            </p>

            {/* --- Pemilih lokasi + harga --- */}
            <div className="mt-block">
              <PemilihLokasi />
            </div>

            {/* --- Halal ---
                Kartunya sengaja putih, bukan varian `trust` yang hijau:
                HalalBadge sendiri sudah berlatar hijau muda, dan menaruh
                hijau di atas hijau membuat penanda paling penting di
                halaman ini justru paling tidak menonjol. */}
            <Card className="mt-block">
              <CardBody>
                <HalalBadge
                  certificateNumber={produk.halal.nomorSertifikat}
                />
                <p className="text-content-soft mt-block">
                  Diterbitkan oleh{" "}
                  <span className="font-medium">
                    {produk.halal.lembagaPenerbit}
                  </span>
                  {produk.halal.berlakuHingga && (
                    <> · berlaku hingga {produk.halal.berlakuHingga}</>
                  )}
                  .
                </p>
                <p className="text-content-muted mt-2 text-sm">
                  Nomor sertifikat ditampilkan supaya bisa dicek sendiri, bukan
                  sekadar dipercaya.
                </p>

                <CatatanPlaceholder
                  judul="nomor sertifikat halal masih karangan"
                  className="mt-block"
                >
                  <p>
                    Ganti dengan nomor pada sertifikat asli beserta nama
                    lembaga penerbit dan masa berlakunya, lalu unggah scan
                    sertifikatnya.
                  </p>
                  <p>
                    Menayangkan nomor karangan bukan cuma keliru — ia merusak
                    persis hal yang paling ingin dibangun halaman ini, karena
                    pembeli yang paling ragu adalah yang paling rajin mengecek
                    nomornya.
                  </p>
                </CatatanPlaceholder>
              </CardBody>
            </Card>
          </div>
        </div>
      </Section>

      {/* ============ 5. MANFAAT ============ */}
      <Section
        tone="sunken"
        title="Manfaat Gizi"
        description="Ditulis apa adanya. Yang belum diuji disebut belum diuji — bukan dibulatkan jadi janji."
        id="manfaat"
      >
        <Card>
          <CardBody>
            <ul className="grid gap-block sm:grid-cols-2">
              {produk.manfaat.map((manfaat) => (
                <li key={manfaat.judul} className="flex gap-3">
                  <LeafIcon className="text-halal-600 mt-0.5 size-6 shrink-0" />
                  <div>
                    <h3 className="text-content text-lg font-semibold">
                      {manfaat.judul}
                    </h3>
                    <p className="text-content-soft mt-1">
                      {manfaat.keterangan}
                    </p>
                    {manfaat.sumber && (
                      <p className="text-content-muted mt-1.5 text-sm">
                        Sumber: {manfaat.sumber}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <CatatanPlaceholder
          judul="isi manfaat harus diganti data gizi yang benar"
          className="mt-block"
        >
          <p>
            Teks di atas sengaja ditulis tanpa satu pun angka gizi dan tanpa
            klaim kesehatan. Tidak ada &ldquo;menyehatkan jantung&rdquo;,
            &ldquo;mencerdaskan otak&rdquo;, atau sejenisnya — klaim seperti
            itu bersifat medis, dan untuk produk pangan klaim tanpa dasar bisa
            menyesatkan pembeli sekaligus berisiko melanggar aturan label
            pangan.
          </p>
          <p>
            Kalau nanti mau mencantumkan angka (protein sekian gram, omega-3
            sekian miligram), angka itu harus datang dari{" "}
            <span className="font-medium">hasil uji laboratorium produk ini
            sendiri</span>
            , lalu diisikan ke field <code>sumber</code> pada tiap poin di{" "}
            <code>src/data/products.ts</code>. Jangan menyalin angka dari
            internet: komposisi ikan berbeda-beda menurut jenis, ukuran, dan
            cara olahnya.
          </p>
        </CatatanPlaceholder>
      </Section>

      {/* ============ 6. KEAMANAN & KUALITAS ============ */}
      <Section
        tone="light"
        title="Keamanan & Kualitas"
        description="Bagian ini menjawab pertanyaan yang paling sering membuat orang ragu membeli ikan asap: prosesnya bersih atau tidak, dan tahan berapa lama."
        id="keamanan"
      >
        {/* Varian `trust` dipakai di sini persis seperti tujuannya:
            supaya blok ini terbaca sebagai keterangan resmi, bukan iklan. */}
        <Card variant="trust">
          <CardBody>
            <CardTitle as="h3" className="text-halal-800 flex items-center gap-2">
              <ThermometerIcon className="text-halal-600 size-6 shrink-0" />
              Proses pengasapan
            </CardTitle>

            <ol className="text-halal-800 mt-block space-y-2.5">
              {produk.pengasapan.langkah.map((langkah, index) => (
                <li key={langkah} className="flex gap-3">
                  <span
                    className="bg-halal-600 tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <span>{langkah}</span>
                </li>
              ))}
            </ol>

            <dl className="border-halal-300 mt-block border-t pt-4">
              <div className="grid gap-x-6 sm:grid-cols-3">
                <div className="border-halal-300 border-b py-2 sm:border-b-0">
                  <dt className="text-halal-800/80 text-sm">Kayu</dt>
                  <dd className="text-halal-800 font-medium">
                    {produk.pengasapan.jenisKayu}
                  </dd>
                </div>
                <div className="border-halal-300 border-b py-2 sm:border-b-0">
                  <dt className="text-halal-800/80 text-sm">Suhu</dt>
                  <dd className="text-halal-800 font-medium">
                    {produk.pengasapan.suhu}
                  </dd>
                </div>
                <div className="py-2">
                  <dt className="text-halal-800/80 text-sm">Lama pengasapan</dt>
                  <dd className="text-halal-800 font-medium">
                    {produk.pengasapan.durasi}
                  </dd>
                </div>
              </div>
            </dl>
          </CardBody>
        </Card>

        <div className="mt-block grid gap-6 md:grid-cols-2">
          <Card>
            <CardBody>
              <CardTitle as="h3">Cara penyimpanan</CardTitle>
              <dl className="mt-block">
                <BarisData
                  label="Di kulkas"
                  nilai={produk.penyimpanan.suhuKulkas}
                />
                <BarisData
                  label="Di freezer"
                  nilai={produk.penyimpanan.suhuFreezer}
                />
              </dl>
              <ul className="text-content-soft mt-block space-y-2.5">
                {produk.penyimpanan.catatan.map((catatan) => (
                  <Butir key={catatan}>{catatan}</Butir>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle as="h3">Masa simpan</CardTitle>
              <p className="text-content-muted mt-2 text-sm">
                Terhitung sejak tanggal produksi yang tercetak di kemasan,
                selama kemasan vakum belum dibuka.
              </p>
              <dl className="mt-block">
                <BarisData
                  label="Suhu ruang"
                  nilai={produk.penyimpanan.masaSimpanSuhuRuang}
                />
                <BarisData
                  label="Kulkas"
                  nilai={produk.penyimpanan.masaSimpanKulkas}
                />
                <BarisData
                  label="Freezer"
                  nilai={produk.penyimpanan.masaSimpanFreezer}
                />
              </dl>
              <p className="mt-block">
                <Badge tone="halal" icon={<ShieldCheckIcon className="size-4" />}>
                  Dikemas vakum
                </Badge>
              </p>
            </CardBody>
          </Card>
        </div>

        <CatatanPlaceholder
          judul="angka suhu & masa simpan belum diuji"
          className="mt-block"
        >
          <p>
            Jenis kayu, suhu, durasi pengasapan, dan seluruh angka masa simpan
            di atas masih perkiraan. Ini informasi keamanan pangan — salah
            menulisnya bisa membuat orang sakit, dan itu risiko yang tidak
            sebanding dengan apa pun.
          </p>
          <p>
            Ganti dengan angka dari catatan produksi sendiri dan hasil uji
            ketahanan produk sebelum situs dibuka untuk umum.
          </p>
        </CatatanPlaceholder>
      </Section>

      {/* ============ 7–8. STOK & AKSI ============ */}
      <Section tone="sunken" id="beli">
        <div className="mx-auto max-w-xl">
          <AksiPembelian />
        </div>
      </Section>
    </PembelianProvider>
  );
}
