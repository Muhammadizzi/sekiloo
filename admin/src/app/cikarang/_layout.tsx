import { Stack } from "expo-router";
import { opsiKepala, TombolKeluar } from "@/lib/navigasi";

/** Menu admin Cikarang (PRD 7.3): kloter, daftar antar, dan aksi per pesanan dalam satu tumpukan layar. */
export default function TataLetakCikarang() {
  return (
    <Stack screenOptions={opsiKepala}>
      <Stack.Screen name="index" options={{ title: "Kloter", headerRight: () => <TombolKeluar /> }} />
    </Stack>
  );
}
