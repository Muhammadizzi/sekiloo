import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { radius, TINGGI_SENTUH, warna } from "@/lib/tema";

/**
 * Ragam sama dengan Button di web: emas untuk satu aksi utama per layar, gelap untuk aksi utama
 * kedua, garis untuk aksi sekunder, bahaya untuk aksi yang membatalkan atau tidak bisa diulang.
 */
type Ragam = "utama" | "gelap" | "garis" | "hantu" | "bahaya";

const latar: Record<Ragam, ViewStyle> = {
  utama: { backgroundColor: warna.emas400 },
  gelap: { backgroundColor: warna.tinta900 },
  garis: { backgroundColor: warna.permukaan, borderWidth: 1, borderColor: warna.garisTegas },
  hantu: { backgroundColor: "transparent" },
  bahaya: { backgroundColor: warna.bahaya },
};

const warnaTeks: Record<Ragam, string> = {
  utama: warna.tinta900,
  gelap: warna.diAtasGelap,
  garis: warna.isi,
  hantu: warna.isiLembut,
  bahaya: "#ffffff",
};

export function Tombol({
  label,
  onPress,
  ragam = "utama",
  memproses = false,
  nonaktif = false,
  penuh = true,
  labelAksesibilitas,
}: {
  label: string;
  onPress: () => void;
  ragam?: Ragam;
  memproses?: boolean;
  nonaktif?: boolean;
  penuh?: boolean;
  labelAksesibilitas?: string;
}) {
  const mati = nonaktif || memproses;
  return (
    <Pressable
      onPress={onPress}
      disabled={mati}
      accessibilityRole="button"
      accessibilityLabel={labelAksesibilitas ?? label}
      accessibilityState={{ disabled: mati, busy: memproses }}
      style={({ pressed }) => [
        styles.dasar,
        latar[ragam],
        penuh ? styles.penuh : styles.pas,
        // Mengecil 3% saat ditekan, umpan balik sentuh yang sama dengan tombol di web.
        pressed && !mati && styles.ditekan,
        mati && styles.mati,
      ]}
    >
      <View style={styles.isi}>
        {memproses && <ActivityIndicator size="small" color={warnaTeks[ragam]} />}
        <Text style={[styles.teks, { color: warnaTeks[ragam] }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dasar: {
    minHeight: TINGGI_SENTUH,
    borderRadius: radius.sedang,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  penuh: { alignSelf: "stretch" },
  pas: { alignSelf: "flex-start" },
  ditekan: { transform: [{ scale: 0.97 }] },
  mati: { opacity: 0.55 },
  isi: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  teks: { fontSize: 16, fontWeight: "600", textAlign: "center" },
});
