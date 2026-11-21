import { useState } from "react";
import { Isian } from "@/components/Isian";
import { Catatan } from "@/components/Kartu";
import { LayarAwal } from "@/components/LayarAwal";
import { Tombol } from "@/components/Tombol";
import { pesanGalat } from "@/lib/galat";
import { supabase } from "@/lib/supabase";

export default function Masuk() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  async function masuk() {
    if (!email.trim() || !password) {
      setGalat("Isi email dan password.");
      return;
    }
    setGalat(null);
    setMemproses(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setMemproses(false);
    if (error) {
      // Pesan sama untuk email tidak terdaftar dan password salah, supaya tidak membocorkan email mana yang ada.
      setGalat(
        error.code === "invalid_credentials"
          ? "Email atau password salah."
          : error.status === 429
            ? "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi."
            : pesanGalat(error),
      );
    }
    // Kalau berhasil, _layout pindah sendiri ke layar 2FA lewat perubahan sesi.
  }

  return (
    <LayarAwal judul="Masuk" keterangan="Khusus admin produksi dan admin Cikarang. Akun dibuat pemilik di Supabase.">
      <Isian
        label="Email"
        nilai={email}
        ubah={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="username"
        returnKeyType="next"
      />
      <Isian
        label="Password"
        nilai={password}
        ubah={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={masuk}
      />
      {galat && <Catatan nada="merah">{galat}</Catatan>}
      <Tombol label="Masuk" onPress={masuk} memproses={memproses} />
    </LayarAwal>
  );
}
