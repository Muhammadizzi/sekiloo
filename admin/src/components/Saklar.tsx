import { StyleSheet, Switch, View } from "react-native";
import { jarak, TINGGI_SENTUH, warna } from "@/lib/tema";
import { Teks } from "./Teks";

export function Saklar({
  label,
  keterangan,
  nilai,
  ubah,
  nonaktif = false,
}: {
  label: string;
  keterangan?: string;
  nilai: boolean;
  ubah: (nilai: boolean) => void;
  nonaktif?: boolean;
}) {
  return (
    <View style={styles.baris}>
      <View style={styles.teks}>
        <Teks tebal>{label}</Teks>
        {keterangan && <Teks ragam="redup">{keterangan}</Teks>}
      </View>
      <Switch
        value={nilai}
        onValueChange={ubah}
        disabled={nonaktif}
        accessibilityLabel={label}
        trackColor={{ false: warna.garisTegas, true: warna.halal600 }}
        thumbColor={warna.permukaan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: "row", alignItems: "center", gap: jarak.m, minHeight: TINGGI_SENTUH },
  teks: { flex: 1, gap: 2 },
});
