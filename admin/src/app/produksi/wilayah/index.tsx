import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { KartuTekan, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { formatRupiah } from "@/lib/format";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { jarak } from "@/lib/tema";

export default function DaftarWilayah() {
  const { keadaan, menyegarkan, segarkan, ulangi } = useMuat(
    async () => wajib(await supabase.from("service_areas").select("*").order("sort_order").order("name")),
  );

  return (
    <Layar segarkan={segarkan} menyegarkan={menyegarkan}>
      <Teks ragam="lembut">Ongkir flat per kecamatan. Hanya kecamatan aktif yang bisa dipilih pembeli di checkout.</Teks>
      <Tombol label="Tambah kecamatan" ragam="garis" onPress={() => router.push({ pathname: "/produksi/wilayah/[id]", params: { id: "baru" } })} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(daftar) =>
          daftar.length === 0 ? (
            <Kosong judul="Belum ada kecamatan" />
          ) : (
            daftar.map((w) => (
              <KartuTekan key={w.id} onPress={() => router.push({ pathname: "/produksi/wilayah/[id]", params: { id: w.id } })} label={`Ubah ${w.name}`}>
                <View style={styles.baris}>
                  <View style={styles.isi}>
                    <Teks ragam="subjudul">{w.name}</Teks>
                    <Teks angka ragam={w.delivery_fee === null ? "redup" : "badan"}>
                      {w.delivery_fee === null ? "Ongkir belum diisi" : `Ongkir ${formatRupiah(w.delivery_fee)}`}
                    </Teks>
                  </View>
                  <Lencana teks={w.is_active ? "Aktif" : "Nonaktif"} nada={w.is_active ? "hijau" : "netral"} />
                </View>
              </KartuTekan>
            ))
          )
        }
      </IsiKeadaan>
    </Layar>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: "row", alignItems: "center", gap: jarak.m },
  isi: { flex: 1, gap: 2 },
});
