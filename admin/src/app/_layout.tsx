import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Galat, Memuat } from "@/components/Keadaan";
import { KunciLayar } from "@/components/KunciLayar";
import { LayarAwal } from "@/components/LayarAwal";
import { Teks } from "@/components/Teks";
import { envLengkap } from "@/lib/env";
import { PenyediaKunci, useKunci } from "@/lib/kunci";
import { PenyediaSesi, useSesi } from "@/lib/sesi";
import { warna } from "@/lib/tema";

SplashScreen.preventAutoHideAsync();

export default function TataLetakAkar() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Akar />
    </SafeAreaProvider>
  );
}

function Akar() {
  // Versi web hanya untuk pratinjau saat pengembangan. Tanpa Keystore dan kunci sidik jari,
  // aplikasi admin tidak boleh dipakai sungguhan dari browser.
  if (Platform.OS === "web" && !__DEV__) {
    return (
      <LayarAwal judul="Hanya untuk Android" keterangan="Aplikasi admin Sealauk dipasang dari file APK.">
        <Teks ragam="lembut">Versi browser hanya dipakai untuk pengembangan.</Teks>
      </LayarAwal>
    );
  }
  if (!envLengkap) {
    return (
      <LayarAwal judul="Konfigurasi belum lengkap">
        <Teks ragam="lembut">
          EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diisi. Salin admin/.env.example ke
          admin/.env.local lalu isi nilainya.
        </Teks>
      </LayarAwal>
    );
  }
  return (
    <PenyediaSesi>
      <Navigasi />
    </PenyediaSesi>
  );
}

function Navigasi() {
  const { sesi, muatUlang } = useSesi();

  useEffect(() => {
    if (sesi.status !== "memuat") SplashScreen.hideAsync();
  }, [sesi.status]);

  if (sesi.status === "memuat") {
    return (
      <View style={styles.tengah}>
        <Memuat teks="Memeriksa sesi…" />
      </View>
    );
  }
  if (sesi.status === "galat") {
    return (
      <LayarAwal judul="Belum tersambung">
        <Galat pesan={sesi.pesan} ulangi={muatUlang} />
      </LayarAwal>
    );
  }

  const peran = sesi.status === "siap" ? sesi.peran : null;

  return (
    <PenyediaKunci aktif={sesi.status !== "keluar"}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: warna.latar } }}>
        <Stack.Protected guard={sesi.status === "keluar"}>
          <Stack.Screen name="masuk" />
        </Stack.Protected>
        <Stack.Protected guard={sesi.status === "perlu-2fa"}>
          <Stack.Screen name="dua-langkah" />
        </Stack.Protected>
        <Stack.Protected guard={sesi.status === "tanpa-peran"}>
          <Stack.Screen name="ditolak" />
        </Stack.Protected>
        <Stack.Protected guard={peran === "admin_produksi"}>
          <Stack.Screen name="produksi" />
        </Stack.Protected>
        <Stack.Protected guard={peran === "admin_cikarang"}>
          <Stack.Screen name="cikarang" />
        </Stack.Protected>
      </Stack>
      <PenutupKunci />
    </PenyediaKunci>
  );
}

function PenutupKunci() {
  const { terkunci } = useKunci();
  return terkunci ? <KunciLayar /> : null;
}

const styles = StyleSheet.create({
  tengah: { flex: 1, justifyContent: "center", backgroundColor: warna.latar },
});
