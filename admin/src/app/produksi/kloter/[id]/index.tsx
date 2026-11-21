import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BarKapasitas, LencanaKloter } from "@/components/KartuKloter";
import { BarisInfo, Bagian, Catatan, Kartu, KartuTekan, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { TombolWa } from "@/components/TombolWa";
import { formatBerat, formatRupiah, formatTanggalKalender, formatWaktuWib } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import { ikutKloter, type KloterAdmin, type PesananKloter } from "@/lib/jenis";
import { beriTahu, konfirmasi } from "@/lib/konfirmasi";
import { ALASAN_BATAL, bacaItem, ringkasItem, STATUS_PESANAN, teksSatuan } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { jarak, warna } from "@/lib/tema";
import { namaPanggilan, pesanKloterBerangkat } from "@/lib/wa";
import { segarkanWeb } from "@/lib/web";

async function ambil(id: string) {
  const [daftar, rekap, pesanan] = await Promise.all([
    supabase.rpc("admin_daftar_kloter"),
    supabase.rpc("admin_rekap_produksi", { p_batch_id: id }),
    supabase.rpc("admin_pesanan_kloter", { p_batch_id: id }),
  ]);
  return {
    kloter: wajib(daftar).find((k) => k.id === id) ?? null,
    rekap: wajib(rekap),
    pesanan: wajib(pesanan),
  };
}

export default function DetailKloter() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { keadaan, menyegarkan, segarkan, ulangi, muatDiam } = useMuat(() => ambil(id));

  return (
    <Layar segarkan={segarkan} menyegarkan={menyegarkan}>
      <Stack.Screen options={{ title: keadaan.status === "siap" && keadaan.data.kloter ? keadaan.data.kloter.name : "Kloter" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {({ kloter, rekap, pesanan }) =>
          !kloter ? (
            <Kosong judul="Kloter tidak ditemukan">Kloter ini mungkin sudah dihapus. Kembali ke daftar kloter.</Kosong>
          ) : (
            <>
              <Ringkasan k={kloter} />
              <Aksi k={kloter} setelahAksi={muatDiam} />
              <Bagian judul="Rekap produksi">
                {rekap.length === 0 ? (
                  <Kosong judul="Belum ada pesanan lunas">Rekap muncul setelah ada pesanan yang dibayar.</Kosong>
                ) : (
                  <Kartu>
                    {rekap.map((r) => (
                      <BarisInfo key={r.product_id} label={r.nama} nilai={`${r.jumlah} ${teksSatuan(r.satuan)}, ${formatBerat(r.berat_gram)}`} angka />
                    ))}
                    <View style={styles.garis} />
                    <BarisInfo label="Total berat kemas" nilai={formatBerat(rekap.reduce((n, r) => n + r.berat_gram, 0))} angka />
                  </Kartu>
                )}
              </Bagian>
              <DaftarPesanan k={kloter} pesanan={pesanan} />
            </>
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}

function Ringkasan({ k }: { k: KloterAdmin }) {
  const minimumTerpenuhi = k.lunas_berat_gram >= k.min_weight_gram && k.lunas_jumlah >= k.min_orders;
  return (
    <Kartu>
      <LencanaKloter status={k.status} />
      <BarisInfo label="Tutup PO" nilai={formatWaktuWib(k.close_order_at)} />
      <BarisInfo label="Diantar" nilai={formatTanggalKalender(k.delivery_date)} />
      <BarisInfo label="Pesanan lunas" nilai={`${k.lunas_jumlah} pesanan, ${formatBerat(k.lunas_berat_gram)}`} angka />
      {k.status === "open" && (
        <>
          <BarisInfo label="Menunggu bayar" nilai={String(k.menunggu_bayar)} angka />
          <BarisInfo label="Minimum jalan" nilai={`${formatBerat(k.min_weight_gram)} dan ${k.min_orders} pesanan`} angka />
          <Teks ragam="kecil" tebal>
            {minimumTerpenuhi ? "Minimum sudah terpenuhi." : "Minimum belum terpenuhi. Kalau sampai PO tutup tetap begini, kloter batal otomatis."}
          </Teks>
          <BarKapasitas terpakai={k.used_gram} kapasitas={k.capacity_gram} />
        </>
      )}
      {k.status === "cancelled" && k.cancel_reason && <BarisInfo label="Alasan batal" nilai={k.cancel_reason} />}
    </Kartu>
  );
}

function Aksi({ k, setelahAksi }: { k: KloterAdmin; setelahAksi: () => void }) {
  const [memproses, setMemproses] = useState(false);
  const bisaUbah = ["open", "closed", "in_transit"].includes(k.status);
  const bisaBatal = k.status === "open" || k.status === "closed";

  async function berangkatkan() {
    const yakin = await konfirmasi(
      "Berangkatkan kloter?",
      `${k.lunas_jumlah} pesanan lunas akan berstatus dalam perjalanan ke Cikarang. Langkah ini tidak bisa dibatalkan.`,
      "Berangkatkan",
    );
    if (!yakin) return;
    setMemproses(true);
    const { data, error } = await supabase.rpc("batch_depart", { p_batch_id: k.id });
    setMemproses(false);
    if (error) {
      beriTahu("Belum bisa berangkat", pesanGalat(error));
      return;
    }
    await segarkanWeb("kloter");
    beriTahu("Kloter berangkat", `${data} pesanan sekarang dalam perjalanan. Kabari pembeli lewat tombol WhatsApp di daftar pesanan.`);
    setelahAksi();
  }

  if (!bisaUbah && !bisaBatal) {
    return k.status === "in_transit" ? null : (
      <Catatan nada="netral">
        {k.status === "arrived_in_cikarang"
          ? "Kloter sudah tiba di Cikarang. Pengantaran diurus admin Cikarang."
          : k.status === "completed"
            ? "Semua pesanan di kloter ini sudah selesai."
            : "Kloter ini batal. Pesanan lunas ada di menu Refund."}
      </Catatan>
    );
  }

  return (
    <View style={styles.aksi}>
      {k.status === "closed" && <Tombol label="Berangkatkan kloter" onPress={berangkatkan} memproses={memproses} />}
      {k.status === "in_transit" && <Catatan nada="biru">Kloter dalam perjalanan. Admin Cikarang akan menandainya tiba.</Catatan>}
      {bisaUbah && (
        <Tombol
          label={k.status === "open" ? "Ubah kloter" : "Ubah nama atau tanggal antar"}
          ragam="garis"
          onPress={() => router.push({ pathname: "/produksi/kloter/[id]/ubah", params: { id: k.id } })}
        />
      )}
      {bisaBatal && (
        <Tombol label="Batalkan kloter" ragam="hantu" onPress={() => router.push({ pathname: "/produksi/kloter/[id]/batal", params: { id: k.id } })} />
      )}
    </View>
  );
}

function DaftarPesanan({ k, pesanan }: { k: KloterAdmin; pesanan: PesananKloter[] }) {
  const [tampilLain, setTampilLain] = useState(false);
  const lunas = pesanan.filter(ikutKloter);
  const lain = pesanan.filter((p) => !ikutKloter(p));

  const buka = (p: PesananKloter) =>
    router.push({ pathname: "/produksi/kloter/[id]/pesanan/[pesanan]", params: { id: k.id, pesanan: p.id } });

  return (
    <>
      <Bagian judul={`Pesanan lunas (${lunas.length})`}>
        <Teks ragam="redup">Nama penerima dan isi pesanan untuk label kemasan. Alamat tidak ditampilkan di sini.</Teks>
        {lunas.length === 0 ? (
          <Kosong judul="Belum ada pesanan lunas" />
        ) : (
          lunas.map((p) => (
            <View key={p.id} style={styles.pesanan}>
              <KartuPesanan p={p} onPress={() => buka(p)} />
              {k.status === "in_transit" && p.order_status === "shipped_to_cikarang" && (
                <TombolWa
                  label="Kabari sudah berangkat"
                  nomor={p.nomor_wa}
                  teks={pesanKloterBerangkat({ nama: namaPanggilan(p.nama_pemesan), invoice: p.invoice_number, token: p.status_token, tanggalAntar: k.delivery_date })}
                />
              )}
            </View>
          ))
        )}
      </Bagian>
      {lain.length > 0 && (
        <Bagian judul={`Belum bayar dan batal (${lain.length})`}>
          {tampilLain ? (
            lain.map((p) => <KartuPesanan key={p.id} p={p} onPress={() => buka(p)} />)
          ) : (
            <Tombol label="Tampilkan" ragam="garis" onPress={() => setTampilLain(true)} />
          )}
        </Bagian>
      )}
    </>
  );
}

function KartuPesanan({ p, onPress }: { p: PesananKloter; onPress: () => void }) {
  const s = STATUS_PESANAN[p.order_status] ?? { teks: p.order_status, nada: "netral" as const };
  return (
    <KartuTekan onPress={onPress} label={`Pesanan ${p.invoice_number} untuk ${p.nama_penerima}`}>
      <View style={styles.atas}>
        <Teks tebal angka style={styles.isiAtas}>
          {p.invoice_number}
        </Teks>
        <Lencana teks={s.teks} nada={s.nada} />
      </View>
      <Teks ragam="subjudul">{p.nama_penerima}</Teks>
      <Teks ragam="lembut">{ringkasItem(bacaItem(p.item))}</Teks>
      <Teks ragam="redup" angka>
        {formatRupiah(p.total_amount)}, {formatBerat(p.total_weight_gram)}
        {p.cancel_reason ? `. ${ALASAN_BATAL[p.cancel_reason] ?? p.cancel_reason}` : ""}
      </Teks>
    </KartuTekan>
  );
}

const styles = StyleSheet.create({
  aksi: { gap: jarak.s },
  garis: { height: 1, backgroundColor: warna.garis, marginVertical: jarak.xs },
  pesanan: { gap: jarak.s },
  atas: { flexDirection: "row", alignItems: "center", gap: jarak.s },
  isiAtas: { flex: 1 },
});
