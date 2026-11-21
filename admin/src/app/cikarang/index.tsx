import { router } from "expo-router";
import { KartuKloter } from "@/components/KartuKloter";
import { Bagian } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import type { KloterAdmin } from "@/lib/jenis";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";

// Kloter yang sedang perlu dikerjakan di Cikarang tampil paling atas.
const PERLU_DIKERJAKAN = ["arrived_in_cikarang", "in_transit"];
const DIJADWALKAN = ["open", "closed"];

export default function KloterCikarang() {
  const { keadaan, menyegarkan, segarkan, ulangi } = useMuat(async () => wajib(await supabase.rpc("admin_daftar_kloter")));
  const buka = (k: KloterAdmin) => router.push({ pathname: "/cikarang/kloter/[id]", params: { id: k.id } });

  return (
    <Layar segarkan={segarkan} menyegarkan={menyegarkan}>
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(daftar) => {
          const sekarang = daftar.filter((k) => PERLU_DIKERJAKAN.includes(k.status));
          const nanti = daftar.filter((k) => DIJADWALKAN.includes(k.status));
          const lewat = daftar.filter((k) => k.status === "completed").slice(0, 10);
          if (daftar.length === 0) return <Kosong judul="Belum ada kloter">Kloter dibuat oleh admin produksi.</Kosong>;
          return (
            <>
              <Bagian judul="Perlu dikerjakan">
                {sekarang.length === 0 ? (
                  <Kosong judul="Tidak ada kloter di jalan atau di Cikarang" />
                ) : (
                  sekarang.map((k) => <KartuKloter key={k.id} kloter={k} onPress={() => buka(k)} />)
                )}
              </Bagian>
              {nanti.length > 0 && (
                <Bagian judul="Dijadwalkan">
                  {nanti.map((k) => (
                    <KartuKloter key={k.id} kloter={k} onPress={() => buka(k)} />
                  ))}
                </Bagian>
              )}
              {lewat.length > 0 && (
                <Bagian judul="Sudah selesai">
                  {lewat.map((k) => (
                    <KartuKloter key={k.id} kloter={k} onPress={() => buka(k)} />
                  ))}
                </Bagian>
              )}
            </>
          );
        }}
      </IsiKeadaan>
    </Layar>
  );
}
