import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { Keadaan } from "@/lib/muat";
import { jarak, warna } from "@/lib/tema";
import { Kartu } from "./Kartu";
import { Teks } from "./Teks";
import { Tombol } from "./Tombol";

export function Memuat({ teks = "Memuat data…" }: { teks?: string }) {
  return (
    <View style={styles.tengah} accessibilityLiveRegion="polite">
      <ActivityIndicator color={warna.emas700} />
      <Teks ragam="redup">{teks}</Teks>
    </View>
  );
}

export function Galat({ pesan, ulangi }: { pesan: string; ulangi: () => void }) {
  return (
    <Kartu>
      <Teks tebal>Data belum bisa dimuat</Teks>
      <Teks ragam="lembut">{pesan}</Teks>
      <Tombol label="Coba lagi" ragam="garis" onPress={ulangi} />
    </Kartu>
  );
}

export function Kosong({ judul, children }: { judul: string; children?: ReactNode }) {
  return (
    <Kartu>
      <Teks tebal>{judul}</Teks>
      {typeof children === "string" ? <Teks ragam="lembut">{children}</Teks> : children}
    </Kartu>
  );
}

/** Menampilkan memuat atau galat sesuai keadaan, dan menyerahkan data ke `children` kalau sudah siap. */
export function IsiKeadaan<T>({
  keadaan,
  ulangi,
  children,
}: {
  keadaan: Keadaan<T>;
  ulangi: () => void;
  children: (data: T) => ReactNode;
}) {
  if (keadaan.status === "memuat") return <Memuat />;
  if (keadaan.status === "galat") return <Galat pesan={keadaan.pesan} ulangi={ulangi} />;
  return <>{children(keadaan.data)}</>;
}

const styles = StyleSheet.create({
  tengah: { alignItems: "center", gap: jarak.s, paddingVertical: jarak.xxl },
});
