import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import type { Nada } from "@/lib/label";
import { jarak, radius, warna } from "@/lib/tema";
import { Teks } from "./Teks";

export function Kartu({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.kartu, style]}>{children}</View>;
}

/** Kartu yang membuka layar lain. Latar menggelap saat ditekan, seperti kartu di web pada HP. */
export function KartuTekan({
  children,
  onPress,
  label,
}: {
  children: ReactNode;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.kartu, pressed && styles.ditekan]}
    >
      {children}
    </Pressable>
  );
}

/**
 * Kelompok isi dengan garis emas tipis di kiri judul. Garis tegak emas adalah motif yang sama dengan
 * menu tegak dan alur status di web pembeli.
 */
export function Bagian({ judul, kanan, children }: { judul: string; kanan?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.bagian}>
      <View style={styles.kepalaBagian}>
        <View style={styles.garisEmas} />
        <Teks ragam="subjudul" style={styles.judulBagian} accessibilityRole="header">
          {judul}
        </Teks>
        {kanan}
      </View>
      {children}
    </View>
  );
}

export function BarisInfo({ label, nilai, angka = false }: { label: string; nilai: ReactNode; angka?: boolean }) {
  return (
    <View style={styles.baris}>
      <Teks ragam="lembut" style={styles.labelBaris}>
        {label}
      </Teks>
      <Teks angka={angka} tebal style={styles.nilaiBaris}>
        {nilai}
      </Teks>
    </View>
  );
}

const NADA: Record<Nada, { latar: string; teks: string }> = {
  netral: { latar: warna.redup, teks: warna.isiLembut },
  emas: { latar: "#fbf3d9", teks: "#713f12" },
  hijau: { latar: warna.halal50, teks: "#166534" },
  merah: { latar: warna.bahaya50, teks: warna.bahaya },
  kuning: { latar: warna.waspada50, teks: warna.waspada },
  biru: { latar: warna.info50, teks: warna.info },
};

/** Status selalu tertulis, warna hanya penegas. */
export function Lencana({ teks, nada }: { teks: string; nada: Nada }) {
  return (
    <View style={[styles.lencana, { backgroundColor: NADA[nada].latar }]}>
      <Teks ragam="kecil" tebal warnaTeks={NADA[nada].teks}>
        {teks}
      </Teks>
    </View>
  );
}

export function Catatan({ nada = "kuning", children }: { nada?: Nada; children: ReactNode }) {
  return (
    <View style={[styles.catatan, { backgroundColor: NADA[nada].latar, borderColor: NADA[nada].teks }]}>
      {typeof children === "string" ? <Teks warnaTeks={NADA[nada].teks}>{children}</Teks> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  kartu: {
    backgroundColor: warna.permukaan,
    borderRadius: radius.sedang,
    borderWidth: 1,
    borderColor: warna.garis,
    padding: jarak.l,
    gap: jarak.s,
  },
  ditekan: { backgroundColor: warna.redup },
  bagian: { gap: jarak.m },
  kepalaBagian: { flexDirection: "row", alignItems: "center", gap: jarak.s },
  garisEmas: { width: 2, alignSelf: "stretch", minHeight: 22, backgroundColor: warna.emas500, borderRadius: 1 },
  judulBagian: { flex: 1 },
  baris: { flexDirection: "row", justifyContent: "space-between", gap: jarak.m, alignItems: "flex-start" },
  // Label pendek tidak boleh terlipat. Nilai yang panjang (tanggal, alamat) yang turun ke baris berikutnya.
  labelBaris: { flexShrink: 0, maxWidth: "45%" },
  nilaiBaris: { flex: 1, textAlign: "right" },
  lencana: { alignSelf: "flex-start", borderRadius: radius.kecil, paddingHorizontal: 8, paddingVertical: 2 },
  catatan: { borderLeftWidth: 3, borderRadius: radius.kecil, padding: jarak.m, gap: jarak.xs },
});
