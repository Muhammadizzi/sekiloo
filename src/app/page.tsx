import { Section } from "@/components/ui/Section";
import { Card, CardBody, CardTitle, CardText } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Beranda — masih placeholder.
 *
 * Halaman KATALOG belum dibuat. Yang sudah ada baru satu halaman detail
 * produk, jadi beranda untuk sementara berfungsi sebagai pintu masuk
 * manual ke halaman-halaman yang sudah jadi.
 */
export default function Home() {
  return (
    <Section
      tone="sunken"
      title="sekiloo sedang dibangun"
      description="Fondasi desain, kerangka global, dan halaman detail produk sudah terpasang. Halaman katalog menyusul."
      headingLevel="h1"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardBody>
            <CardTitle>Lihat halaman detail produk</CardTitle>
            <CardText>
              Galeri, pemilih lokasi pengambilan dengan harga yang ikut
              berubah, info halal, manfaat gizi, dan keamanan pangan.
            </CardText>
            <Button href="/produk/ikan-patin-asap" className="mt-block">
              Buka Detail Produk
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Lihat panduan gaya</CardTitle>
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
      </div>
    </Section>
  );
}
