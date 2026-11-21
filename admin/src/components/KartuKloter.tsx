import { StyleSheet, View } from "react-native";
import { formatBerat, formatTanggalKalender, formatWaktuWib } from "@/lib/format";
import type { KloterAdmin } from "@/lib/jenis";
import { STATUS_KLOTER } from "@/lib/label";
import { jarak, warna } from "@/lib/tema";
import { BarisInfo, KartuTekan, Lencana } from "./Kartu";
import { Teks } from "./Teks";

export function LencanaKloter({ status }: { status: string }) {
  const s = STATUS_KLOTER[status] ?? { teks: status, nada: "netral" as const };
  return <Lencana teks={s.teks} nada={s.nada} />;
}

/** Bar terisi dari berat terpakai dibanding kapasitas. Angkanya selalu ikut ditulis di bawah bar. */
export function BarKapasitas({ terpakai, kapasitas }: { terpakai: number; kapasitas: number }) {
  const persen = kapasitas > 0 ? Math.min(100, Math.round((terpakai / kapasitas) * 100)) : 0;
  return (
    <View style={styles.wadahBar}>
      <View
        style={styles.bar}
        accessibilityRole="progressbar"
        accessibilityLabel="Kapasitas terpakai"
        accessibilityValue={{ min: 0, max: 100, now: persen }}
      >
        <View style={[styles.isiBar, { width: `${persen}%` }]} />
      </View>
      <Teks ragam="redup" angka>
        {formatBerat(terpakai)} dari {formatBerat(kapasitas)} terpakai ({persen}%)
      </Teks>
    </View>
  );
}

export function KartuKloter({ kloter: k, onPress }: { kloter: KloterAdmin; onPress: () => void }) {
  return (
    <KartuTekan onPress={onPress} label={`Buka ${k.name}`}>
      <View style={styles.atas}>
        <Teks ragam="subjudul" style={styles.nama}>
          {k.name}
        </Teks>
        <LencanaKloter status={k.status} />
      </View>
      <BarisInfo label="Tutup PO" nilai={formatWaktuWib(k.close_order_at)} />
      <BarisInfo label="Diantar" nilai={formatTanggalKalender(k.delivery_date)} />
      <BarisInfo label="Lunas" nilai={`${k.lunas_jumlah} pesanan, ${formatBerat(k.lunas_berat_gram)}`} angka />
      {k.status === "open" && <BarKapasitas terpakai={k.used_gram} kapasitas={k.capacity_gram} />}
    </KartuTekan>
  );
}

const styles = StyleSheet.create({
  atas: { flexDirection: "row", alignItems: "flex-start", gap: jarak.s, marginBottom: jarak.xs },
  nama: { flex: 1 },
  wadahBar: { gap: jarak.xs, marginTop: jarak.xs },
  bar: { height: 8, borderRadius: 4, backgroundColor: warna.redup, overflow: "hidden" },
  isiBar: { height: 8, backgroundColor: warna.emas500 },
});
