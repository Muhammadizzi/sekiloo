import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Bagian, KartuTekan, Lencana } from "@/components/Kartu";
import { IsiKeadaan, Kosong } from "@/components/Keadaan";
import { Layar } from "@/components/Layar";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { urlFotoProduk } from "@/lib/foto";
import { formatBerat, formatRupiah } from "@/lib/format";
import type { BarisProduk } from "@/lib/jenis";
import { teksSatuan } from "@/lib/label";
import { useMuat, wajib } from "@/lib/muat";
import { supabase } from "@/lib/supabase";
import { jarak, radius, warna } from "@/lib/tema";

export default function DaftarProduk() {
  const { keadaan, menyegarkan, segarkan, ulangi } = useMuat(
    async () => wajib(await supabase.from("products").select("*").order("sort_order").order("name")),
  );

  return (
    <Layar segarkan={segarkan} menyegarkan={menyegarkan}>
      <Tombol label="Tambah produk" onPress={() => router.push({ pathname: "/produksi/produk/[id]", params: { id: "baru" } })} />
      <IsiKeadaan keadaan={keadaan} ulangi={ulangi}>
        {(daftar) => {
          if (daftar.length === 0) return <Kosong judul="Belum ada produk">Tambah produk pertama untuk katalog web.</Kosong>;
          const aktif = daftar.filter((p) => p.is_active);
          const nonaktif = daftar.filter((p) => !p.is_active);
          return (
            <>
              <Bagian judul={`Tampil di web (${aktif.length})`}>
                {aktif.length === 0 ? <Kosong judul="Belum ada produk aktif">Katalog web masih kosong.</Kosong> : aktif.map((p) => <KartuProduk key={p.id} p={p} />)}
              </Bagian>
              {nonaktif.length > 0 && (
                <Bagian judul={`Nonaktif (${nonaktif.length})`}>
                  {nonaktif.map((p) => (
                    <KartuProduk key={p.id} p={p} />
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

function KartuProduk({ p }: { p: BarisProduk }) {
  const foto = urlFotoProduk(p.image_path);
  const belumLengkap = p.price === null || p.net_weight_gram === null || p.ship_weight_gram === null;
  return (
    <KartuTekan onPress={() => router.push({ pathname: "/produksi/produk/[id]", params: { id: p.id } })} label={`Ubah ${p.name}`}>
      <View style={styles.baris}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.foto} contentFit="cover" alt={`Foto ${p.name}`} />
        ) : (
          <View style={[styles.foto, styles.tanpaFoto]}>
            <Teks ragam="redup">Tanpa foto</Teks>
          </View>
        )}
        <View style={styles.isi}>
          <Teks ragam="subjudul">{p.name}</Teks>
          {belumLengkap ? (
            <Lencana teks="Harga atau berat belum diisi" nada="kuning" />
          ) : (
            <>
              <Teks angka tebal>
                {formatRupiah(p.price!)} per {teksSatuan(p.unit_type)}
              </Teks>
              <Teks ragam="redup" angka>
                Isi {formatBerat(p.net_weight_gram!)}, kemas {formatBerat(p.ship_weight_gram!)}
              </Teks>
            </>
          )}
        </View>
      </View>
    </KartuTekan>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: "row", gap: jarak.m, alignItems: "center" },
  foto: { width: 72, height: 72, borderRadius: radius.kecil, backgroundColor: warna.redup },
  tanpaFoto: { alignItems: "center", justifyContent: "center", padding: 4 },
  isi: { flex: 1, gap: 2 },
});
