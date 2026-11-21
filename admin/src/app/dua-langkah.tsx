import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Isian } from "@/components/Isian";
import { Catatan, Kartu } from "@/components/Kartu";
import { Galat, Memuat } from "@/components/Keadaan";
import { LayarAwal } from "@/components/LayarAwal";
import { Teks } from "@/components/Teks";
import { Tombol } from "@/components/Tombol";
import { pesanGalat } from "@/lib/galat";
import { useSesi } from "@/lib/sesi";
import { supabase } from "@/lib/supabase";
import { jarak, radius, warna } from "@/lib/tema";

type Tahap =
  | { jenis: "memuat" }
  | { jenis: "galat"; pesan: string }
  | { jenis: "verifikasi"; factorId: string }
  | { jenis: "daftar"; factorId: string; rahasia: string; uri: string };

async function siapkan(): Promise<Tahap> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return { jenis: "galat", pesan: pesanGalat(error) };

  const terdaftar = data.totp[0];
  if (terdaftar) return { jenis: "verifikasi", factorId: terdaftar.id };

  // Sisa pendaftaran yang tidak diselesaikan dihapus dulu, supaya authenticator lama tidak tertukar dengan yang baru.
  for (const f of data.all) {
    if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const daftar = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `HP admin ${Date.now()}`, issuer: "Sealauk Admin" });
  if (daftar.error) {
    const mati = /disabled|not enabled/i.test(daftar.error.message);
    return {
      jenis: "galat",
      pesan: mati
        ? "2FA belum diaktifkan di project Supabase. Pemilik perlu menyalakan TOTP di Authentication, bagian Multi-Factor."
        : pesanGalat(daftar.error),
    };
  }
  return {
    jenis: "daftar",
    factorId: daftar.data.id,
    rahasia: daftar.data.totp.secret,
    uri: daftar.data.totp.uri,
  };
}

export default function DuaLangkah() {
  const { sesi, keluar } = useSesi();
  const [tahap, setTahap] = useState<Tahap>({ jenis: "memuat" });
  const [kode, setKode] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);
  const [tersalin, setTersalin] = useState(false);

  useEffect(() => {
    let berlaku = true;
    siapkan().then((t) => berlaku && setTahap(t));
    return () => {
      berlaku = false;
    };
  }, []);

  function muatLagi() {
    setTahap({ jenis: "memuat" });
    siapkan().then(setTahap);
  }

  async function verifikasi() {
    if (tahap.jenis !== "verifikasi" && tahap.jenis !== "daftar") return;
    const bersih = kode.replace(/\s/g, "");
    if (!/^\d{6}$/.test(bersih)) {
      setGalat("Kode terdiri dari 6 angka.");
      return;
    }
    setGalat(null);
    setMemproses(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: tahap.factorId, code: bersih });
    setMemproses(false);
    if (error) {
      setGalat(/invalid|expired/i.test(error.message) ? "Kode salah atau sudah berganti. Masukkan kode yang sedang tampil." : pesanGalat(error));
      setKode("");
    }
    // Berhasil: sesi naik ke aal2 dan _layout membuka menu sesuai peran.
  }

  async function salin(rahasia: string) {
    await Clipboard.setStringAsync(rahasia);
    setTersalin(true);
  }

  const nama = sesi.status === "perlu-2fa" ? sesi.nama : "";
  const isianKode = (
    <>
      <Isian
        label="Kode 6 angka dari aplikasi authenticator"
        nilai={kode}
        ubah={(t) => setKode(t.replace(/[^\d]/g, "").slice(0, 6))}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        returnKeyType="go"
        onSubmitEditing={verifikasi}
        galat={galat}
      />
      <Tombol label="Verifikasi" onPress={verifikasi} memproses={memproses} />
    </>
  );

  return (
    <LayarAwal
      judul={tahap.jenis === "daftar" ? "Pasang 2FA" : "Verifikasi 2FA"}
      keterangan={nama ? `Masuk sebagai ${nama}.` : undefined}
    >
      {tahap.jenis === "memuat" && <Memuat />}
      {tahap.jenis === "galat" && <Galat pesan={tahap.pesan} ulangi={muatLagi} />}

      {tahap.jenis === "verifikasi" && (
        <>
          <Teks ragam="lembut">Buka aplikasi authenticator di HP ini, lalu masukkan kode Sealauk Admin yang sedang tampil.</Teks>
          {isianKode}
        </>
      )}

      {tahap.jenis === "daftar" && (
        <>
          <Teks ragam="lembut">
            Akun ini belum punya 2FA. Pasang sekali saja memakai aplikasi authenticator, misalnya Google Authenticator
            atau Microsoft Authenticator.
          </Teks>
          <Kartu>
            <Teks tebal>1. Tambahkan akun di authenticator</Teks>
            <Tombol label="Buka aplikasi authenticator" ragam="gelap" onPress={() => Linking.openURL(tahap.uri)} />
            <Teks ragam="redup">Kalau tombol di atas tidak membuka apa pun, atau authenticator ada di HP lain, masukkan kode rahasia ini secara manual:</Teks>
            <View style={styles.rahasia}>
              <Teks angka tebal selectable style={styles.teksRahasia}>
                {tahap.rahasia.replace(/(.{4})/g, "$1 ").trim()}
              </Teks>
            </View>
            <Tombol label={tersalin ? "Kode rahasia tersalin" : "Salin kode rahasia"} ragam="garis" onPress={() => salin(tahap.rahasia)} />
          </Kartu>
          <Kartu>
            <Teks tebal>2. Masukkan kode yang muncul</Teks>
            {isianKode}
          </Kartu>
          <Catatan>
            Kode rahasia di atas sama nilainya dengan password. Jangan dikirim lewat WhatsApp atau difoto.
          </Catatan>
        </>
      )}

      <Tombol label="Keluar, pakai akun lain" ragam="hantu" onPress={keluar} />
    </LayarAwal>
  );
}

const styles = StyleSheet.create({
  rahasia: { backgroundColor: warna.redup, borderRadius: radius.kecil, padding: jarak.m },
  teksRahasia: { fontSize: 18, letterSpacing: 1 },
});
