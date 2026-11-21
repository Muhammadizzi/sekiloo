import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import { useKunci } from "@/lib/kunci";
import { useSesi } from "@/lib/sesi";
import { warna } from "@/lib/tema";
import { Memuat } from "./Keadaan";
import { LayarAwal } from "./LayarAwal";
import { Teks } from "./Teks";
import { Tombol } from "./Tombol";

/** Menutupi seluruh aplikasi sampai sidik jari atau PIN HP dimasukkan. */
export function KunciLayar() {
  const { tingkat, buka, periksaKunciHp } = useKunci();
  const { keluar } = useSesi();
  const [membuka, setMembuka] = useState(false);
  const sudahDiminta = useRef(false);

  async function cobaBuka() {
    setMembuka(true);
    try {
      await buka();
    } finally {
      setMembuka(false);
    }
  }

  // Langsung tampilkan dialog sidik jari begitu kunci muncul, tapi hanya sekali, supaya tombol Batal tetap berarti.
  useEffect(() => {
    if (tingkat !== "ada" || sudahDiminta.current || AppState.currentState !== "active") return;
    sudahDiminta.current = true;
    cobaBuka();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tingkat]);

  return (
    <View style={styles.tutup} accessibilityViewIsModal>
      {tingkat === "memeriksa" ? (
        <LayarAwal judul="Aplikasi terkunci">
          <Memuat teks="Memeriksa kunci layar HP…" />
        </LayarAwal>
      ) : tingkat === "tidak-ada" ? (
        <LayarAwal
          judul="Pasang kunci layar HP dulu"
          keterangan="HP admin wajib memakai sidik jari, PIN, atau pola, karena aplikasi ini berisi data pembeli."
        >
          <Teks ragam="lembut">
            Buka Pengaturan HP, pasang kunci layar, lalu kembali ke sini dan tekan Periksa lagi.
          </Teks>
          <Tombol label="Periksa lagi" onPress={periksaKunciHp} />
          <Tombol label="Keluar dari akun" ragam="hantu" onPress={keluar} />
        </LayarAwal>
      ) : (
        <LayarAwal judul="Aplikasi terkunci" keterangan="Buka dengan sidik jari atau PIN HP ini.">
          <Tombol label="Buka kunci" onPress={cobaBuka} memproses={membuka} />
          <Tombol label="Keluar dari akun" ragam="hantu" onPress={keluar} />
        </LayarAwal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tutup: { ...StyleSheet.absoluteFill, backgroundColor: warna.latar, zIndex: 10 },
});
