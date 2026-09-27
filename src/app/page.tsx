import Image from "next/image";
import Link from "next/link";

import {
  CheckIcon,
  LeafIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ThermometerIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { LOKASI } from "@/data/locations";
import { PRODUK } from "@/data/products";
import { formatRupiah } from "@/lib/format";

const produkUnggulan = PRODUK[0];

const alasanMemilih = [
  {
    icon: ShieldCheckIcon,
    judul: "Informasi yang terbuka",
    isi: "Kenali produk, informasi halal, dan detail yang perlu diketahui sebelum memilih.",
  },
  {
    icon: ThermometerIcon,
    judul: "Proses dijelaskan",
    isi: "Lihat tahapan pengolahan, cara menyimpan, dan catatan kualitas produk.",
  },
  {
    icon: MapPinIcon,
    judul: "Ambil di lokasi pilihan",
    isi: "Pilih titik pengambilan yang paling nyaman. Harga dan ketersediaan ditampilkan lebih dulu.",
  },
];

export default function Home() {
  if (!produkUnggulan) return null;

  const hargaTerendah = Math.min(
    produkUnggulan.zona.reguler.harga,
    produkUnggulan.zona.cikarang.harga,
  );

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink-900 text-on-dark">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-48 -right-40 -z-10 size-[34rem] rounded-full border border-gold-400/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 -z-10 size-[25rem] rounded-full border border-gold-400/10"
        />

        <Container className="grid items-center gap-12 py-14 md:min-h-[610px] md:grid-cols-[0.94fr_1.06fr] md:gap-10 md:py-20">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1.5 text-sm font-medium text-gold-200">
              <span className="size-1.5 rounded-full bg-gold-400" />
              Ikan asap, dibuat dengan perhatian
            </p>
            <h1 className="font-display mt-6 text-4xl leading-[1.08] font-semibold tracking-tight text-on-dark sm:text-5xl md:text-6xl">
              Rasa yang akrab.
              <span className="mt-1 block text-gold-400">Cerita yang jelas.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-on-dark-soft">
              Temukan ikan asap pilihan, kenali proses dan cara penyimpanannya,
              lalu pilih lokasi pengambilan yang paling nyaman untukmu.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#produk" size="lg">
                Lihat produk pilihan
                <span aria-hidden>↗</span>
              </Button>
              <Button href="#cerita" variant="outlineGold" size="lg">
                Kenali Sekiloo
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-on-dark-muted">
              <span className="inline-flex items-center gap-2">
                <CheckIcon className="size-4 text-gold-400" />
                Informasi produk transparan
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="size-4 text-gold-400" />
                3 titik pengambilan
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] md:ml-auto">
            <div className="absolute -inset-3 rotate-2 rounded-[2rem] border border-gold-400/20" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl">
              <Image
                src="/ikan-asap-hero.png"
                alt="Ilustrasi ikan asap dalam kemasan vakum di atas daun pisang"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 52vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-ink-950/10" />
              <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-4 sm:right-6 sm:bottom-6 sm:left-6">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-gold-200 uppercase">
                    Produk pilihan
                  </p>
                  <p className="font-display mt-1 text-2xl font-semibold text-white sm:text-3xl">
                    {produkUnggulan.nama}
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    {produkUnggulan.ukuranKemasan}
                  </p>
                </div>
                <span className="hidden rounded-full border border-white/25 bg-ink-950/45 px-3 py-1.5 text-xs text-white/85 backdrop-blur sm:inline-flex">
                  Ilustrasi produk
                </span>
              </div>
            </div>
            <p className="mt-3 text-right text-xs text-on-dark-muted">
              Gambar ilustrasi · foto produk asli menyusul
            </p>
          </div>
        </Container>
      </section>

      <section id="cerita" className="scroll-mt-20 bg-surface py-14 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-gold-700 uppercase">
              Dibuat untuk dinikmati dengan yakin
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-content sm:text-4xl">
              Bukan cuma soal rasa.
            </h2>
            <p className="mt-4 text-lg text-content-muted">
              Kami ingin setiap pilihan terasa lebih mudah: informasi yang
              dibutuhkan tersedia, dan detail pengambilan tidak jadi kejutan.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {alasanMemilih.map(({ icon: Icon, judul, isi }, index) => (
              <article
                key={judul}
                className="rounded-xl border border-line bg-surface p-6 shadow-card"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-gold-200/55 text-gold-700">
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 text-xs font-bold tracking-[0.16em] text-content-muted uppercase">
                  0{index + 1}
                </p>
                <h3 className="font-display mt-2 text-xl font-semibold text-content">
                  {judul}
                </h3>
                <p className="mt-2 text-content-muted">{isi}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section id="produk" className="scroll-mt-20 bg-surface-sunken py-14 md:py-20">
        <Container>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-[0.2em] text-gold-700 uppercase">
                Pilihan hari ini
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-content sm:text-4xl">
                Kenalan dengan produk kami
              </h2>
              <p className="mt-3 text-lg text-content-muted">
                Mulai dari satu produk pilihan, dengan detail yang bisa kamu
                baca sebelum menentukan lokasi pengambilan.
              </p>
            </div>
            <Link
              href={`/produk/${produkUnggulan.slug}`}
              className="font-semibold text-gold-700 underline decoration-gold-500/50 underline-offset-4 hover:decoration-gold-700"
            >
              Baca detail produk <span aria-hidden>↗</span>
            </Link>
          </div>

          <article className="mt-8 grid overflow-hidden rounded-2xl border border-line bg-surface shadow-raised md:grid-cols-[0.9fr_1.1fr]">
            <Link
              href={`/produk/${produkUnggulan.slug}`}
              className="group relative block min-h-64 overflow-hidden bg-ink-800 md:min-h-[390px]"
              aria-label={`Lihat detail ${produkUnggulan.nama}`}
            >
              <Image
                src="/ikan-asap-hero.png"
                alt="Ilustrasi ikan asap kemasan vakum"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute top-4 left-4 rounded-full bg-surface/95 px-3 py-1 text-xs font-semibold text-content shadow-card">
                Produk contoh
              </span>
            </Link>

            <div className="flex flex-col justify-center p-6 sm:p-9 md:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-halal-50 px-3 py-1 text-xs font-semibold text-halal-800">
                  Informasi produk
                </span>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-content-muted">
                  {produkUnggulan.ukuranKemasan}
                </span>
              </div>
              <h3 className="font-display mt-5 text-3xl font-semibold text-content">
                {produkUnggulan.nama}
              </h3>
              <p className="mt-3 max-w-xl text-content-muted">
                {produkUnggulan.deskripsiSingkat}
              </p>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
                <div>
                  <p className="text-sm text-content-muted">Harga contoh mulai dari</p>
                  <p className="tabular mt-1 text-2xl font-semibold text-content">
                    {formatRupiah(hargaTerendah)}
                  </p>
                </div>
                <p className="inline-flex items-center gap-2 text-sm text-content-muted">
                  <MapPinIcon className="size-4 text-gold-700" />
                  3 pilihan lokasi
                </p>
              </div>

              <Button
                href={`/produk/${produkUnggulan.slug}`}
                size="lg"
                className="mt-6 w-full sm:w-fit"
              >
                Lihat detail & lokasi
                <span aria-hidden>→</span>
              </Button>
              <p className="mt-3 text-xs leading-5 text-content-muted">
                Harga dan informasi produk pada pratinjau ini masih contoh,
                belum menjadi penawaran untuk pemesanan.
              </p>
            </div>
          </article>
        </Container>
      </section>

      <section className="bg-surface py-14 md:py-20">
        <Container>
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-gold-700 uppercase">
                Dekat denganmu
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-content sm:text-4xl">
                Pilih cara ambil yang nyaman
              </h2>
              <p className="mt-4 text-content-muted">
                Setiap lokasi punya detailnya sendiri. Cek alamat dan jam
                operasional yang berlaku sebelum datang.
              </p>
              <Link
                href={`/produk/${produkUnggulan.slug}#beli`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-gold-700 underline decoration-gold-500/50 underline-offset-4 hover:decoration-gold-700"
              >
                Lihat pilihan lokasi <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {LOKASI.map((lokasi, index) => (
                <div
                  key={lokasi.id}
                  className="rounded-xl border border-line bg-surface p-5 shadow-card"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted text-gold-700">
                    <MapPinIcon className="size-5" />
                  </span>
                  <p className="mt-4 text-xs font-bold tracking-[0.16em] text-content-muted uppercase">
                    Titik 0{index + 1}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-semibold text-content">
                    {lokasi.nama}
                  </h3>
                  <p className="mt-2 text-sm text-content-muted">
                    {lokasi.jamOperasional}
                  </p>
                  <p className="mt-3 border-t border-line pt-3 text-xs leading-5 text-content-muted">
                    Detail alamat menyusul
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-ink-950 py-14 text-on-dark md:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-2xl border border-gold-400/20 bg-ink-900 px-6 py-10 sm:px-10 md:px-14 md:py-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -bottom-48 size-96 rounded-full border border-gold-400/15"
            />
            <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400">
                  <LeafIcon className="size-5" />
                  Sekiloo, dari dekat
                </span>
                <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
                  Cari tahu sebelum memilih.
                </h2>
                <p className="mt-3 max-w-xl text-on-dark-soft">
                  Buka detail produk untuk melihat informasi pengolahan,
                  penyimpanan, serta lokasi pengambilan yang tersedia.
                </p>
              </div>
              <Button href={`/produk/${produkUnggulan.slug}`} size="lg" className="shrink-0">
                Jelajahi produk <span aria-hidden>→</span>
              </Button>
            </div>
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-on-dark-muted">
            Pratinjau Sekiloo: foto, harga, alamat, jam operasional, sertifikat,
            dan informasi produk masih perlu dikonfirmasi sebelum situs dibuka
            untuk pemesanan.
          </p>
        </Container>
      </section>
    </>
  );
}
