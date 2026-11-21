import type { Metadata } from "next";
import { BagianDokumen, Dokumen } from "@/components/dokumen/Dokumen";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { NOMOR_WHATSAPP, tautanWhatsApp } from "@/data/kontak";
import { KEBIJAKAN } from "@/data/kebijakan";
import { formatNomorTampil } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Data apa yang dikumpulkan Sealauk saat kamu memesan, untuk apa, siapa yang bisa melihatnya, dan cara meminta penghapusan.",
};

const ISI = [
  { id: "pengelola", judul: "Siapa yang mengelola data" },
  { id: "data", judul: "Data yang kami kumpulkan" },
  { id: "tujuan", judul: "Untuk apa data dipakai" },
  { id: "akses", judul: "Siapa yang bisa melihat" },
  { id: "pihak-lain", judul: "Layanan pihak lain" },
  { id: "masa-simpan", judul: "Berapa lama disimpan" },
  { id: "hak", judul: "Hakmu atas datamu" },
  { id: "keamanan", judul: "Keamanan dan kebocoran data" },
  { id: "perubahan", judul: "Perubahan kebijakan" },
];

const tautan = "text-gold-700 font-semibold underline underline-offset-4";

export default function HalamanPrivasi() {
  const k = KEBIJAKAN;
  const nomor = formatNomorTampil(NOMOR_WHATSAPP);

  return (
    <Dokumen
      judul="Kebijakan Privasi"
      ringkasan={
        <p>
          Kami hanya meminta data yang perlu untuk mengantar pesananmu, dan tidak menjualnya atau memakainya untuk
          iklan. Kebijakan ini mengikuti Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
        </p>
      }
      diperbarui={k.diperbarui}
      isi={ISI}
    >
      <BagianDokumen id="pengelola" judul="Siapa yang mengelola data">
        {k.pengelola ? (
          <p>
            Data pesanan dikelola oleh {k.pengelola.nama}, {k.pengelola.kota}, pemilik usaha Sealauk. Pertanyaan soal
            data pribadi bisa dikirim lewat WhatsApp resmi kami di nomor <span className="tabular">{nomor}</span>.
          </p>
        ) : (
          <>
            <p>
              Data pesanan dikelola oleh Sealauk. Pertanyaan soal data pribadi bisa dikirim lewat WhatsApp resmi kami di
              nomor <span className="tabular">{nomor}</span>.
            </p>
            <CatatanPlaceholder judul="nama pengelola data belum diisi">
              <p>
                UU PDP mewajibkan pengendali data jelas identitasnya. Isi KEBIJAKAN.pengelola di src/data/kebijakan.ts
                dengan nama pemilik usaha atau badan usaha dan kotanya.
              </p>
            </CatatanPlaceholder>
          </>
        )}
      </BagianDokumen>

      <BagianDokumen id="data" judul="Data yang kami kumpulkan">
        <p>Saat kamu memesan:</p>
        <ul>
          <li>Nama dan nomor WhatsApp pemesan.</li>
          <li>Nama dan nomor penerima, kalau penerimanya orang lain.</li>
          <li>
            Kecamatan, alamat lengkap, patokan, dan titik lokasi rumah yang kamu pasang di peta. Kalau kamu memakai
            tombol lokasi HP, lokasinya hanya dipakai untuk memindahkan pin dan baru tersimpan setelah pesanan dibuat.
          </li>
          <li>Isi pesanan, total bayar, dan waktu kamu menyetujui kebijakan ini dan Syarat Pemesanan.</li>
        </ul>
        <p>Selama pesanan berjalan:</p>
        <ul>
          <li>
            Status pembayaran dari Midtrans: nomor transaksi, status, metode, dan waktunya. Nomor kartu, rekening, atau
            akun e-wallet-mu tidak pernah sampai ke kami.
          </li>
          <li>Riwayat status pesanan, mulai dari dibayar sampai diterima atau dibatalkan.</li>
          <li>Foto bukti antar, kalau admin memotretnya saat pesanan diserahkan.</li>
          <li>
            Kalau ada refund: nomor rekening atau e-wallet tujuan yang kamu kirim lewat WhatsApp tidak kami catat di
            sistem. Yang kami simpan hanya foto bukti transfer, yang bisa memuat nama dan nomor rekening tujuan.
          </li>
        </ul>
        <p>Untuk mencegah penyalahgunaan:</p>
        <ul>
          <li>
            Alamat IP saat checkout dan saat memakai Cek Pesanan, disimpan dalam bentuk acak (hash) yang tidak bisa
            dibalik, dan dihapus setelah satu hari.
          </li>
        </ul>
        <p>
          Isi keranjang disimpan di HP-mu sendiri (penyimpanan browser), berisi produk dan jumlahnya saja. Kami tidak
          memasang pelacak iklan atau analitik.
        </p>
      </BagianDokumen>

      <BagianDokumen id="tujuan" judul="Untuk apa data dipakai">
        <ul>
          <li>Membuat pesanan, menghitung ongkir, dan memeriksa pembayaran.</li>
          <li>Menulis nama di label kemasan.</li>
          <li>Mengantar ke alamatmu dan mengabari lewat WhatsApp, misalnya jadwal antar, gagal antar, atau perubahan jadwal kloter.</li>
          <li>Memproses refund kalau pesanan dibatalkan.</li>
          <li>Membatasi spam checkout dan percobaan Cek Pesanan yang berlebihan.</li>
        </ul>
        <p>
          Dasarnya adalah persetujuanmu saat checkout, dan keperluan untuk menjalankan pesanan yang kamu buat. Data
          pribadimu tidak dikirim ke layanan kecerdasan buatan (AI).
        </p>
      </BagianDokumen>

      <BagianDokumen id="akses" judul="Siapa yang bisa melihat">
        <div className="border-line overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Siapa yang bisa melihat tiap jenis data</caption>
            <thead className="bg-surface-muted text-content">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Data</th>
                <th scope="col" className="px-4 py-3 font-semibold">Bisa dilihat</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              <tr>
                <th scope="row" className="text-content px-4 py-3 font-medium">Nama pemesan dan penerima</th>
                <td className="px-4 py-3">Admin produksi di desa (untuk label kemasan) dan admin pengantaran di Cikarang</td>
              </tr>
              <tr>
                <th scope="row" className="text-content px-4 py-3 font-medium">Nomor WhatsApp</th>
                <td className="px-4 py-3">Admin produksi (untuk refund) dan admin pengantaran</td>
              </tr>
              <tr>
                <th scope="row" className="text-content px-4 py-3 font-medium">Alamat, patokan, titik lokasi</th>
                <td className="px-4 py-3">Hanya admin pengantaran di Cikarang, dan baru setelah kloternya tiba di Cikarang</td>
              </tr>
              <tr>
                <th scope="row" className="text-content px-4 py-3 font-medium">Status pembayaran</th>
                <td className="px-4 py-3">Admin produksi</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Admin masuk ke aplikasi khusus dengan password dan kode verifikasi dua langkah, dan aplikasinya terkunci
          sidik jari atau PIN. Halaman status pesananmu menampilkan nomor dan alamat secara tersamar, karena link-nya
          bisa saja diteruskan ke orang lain.
        </p>
      </BagianDokumen>

      <BagianDokumen id="pihak-lain" judul="Layanan pihak lain">
        <p>Beberapa bagian situs dijalankan layanan lain. Masing-masing hanya menerima data yang ia perlukan:</p>
        <ul>
          <li>
            <strong>Midtrans</strong> memproses pembayaran. Midtrans hanya menerima nomor pesanan dan total bayar dari
            kami, bukan nama atau nomor HP-mu. Data yang kamu masukkan di halaman pembayaran diatur kebijakan privasi
            Midtrans.
          </li>
          <li>
            <strong>Supabase</strong> menyimpan database pesanan dan foto. Foto bukti antar dan bukti transfer ada di
            penyimpanan tertutup, bukan link publik.
          </li>
          <li><strong>Netlify</strong> menjalankan situs ini.</li>
          <li>
            <strong>Cloudflare Turnstile</strong> memeriksa bahwa checkout dilakukan manusia, bukan program spam.
          </li>
          <li>
            <strong>OpenStreetMap</strong> menyediakan gambar peta di halaman checkout. Saat peta dimuat, browser-mu
            mengambil potongan peta dari server mereka.
          </li>
          <li>
            <strong>WhatsApp</strong> dipakai saat kamu atau admin kami menekan tombol pesan WhatsApp.
          </li>
        </ul>
      </BagianDokumen>

      <BagianDokumen id="masa-simpan" judul="Berapa lama disimpan">
        {k.masaSimpanDataBulan ? (
          <p>
            Nama, nomor, alamat, dan titik lokasi disimpan sampai {k.masaSimpanDataBulan} bulan setelah pesanan selesai
            atau dibatalkan. Setelah itu dianonimkan. Catatan transaksi tanpa identitas tetap disimpan untuk pembukuan.
          </p>
        ) : (
          <>
            <p>
              Setelah masa simpan berakhir, nama, nomor, alamat, dan titik lokasi dianonimkan. Catatan transaksi tanpa
              identitas tetap disimpan untuk pembukuan.
            </p>
            <CatatanPlaceholder judul="masa simpan data belum diputuskan">
              <p>
                Usulan PRD 12 bulan setelah pesanan selesai (Bagian 23 no. 12). Isi KEBIJAKAN.masaSimpanDataBulan di
                src/data/kebijakan.ts, dan jadwalkan proses anonimisasinya sebelum batas itu tercapai.
              </p>
            </CatatanPlaceholder>
          </>
        )}
      </BagianDokumen>

      <BagianDokumen id="hak" judul="Hakmu atas datamu">
        <p>Kamu bisa meminta untuk:</p>
        <ul>
          <li>melihat data pesananmu yang kami simpan;</li>
          <li>memperbaiki data yang salah, misalnya alamat atau nomor;</li>
          <li>menghapus datamu, setelah pesanan dan refund-nya selesai;</li>
          <li>menarik persetujuan. Pesanan yang masih berjalan mungkin perlu dibatalkan, karena tanpa alamat kami tidak bisa mengantar.</li>
        </ul>
        <p>
          Kirim permintaanmu lewat{" "}
          <a href={tautanWhatsApp("Halo Sealauk, saya mau mengajukan permintaan soal data pribadi saya.")} target="_blank" rel="noopener noreferrer" className={tautan}>
            WhatsApp resmi kami
          </a>{" "}
          dari nomor yang dipakai saat memesan, dan sebutkan nomor invoicenya. Permintaan dari nomor lain akan kami
          konfirmasi dulu supaya data tidak jatuh ke orang yang salah.
        </p>
      </BagianDokumen>

      <BagianDokumen id="keamanan" judul="Keamanan dan kebocoran data">
        <p>
          Data pesanan tertutup untuk umum. Dari luar, pesananmu hanya bisa dibuka lewat link bertoken acak milikmu,
          atau lewat Cek Pesanan dengan nomor invoice dan nomor WhatsApp yang cocok. Kunci akses sistem hanya disimpan
          di server, tidak di browser atau aplikasi admin.
        </p>
        <p>
          Kalau terjadi kebocoran data, kami menghentikan kebocorannya, memeriksa data apa yang terdampak, lalu
          memberitahumu secara tertulis paling lambat 3 × 24 jam setelah kebocoran diketahui, sesuai UU PDP.
        </p>
      </BagianDokumen>

      <BagianDokumen id="perubahan" judul="Perubahan kebijakan">
        <p>
          Kalau kebijakan ini berubah, tanggal di bagian atas halaman ikut diperbarui. Perubahan berlaku untuk pesanan
          yang dibuat setelah tanggal itu.
        </p>
      </BagianDokumen>
    </Dokumen>
  );
}
