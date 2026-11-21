import { Pressable, StyleSheet, Text } from "react-native";
import { konfirmasi } from "./konfirmasi";
import { useSesi } from "./sesi";
import { hurufJudul, TINGGI_SENTUH, warna } from "./tema";

/** Header gelap dengan judul serif, zona gelap yang sama dengan header web. */
export const opsiKepala = {
  headerStyle: { backgroundColor: warna.tinta900 },
  headerTintColor: warna.diAtasGelap,
  headerTitleStyle: { fontFamily: hurufJudul, fontWeight: "600" as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: warna.latar },
};

export function TombolKeluar() {
  const { sesi, keluar } = useSesi();
  const nama = sesi.status === "siap" ? sesi.nama : "";

  async function tekan() {
    if (await konfirmasi("Keluar dari akun?", `Kamu masuk sebagai ${nama}. Untuk masuk lagi perlu password dan kode 2FA.`, "Keluar")) {
      await keluar();
    }
  }

  return (
    <Pressable onPress={tekan} accessibilityRole="button" accessibilityLabel="Keluar dari akun" style={styles.tombol} hitSlop={8}>
      <Text style={styles.teks}>Keluar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tombol: { minHeight: TINGGI_SENTUH, minWidth: TINGGI_SENTUH, justifyContent: "center", paddingHorizontal: 8 },
  teks: { color: warna.emas400, fontSize: 16, fontWeight: "600" },
});
