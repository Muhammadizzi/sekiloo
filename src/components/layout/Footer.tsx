import { Container } from "@/components/ui/Section";
import { MapPinIcon, PhoneIcon, ShieldCheckIcon } from "@/components/icons";

/**
 * Footer global — zona gelap.
 *
 * Isinya mengikuti PRD: info halal, kontak cepat, dan 3 titik pengambilan
 * (Pasar / Rumah Produksi / Cikarang).
 *
 * Semua data di bawah masih PLACEHOLDER. Alamat, nomor telepon, dan
 * terutama nomor sertifikat halal harus diganti dengan data asli sebelum
 * situs ini tayang — menampilkan nomor sertifikat karangan justru
 * merusak kepercayaan yang jadi tujuan utama web ini.
 */

const LOKASI = [
  {
    nama: "Pasar",
    alamat: "Alamat lengkap menyusul",
    jam: "06.00 – 14.00",
  },
  {
    nama: "Rumah Produksi",
    alamat: "Alamat lengkap menyusul",
    jam: "08.00 – 17.00",
  },
  {
    nama: "Cikarang",
    alamat: "Alamat lengkap menyusul",
    jam: "09.00 – 17.00",
  },
];

export function Footer() {
  return (
    <footer className="bg-ink-950 text-on-dark-soft border-t border-ink-700 mt-auto">
      <Container>
        <div className="py-section grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Kolom 1 — merek & jaminan halal */}
          <div>
            <p className="font-display text-on-dark text-2xl font-semibold">
              sekiloo
              <span className="text-gold-400" aria-hidden>
                .
              </span>
            </p>
            <p className="mt-stack max-w-xs text-base">
              Ikan asap yang diproses higienis, tanpa pengawet berbahaya, dan
              bersertifikat halal.
            </p>

            <div className="mt-block border-halal-400/30 bg-halal-400/10 rounded-sm border p-3">
              <p className="text-halal-400 flex items-center gap-2 font-semibold">
                <ShieldCheckIcon className="size-5" />
                Bersertifikat Halal
              </p>
              <p className="tabular text-on-dark-soft mt-1 text-sm">
                No. sertifikat: menyusul
              </p>
            </div>
          </div>

          {/* Kolom 2 — tiga titik pengambilan */}
          <div>
            <h2 className="font-display text-on-dark text-lg font-semibold">
              Lokasi Pengambilan
            </h2>
            <ul className="mt-stack space-y-4">
              {LOKASI.map((lokasi) => (
                <li key={lokasi.nama} className="flex gap-2.5">
                  <MapPinIcon className="text-gold-400 mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="text-on-dark font-medium">{lokasi.nama}</p>
                    <p className="text-sm">{lokasi.alamat}</p>
                    <p className="tabular text-on-dark-muted text-sm">
                      {lokasi.jam}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3 — kontak */}
          <div>
            <h2 className="font-display text-on-dark text-lg font-semibold">
              Hubungi Kami
            </h2>
            <p className="mt-stack text-base">
              Ada pertanyaan soal produk, proses, atau pesanan? Kami balas cepat
              lewat WhatsApp.
            </p>
            <a
              href="#"
              className="mt-stack border-ink-500 text-on-dark hover:bg-on-dark/10 inline-flex min-h-11 items-center gap-2 rounded-md border px-4 font-medium transition-colors"
            >
              <PhoneIcon className="size-5" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="border-ink-700 flex flex-col gap-2 border-t py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} sekiloo. Seluruh hak dilindungi.</p>
          <p className="text-on-dark-muted">
            Pembayaran diproses aman lewat gateway resmi.
          </p>
        </div>
      </Container>
    </footer>
  );
}
