import type { ReactNode } from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { hurufJudul, warna } from "@/lib/tema";

type Ragam = "judul" | "subjudul" | "badan" | "lembut" | "redup" | "kecil" | "label";

const gaya: Record<Ragam, TextStyle> = {
  judul: { fontFamily: hurufJudul, fontSize: 24, lineHeight: 30, color: warna.isi, fontWeight: "600" },
  subjudul: { fontSize: 18, lineHeight: 24, color: warna.isi, fontWeight: "600" },
  badan: { fontSize: 16, lineHeight: 22, color: warna.isi },
  lembut: { fontSize: 16, lineHeight: 22, color: warna.isiLembut },
  redup: { fontSize: 14, lineHeight: 20, color: warna.isiRedup },
  kecil: { fontSize: 14, lineHeight: 20, color: warna.isiLembut },
  label: { fontSize: 14, lineHeight: 20, color: warna.isiLembut, fontWeight: "600" },
};

export function Teks({
  ragam = "badan",
  tebal = false,
  angka = false,
  warnaTeks,
  style,
  children,
  ...sisa
}: TextProps & { ragam?: Ragam; tebal?: boolean; angka?: boolean; warnaTeks?: string; children: ReactNode }) {
  return (
    <Text
      {...sisa}
      style={[
        gaya[ragam],
        tebal && styles.tebal,
        // Angka sejajar supaya kolom harga dan berat mudah dibandingkan dari atas ke bawah.
        angka && styles.angka,
        warnaTeks ? { color: warnaTeks } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  tebal: { fontWeight: "600" },
  angka: { fontVariant: ["tabular-nums"] },
});
