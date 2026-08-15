import { Section } from "@/components/ui/Section";
import { Card, CardBody, CardTitle, CardText } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Beranda — masih placeholder.
 *
 * Katalog dan detail produk sengaja belum dibuat: tahap ini hanya
 * menetapkan fondasi desain dan kerangka global.
 */
export default function Home() {
  return (
    <Section
      tone="sunken"
      title="sekiloo sedang dibangun"
      description="Fondasi desain dan kerangka global sudah terpasang. Halaman katalog menyusul."
      headingLevel="h1"
    >
      <Card>
        <CardBody>
          <CardTitle>Lihat panduan gaya</CardTitle>
          <CardText>
            Semua token warna, tipografi, jarak, dan komponen dasar bisa
            ditinjau dalam satu halaman.
          </CardText>
          <Button href="/styleguide" className="mt-block">
            Buka Panduan Gaya
          </Button>
        </CardBody>
      </Card>
    </Section>
  );
}
