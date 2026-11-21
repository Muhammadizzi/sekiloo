import type { Metadata } from "next";
import Image from "next/image";
import { BagianDokumen, Dokumen } from "@/components/dokumen/Dokumen";
import { ShieldCheckIcon } from "@/components/icons";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { SERTIFIKAT_HALAL, URL_CEK_HALAL } from "@/data/halal";
import { CARA_SIMPAN, caraSimpanLengkap, IZIN_EDAR, PROSES_ASAP, RANTAI_DINGIN } from "@/data/keamanan-pangan";

export const metadata: Metadata = {
  title: "Halal & Keamanan Pangan",
  description: "Sertifikat halal, izin edar, cara ikan diasap dan dikemas, rantai dingin sampai Cikarang, dan cara menyimpannya.",
};

const ISI = [
  { id: "sertifikat", judul: "Sertifikat halal" },
  { id: "izin-edar", judul: "Izin edar" },
  { id: "proses", judul: "Cara ikan diasap" },
  { id: "rantai-dingin", judul: "Rantai dingin" },
  { id: "penyimpanan", judul: "Cara menyimpan" },
  { id: "gizi", judul: "Soal gizi dan kesehatan" },
];

export default function HalamanHalal() {
  const s = SERTIFIKAT_HALAL;
  const prosesLengkap = PROSES_ASAP.jenisKayu && PROSES_ASAP.suhu && PROSES_ASAP.durasi;
  const adaYangKurang =
    !s || !IZIN_EDAR || !prosesLengkap || !caraSimpanLengkap || !RANTAI_DINGIN.lamaPerjalanan || !RANTAI_DINGIN.batasLuarPendingin;

  return (
    <Dokumen
      judul="Halal & Keamanan Pangan"
      ringkasan={
        <p>
          Ikan asap kami diolah di desa, dikemas vakum, lalu dibawa dingin ke Cikarang. Di halaman ini kami tulis apa
          saja yang bisa kamu periksa sendiri{adaYangKurang ? ", dan apa yang masih kami lengkapi" : ""}.
        </p>
      }
      isi={ISI}
    >
      <BagianDokumen id="sertifikat" judul="Sertifikat halal">
        {s ? (
          <Card variant="trust">
            <CardBody>
              <p className="text-halal-800 flex items-center gap-2 text-lg font-semibold">
                <ShieldCheckIcon className="size-6" />
                Bersertifikat Halal
              </p>
              <dl className="text-halal-800 mt-stack grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
                <dt>Nomor</dt>
                <dd className="tabular font-semibold">{s.nomor}</dd>
                <dt>Lembaga</dt>
                <dd>{s.lembaga}</dd>
                <dt>Terbit</dt>
                <dd>{s.terbit}</dd>
                {s.berlaku && (
                  <>
                    <dt>Berlaku</dt>
                    <dd>{s.berlaku}</dd>
                  </>
                )}
              </dl>
              <Button href={URL_CEK_HALAL} variant="outline" target="_blank" rel="noopener noreferrer" className="mt-block">
                Cek keaslian di situs BPJPH
              </Button>
              <p className="text-halal-800 mt-2 text-sm">Masukkan nomor sertifikat di kolom Nomor Sertifikat.</p>
            </CardBody>
          </Card>
        ) : (
          <>
            <p>Nomor sertifikat halal belum kami cantumkan.</p>
            <CatatanPlaceholder judul="data sertifikat halal belum diisi">
              <p>
                Isi SERTIFIKAT_HALAL di src/data/halal.ts: nomor, lembaga penerbit, tanggal terbit, masa berlaku, dan
                scan sertifikat (PRD Bagian 23 no. 13). Setelah terisi, klaim halal muncul di header, footer, beranda,
                dan tanya jawab.
              </p>
            </CatatanPlaceholder>
          </>
        )}
        {s?.scan && (
          <Image
            src={s.scan}
            alt={`Sertifikat halal nomor ${s.nomor}`}
            width={1200}
            height={1700}
            className="border-line h-auto w-full max-w-md rounded-md border"
          />
        )}
      </BagianDokumen>

      <BagianDokumen id="izin-edar" judul="Izin edar">
        {IZIN_EDAR ? (
          <p>
            Nomor izin edar {IZIN_EDAR.jenis}: <strong className="tabular">{IZIN_EDAR.nomor}</strong>.
          </p>
        ) : (
          <>
            <p>Nomor izin edar belum kami cantumkan.</p>
            <CatatanPlaceholder judul="izin edar belum diisi">
              <p>
                Cek izin yang berlaku untuk ikan asap kemasan vakum yang perlu disimpan dingin (PIRT atau BPOM), lalu
                isi IZIN_EDAR di src/data/keamanan-pangan.ts (PRD Bagian 23 no. 14).
              </p>
            </CatatanPlaceholder>
          </>
        )}
      </BagianDokumen>

      <BagianDokumen id="proses" judul="Cara ikan diasap">
        <ul>
          <li>Ikan baru diasap setelah PO ditutup, hanya sebanyak pesanan yang sudah dibayar. Tidak ada stok yang disiapkan lebih dulu.</li>
          {prosesLengkap && (
            <li>
              Diasap dengan kayu {PROSES_ASAP.jenisKayu} pada suhu {PROSES_ASAP.suhu} selama {PROSES_ASAP.durasi}.
            </li>
          )}
          <li>Setelah diasap, ikan dikemas vakum lalu disimpan dingin sampai kloter berangkat.</li>
          <li>Setiap kemasan diberi label: nama produk, berat isi, tanggal produksi, kode kloter, cara simpan, dan batas konsumsi.</li>
        </ul>
        {!prosesLengkap && (
          <CatatanPlaceholder judul="detail pengasapan belum diisi">
            <p>
              Isi PROSES_ASAP di src/data/keamanan-pangan.ts: jenis kayu, suhu, dan durasi pengasapan. Foto atau video
              dapur asli juga ditaruh di bagian ini (PRD Bagian 15).
            </p>
          </CatatanPlaceholder>
        )}
      </BagianDokumen>

      <BagianDokumen id="rantai-dingin" judul="Rantai dingin">
        <p>Ikan yang sudah divakum tidak dibiarkan lama di suhu ruang. Urutannya:</p>
        <ol className="space-y-3">
          {[
            { tahap: "Di desa", isi: "Disimpan dingin setelah divakum, sampai kloter berangkat." },
            {
              tahap: "Perjalanan ke Cikarang",
              isi: `Dibawa dalam cool box dengan ice gel${RANTAI_DINGIN.lamaPerjalanan ? `, paling lama ${RANTAI_DINGIN.lamaPerjalanan}` : ""}.`,
            },
            { tahap: "Di Cikarang", isi: "Langsung masuk freezer atau kulkas begitu tiba, sampai hari antar." },
            {
              tahap: "Saat diantar",
              isi: `Dibawa dalam tas atau box dingin${RANTAI_DINGIN.batasLuarPendingin ? `, paling lama ${RANTAI_DINGIN.batasLuarPendingin} di luar pendingin` : ""}.`,
            },
          ].map((t, i) => (
            <li key={t.tahap} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
              <span className="font-angka tabular-nums lining-nums text-gold-700 text-xl leading-7 font-semibold">{i + 1}</span>
              <span>
                <strong>{t.tahap}.</strong> {t.isi}
              </span>
            </li>
          ))}
        </ol>
        {(!RANTAI_DINGIN.lamaPerjalanan || !RANTAI_DINGIN.batasLuarPendingin) && (
          <CatatanPlaceholder judul="durasi rantai dingin belum diisi">
            <p>
              Isi RANTAI_DINGIN di src/data/keamanan-pangan.ts: lama maksimum perjalanan dalam cool box, dan batas
              maksimum di luar pendingin saat diantar. Angkanya dari uji ketahanan produk (PRD Bagian 11.3).
            </p>
          </CatatanPlaceholder>
        )}
      </BagianDokumen>

      <BagianDokumen id="penyimpanan" judul="Cara menyimpan">
        <p>Begitu pesanan diterima, langsung masukkan ke freezer atau kulkas.</p>
        {caraSimpanLengkap ? (
          <div className="border-line overflow-hidden rounded-lg border">
            <table className="w-full text-left">
              <caption className="sr-only">Suhu dan lama simpan ikan asap</caption>
              <thead className="bg-surface-muted text-content text-sm">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Tempat</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Suhu</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Tahan</th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {CARA_SIMPAN.map((c) => (
                  <tr key={c.tempat}>
                    <th scope="row" className="text-content px-4 py-3 font-medium">{c.tempat}</th>
                    <td className="tabular px-4 py-3">{c.suhu}</td>
                    <td className="tabular px-4 py-3">{c.tahan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CatatanPlaceholder judul="suhu dan masa simpan belum diisi">
            <p>
              Isi CARA_SIMPAN di src/data/keamanan-pangan.ts untuk freezer, kulkas, suhu ruang, dan setelah kemasan
              dibuka. Angkanya harus dari hasil uji ketahanan produk, bukan perkiraan (PRD Bagian 23 no. 15).
            </p>
          </CatatanPlaceholder>
        )}
      </BagianDokumen>

      <BagianDokumen id="gizi" judul="Soal gizi dan kesehatan">
        <p>
          Kami tidak mencantumkan angka gizi atau klaim kesehatan, karena belum ada hasil uji lab untuk produk kami
          sendiri. Angka gizi baru kami tulis setelah ada hasil uji itu.
        </p>
      </BagianDokumen>
    </Dokumen>
  );
}
