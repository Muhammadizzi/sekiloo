import type { Metadata } from "next";
import Link from "next/link";
import { Section, Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  tautanMeregang,
} from "@/components/ui/Card";
import { Badge, HalalBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { MenuTegak } from "@/components/ui/MenuTegak";
import { MENU_BERANDA } from "@/data/navigasi";
import { FotoPlaceholder } from "@/components/produk/FotoPlaceholder";
import { KartuProduk } from "@/components/produk/KartuProduk";
import { KartuKloter } from "@/components/kloter/KartuKloter";
import type { HasilKloter, Kloter } from "@/lib/kloter";
import type { Produk } from "@/lib/produk";
import {
  CheckIcon,
  LeafIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ThermometerIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Panduan Gaya",
  description: "Halaman sementara untuk meninjau design system sekiloo.",
};

/* Data contoh. Waktu dibuat tetap supaya keadaan "buka" dan "ditutup" tidak berubah sendiri setelah build. */
const WAKTU_CONTOH = Date.parse("2026-11-17T03:00:00Z");

function kloterContoh(ubah: Partial<Kloter>): HasilKloter {
  return {
    ok: true,
    data: {
      id: "contoh",
      name: "Kloter contoh",
      close_order_at: "2099-11-19T11:00:00Z",
      checkout_closes_at: "2099-11-19T10:45:00Z",
      delivery_date: "2099-11-21",
      capacity_gram: 20000,
      max_order_weight_gram: 3000,
      used_gram: 12800,
      remaining_gram: 7200,
      ...ubah,
    },
  };
}

const CONTOH_KLOTER: { label: string; hasil: HasilKloter }[] = [
  { label: "Buka", hasil: kloterContoh({}) },
  { label: "Hampir penuh", hasil: kloterContoh({ used_gram: 19400, remaining_gram: 600 }) },
  { label: "Penuh", hasil: kloterContoh({ used_gram: 20000, remaining_gram: 0 }) },
  {
    label: "Pemesanan sudah ditutup",
    hasil: kloterContoh({ checkout_closes_at: "2026-11-16T10:45:00Z", close_order_at: "2026-11-16T11:00:00Z" }),
  },
  { label: "Belum ada kloter", hasil: { ok: true, data: null } },
  { label: "Gagal dimuat", hasil: { ok: false } },
];

const PRODUK_CONTOH: Produk = {
  id: "contoh",
  slug: "contoh",
  nama: "Produk contoh",
  kategori: "ikan",
  satuan: "ekor",
  deskripsi: "",
  beratIsiGram: 450,
  harga: 40000,
  fotoUrl: null,
};

/* ---------- pembantu tampilan, khusus halaman ini ---------- */

function Swatch({
  name,
  token,
  ratio,
  className,
}: {
  name: string;
  token: string;
  ratio?: string;
  className: string;
}) {
  return (
    <div>
      <div
        className={`border-line h-14 rounded-sm border ${className}`}
        aria-hidden
      />
      <p className="text-content mt-1.5 text-sm font-medium">{name}</p>
      <p className="tabular text-content-muted text-xs">{token}</p>
      {ratio && <p className="tabular text-halal-600 text-xs">{ratio}</p>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-line border-t py-4 first:border-t-0">
      <p className="text-content-muted mb-3 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <>
      {/* ============ HERO — contoh ZONA BINGKAI (gelap + emas) ============ */}
      <div className="bg-ink-950 relative overflow-hidden">
        {/* Sorotan emas halus. Ini satu-satunya efek dekoratif di seluruh
            sistem, dan sengaja diletakkan di hero — bukan di area konten,
            supaya tidak pernah mengganggu keterbacaan teks penting. */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--color-gold-500), transparent 70%)",
          }}
          aria-hidden
        />
        <Container>
          <div className="relative py-section md:py-section-lg max-w-2xl">
            <Badge tone="onDark">Halaman sementara untuk review</Badge>
            <h1 className="text-on-dark mt-block text-4xl font-semibold md:text-6xl">
              Fondasi desain{" "}
              <span className="text-gold-400">sekiloo</span>
            </h1>
            <p className="text-on-dark-soft mt-stack text-lg md:text-xl">
              Gelap dan emas dipakai sebagai bingkai. Begitu masuk ke area
              produk dan informasi halal, tampilan berganti terang dan
              berkontras tinggi, supaya yang paling penting justru yang paling
              mudah dibaca.
            </p>
            <div className="mt-block flex flex-wrap gap-3">
              <Button size="lg">Pesan Sekarang</Button>
              <Button variant="outlineGold" size="lg">
                Lihat Proses Kami
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* ============ WARNA ============ */}
      <Section
        tone="light"
        title="Palet Warna"
        description="Setiap pasangan teks dan latar sudah diuji memenuhi WCAG AA. Angka hijau di bawah swatch adalah rasio kontras terukur, bukan perkiraan."
        headingLevel="h2"
      >
        <div className="space-y-8">
          <div>
            <h3 className="text-content mb-3 text-lg font-semibold">
              Zona bingkai: gelap
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Swatch name="Ink 950" token="--color-ink-950" className="bg-ink-950" />
              <Swatch name="Ink 900" token="--color-ink-900" className="bg-ink-900" />
              <Swatch name="Ink 800" token="--color-ink-800" className="bg-ink-800" />
              <Swatch name="Ink 700" token="--color-ink-700" className="bg-ink-700" />
              <Swatch name="Ink 500" token="--color-ink-500" className="bg-ink-500" />
            </div>
          </div>

          <div>
            <h3 className="text-content mb-3 text-lg font-semibold">
              Emas: aksen merek
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch
                name="Gold 700"
                token="--color-gold-700"
                ratio="4.92:1 pada putih"
                className="bg-gold-700"
              />
              <Swatch name="Gold 500" token="--color-gold-500" className="bg-gold-500" />
              <Swatch
                name="Gold 400"
                token="--color-gold-400"
                ratio="8.99:1 pada ink-900"
                className="bg-gold-400"
              />
              <Swatch name="Gold 200" token="--color-gold-200" className="bg-gold-200" />
            </div>
            <p className="text-content-muted mt-3 text-sm">
              Dua nilai emas, dan itu disengaja: emas terang mustahil terbaca di
              atas putih, emas gelap mustahil terbaca di atas hitam. Memaksakan
              satu nilai untuk keduanya adalah cara tercepat kehilangan kontras.
            </p>
          </div>

          <div>
            <h3 className="text-content mb-3 text-lg font-semibold">
              Zona konten: terang
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Swatch name="Surface" token="--color-surface" className="bg-surface" />
              <Swatch
                name="Sunken"
                token="--color-surface-sunken"
                className="bg-surface-sunken"
              />
              <Swatch
                name="Muted"
                token="--color-surface-muted"
                className="bg-surface-muted"
              />
              <Swatch name="Line" token="--color-line" className="bg-line" />
              <Swatch
                name="Content"
                token="--color-content"
                ratio="19.76:1 pada putih"
                className="bg-content"
              />
            </div>
          </div>

          <div>
            <h3 className="text-content mb-3 text-lg font-semibold">
              Halal & status
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Swatch
                name="Halal 600"
                token="--color-halal-600"
                ratio="5.02:1 pada putih"
                className="bg-halal-600"
              />
              <Swatch name="Halal 50" token="--color-halal-50" className="bg-halal-50" />
              <Swatch name="Danger" token="--color-danger" ratio="6.47:1" className="bg-danger" />
              <Swatch name="Warn" token="--color-warn" ratio="5.02:1" className="bg-warn" />
              <Swatch name="Info" token="--color-info" ratio="6.70:1" className="bg-info" />
            </div>
          </div>
        </div>
      </Section>

      {/* ============ TIPOGRAFI ============ */}
      <Section
        tone="sunken"
        title="Tipografi"
        description="Seluruhnya font sistem: nol unduhan jaringan, nol kedipan teks, dan build tidak bisa gagal gara-gara CDN font."
      >
        <Card>
          <CardBody className="space-y-6">
            <div>
              <p className="text-content-muted text-sm">
                Display / serif sistem, untuk judul
              </p>
              <p className="font-display text-content mt-1 text-4xl font-semibold">
                Ikan asap pilihan
              </p>
              <p className="text-content-muted tabular mt-1 text-xs">
                --font-display · ui-serif, Georgia, …
              </p>
            </div>

            <div className="border-line border-t pt-6">
              <p className="text-content-muted text-sm">
                Sans / sans-serif sistem, untuk isi teks
              </p>
              <p className="text-content mt-1 max-w-prose text-base">
                Diasap dengan kayu pilihan pada suhu terkendali, tanpa pengawet
                berbahaya. Setiap batch dicatat tanggal produksinya sehingga
                kesegaran bisa ditelusuri.
              </p>
              <p className="text-content-muted tabular mt-1 text-xs">
                --font-sans · system-ui, -apple-system, …
              </p>
            </div>

            <div className="border-line border-t pt-6">
              <p className="text-content-muted text-sm">Skala ukuran</p>
              <div className="mt-2 space-y-1">
                <p className="text-content text-4xl font-semibold">36px: judul halaman</p>
                <p className="text-content text-2xl font-semibold">24px: judul seksi</p>
                <p className="text-content text-xl font-semibold">20px: judul kartu</p>
                <p className="text-content text-base">16px: teks isi (minimum di HP)</p>
                <p className="text-content-muted text-sm">14px: keterangan</p>
              </div>
            </div>

            <div className="border-line border-t pt-6">
              <p className="text-content-muted text-sm">
                Angka tabular, dipakai untuk harga agar kolom tidak bergeser
              </p>
              <p className="tabular text-content mt-1 text-2xl font-semibold">
                Rp 45.000 · Rp 118.000 · Rp 9.000
              </p>
            </div>
          </CardBody>
        </Card>
      </Section>

      {/* ============ JARAK & RADIUS ============ */}
      <Section
        tone="light"
        title="Jarak & Radius"
        description="Ritme 4/8px. Nama token menjelaskan perannya, bukan ukurannya, supaya nilai bisa disetel tanpa mengganti kelas di seluruh proyek."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardBody>
              <CardTitle as="h3">Skala jarak</CardTitle>
              <div className="mt-block space-y-3">
                {[
                  ["gutter", "20px", "w-5"],
                  ["stack", "16px", "w-4"],
                  ["block", "24px", "w-6"],
                  ["section", "56px", "w-14"],
                  ["section-lg", "88px", "w-22"],
                ].map(([nama, ukuran, kelas]) => (
                  <div key={nama} className="flex items-center gap-3">
                    <div className={`bg-gold-500 h-4 rounded-xs ${kelas}`} aria-hidden />
                    <span className="tabular text-content-soft text-sm">
                      --spacing-{nama} · {ukuran}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle as="h3">Radius</CardTitle>
              <div className="mt-block grid grid-cols-5 gap-2">
                {[
                  ["xs", "rounded-xs"],
                  ["sm", "rounded-sm"],
                  ["md", "rounded-md"],
                  ["lg", "rounded-lg"],
                  ["xl", "rounded-xl"],
                ].map(([nama, kelas]) => (
                  <div key={nama}>
                    <div
                      className={`bg-ink-900 aspect-square w-full ${kelas}`}
                      aria-hidden
                    />
                    <p className="text-content-muted mt-1 text-center text-xs">
                      {nama}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* ============ TOMBOL ============ */}
      <Section
        tone="sunken"
        title="Tombol"
        description="Varian dinamai per zona, karena satu warna garis tidak mungkin terbaca di latar terang dan gelap sekaligus. Saat ditekan, tombol mengecil sedikit sebagai umpan balik sentuh."
      >
        <Card>
          <CardBody>
            <Row label="Zona terang">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </Row>
            <Row label="Ukuran: semua memenuhi ambang area sentuh">
              <Button size="sm">Kecil 40px</Button>
              <Button size="md">Sedang 44px</Button>
              <Button size="lg">Besar 52px</Button>
            </Row>
            <Row label="Status">
              <Button loading>Memproses</Button>
              <Button disabled>Nonaktif</Button>
              <Button href="#">Sebagai tautan</Button>
            </Row>
          </CardBody>
        </Card>

        <div className="bg-ink-900 mt-6 rounded-lg p-6">
          <p className="text-on-dark-muted mb-3 text-sm font-medium">
            Zona gelap
          </p>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="outlineGold">Outline emas</Button>
          </div>
        </div>
      </Section>

      {/* ============ BADGE & HALAL ============ */}
      <Section
        tone="light"
        title="Badge & Penanda Halal"
        description="Warna tidak pernah jadi satu-satunya pembawa makna. Setiap badge punya teks, dan yang penting juga punya ikon."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="trust">
            <CardBody>
              <CardTitle as="h3" className="text-halal-800">
                Badge Halal
              </CardTitle>
              <CardText className="text-halal-800/80">
                Komponen tersendiri, bukan sekadar badge hijau. Nomor sertifikat
                bisa tampil langsung. Klaim halal tanpa nomor yang bisa dicek
                adalah klaim kosong, dan pembeli yang ragu justru yang paling
                teliti membacanya.
              </CardText>
              <div className="mt-block flex flex-wrap items-center gap-3">
                <HalalBadge certificateNumber="ID00410001234567890" />
                <HalalBadge size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle as="h3">Badge lain</CardTitle>
              <CardText>
                Untuk status stok, keterangan produk, dan pesan sistem.
              </CardText>
              <div className="mt-block flex flex-wrap gap-2">
                <Badge tone="halal" icon={<ShieldCheckIcon className="size-4" />}>
                  Halal
                </Badge>
                <Badge tone="gold">Favorit</Badge>
                <Badge tone="neutral">Stok 12</Badge>
                <Badge tone="info" icon={<LeafIcon className="size-4" />}>
                  Tinggi omega-3
                </Badge>
                <Badge tone="warn">Stok menipis</Badge>
                <Badge tone="danger">Habis</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* ============ KARTU ============ */}
      <Section
        tone="sunken"
        title="Kartu"
        description="Varian trust dipakai khusus untuk info keamanan pangan dan halal, supaya terbaca seperti keterangan resmi, bukan seperti iklan."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardBody>
              <Badge tone="neutral">default</Badge>
              <CardTitle as="h3" className="mt-3">
                Kartu produk
              </CardTitle>
              <CardText>
                Latar putih, teks nyaris hitam. Inilah kondisi paling terbaca,
                dan itulah sebabnya area produk memakainya.
              </CardText>
              <p className="tabular text-content mt-block text-2xl font-semibold">
                Rp 45.000
              </p>
              <Button fullWidth className="mt-stack">
                Tambah ke Keranjang
              </Button>
            </CardBody>
          </Card>

          <Card variant="trust">
            <CardBody>
              <Badge tone="halal">trust</Badge>
              <CardTitle as="h3" className="text-halal-800 mt-3">
                Keamanan pangan
              </CardTitle>
              <ul className="mt-block space-y-2.5">
                {[
                  ["Diasap pada suhu terkendali", ThermometerIcon],
                  ["Tanpa pengawet berbahaya", LeafIcon],
                  ["Tanggal produksi tercatat", CheckIcon],
                ].map(([teks, Ikon]) => {
                  const Komponen = Ikon as typeof CheckIcon;
                  return (
                    <li
                      key={teks as string}
                      className="text-halal-800 flex gap-2.5 text-base"
                    >
                      <Komponen className="text-halal-600 mt-0.5 size-5 shrink-0" />
                      {teks as string}
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          <Card variant="dark">
            <CardBody>
              <Badge tone="onDark">dark</Badge>
              <CardTitle as="h3" className="text-on-dark mt-3">
                Kartu zona gelap
              </CardTitle>
              <p className="text-on-dark-soft mt-2 text-base">
                Hanya untuk kartu yang berdiri di atas latar gelap, misalnya di
                dalam hero.
              </p>
              <p className="text-on-dark-soft mt-block flex items-center gap-2">
                <MapPinIcon className="text-gold-400 size-5" />
                Diantar ke rumah di Cikarang
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section
        tone="light"
        title="Interaksi & Memuat"
        description="Dibuat dengan CSS, jadi tidak menambah JavaScript. Semua gerakan berhenti kalau pengguna mengaktifkan kurangi gerak di HP-nya."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card interactive>
            <div className="border-line aspect-[4/3] overflow-hidden rounded-t-lg border-b">
              <FotoPlaceholder label="Foto produk" />
            </div>
            <CardBody>
              <CardTitle as="h3">
                <Link href="/produk" className={tautanMeregang}>
                  Kartu yang bisa ditekan
                </Link>
              </CardTitle>
              <CardText>
                Saat disorot kursor, kartu naik sedikit dan bayangannya menebal.
                Di HP, latarnya menggelap saat ditekan. Tautan ini membuka
                daftar produk.
              </CardText>
            </CardBody>
          </Card>

          <div>
            <div className="border-line bg-surface overflow-hidden rounded-lg border">
              <Skeleton className="border-line aspect-[4/3] w-full border-b" />
              <div className="p-block space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-xs" />
                <Skeleton className="h-4 w-full rounded-xs" />
                <Skeleton className="h-4 w-2/3 rounded-xs" />
              </div>
            </div>
            <p className="text-content-muted mt-3 text-sm">
              Kerangka saat memuat, dengan bentuk yang sama seperti kartu di
              sebelahnya. Di halaman asli selalu ditemani teks status, misalnya
              &ldquo;Memuat daftar produk&hellip;&rdquo;.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="teks-tegak"
        tone="sunken"
        title="Teks Tegak"
        description="Ciri khas hero beranda: empat kolom menu. Kata dibaca dari bawah ke atas dan mulai tepat di atas nomornya, jadi ujung atasnya tidak rata seperti asap yang naik. Hanya dipakai di hero, tidak untuk harga, nama produk, tombol, atau status."
      >
        <div className="bg-ink-950 rounded-lg p-6 md:p-10">
          <MenuTegak label="Contoh menu tegak" item={MENU_BERANDA} className="mx-auto max-w-xl" />
        </div>
      </Section>

      <Section
        id="kloter"
        tone="light"
        title="Kartu Kloter & Produk"
        description="Semua keadaan kartu kloter, dengan data contoh. Di beranda, kartu yang sama memakai data asli dari database dan menyegarkan diri saat halaman dibuka."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {CONTOH_KLOTER.map((contoh) => (
            <div key={contoh.label}>
              <p className="text-content-muted mb-2 text-sm font-medium">{contoh.label}</p>
              <KartuKloter awal={contoh.hasil} waktuRender={WAKTU_CONTOH} segarkan={false} />
            </div>
          ))}
        </div>

        <h3 className="text-content mt-section mb-3 text-lg font-semibold">Kartu produk</h3>
        <div className="grid max-w-md grid-cols-2 gap-3">
          <KartuProduk produk={PRODUK_CONTOH} />
        </div>
        <p className="text-content-muted mt-3 text-sm">
          Produk contoh, jadi tautannya membuka halaman tidak ditemukan.
        </p>
      </Section>

      {/* ============ CATATAN ============ */}
      <Section tone="sunken" title="Yang belum dikerjakan">
        <Card variant="raised">
          <CardBody>
            <ul className="text-content-soft space-y-2.5">
              {[
                "Keranjang dan checkout: langkah berikutnya (PRD Bagian 24, Fase 1 langkah 3).",
                "Nomor WhatsApp dan data sertifikat halal masih menunggu data asli.",
                "Foto produk dan foto proses pengasapan asli belum ada.",
                "Logo gambar belum ada; identitas sementara bertumpu pada wordmark serif.",
              ].map((teks) => (
                <li key={teks} className="flex gap-2.5">
                  <CheckIcon className="text-gold-700 mt-0.5 size-5 shrink-0" />
                  {teks}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </Section>
    </>
  );
}
