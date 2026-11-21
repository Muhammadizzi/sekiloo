import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { jarak, warna } from "@/lib/tema";

/** Satu kolom isi yang bisa digulir, dengan tarik-untuk-menyegarkan kalau `segarkan` diberikan. */
export function Layar({
  children,
  segarkan,
  menyegarkan = false,
  bawah,
}: {
  children: ReactNode;
  segarkan?: () => void;
  menyegarkan?: boolean;
  /** Tombol aksi yang menempel di bawah layar, di atas tombol navigasi HP. */
  bawah?: ReactNode;
}) {
  const tepi = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.akar} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.isi, { paddingBottom: (bawah ? jarak.l : tepi.bottom) + jarak.xxl }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          segarkan ? (
            <RefreshControl refreshing={menyegarkan} onRefresh={segarkan} colors={[warna.emas700]} tintColor={warna.emas700} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {bawah && <View style={[styles.bawah, { paddingBottom: tepi.bottom + jarak.m }]}>{bawah}</View>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  akar: { flex: 1, backgroundColor: warna.latar },
  // Lebar dibatasi supaya pratinjau web dan tablet tidak membentang terlalu lebar untuk dibaca.
  isi: { padding: jarak.l, gap: jarak.xl, width: "100%", maxWidth: 640, alignSelf: "center" },
  bawah: {
    paddingHorizontal: jarak.l,
    paddingTop: jarak.m,
    backgroundColor: warna.permukaan,
    borderTopWidth: 1,
    borderTopColor: warna.garis,
    gap: jarak.s,
  },
});
