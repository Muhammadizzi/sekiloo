import type { Metadata } from "next";
import { BagianDokumen, Dokumen } from "@/components/dokumen/Dokumen";
import { CatatanPlaceholder } from "@/components/produk/CatatanPlaceholder";
import { NOMOR_WHATSAPP } from "@/data/kontak";
import { KEBIJAKAN } from "@/data/kebijakan";
import { formatNomorTampil } from "@/lib/format";

export const metadata: Metadata = {
  title: "Syarat Pemesanan",
  description: "Aturan pre-order per kloter Sealauk: pembayaran, kloter batal, pengantaran, gagal antar, perubahan jadwal, dan refund.",
};

const ISI = [
  { id: "cara-kerja", judul: "Cara kerja PO per kloter" },
  { id: "pesanan", judul: "Membuat pesanan" },
  { id: "pembayaran", judul: "Pembayaran" },
  { id: "kloter-batal", judul: "Kloter batal" },
  { id: "pembatalan", judul: "Pembatalan pesanan" },
  { id: "jadwal", judul: "Perubahan jadwal" },
  { id: "pengantaran", judul: "Pengantaran" },
  { id: "gagal-antar", judul: "Gagal antar" },
  { id: "refund", judul: "Refund" },
  { id: "kontak", judul: "Kontak resmi" },
];

export default function HalamanSyarat() {
  const k = KEBIJAKAN;
  const nomor = formatNomorTampil(NOMOR_WHATSAPP);

  return (
    <Dokumen
      judul="Syarat Pemesanan"
      ringkasan={
        <p>
          Aturan ini berlaku untuk setiap pesanan di Sealauk. Dengan mencentang persetujuan di checkout, kamu
          menyetujuinya.
        </p>
      }
      diperbarui={k.diperbarui}
      isi={ISI}
    >
      <BagianDokumen id="cara-kerja" judul="Cara kerja PO per kloter">
        <ul>
          <li>
            Sealauk menjual ikan asap dengan sistem pre-order (PO). Pesanan dikumpulkan per kloter, dan setiap kloter
            punya jam tutup PO dan tanggal antar.
          </li>
          <li>Ikan baru diasap dan dikemas vakum setelah PO ditutup, sebanyak pesanan yang sudah dibayar.</li>
          <li>
            Setiap kloter punya kapasitas berat, mengikuti muatan cool box. Kalau kapasitasnya habis, pemesanan untuk
            kloter itu ditutup lebih awal.
          </li>
          <li>Kami hanya mengantar ke alamat di kecamatan Cikarang yang tercantum di daftar ongkir.</li>
        </ul>
      </BagianDokumen>

      <BagianDokumen id="pesanan" judul="Membuat pesanan">
        <ul>
          <li>Checkout ditutup 15 menit sebelum jam tutup PO.</li>
          <li>
            Harga per satuan sudah termasuk kemasan vakum. Ongkir flat sesuai kecamatan tujuan. Total yang berlaku
            adalah total yang dihitung sistem saat pesanan dibuat.
          </li>
          <li>
            Setiap pesanan maksimal 10 unit per produk, dan beratnya dibatasi sesuai ketentuan kloter, supaya satu
            pesanan tidak menghabiskan kapasitas kloter.
          </li>
          <li>Satu nomor WhatsApp paling banyak punya 2 pesanan yang belum dibayar dalam waktu bersamaan.</li>
          <li>
            Periksa alamat, patokan, dan titik lokasi di peta sebelum membayar. Pengantaran memakai titik lokasi itu,
            dan alamat tidak bisa diubah setelah pesanan dibuat. Kalau ada patokan yang terlewat, kabari kami lewat
            WhatsApp.
          </li>
        </ul>
      </BagianDokumen>

      <BagianDokumen id="pembayaran" judul="Pembayaran">
        <ul>
          <li>Pembayaran penuh di muka lewat QRIS di halaman pembayaran Midtrans. Tidak ada DP atau bayar di tempat.</li>
          <li>
            Pesanan harus dibayar dalam 15 menit setelah dibuat, atau sebelum jam tutup PO kalau itu lebih dulu.
            Selama menunggu pembayaran, tempatmu di kloter disimpan.
          </li>
          <li>Kalau batas bayar lewat, pesanan batal sendiri dan tempatnya dilepas untuk pembeli lain.</li>
          <li>Pembayaran yang masuk setelah pesanan batal dikembalikan penuh lewat refund.</li>
          <li>Status pembayaran yang berlaku adalah yang tercatat di sistem kami dari Midtrans, bukan tangkapan layar.</li>
        </ul>
      </BagianDokumen>

      <BagianDokumen id="kloter-batal" judul="Kloter batal">
        <ul>
          <li>
            Setiap kloter punya syarat minimum: total berat dan jumlah pesanan yang sudah dibayar. Kalau sampai PO
            ditutup salah satunya belum terpenuhi, kloter dibatalkan.
          </li>
          <li>Kloter juga bisa kami batalkan sebelum berangkat, misalnya kalau bahan baku tidak tersedia.</li>
          <li>Kalau kloter batal, semua pesanan yang sudah dibayar mendapat refund penuh, termasuk ongkir.</li>
        </ul>
      </BagianDokumen>

      <BagianDokumen id="pembatalan" judul="Pembatalan pesanan">
        <ul>
          <li>Pesanan yang sudah dibayar tidak bisa dibatalkan pembeli, karena ikan diasap khusus untuk pesanan itu.</li>
          <li>
            Kami membatalkan pesanan dan memberi refund penuh kalau ikan gagal diproduksi, atau kalau barang rusak atau
            hilang dalam perjalanan ke Cikarang.
          </li>
        </ul>
      </BagianDokumen>

      <BagianDokumen id="jadwal" judul="Perubahan jadwal">
        <ul>
          <li>
            Jam tutup PO atau tanggal antar bisa berubah, misalnya karena cuaca atau bahan baku. Kalau kloternya sudah
            berisi pesanan yang dibayar, kami mengabari setiap pembeli lewat WhatsApp beserta alasannya.
          </li>
          {k.refundSaatJadwalBerubah === true && (
            <li>
              Kalau kamu tidak bisa menerima di tanggal yang baru, kabari kami lewat WhatsApp sebelum kloter berangkat
              untuk meminta refund penuh.
            </li>
          )}
          {k.refundSaatJadwalBerubah === false && (
            <li>Perubahan jadwal tidak membuat pesanan bisa dibatalkan. Pesanan tetap diantar di tanggal yang baru.</li>
          )}
        </ul>
        {k.refundSaatJadwalBerubah === null && (
          <CatatanPlaceholder judul="kebijakan refund saat jadwal berubah belum diputuskan">
            <p>
              Boleh refund atas permintaan pembeli kalau tanggal antar berubah? (PRD Bagian 23 no. 10). Isi
              KEBIJAKAN.refundSaatJadwalBerubah di src/data/kebijakan.ts.
            </p>
          </CatatanPlaceholder>
        )}
      </BagianDokumen>

      <BagianDokumen id="pengantaran" judul="Pengantaran">
        <ul>
          <li>Pesanan diantar pada tanggal antar kloter, ke titik lokasi yang kamu pasang saat checkout.</li>
          <li>Di hari antar, admin kami mengabari lewat WhatsApp sebelum berangkat, beserta perkiraan jamnya.</li>
          <li>
            Pastikan ada yang menerima dan nomor WhatsApp-mu bisa dihubungi. Begitu diterima, segera simpan di freezer
            atau kulkas.
          </li>
          <li>Admin bisa memotret barang saat diserahkan sebagai bukti antar.</li>
        </ul>
      </BagianDokumen>

      <BagianDokumen id="gagal-antar" judul="Gagal antar">
        <ul>
          <li>
            Pengantaran dicatat gagal kalau penerima tidak di tempat, tidak bisa dihubungi, alamatnya tidak ditemukan,
            atau pesanan ditolak. Ikannya kami simpan lagi di freezer.
          </li>
          <li>Admin menghubungimu untuk mengatur antar ulang. Antar ulang hanya satu kali.</li>
          {k.refundGagalAntarKarenaPembeli === true && (
            <li>Kalau pengantaran kedua juga gagal, pesanan dibatalkan dan pembayaranmu dikembalikan penuh.</li>
          )}
          {k.refundGagalAntarKarenaPembeli === false && (
            <li>
              Kalau pengantaran kedua juga gagal karena penerima tidak di tempat, tidak bisa dihubungi, alamatnya
              salah, atau menolak, pesanan dibatalkan tanpa refund, karena ikannya sudah diproduksi dan dibawa untukmu.
            </li>
          )}
        </ul>
        {k.refundGagalAntarKarenaPembeli === null && (
          <CatatanPlaceholder judul="kebijakan gagal antar belum diputuskan">
            <p>
              Pesanan yang dua kali gagal diantar karena pembeli: di-refund atau tidak? (PRD Bagian 23 no. 9). Isi
              KEBIJAKAN.refundGagalAntarKarenaPembeli di src/data/kebijakan.ts. Aturan ini wajib tertulis sebelum
              pembeli membayar.
            </p>
          </CatatanPlaceholder>
        )}
      </BagianDokumen>

      <BagianDokumen id="refund" judul="Refund">
        <ul>
          <li>Refund selalu sebesar total yang kamu bayar, termasuk ongkir.</li>
          <li>
            Refund dimulai oleh admin kami, lewat WhatsApp ke nomor yang tercatat di pesananmu. Admin akan menanyakan
            nomor rekening atau e-wallet tujuan. Permintaan refund dari nomor lain tidak kami layani.
          </li>
          <li>Admin Sealauk tidak pernah meminta kode OTP, PIN, password, atau biaya apa pun untuk refund.</li>
          {k.lamaRefund && <li>Refund kami transfer paling lambat {k.lamaRefund} setelah kamu mengirim rekening tujuan.</li>}
          <li>Setelah ditransfer, status pesananmu berubah menjadi sudah direfund.</li>
        </ul>
        {!k.lamaRefund && (
          <CatatanPlaceholder judul="target lama refund belum diputuskan">
            <p>
              Berapa lama refund ditransfer setelah pembeli mengirim rekening, mis. 3 hari kerja (PRD Bagian 23 no. 11).
              Isi KEBIJAKAN.lamaRefund di src/data/kebijakan.ts.
            </p>
          </CatatanPlaceholder>
        )}
      </BagianDokumen>

      <BagianDokumen id="kontak" judul="Kontak resmi">
        <p>
          Nomor WhatsApp resmi Sealauk hanya <strong className="tabular">{nomor}</strong>. Pesan yang mengaku dari
          Sealauk lewat nomor lain bukan dari kami.
        </p>
      </BagianDokumen>
    </Dokumen>
  );
}
