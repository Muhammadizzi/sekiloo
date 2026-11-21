import { Alert, Platform } from "react-native";

// Alert di react-native-web tidak menampilkan apa-apa, jadi pratinjau web memakai dialog browser.
export function konfirmasi(judul: string, pesan: string, tombolYa: string, merusak = false): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(globalThis.confirm?.(`${judul}\n\n${pesan}`) ?? false);
  }
  return new Promise((selesai) => {
    Alert.alert(
      judul,
      pesan,
      [
        { text: "Batal", style: "cancel", onPress: () => selesai(false) },
        { text: tombolYa, style: merusak ? "destructive" : "default", onPress: () => selesai(true) },
      ],
      { cancelable: true, onDismiss: () => selesai(false) },
    );
  });
}

export function beriTahu(judul: string, pesan: string): void {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${judul}\n\n${pesan}`);
    return;
  }
  Alert.alert(judul, pesan);
}
