import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FormKloter } from "@/components/FormKloter";
import { Bagian, Catatan } from "@/components/Kartu";
import { IsiKeadaan, Kosong, Memuat } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { TombolWa } from "@/components/TombolWa";
import { ikutKloter, type BarisKloter, type PesananKloter } from "@/lib/jenis";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { namaPanggilan, pesanJadwalBerubah } from "@/lib/wa";

async function ambil(id: string) {
  const [kloter, pesanan] = await Promise.all([
    supabase.from("po_batches").select("*").eq("id", id).maybeSingle(),
    supabase.rpc("admin_pesanan_kloter", { p_batch_id: id }),
  ]);
  return { kloter: wajib(kloter), lunas: wajib(pesanan).filter(ikutKloter) };
}

export default function UbahKloter() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { keadaan, ulangi } = useMuat(() => ambil(id));
  // Setelah jadwal diubah, layar ini berganti menjadi daftar pembeli yang perlu dikabari (PRD 8.5).
  const [dikabari, setDikabari] = useState<BarisKloter | null>(null);

  async function selesai(jadwalBerubah: boolean) {
    if (!jadwalBerubah) {
      router.back();
      return;
    }
    const { data } = await supabase.from("po_batches").select("*").eq("id", id).maybeSingle();
    if (data) setDikabari(data);
    else router.back();
  }

  return (
    <Layar>
      <Stack.Screen options={{ title: dikabari ? "Kabari pembeli" : "Ubah kloter" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {({ kloter, lunas }) =>
          !kloter ? (
            <Kosong judul="Kloter tidak ditemukan" />
          ) : dikabari ? (
            <KabariPembeli kloter={dikabari} lunas={lunas} />
          ) : ["cancelled", "completed"].includes(kloter.status) ? (
            <Kosong judul="Kloter ini tidak bisa diubah">Kloter yang sudah batal atau selesai tidak bisa diubah lagi.</Kosong>
          ) : (
            <FormKloter kloter={kloter} lunasJumlah={lunas.length} selesai={(_, berubah) => selesai(berubah)} />
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}

function KabariPembeli({ kloter, lunas }: { kloter: BarisKloter; lunas: PesananKloter[] }) {
  if (!kloter.change_reason) return <Memuat />;
  return (
    <>
      <Catatan nada="hijau">Jadwal tersimpan. Kirim kabar ke setiap pembeli yang sudah bayar.</Catatan>
      <Bagian judul={`Pembeli yang perlu dikabari (${lunas.length})`}>
        <Teks ragam="redup">Tombol membuka WhatsApp dengan pesan terisi. Tekan kirim di WhatsApp, lalu kembali ke sini.</Teks>
        {lunas.map((p) => (
          <TombolWa
            key={p.id}
            label={`${p.nama_pemesan}, ${p.invoice_number}`}
            nomor={p.nomor_wa}
            teks={pesanJadwalBerubah({
              nama: namaPanggilan(p.nama_pemesan),
              invoice: p.invoice_number,
              token: p.status_token,
              tanggalAntar: kloter.delivery_date,
              alasan: kloter.change_reason!,
            })}
          />
        ))}
      </Bagian>
      <Tombol label="Selesai" ragam="garis" onPress={() => router.back()} />
    </>
  );
}
