import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { beriTahu } from "@/lib/konfirmasi";
import { radius, TINGGI_SENTUH, warna } from "@/lib/tema";
import { bukaWhatsApp } from "@/lib/wa";

/** Membuka WhatsApp dengan pesan terisi. Tanda centang muncul setelah ditekan, supaya admin tahu pesan mana yang sudah dibuka. */
export function TombolWa({ label, nomor, teks }: { label: string; nomor: string; teks: string }) {
  const [sudah, setSudah] = useState(false);

  async function buka() {
    try {
      await bukaWhatsApp(nomor, teks);
      setSudah(true);
    } catch {
      beriTahu("WhatsApp tidak terbuka", "Pastikan WhatsApp terpasang di HP ini.");
    }
  }

  return (
    <Pressable
      onPress={buka}
      accessibilityRole="button"
      accessibilityLabel={`${label} lewat WhatsApp${sudah ? ", sudah dibuka" : ""}`}
      style={({ pressed }) => [styles.tombol, pressed && styles.ditekan]}
    >
      <MaterialCommunityIcons name={sudah ? "check" : "whatsapp"} size={20} color={warna.halal600} />
      <Text style={styles.teks}>{sudah ? `${label} (sudah dibuka)` : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tombol: {
    minHeight: TINGGI_SENTUH,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sedang,
    borderWidth: 1,
    borderColor: warna.garisTegas,
    backgroundColor: warna.permukaan,
  },
  ditekan: { transform: [{ scale: 0.97 }], backgroundColor: warna.redup },
  teks: { flex: 1, fontSize: 16, fontWeight: "600", color: warna.isi },
});
