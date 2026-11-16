import { Section } from "@/components/ui/Section";
import { Reveal, jedaBertahap } from "@/components/ui/Reveal";
import { Card, CardBody, CardTitle, CardText } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MapPinIcon,
  ShieldCheckIcon,
  ThermometerIcon,
} from "@/components/icons";
import { FotoPlaceholder } from "@/components/produk/FotoPlaceholder";
import { getKatalog } from "@/data/products";

/**
 * SLOT FOTO PRODUK UNGGULAN — separuh kanan hero.
 *
 * Alasan ia ada sekarang, sebelum fotonya ada: ruang kanan hero yang
 * dibiarkan kosong bukan cuma terasa hambar, tapi juga menyembunyikan
 * keputusan tata letak. Begitu foto asli datang dan baru saat itu
 * kolomnya dibuat, ukuran judul, panjang paragraf, dan jarak antar
 * elemen di kiri semuanya harus disetel ulang.
 *
 * Karena itu slot ini sudah memakai RASIO FINAL (4:5 di desktop, 16:10
 * sebagai spanduk di HP). Mengganti isinya nanti tidak akan menggeser
 * apa pun — cukup tukar <FotoPlaceholder> dengan <Image> dari next/image
 * pada kotak yang sama.
 */
function SlotFotoUnggulan() {
  return (
    <div className="mx-auto w-full max-w-md lg:max-w-none">
      {/* Bingkai: garis emas tipis + jarak dalam, sehingga foto nanti
          terbaca seperti dipigura, bukan ditempel. */}
      <div className="border-gold-500/35 bg-ink-800/50 shadow-panel rounded-xl border p-2">
        <div className="border-ink-700 aspect-[16/10] overflow-hidden rounded-lg border sm:aspect-[3/2] lg:aspect-[4/5]">
          <FotoPlaceholder
            tone="dark"
            label="Foto produk unggulan"
            catatan="Slot menunggu foto asli · 4:5 di desktop"
          />
        </div>
      </div>

      <p className="text-on-dark-muted mt-3 text-center text-xs">
        Foto asli menyusul — kotak ini sudah memakai rasio finalnya.
      </p>
    </div>
  );
}

/**
 * Beranda.
 *
 * Belum jadi beranda sungguhan — bagian cerita, testimoni, dan pengenalan
 * proses masih menyusul. Yang sudah benar sejak sekarang adalah TUGAS
 * UTAMANYA: mengantar pengunjung ke katalog dalam satu ketukan, tanpa
 * perlu menggulir. Di HP itu berarti tombolnya harus ada di layar pertama.
 *
 * Blok gelap di atas adalah zona bingkai (menyambung dari header), sisanya
 * zona terang. Hero-nya dua kolom di desktop: teks di kiri, slot foto di
 * kanan — separuh kanan yang kosong adalah cara tercepat sebuah hero
 * terasa belum selesai.
 */
export default async function Home() {
  /* Jumlah kategori & produk diambil dari data, bukan ditulis "4 kategori"
     sebagai teks. Angka yang ditulis tangan adalah angka yang suatu hari
     akan salah tanpa ada yang menyadarinya. */
  const katalog = await getKatalog();
  const jumlahProduk = katalog.reduce(
    (total, kelompok) => total + kelompok.produk.length,
    0,
  );

  return (
    <>
      <Section tone="dark" className="relative isolate overflow-hidden">
        {/* Kedalaman zona gelap. Dua lapisan dekoratif, nol dampak pada
            tata letak: cahaya hangat dari kiri-atas, lalu rambut emas
            sebagai penutup seksi. Nilainya ada di globals.css (.lapis-cahaya)
            berikut catatan batas kontrasnya. */}
        <div
          aria-hidden
          className="lapis-cahaya pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden
          className="garis-emas pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
        />

        {/*
          DUA KOLOM DI DESKTOP, MENUMPUK DI HP.

          Urutan DOM: teks dulu, gambar belakangan — supaya pembaca layar
          dan mesin pencari menemukan h1 sebagai hal pertama di halaman.
          Yang dibalik hanya urutan TAMPILANNYA di HP (`order`), tempat
          gambar bekerja sebagai spanduk pembuka. Tidak ada elemen yang
          bisa difokus di dalam slot gambar, jadi urutan tab tetap benar.
        */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="order-2 max-w-xl lg:order-1">
            {/* Kicker. Garis pendek di depannya memberi titik mulai untuk
                mata sebelum judul — trik lama, dan masih bekerja. */}
            <p className="text-gold-400 flex items-center gap-3 text-sm font-medium tracking-[0.14em] uppercase">
              <span aria-hidden className="bg-gold-500 h-px w-8 shrink-0" />
              Diasap &amp; dikemas hari itu juga
            </p>

            <h1 className="text-on-dark mt-stack text-4xl font-semibold md:text-5xl lg:text-[3.5rem]">
              Ikan asap yang bisa kamu percaya
            </h1>
            <p className="text-on-dark-soft mt-stack text-lg">
              Diasap perlahan, dikemas vakum hari itu juga, dan diambil sendiri
              di titik ambil pilihanmu. Nomor sertifikat halal, proses
              pengasapan, dan masa simpan ditulis terbuka di tiap produk.
            </p>

            {/* Hirarki tombol: satu aksi utama beremas, satu aksi sekunder
                bergaris. Di HP keduanya melebar penuh supaya jadi sasaran
                sentuh yang besar dan tidak berdempetan. */}
            <div className="mt-block flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/produk" size="lg" className="w-full sm:w-auto">
                Lihat Semua Produk
              </Button>
              <Button
                href="/produk/ikan-patin-asap"
                variant="outlineGold"
                size="lg"
                className="w-full sm:w-auto"
              >
                Lihat Contoh Produk
              </Button>
            </div>

            {/* Baris kepercayaan. Ikon + teks, tidak pernah ikon saja —
                warna dan bentuk bukan pembawa makna tunggal di sini. */}
            <ul className="mt-block text-on-dark-soft flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ShieldCheckIcon className="text-halal-400 size-4 shrink-0" />
                Bersertifikat halal
              </li>
              <li className="flex items-center gap-2">
                <ThermometerIcon className="text-gold-400 size-4 shrink-0" />
                Dikemas vakum
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon className="text-gold-400 size-4 shrink-0" />3 titik
                ambil
              </li>
            </ul>

            <p className="text-on-dark-muted mt-stack text-sm">
              {jumlahProduk} produk dalam {katalog.length} kategori — ikan,
              kepala, jeroan, dan telur ikan asap.
            </p>
          </div>

          {/* Satu-satunya bagian hero yang dianimasikan.
              Judul, paragraf, dan tombol di kolom kiri sengaja TIDAK
              dibungkus <Reveal>: h1 hampir pasti elemen LCP halaman ini,
              dan teks ber-opacity 0 tidak dihitung browser sebagai "sudah
              tampil". Menganimasikannya berarti menukar angka LCP dengan
              efek — pertukaran yang jelas rugi. Slot foto bukan kandidat
              LCP (ia SVG sebaris), jadi ia yang mendapat sambutannya. */}
          <Reveal className="order-1 lg:order-2">
            <SlotFotoUnggulan />
          </Reveal>
        </div>
      </Section>

      <Section
        tone="sunken"
        title="sekiloo sedang dibangun"
        description="Fondasi desain, kerangka global, katalog, dan halaman detail produk sudah terpasang. Keranjang dan checkout menyusul."
        reveal
      >
        {/* Tiga kartu muncul bergiliran, bukan serempak. Jeda 70ms cukup
            untuk terbaca sebagai urutan; lebih dari itu mulai terasa
            seperti halaman yang lambat. */}
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal jeda={jedaBertahap(0)}>
            <Card>
              <CardBody>
                <CardTitle>Katalog produk</CardTitle>
                <CardText>
                  Empat kategori, dengan pembagian potongan dan per ekor di
                  dalam kategori Ikan. Harga zona reguler tampil di kartu, harga
                  Cikarang ikut disebut supaya tidak jadi kejutan.
                </CardText>
                <Button href="/produk" className="mt-block">
                  Buka Katalog
                </Button>
              </CardBody>
            </Card>
          </Reveal>

          <Reveal jeda={jedaBertahap(1)}>
            <Card>
              <CardBody>
                <CardTitle>Halaman detail produk</CardTitle>
                <CardText>
                  Galeri, pemilih lokasi pengambilan dengan harga yang ikut
                  berubah, info halal, manfaat gizi, dan keamanan pangan.
                </CardText>
                <Button
                  href="/produk/ikan-patin-asap"
                  variant="outline"
                  className="mt-block"
                >
                  Buka Contoh Detail
                </Button>
              </CardBody>
            </Card>
          </Reveal>

          <Reveal jeda={jedaBertahap(2)}>
            <Card>
              <CardBody>
                <CardTitle>Panduan gaya</CardTitle>
                <CardText>
                  Semua token warna, tipografi, jarak, dan komponen dasar bisa
                  ditinjau dalam satu halaman.
                </CardText>
                <Button
                  href="/styleguide"
                  variant="outline"
                  className="mt-block"
                >
                  Buka Panduan Gaya
                </Button>
              </CardBody>
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
