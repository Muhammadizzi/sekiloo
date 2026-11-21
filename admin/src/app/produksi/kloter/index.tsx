import { router } from "expo-router";
import { KartuKloter } from "@/components/KartuKloter";
import { Catatan } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Tombol } from "@/components/Tombol";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";

export default function DaftarKloter() {
  const { keadaan, menyegarkan, segarkan, ulangi } = useMuat(
    async () => wajib(await supabase.rpc("admin_daftar_kloter")),
  );

  const adaYangBuka = keadaan.status === "siap" && keadaan.data.some((k) => k.status === "open");

  return (
    <Layar segarkan={segarkan} menyegarkan={menyegarkan}>
      <Tombol label="Buat kloter baru" onPress={() => router.push("/produksi/kloter/baru")} nonaktif={adaYangBuka} />
      {adaYangBuka && <Catatan nada="netral">Hanya boleh satu kloter buka. Kloter baru bisa dibuat setelah PO kloter ini tutup.</Catatan>}
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(daftar) =>
          daftar.length === 0 ? (
            <Kosong judul="Belum ada kloter">Buat kloter pertama untuk membuka PO di web.</Kosong>
          ) : (
            daftar.map((k) => (
              <KartuKloter key={k.id} kloter={k} onPress={() => router.push({ pathname: "/produksi/kloter/[id]", params: { id: k.id } })} />
            ))
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}
