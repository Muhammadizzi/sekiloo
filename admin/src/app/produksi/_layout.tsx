import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { warna } from "@/lib/tema";

type NamaIkon = ComponentProps<typeof MaterialCommunityIcons>["name"];

function ikon(nama: NamaIkon) {
  return function Ikon({ color, size }: { color: ColorValue; size: number }) {
    return <MaterialCommunityIcons name={nama} color={typeof color === "string" ? color : undefined} size={size} />;
  };
}

/** Menu admin produksi (PRD 7.2). Tiap tab punya tumpukan layar sendiri. */
export default function TataLetakProduksi() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: warna.emas700,
        tabBarInactiveTintColor: warna.isiRedup,
        tabBarStyle: { backgroundColor: warna.permukaan, borderTopColor: warna.garis },
        tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="kloter" options={{ title: "Kloter", tabBarAccessibilityLabel: "Kloter", tabBarIcon: ikon("calendar-month-outline") }} />
      <Tabs.Screen name="refund" options={{ title: "Refund", tabBarAccessibilityLabel: "Refund", tabBarIcon: ikon("cash-refund") }} />
      <Tabs.Screen name="produk" options={{ title: "Produk", tabBarAccessibilityLabel: "Produk", tabBarIcon: ikon("fish") }} />
      <Tabs.Screen name="wilayah" options={{ title: "Wilayah", tabBarAccessibilityLabel: "Wilayah", tabBarIcon: ikon("map-marker-radius-outline") }} />
    </Tabs>
  );
}
