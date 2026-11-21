import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { pilihFoto, type FotoSiap, type SumberFoto } from "@/lib/foto";
import { jarak, radius, warna } from "@/lib/tema";
import { Teks } from "./Teks";
import { Tombol } from "./Tombol";

/** Ambil foto dari kamera atau galeri, tampilkan pratinjaunya. Foto baru diunggah saat formulir disimpan. */
export function AksiFoto({
  label,
  foto,
  ubah,
  urlLama,
  keterangan,
}: {
  label: string;
  foto: FotoSiap | null;
  ubah: (foto: FotoSiap | null) => void;
  /** Foto yang sudah tersimpan sebelumnya, ditampilkan selama belum diganti. */
  urlLama?: string | null;
  keterangan?: string;
}) {
  const [memproses, setMemproses] = useState<SumberFoto | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function ambil(sumber: SumberFoto) {
    setGalat(null);
    setMemproses(sumber);
    try {
      const hasil = await pilihFoto(sumber);
      if (hasil) ubah(hasil);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Foto belum bisa diambil. Coba lagi.");
    } finally {
      setMemproses(null);
    }
  }

  const sumberTampil = foto?.uri ?? urlLama ?? null;

  return (
    <View style={styles.wadah}>
      <Teks ragam="label">{label}</Teks>
      {keterangan && <Teks ragam="redup">{keterangan}</Teks>}
      {sumberTampil ? (
        <Image
          source={{ uri: sumberTampil }}
          style={styles.pratinjau}
          contentFit="cover"
          alt={foto ? "Pratinjau foto baru" : "Foto yang tersimpan"}
        />
      ) : (
        <View style={[styles.pratinjau, styles.kosong]}>
          <Teks ragam="redup">Belum ada foto</Teks>
        </View>
      )}
      {foto && <Teks ragam="redup">Foto baru, tersimpan setelah tombol simpan ditekan.</Teks>}
      <View style={styles.tombol}>
        <View style={styles.separuh}>
          <Tombol label="Kamera" ragam="garis" onPress={() => ambil("kamera")} memproses={memproses === "kamera"} nonaktif={memproses !== null} />
        </View>
        <View style={styles.separuh}>
          <Tombol label="Galeri" ragam="garis" onPress={() => ambil("galeri")} memproses={memproses === "galeri"} nonaktif={memproses !== null} />
        </View>
      </View>
      {foto && <Tombol label="Batalkan foto baru" ragam="hantu" onPress={() => ubah(null)} />}
      {galat && (
        <Teks ragam="kecil" warnaTeks={warna.bahaya}>
          {galat}
        </Teks>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { gap: jarak.s },
  pratinjau: { width: "100%", aspectRatio: 4 / 3, borderRadius: radius.sedang, backgroundColor: warna.redup },
  kosong: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: warna.garis, borderStyle: "dashed" },
  tombol: { flexDirection: "row", gap: jarak.s },
  separuh: { flex: 1 },
});
