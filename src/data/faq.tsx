import Link from "next/link";
import type { Tanya } from "@/components/faq/DaftarTanya";
import { KEBIJAKAN } from "@/data/kebijakan";
import { SERTIFIKAT_HALAL, URL_CEK_HALAL } from "@/data/halal";

const tautan = "text-gold-700 font-semibold underline underline-offset-4";

/**
 * Pertanyaan yang benar-benar muncul dari model PO per kloter: kenapa harus menunggu, kapan diantar,
 * apa yang terjadi kalau kloter batal atau pembeli tidak di rumah. Jawaban hanya memakai aturan yang
 * sudah diputuskan (PRD Bagian 22) dan yang dijalankan sistem.
 */
export function daftarTanyaJawab(): Tanya[] {
  const daftar: Tanya[] = [
    {
      tanya: "Kenapa harus pesan dulu, tidak bisa langsung beli?",
      jawab: (
        <p>
          Kami tidak menyimpan stok. Ikan baru diasap setelah PO ditutup, sebanyak pesanan yang sudah dibayar, lalu
          langsung dikemas vakum dan dibawa ke Cikarang. Jadi ikan yang sampai ke rumahmu tidak menunggu lama di rak.
        </p>
      ),
    },
    {
      tanya: "Kapan pesananku diantar?",
      jawab: (
        <p>
          Pada tanggal antar kloter, yang tertulis di kartu kloter saat memesan dan di halaman status pesananmu. Di hari
          itu admin kami di Cikarang mengabari lewat WhatsApp sebelum berangkat, beserta perkiraan jamnya.
        </p>
      ),
    },
    {
      tanya: "Bisa diantar ke luar Cikarang?",
      jawab: (
        <p>
          Belum. Saat ini kami hanya mengantar ke alamat di kecamatan yang ada di daftar ongkir, karena ikan harus
          sampai dalam keadaan dingin.
        </p>
      ),
    },
    {
      tanya: "Bagaimana cara membayar?",
      jawab: (
        <p>
          Lewat QRIS di halaman pembayaran Midtrans. QRIS bisa dibayar dari hampir semua e-wallet dan aplikasi
          m-banking. Selesaikan dalam 15 menit setelah pesanan dibuat. Lewat dari itu, pesanan batal sendiri dan
          tempatmu di kloter dilepas.
        </p>
      ),
    },
    {
      tanya: "Sudah bayar, tapi status pesanan belum berubah?",
      jawab: (
        <p>
          Biasanya status berubah sendiri dalam beberapa detik. Buka lagi link pesananmu, atau cari lewat{" "}
          <Link href="/cek-pesanan" className={tautan}>
            Cek Pesanan
          </Link>{" "}
          dengan nomor invoice dan nomor WhatsApp. Kalau dalam beberapa menit masih belum berubah, hubungi kami lewat
          WhatsApp dan sebutkan nomor invoicenya.
        </p>
      ),
    },
    {
      tanya: "Link pesananku hilang.",
      jawab: (
        <p>
          Buka{" "}
          <Link href="/cek-pesanan" className={tautan}>
            Cek Pesanan
          </Link>
          , lalu masukkan nomor invoice dan nomor WhatsApp yang dipakai saat memesan.
        </p>
      ),
    },
    {
      tanya: "Bagaimana kalau kloternya batal?",
      jawab: (
        <p>
          Kloter batal kalau sampai PO ditutup jumlah pesanan belum memenuhi minimum, atau kalau kami terpaksa
          membatalkannya. Pembayaranmu dikembalikan penuh, termasuk ongkir. Admin kami menghubungi nomor WhatsApp di
          pesananmu untuk menanyakan rekening atau e-wallet tujuan.
        </p>
      ),
    },
    {
      tanya: "Bagaimana kalau aku tidak di rumah saat diantar?",
      jawab: (
        <p>
          Kalau pengantaran gagal, ikannya kami simpan lagi di freezer dan admin menghubungimu untuk mengatur antar
          ulang. Antar ulang hanya satu kali. Kalau pengantaran kedua juga gagal, pesanan dibatalkan sesuai{" "}
          <Link href="/syarat#gagal-antar" className={tautan}>
            Syarat Pemesanan
          </Link>
          .
        </p>
      ),
    },
    {
      tanya: "Bisa membatalkan pesanan yang sudah dibayar?",
      jawab: (
        <p>
          Tidak, karena ikan diasap khusus untuk pesanan yang sudah dibayar.
          {KEBIJAKAN.refundSaatJadwalBerubah && " Pengecualiannya kalau jadwal kloter berubah dan kamu tidak bisa menerima di tanggal yang baru."}{" "}
          Selengkapnya di{" "}
          <Link href="/syarat#pembatalan" className={tautan}>
            Syarat Pemesanan
          </Link>
          .
        </p>
      ),
    },
    {
      tanya: "Bagaimana menyimpan ikan asap setelah diterima?",
      jawab: (
        <p>
          Langsung masukkan ke freezer atau kulkas begitu diterima. Suhu dan lama simpannya ada di halaman{" "}
          <Link href="/halal#penyimpanan" className={tautan}>
            Halal & Keamanan Pangan
          </Link>
          .
        </p>
      ),
    },
    {
      tanya: "Admin Sealauk meminta kode OTP. Benarkah?",
      jawab: (
        <p>
          Bukan dari kami. Admin Sealauk tidak pernah meminta kode OTP, PIN, password, atau biaya apa pun, termasuk
          untuk refund. Refund juga hanya dibahas lewat nomor WhatsApp yang tercatat di pesananmu.
        </p>
      ),
    },
  ];

  if (SERTIFIKAT_HALAL) {
    daftar.splice(3, 0, {
      tanya: "Apakah produknya halal?",
      jawab: (
        <p>
          Ya. Sertifikat halal kami bernomor <span className="tabular font-semibold">{SERTIFIKAT_HALAL.nomor}</span>{" "}
          dari {SERTIFIKAT_HALAL.lembaga}. Kamu bisa mengecek keasliannya di{" "}
          <a href={URL_CEK_HALAL} target="_blank" rel="noopener noreferrer" className={tautan}>
            situs BPJPH
          </a>{" "}
          dengan memasukkan nomor itu.
        </p>
      ),
    });
  }

  return daftar;
}
