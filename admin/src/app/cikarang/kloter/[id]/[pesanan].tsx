import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { AksiFoto } from "@/components/AksiFoto";
import { Isian } from "@/components/Isian";
import { BarisInfo, Bagian, Catatan, Kartu, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Pilihan } from "@/components/Pilihan";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { TombolWa } from "@/components/TombolWa";
import { jalurFoto, unggahFoto, type FotoSiap } from "@/lib/foto";
import { formatNomorWa } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import type { PesananAntar } from "@/lib/jenis";
import { beriTahu, konfirmasi } from "@/lib/konfirmasi";
import { useKunci } from "@/lib/kunci";
import { ALASAN_GAGAL_ANTAR, bacaItem, STATUS_PESANAN, teksSatuan } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { usePerkiraanJam } from "@/lib/perkiraan";
import { supabase } from "@/lib/supabase";
import { jarak } from "@/lib/tema";
import { namaPanggilan, pesanDiantarHariIni, pesanGagalAntar } from "@/lib/wa";
import { segarkanWeb } from "@/lib/web";

type AlasanGagal = (typeof ALASAN_GAGAL_ANTAR)[number]["kode"];

export default function PesananAntarDetail() {
  const { id, pesanan } = useLocalSearchParams<{ id: string; pesanan: string }>();
  const { keadaan, ulangi, muatDiam } = useMuat(
    async () => wajib(await supabase.rpc("admin_daftar_antar", { p_batch_id: id })).find((p) => p.id === pesanan) ?? null,
  );
  const jam = usePerkiraanJam(id);

  return (
    <Layar>
      <Stack.Screen options={{ title: keadaan.status === "siap" && keadaan.data ? keadaan.data.invoice_number : "Pesanan" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(p) =>
          !p ? (
            <Kosong judul="Pesanan tidak ada di daftar antar">Pesanan ini mungkin sudah dibatalkan.</Kosong>
          ) : (
            <>
              <Penerima p={p} />
              <Aksi p={p} jam={jam} setelah={muatDiam} />
            </>
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}

function Penerima({ p }: { p: PesananAntar }) {
  const s = STATUS_PESANAN[p.order_status] ?? { teks: p.order_status, nada: "netral" as const };
  // Link peta dibuat dari koordinat yang tersimpan, bukan dari teks yang diketik pembeli (PRD 7.3).
  const peta = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;

  return (
    <>
      <Kartu>
        <Lencana teks={s.teks} nada={s.nada} />
        <Teks ragam="subjudul">{p.nama_penerima}</Teks>
        <Teks angka>{formatNomorWa(p.nomor_wa)}</Teks>
        <Teks ragam="lembut">{p.alamat}</Teks>
        {p.patokan && <Teks ragam="lembut">Patokan: {p.patokan}</Teks>}
        <BarisInfo label="Kecamatan" nilai={p.kecamatan} />
        {p.delivery_attempts > 0 && <BarisInfo label="Percobaan antar" nilai={`${p.delivery_attempts} kali`} angka />}
      </Kartu>
      <View style={styles.dua}>
        <View style={styles.separuh}>
          <Tombol label="Buka di peta" ragam="gelap" onPress={() => Linking.openURL(peta)} />
        </View>
        <View style={styles.separuh}>
          <Tombol label="Telepon" ragam="garis" onPress={() => Linking.openURL(`tel:+${p.nomor_wa}`)} />
        </View>
      </View>
      <Bagian judul="Isi pesanan">
        <Kartu>
          {bacaItem(p.item).map((i) => (
            <BarisInfo key={i.nama} label={i.nama} nilai={`${i.jumlah} ${teksSatuan(i.satuan)}`} angka />
          ))}
        </Kartu>
      </Bagian>
    </>
  );
}

function Aksi({ p, jam, setelah }: { p: PesananAntar; jam: string; setelah: () => void }) {
  const { verifikasiUlang } = useKunci();
  const [memproses, setMemproses] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [foto, setFoto] = useState<FotoSiap | null>(null);
  const [gagalDibuka, setGagalDibuka] = useState(false);
  const [alasanGagal, setAlasanGagal] = useState<AlasanGagal | null>(null);
  const [refund, setRefund] = useState<"ya" | "tidak" | null>(null);
  const [catatan, setCatatan] = useState("");
  const nama = namaPanggilan(p.nama_penerima);

  async function jalankan(kode: string, kerja: () => Promise<void>): Promise<boolean> {
    setGalat(null);
    setMemproses(kode);
    try {
      await kerja();
      await segarkanWeb("kloter");
      // Isian dikosongkan supaya alasan atau pilihan dari aksi sebelumnya tidak ikut terkirim di aksi berikutnya.
      setGagalDibuka(false);
      setFoto(null);
      setAlasanGagal(null);
      setRefund(null);
      setCatatan("");
      setelah();
      return true;
    } catch (e) {
      setGalat(pesanGalat(e));
      return false;
    } finally {
      setMemproses(null);
    }
  }

  const mulai = () =>
    jalankan("mulai", async () => {
      const { error } = await supabase.rpc("order_start_delivery", { p_order_id: p.id });
      if (error) throw error;
    });

  const selesai = async () => {
    if (!(await konfirmasi("Pesanan sudah diterima?", `Tandai ${p.invoice_number} diterima ${p.nama_penerima}.`, "Sudah diterima"))) return;
    await jalankan("selesai", async () => {
      let jalur: string | undefined;
      if (foto) {
        jalur = jalurFoto(p.id);
        await unggahFoto("delivery-proofs", jalur, foto);
      }
      const { error } = await supabase.rpc("order_complete", { p_order_id: p.id, p_proof_path: jalur });
      if (error) throw error;
    });
  };

  const gagal = async () => {
    if (!alasanGagal) {
      setGalat("Pilih alasan gagal antar.");
      return;
    }
    const berhasil = await jalankan("gagal", async () => {
      const { error } = await supabase.rpc("order_delivery_failed", { p_order_id: p.id, p_reason: alasanGagal });
      if (error) throw error;
    });
    if (berhasil) beriTahu("Tercatat gagal antar", "Simpan lagi barangnya di freezer, lalu kabari pembeli lewat tombol WhatsApp.");
  };

  const batalkan = async () => {
    if (!refund) {
      setGalat("Pilih dengan atau tanpa refund.");
      return;
    }
    const yakin = await konfirmasi(
      `Batalkan ${p.invoice_number}?`,
      refund === "ya" ? "Pesanan dibatalkan dan masuk daftar refund admin produksi." : "Pesanan dibatalkan tanpa refund.",
      "Batalkan pesanan",
      true,
    );
    if (!yakin || !(await verifikasiUlang("Konfirmasi pembatalan pesanan"))) return;
    await jalankan("batal", async () => {
      const { error } = await supabase.rpc("order_cancel", {
        p_order_id: p.id,
        p_reason: "delivery_failed",
        p_note: catatan.trim() || undefined,
        p_refund: refund === "ya",
      });
      if (error) throw error;
    });
  };

  return (
    <Bagian judul="Pengantaran">
      {galat && <Catatan nada="merah">{galat}</Catatan>}

      {p.order_status === "arrived_in_cikarang" && (
        <>
          <TombolWa label="Kabari diantar hari ini" nomor={p.nomor_wa} teks={pesanDiantarHariIni({ nama, invoice: p.invoice_number, token: p.status_token, perkiraanJam: jam })} />
          <Tombol label="Mulai antar" onPress={mulai} memproses={memproses === "mulai"} />
        </>
      )}

      {p.order_status === "out_for_delivery" && !gagalDibuka && (
        <>
          <AksiFoto label="Foto bukti antar (boleh dilewati)" foto={foto} ubah={setFoto} keterangan="Foto barang di depan pintu atau saat diserahkan. Jangan memotret wajah penerima." />
          <Tombol label="Sudah diterima" onPress={selesai} memproses={memproses === "selesai"} />
          <Tombol label="Gagal antar" ragam="garis" onPress={() => setGagalDibuka(true)} />
        </>
      )}

      {p.order_status === "out_for_delivery" && gagalDibuka && (
        <>
          <Pilihan label="Kenapa gagal?" opsi={ALASAN_GAGAL_ANTAR} nilai={alasanGagal} ubah={setAlasanGagal} />
          <Tombol label="Catat gagal antar" ragam="bahaya" onPress={gagal} memproses={memproses === "gagal"} />
          <Tombol label="Kembali" ragam="hantu" onPress={() => setGagalDibuka(false)} />
        </>
      )}

      {p.order_status === "delivery_failed" && p.delivery_attempts < 2 && (
        <>
          <Teks ragam="lembut">Pengantaran pertama gagal. Antar ulang boleh satu kali.</Teks>
          <TombolWa label="Atur antar ulang" nomor={p.nomor_wa} teks={pesanGagalAntar({ nama, invoice: p.invoice_number, token: p.status_token, alasan: p.catatan_gagal })} />
          <Tombol label="Antar ulang sekarang" onPress={mulai} memproses={memproses === "mulai"} />
        </>
      )}

      {p.order_status === "delivery_failed" && p.delivery_attempts >= 2 && (
        <>
          <Catatan>Pengantaran kedua juga gagal, jadi pesanan ini perlu dibatalkan. Pilih refund atau tidak sesuai kebijakan gagal antar di Syarat Pemesanan.</Catatan>
          <Pilihan
            label="Refund"
            opsi={[
              { kode: "ya", teks: "Dengan refund" },
              { kode: "tidak", teks: "Tanpa refund" },
            ]}
            nilai={refund}
            ubah={setRefund}
          />
          <Isian label="Catatan" nilai={catatan} ubah={setCatatan} multiline placeholder="Mis. nomor tidak aktif sejak kemarin" />
          <Tombol label="Batalkan pesanan" ragam="bahaya" onPress={batalkan} memproses={memproses === "batal"} />
        </>
      )}

      {p.order_status === "completed" && <Catatan nada="hijau">Pesanan ini sudah diterima.</Catatan>}
      {p.order_status === "shipped_to_cikarang" && <Catatan nada="netral">Pesanan masih dalam perjalanan.</Catatan>}
      {p.order_status === "cancelled" && <Catatan nada="netral">Pesanan ini sudah dibatalkan dan tidak perlu diantar.</Catatan>}
    </Bagian>
  );
}

const styles = StyleSheet.create({
  dua: { flexDirection: "row", gap: jarak.s },
  separuh: { flex: 1 },
});
