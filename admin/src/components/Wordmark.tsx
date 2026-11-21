import { StyleSheet, Text, View } from "react-native";
import { hurufJudul, warna } from "@/lib/tema";

// Sama dengan Wordmark di web: nama berhuruf serif dengan titik emas, sampai logo dari pemilik tersedia.
export function Wordmark({ ukuran = 28 }: { ukuran?: number }) {
  return (
    <View style={styles.baris} accessibilityRole="header" accessibilityLabel="Sealauk Admin">
      <Text style={[styles.nama, { fontSize: ukuran }]}>
        sealauk<Text style={styles.titik}>.</Text>
      </Text>
      <Text style={styles.admin}>Admin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  nama: { fontFamily: hurufJudul, color: warna.diAtasGelap, fontWeight: "600" },
  titik: { color: warna.emas400 },
  admin: { fontSize: 14, color: warna.diAtasGelapRedup, fontWeight: "600" },
});
