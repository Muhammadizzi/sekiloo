import { Stack } from "expo-router";
import { opsiKepala, TombolKeluar } from "@/lib/navigasi";

export default function TumpukanTab() {
  return (
    <Stack screenOptions={opsiKepala}>
      <Stack.Screen name="index" options={{ title: "Wilayah dan ongkir", headerRight: () => <TombolKeluar /> }} />
    </Stack>
  );
}
