import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from "react-native";
import { radius, TINGGI_SENTUH, warna } from "@/lib/tema";
import { Teks } from "./Teks";

export type OpsiPilihan<T extends string> = { kode: T; teks: string };

/** Pilih satu dari beberapa opsi. Opsi terpilih ditandai warna dan tanda centang, bukan warna saja. */
export function Pilihan<T extends string>({
  label,
  opsi,
  nilai,
  ubah,
  gulir = false,
  galat,
}: {
  label: string;
  opsi: readonly OpsiPilihan<T>[];
  nilai: T | null;
  ubah: (kode: T) => void;
  /** Satu baris yang bisa digeser, untuk opsi yang banyak seperti tanggal dan jam. */
  gulir?: boolean;
  galat?: string | null;
}) {
  const gulirRef = useRef<ScrollViewInstance>(null);
  const sudahDigulir = useRef(false);

  const daftar = opsi.map((o) => {
    const terpilih = o.kode === nilai;
    return (
      <Pressable
        key={o.kode}
        onPress={() => ubah(o.kode)}
        // Saat layar dibuka, baris yang bisa digeser langsung menampilkan pilihan yang tersimpan.
        onLayout={
          gulir && terpilih
            ? (e) => {
                if (sudahDigulir.current) return;
                sudahDigulir.current = true;
                gulirRef.current?.scrollTo({ x: Math.max(0, e.nativeEvent.layout.x - 16), animated: false });
              }
            : undefined
        }
        role="radio"
        aria-checked={terpilih}
        aria-label={o.teks}
        style={({ pressed }) => [styles.chip, terpilih && styles.chipTerpilih, pressed && styles.ditekan]}
      >
        <Teks ragam="kecil" tebal warnaTeks={terpilih ? warna.diAtasGelap : warna.isi}>
          {terpilih ? `✓ ${o.teks}` : o.teks}
        </Teks>
      </Pressable>
    );
  });

  return (
    <View style={styles.wadah} role="radiogroup" aria-label={label}>
      <Teks ragam="label">{label}</Teks>
      {gulir ? (
        <ScrollView ref={gulirRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.baris}>
          {daftar}
        </ScrollView>
      ) : (
        <View style={styles.bungkus}>{daftar}</View>
      )}
      {galat ? (
        <Teks ragam="kecil" warnaTeks={warna.bahaya}>
          {galat}
        </Teks>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { gap: 6 },
  baris: { flexDirection: "row", gap: 8, paddingRight: 8 },
  bungkus: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: TINGGI_SENTUH,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: radius.kecil,
    borderWidth: 1,
    borderColor: warna.garisTegas,
    backgroundColor: warna.permukaan,
  },
  chipTerpilih: { backgroundColor: warna.tinta900, borderColor: warna.tinta900 },
  ditekan: { opacity: 0.8 },
});
