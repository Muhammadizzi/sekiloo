import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Isian } from "@/components/Isian";
import { LencanaKloter } from "@/components/KartuKloter";
import { BarisInfo, Bagian, Catatan, Kartu, KartuTekan, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { TombolWa } from "@/components/TombolWa";
import { formatBerat, formatNomorWa, formatTanggalKalender } from "@/lib/format";
import { pesanGalat } from "@/lib/galat";
import type { KloterAdmin, PesananAntar } from "@/lib/jenis";
import { beriTahu, konfirmasi } from "@/lib/konfirmasi";
import { bacaItem, ringkasItem, STATUS_PESANAN } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { aturPerkiraanJam, usePerkiraanJam } from "@/lib/perkiraan";
import { supabase } from "@/lib/supabase";
import { jarak } from "@/lib/tema";
import { namaPanggilan, pesanDiantarHariIni, pesanGagalAntar } from "@/lib/wa";
import { segarkanWeb } from "@/lib/web";

const SUDAH_TIBA = ["arrived_in_cikarang", "completed"];

async function ambil(id: string) {
  const kloter = wajib(await supabase.rpc("admin_daftar_kloter")).find((k) => k.id === id) ?? null;
  // Alamat hanya dibuka database setelah kloter tiba, jadi daftar antar tidak diminta sebelum itu.
  const antar = kloter && SUDAH_TIBA.includes(kloter.status) ? wajib(await supabase.rpc("admin_daftar_antar", { p_batch_id: id })) : [];
  return { kloter, antar };
}

export default function KloterAntar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { keadaan, menyegarkan, segarkan, ulangi, muatDiam } = useMuat(() => ambil(id));

  return (
    <Layar segarkan={segarkan} menyegarkan={menyegarkan}>
      <Stack.Screen options={{ title: keadaan.status === "siap" && keadaan.data.kloter ? keadaan.data.kloter.name : "Kloter" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {({ kloter, antar }) =>
          !kloter ? (
            <Kosong judul="Kloter tidak ditemukan" />
          ) : (
            <>
              <Kartu>
                <LencanaKloter status={kloter.status} />
                <BarisInfo label="Jadwal antar" nilai={formatTanggalKalender(kloter.delivery_date)} />
                <BarisInfo label="Pesanan lunas" nilai={`${kloter.lunas_jumlah} pesanan, ${formatBerat(kloter.lunas_berat_gram)}`} angka />
              </Kartu>
              {kloter.status === "in_transit" && <TandaiTiba k={kloter} setelah={muatDiam} />}
              {SUDAH_TIBA.includes(kloter.status) ? (
                <DaftarAntar k={kloter} antar={antar} />
              ) : (
                kloter.status !== "in_transit" && (
                  <Catatan nada="netral">Daftar antar dan alamat pembeli muncul setelah kloter ini ditandai tiba di Cikarang.</Catatan>
                )
              )}
            </>
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}

function TandaiTiba({ k, setelah }: { k: KloterAdmin; setelah: () => void }) {
  const [memproses, setMemproses] = useState(false);

  async function tandai() {
    const yakin = await konfirmasi(
      "Tandai kloter tiba?",
      "Pastikan semua cool box sudah diterima dan isinya sudah masuk freezer atau kulkas.",
      "Tandai tiba",
    );
    if (!yakin) return;
    setMemproses(true);
    const { data, error } = await supabase.rpc("batch_arrive", { p_batch_id: k.id });
    setMemproses(false);
    if (error) {
      beriTahu("Belum bisa ditandai", pesanGalat(error));
      return;
    }
    await segarkanWeb("kloter");
    beriTahu("Kloter tiba", `${data} pesanan siap diantar. Daftar antar sudah terbuka.`);
    setelah();
  }

  return (
    <View style={styles.aksi}>
      <Teks ragam="lembut">Kloter sedang dalam perjalanan dari desa. Tandai tiba setelah barang masuk pendingin.</Teks>
      <Tombol label="Tandai tiba di Cikarang" onPress={tandai} memproses={memproses} />
    </View>
  );
}

function DaftarAntar({ k, antar }: { k: KloterAdmin; antar: PesananAntar[] }) {
  const jam = usePerkiraanJam(k.id);
  const selesai = antar.filter((p) => p.order_status === "completed").length;

  if (antar.length === 0) return <Kosong judul="Tidak ada pesanan untuk diantar" />;

  // Dikelompokkan per kecamatan, urutannya sudah diatur database mengikuti urutan wilayah.
  const kelompok = new Map<string, PesananAntar[]>();
  for (const p of antar) kelompok.set(p.kecamatan, [...(kelompok.get(p.kecamatan) ?? []), p]);

  return (
    <>
      <Kartu>
        <Teks tebal angka>
          {selesai} dari {antar.length} pesanan sudah diterima
        </Teks>
        <Isian
          label="Perkiraan jam antar"
          nilai={jam}
          ubah={(t) => aturPerkiraanJam(k.id, t)}
          placeholder="13.00 sampai 15.00"
          petunjuk="Ikut tertulis di pesan WhatsApp diantar hari ini."
        />
      </Kartu>
      {[...kelompok.entries()].map(([kecamatan, daftar]) => (
        <Bagian key={kecamatan} judul={`${kecamatan} (${daftar.length})`}>
          {daftar.map((p) => (
            <KartuAntar key={p.id} kloterId={k.id} p={p} jam={jam} />
          ))}
        </Bagian>
      ))}
    </>
  );
}

function KartuAntar({ kloterId, p, jam }: { kloterId: string; p: PesananAntar; jam: string }) {
  const s = STATUS_PESANAN[p.order_status] ?? { teks: p.order_status, nada: "netral" as const };
  const nama = namaPanggilan(p.nama_penerima);
  return (
    <View style={styles.kartuAntar}>
      <KartuTekan
        onPress={() => router.push({ pathname: "/cikarang/kloter/[id]/[pesanan]", params: { id: kloterId, pesanan: p.id } })}
        label={`Buka pesanan ${p.invoice_number} untuk ${p.nama_penerima}`}
      >
        <View style={styles.atas}>
          <Teks tebal angka style={styles.isiAtas}>
            {p.invoice_number}
          </Teks>
          <Lencana teks={s.teks} nada={s.nada} />
        </View>
        <Teks ragam="subjudul">{p.nama_penerima}</Teks>
        <Teks ragam="lembut">{p.alamat}</Teks>
        {p.patokan && <Teks ragam="redup">Patokan: {p.patokan}</Teks>}
        <Teks ragam="redup" angka>
          {formatNomorWa(p.nomor_wa)}. {ringkasItem(bacaItem(p.item))}
        </Teks>
      </KartuTekan>
      {p.order_status === "arrived_in_cikarang" && (
        <TombolWa label="Kabari diantar hari ini" nomor={p.nomor_wa} teks={pesanDiantarHariIni({ nama, invoice: p.invoice_number, token: p.status_token, perkiraanJam: jam })} />
      )}
      {p.order_status === "delivery_failed" && p.delivery_attempts < 2 && (
        <TombolWa label="Atur antar ulang" nomor={p.nomor_wa} teks={pesanGagalAntar({ nama, invoice: p.invoice_number, token: p.status_token, alasan: p.catatan_gagal })} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  aksi: { gap: jarak.s },
  kartuAntar: { gap: jarak.s },
  atas: { flexDirection: "row", alignItems: "center", gap: jarak.s },
  isiAtas: { flex: 1 },
});
