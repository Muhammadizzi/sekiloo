import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { radius, TINGGI_SENTUH, warna } from "@/lib/tema";
import { Teks } from "./Teks";

export function Isian({
  label,
  nilai,
  ubah,
  galat,
  petunjuk,
  akhiran,
  ...sisa
}: Omit<TextInputProps, "value" | "onChangeText"> & {
  label: string;
  nilai: string;
  ubah: (teks: string) => void;
  galat?: string | null;
  petunjuk?: string;
  /** Satuan di ujung kanan isian, mis. "kg" atau "gram". */
  akhiran?: string;
}) {
  const [fokus, setFokus] = useState(false);
  return (
    <View style={styles.wadah}>
      <Teks ragam="label">{label}</Teks>
      <View
        style={[
          styles.kotak,
          fokus && styles.kotakFokus,
          galat ? styles.kotakGalat : null,
          sisa.multiline ? styles.kotakPanjang : null,
        ]}
      >
        <TextInput
          {...sisa}
          value={nilai}
          onChangeText={ubah}
          onFocus={(e) => {
            setFokus(true);
            sisa.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFokus(false);
            sisa.onBlur?.(e);
          }}
          accessibilityLabel={label}
          placeholderTextColor={warna.isiContoh}
          style={[styles.masukan, sisa.multiline ? styles.masukanPanjang : null]}
        />
        {akhiran && <Teks ragam="redup">{akhiran}</Teks>}
      </View>
      {galat ? (
        <Teks ragam="kecil" warnaTeks={warna.bahaya} accessibilityLiveRegion="polite">
          {galat}
        </Teks>
      ) : petunjuk ? (
        <Teks ragam="redup">{petunjuk}</Teks>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { gap: 6 },
  kotak: {
    minHeight: TINGGI_SENTUH,
    borderWidth: 1,
    borderColor: warna.garisTegas,
    borderRadius: radius.kecil,
    backgroundColor: warna.permukaan,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kotakFokus: { borderColor: warna.tinta900, borderWidth: 2, paddingHorizontal: 11 },
  kotakGalat: { borderColor: warna.bahaya },
  kotakPanjang: { alignItems: "flex-start", paddingVertical: 10 },
  masukan: { flex: 1, fontSize: 16, color: warna.isi, paddingVertical: 10 },
  masukanPanjang: { minHeight: 88, textAlignVertical: "top", paddingVertical: 0 },
});
