/**
 * Keputusan pemilik yang dipakai di Kebijakan Privasi, Syarat Pemesanan, dan FAQ (PRD Bagian 23).
 * Selama `null`, halaman menampilkan catatan untuk pemilik di tempat aturan itu seharusnya ditulis,
 * supaya tidak ada aturan yang dikarang sebelum diputuskan.
 */
export const KEBIJAKAN: {
  /** PRD 23 no. 9: pesanan yang dua kali gagal diantar karena pembeli, di-refund atau tidak. */
  refundGagalAntarKarenaPembeli: boolean | null;
  /** PRD 23 no. 10: boleh refund atas permintaan pembeli kalau jadwal kloter berubah. */
  refundSaatJadwalBerubah: boolean | null;
  /** PRD 23 no. 11: target lama refund, mis. "3 hari kerja". */
  lamaRefund: string | null;
  /** PRD 23 no. 12: berapa bulan data pembeli disimpan setelah pesanan selesai, lalu dianonimkan. */
  masaSimpanDataBulan: number | null;
  /** Pengendali data pribadi menurut UU PDP: nama pemilik usaha atau badan usaha, dan kota. */
  pengelola: { nama: string; kota: string } | null;
  /** Tanggal terakhir isi Kebijakan Privasi dan Syarat Pemesanan diubah. */
  diperbarui: string;
} = {
  refundGagalAntarKarenaPembeli: null,
  refundSaatJadwalBerubah: null,
  lamaRefund: null,
  masaSimpanDataBulan: null,
  pengelola: null,
  diperbarui: "21 November 2026",
};
