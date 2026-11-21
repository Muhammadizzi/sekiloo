import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { jarak, warna } from "@/lib/tema";
import { Teks } from "./Teks";
import { Wordmark } from "./Wordmark";

/** Kerangka layar sebelum masuk (login, 2FA, kunci): zona gelap bermerek di atas, isian di zona terang. */
export function LayarAwal({ judul, keterangan, children }: { judul: string; keterangan?: string; children: ReactNode }) {
  const tepi = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.akar} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.kepala, { paddingTop: tepi.top + jarak.xxl }]}>
          <View style={styles.lebar}>
            <Wordmark />
            <View style={styles.garis} />
            <Teks ragam="judul" warnaTeks={warna.diAtasGelap} accessibilityRole="header">
              {judul}
            </Teks>
            {keterangan && <Teks warnaTeks={warna.diAtasGelapRedup}>{keterangan}</Teks>}
          </View>
        </View>
        <View style={[styles.isi, { paddingBottom: tepi.bottom + jarak.xxl }]}>
          <View style={[styles.lebar, styles.jarakIsi]}>{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  akar: { flex: 1, backgroundColor: warna.latar },
  kepala: { backgroundColor: warna.tinta900, paddingHorizontal: jarak.l, paddingBottom: jarak.xl },
  garis: { width: 40, height: 2, backgroundColor: warna.emas500, marginVertical: jarak.l },
  isi: { flex: 1, paddingHorizontal: jarak.l, paddingTop: jarak.xl },
  lebar: { width: "100%", maxWidth: 480, alignSelf: "center", gap: jarak.s },
  jarakIsi: { gap: jarak.l },
});
