import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Isian } from "@/components/Isian";
import { Catatan, Kartu } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { pesanGalat } from "@/lib/galat";
import { konfirmasi } from "@/lib/konfirmasi";
import { useKunci } from "@/lib/kunci";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { segarkanWeb } from "@/lib/web";

export default function BatalkanKloter() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { verifikasiUlang } = useKunci();
  const { keadaan, ulangi } = useMuat(async () => wajib(await supabase.rpc("admin_daftar_kloter")).find((k) => k.id === id) ?? null);
  const [alasan, setAlasan] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);
  const [hasil, setHasil] = useState<number | null>(null);

  async function batalkan(nama: string, lunas: number) {
    if (alasan.trim().length < 5) {
      setGalat("Tulis alasan pembatalan, minimal 5 huruf.");
      return;
    }
    setGalat(null);
    const yakin = await konfirmasi(
      `Batalkan ${nama}?`,
      `${lunas} pesanan lunas akan dibatalkan dan masuk daftar refund. Langkah ini tidak bisa dibatalkan.`,
      "Batalkan kloter",
      true,
    );
    if (!yakin || !(await verifikasiUlang("Konfirmasi pembatalan kloter"))) return;

    setMemproses(true);
    const { data, error } = await supabase.rpc("batch_cancel", { p_batch_id: id, p_note: alasan.trim() });
    setMemproses(false);
    if (error) {
      setGalat(pesanGalat(error));
      return;
    }
    await segarkanWeb("kloter");
    setHasil(data);
  }

  return (
    <Layar>
      <Stack.Screen options={{ title: "Batalkan kloter" }} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(k) =>
          hasil !== null ? (
            <>
              <Catatan nada="hijau">{`Kloter dibatalkan. ${hasil} pesanan lunas masuk daftar refund.`}</Catatan>
              <Tombol label="Buka daftar refund" onPress={() => router.navigate("/produksi/refund")} />
              <Tombol label="Kembali ke kloter" ragam="garis" onPress={() => router.back()} />
            </>
          ) : !k || (k.status !== "open" && k.status !== "closed") ? (
            <Kosong judul="Kloter ini tidak bisa dibatalkan">Hanya kloter yang masih buka atau sedang produksi yang bisa dibatalkan.</Kosong>
          ) : (
            <>
              <Kartu>
                <Teks tebal>{k.name}</Teks>
                <Teks ragam="lembut">
                  {`${k.lunas_jumlah} pesanan lunas akan dibatalkan dan masuk daftar refund. ${k.menunggu_bayar} pesanan yang belum dibayar ikut batal.`}
                </Teks>
              </Kartu>
              <Isian label="Alasan pembatalan" nilai={alasan} ubah={setAlasan} galat={galat} multiline placeholder="Mis. kapal tidak melaut karena cuaca buruk" petunjuk="Tercatat di log kloter." />
              <Tombol label="Batalkan kloter" ragam="bahaya" onPress={() => batalkan(k.name, k.lunas_jumlah)} memproses={memproses} />
            </>
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}
