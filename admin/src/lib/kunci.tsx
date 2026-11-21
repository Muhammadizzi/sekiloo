import * as LocalAuthentication from "expo-local-authentication";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, Platform } from "react-native";

/**
 * Kunci sidik jari atau PIN HP (PRD 14.2). 2FA hanya melindungi saat login, sedangkan sesi yang
 * sudah aktif di HP yang hilang dilindungi kunci ini.
 *
 * Aplikasi terkunci setiap dibuka dari keadaan tertutup, dan setiap kembali dari latar belakang
 * setelah lebih dari satu menit. Satu menit itu memberi ruang untuk membuka WhatsApp, peta,
 * kamera, atau galeri di tengah pekerjaan tanpa harus membuka kunci berkali-kali.
 */
const MASA_TENGGANG_MS = 60_000;

const DI_WEB = Platform.OS === "web";

export type TingkatKunciHp = "memeriksa" | "tidak-ada" | "ada";

type NilaiKunci = {
  terkunci: boolean;
  tingkat: TingkatKunciHp;
  buka: () => Promise<void>;
  periksaKunciHp: () => Promise<void>;
  /** Untuk aksi sensitif: refund, batalkan kloter atau pesanan, ubah jadwal. */
  verifikasiUlang: (alasan: string) => Promise<boolean>;
};

const KonteksKunci = createContext<NilaiKunci | null>(null);

async function mintaKunciHp(pesan: string): Promise<boolean> {
  // Pratinjau web hanya untuk pengembangan, dan aplikasi menolak jalan di web versi rilis (lihat _layout).
  if (DI_WEB) return __DEV__;
  const hasil = await LocalAuthentication.authenticateAsync({
    promptMessage: pesan,
    cancelLabel: "Batal",
    disableDeviceFallback: false,
  });
  return hasil.success;
}

async function bacaTingkat(): Promise<TingkatKunciHp> {
  const level = await LocalAuthentication.getEnrolledLevelAsync();
  return level === LocalAuthentication.SecurityLevel.NONE ? "tidak-ada" : "ada";
}

export function PenyediaKunci({ aktif, children }: { aktif: boolean; children: ReactNode }) {
  const [terkunci, setTerkunci] = useState(!DI_WEB);
  const [tingkat, setTingkat] = useState<TingkatKunciHp>(DI_WEB ? "ada" : "memeriksa");
  const keLatarPada = useRef<number | null>(null);

  const periksaKunciHp = useCallback(async () => {
    if (DI_WEB) return;
    setTingkat("memeriksa");
    setTingkat(await bacaTingkat());
  }, []);

  useEffect(() => {
    if (!DI_WEB) bacaTingkat().then(setTingkat);
  }, []);

  // Setelah keluar, tidak ada sesi yang perlu dilindungi. Login berikutnya sudah memakai password dan 2FA.
  const [aktifSebelumnya, setAktifSebelumnya] = useState(aktif);
  if (aktif !== aktifSebelumnya) {
    setAktifSebelumnya(aktif);
    if (!aktif && !DI_WEB) setTerkunci(false);
  }

  useEffect(() => {
    if (DI_WEB) return;
    const langganan = AppState.addEventListener("change", (keadaan) => {
      if (keadaan === "background") {
        keLatarPada.current = Date.now();
      } else if (keadaan === "active" && keLatarPada.current !== null) {
        if (Date.now() - keLatarPada.current > MASA_TENGGANG_MS) setTerkunci(true);
        keLatarPada.current = null;
      }
    });
    return () => langganan.remove();
  }, []);

  const buka = useCallback(async () => {
    if (await mintaKunciHp("Buka Sealauk Admin")) setTerkunci(false);
  }, []);

  const verifikasiUlang = useCallback((alasan: string) => mintaKunciHp(alasan), []);

  // HP tanpa kunci layar tidak boleh memakai aplikasi ini sama sekali (PRD 14.3), walau baru saja login.
  const tampilkanKunci = aktif && !DI_WEB && (terkunci || tingkat === "tidak-ada");

  return (
    <KonteksKunci.Provider value={{ terkunci: tampilkanKunci, tingkat, buka, periksaKunciHp, verifikasiUlang }}>
      {children}
    </KonteksKunci.Provider>
  );
}

export function useKunci(): NilaiKunci {
  const nilai = useContext(KonteksKunci);
  if (!nilai) throw new Error("useKunci dipakai di luar PenyediaKunci");
  return nilai;
}
