import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Isian } from "@/components/Isian";
import { BarisInfo, Bagian, Catatan, Kartu, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Pilihan } from "@/components/Pilihan";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { TombolWa } from "@/components/TombolWa";
import { formatBerat, formatNomorWa, formatRupiah, formatWaktuWib } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import type { PesananKloter } from "@/lib/jenis";
import { konfirmasi } from "@/lib/konfirmasi";
import { useKunci } from "@/lib/kunci";
import { ALASAN_BATAL, bacaItem, STATUS_BAYAR, STATUS_PESANAN, teksSatuan } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { jarak, warna } from "@/lib/tema";
import { namaPanggilan, pesanKloterBerangkat } from "@/lib/wa";
import { segarkanWeb } from "@/lib/web";

// Status yang masih bisa dibatalkan admin produksi (fungsi order_cancel).
const BISA_DIBATALKAN = ["processing_vacuum", "shipped_to_cikarang", "arrived_in_cikarang", "delivery_failed"];

const ALASAN = [
  { kode: "production_failed", teks: "Gagal produksi" },
  { kode: "damaged_in_transit", teks: "Rusak di perjalanan" },
  { kode: "admin", teks: "Alasan lain" },
] as const;
type KodeAlasan = (typeof ALASAN)[number]["kode"];

async function ambil(kloterId: string, pesananId: string) {
  const [pesanan, daftar] = await Promise.all([
    supabase.rpc("admin_pesanan_kloter", { p_batch_id: kloterId }),
    supabase.rpc("admin_daftar_kloter"),
  ]);
  return {
    p: wajib(pesanan).find((x) => x.id === pesananId) ?? null,
    tanggalAntar: wajib(daftar).find((k) => k.id === kloterId)?.delivery_date ?? null,
  };
}

export default function DetailPesanan() {
  const { id, pesanan } = useLocalSearchParams<{ id: string; pesanan: string }>();
  const { keadaan, ulangi, muatDiam } = useMuat(() => ambil(id, pesanan));

  return (
    <Layar>
      <Stack.Screen options={{ title: keadaan.status === "siap" && keadaan.data.p ? keadaan.data.p.invoice_number : "Pesanan" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {({ p, tanggalAntar }) =>
          !p ? (
            <Kosong judul="Pesanan tidak ditemukan" />
          ) : (
            <>
              <Rincian p={p} />
              {p.order_status === "shipped_to_cikarang" && tanggalAntar && (
                <TombolWa
                  label="Kabari sudah berangkat"
                  nomor={p.nomor_wa}
                  teks={pesanKloterBerangkat({ nama: namaPanggilan(p.nama_pemesan), invoice: p.invoice_number, token: p.status_token, tanggalAntar })}
                />
              )}
              {p.payment_status === "refund_pending" && (
                <Catatan nada="kuning">Pesanan ini menunggu refund. Proses dari menu Refund.</Catatan>
              )}
              {BISA_DIBATALKAN.includes(p.order_status) && <Batalkan p={p} setelah={muatDiam} />}
            </>
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}

function Rincian({ p }: { p: PesananKloter }) {
  const s = STATUS_PESANAN[p.order_status] ?? { teks: p.order_status, nada: "netral" as const };
  const item = bacaItem(p.item);
  return (
    <>
      <Kartu>
        <Lencana teks={s.teks} nada={s.nada} />
        <BarisInfo label="Pembayaran" nilai={STATUS_BAYAR[p.payment_status] ?? p.payment_status} />
        {p.cancel_reason && <BarisInfo label="Alasan batal" nilai={ALASAN_BATAL[p.cancel_reason] ?? p.cancel_reason} />}
        <BarisInfo label="Dipesan" nilai={formatWaktuWib(p.created_at)} />
      </Kartu>
      <Bagian judul="Untuk label kemasan">
        <Kartu>
          <BarisInfo label="Penerima" nilai={p.nama_penerima} />
          {p.nama_penerima !== p.nama_pemesan && <BarisInfo label="Pemesan" nilai={p.nama_pemesan} />}
          <BarisInfo label="WhatsApp pemesan" nilai={formatNomorWa(p.nomor_wa)} angka />
        </Kartu>
        <Kartu>
          {item.map((i) => (
            <BarisInfo key={i.nama} label={i.nama} nilai={`${i.jumlah} ${teksSatuan(i.satuan)}`} angka />
          ))}
          <View style={styles.garis} />
          <BarisInfo label="Total" nilai={formatRupiah(p.total_amount)} angka />
          <BarisInfo label="Berat kemas" nilai={formatBerat(p.total_weight_gram)} angka />
        </Kartu>
      </Bagian>
    </>
  );
}

function Batalkan({ p, setelah }: { p: PesananKloter; setelah: () => void }) {
  const { verifikasiUlang } = useKunci();
  const [buka, setBuka] = useState(false);
  const [alasan, setAlasan] = useState<KodeAlasan | null>(null);
  const [catatan, setCatatan] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  async function kirim() {
    if (!alasan) {
      setGalat("Pilih alasan pembatalan.");
      return;
    }
    if (alasan === "admin" && catatan.trim().length < 5) {
      setGalat("Tulis alasannya di catatan.");
      return;
    }
    setGalat(null);
    const yakin = await konfirmasi(
      `Batalkan ${p.invoice_number}?`,
      `Pesanan dibatalkan dan ${formatRupiah(p.total_amount)} masuk daftar refund. Langkah ini tidak bisa dibatalkan.`,
      "Batalkan pesanan",
      true,
    );
    if (!yakin || !(await verifikasiUlang("Konfirmasi pembatalan pesanan"))) return;

    setMemproses(true);
    const { error } = await supabase.rpc("order_cancel", {
      p_order_id: p.id,
      p_reason: alasan,
      p_note: catatan.trim() || undefined,
      p_refund: true,
    });
    setMemproses(false);
    if (error) {
      setGalat(pesanGalat(error));
      return;
    }
    await segarkanWeb("kloter");
    setelah();
  }

  if (!buka) return <Tombol label="Batalkan pesanan ini" ragam="hantu" onPress={() => setBuka(true)} />;

  return (
    <Bagian judul="Batalkan pesanan">
      <Teks ragam="lembut">Pembeli mendapat refund penuh. Setelah dibatalkan, hubungi pembeli dari menu Refund.</Teks>
      <Pilihan label="Alasan" opsi={ALASAN} nilai={alasan} ubah={setAlasan} />
      <Isian label="Catatan" nilai={catatan} ubah={setCatatan} multiline placeholder="Mis. vakum bocor saat dikemas" />
      {galat && <Catatan nada="merah">{galat}</Catatan>}
      <Tombol label="Batalkan dan masukkan ke refund" ragam="bahaya" onPress={kirim} memproses={memproses} />
      <Tombol label="Tidak jadi" ragam="hantu" onPress={() => setBuka(false)} />
    </Bagian>
  );
}

const styles = StyleSheet.create({
  garis: { height: 1, backgroundColor: warna.garis, marginVertical: jarak.xs },
});
